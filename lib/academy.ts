import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { courses } from "../app/academy/courseData";
import {
  certificateSigningReady,
  signCertificateClaim,
  type SignedCertificateClaim,
  verifyCertificateClaim,
} from "./certificate-signing";
import { ownerUserIdAllowed } from "./owner-auth";
import { getStripe } from "./stripe";

export type CourseProgress = {
  completedLessons: number[];
  assessmentScore?: number;
  completedAt?: string;
  certificateId?: string;
  signedCertificate?: SignedCertificateClaim;
};

export type AcademyState = {
  entitlements: Record<string, { enrolledAt: string; paymentReference: string }>;
  progress: Record<string, CourseProgress>;
};

const emptyState = (): AcademyState => ({ entitlements: {}, progress: {} });

export function courseForId(courseId: string) {
  return courses.find((course) => course.id === courseId);
}

export function academyStateFromUser(user: { privateMetadata: Record<string, unknown> }): AcademyState {
  const raw = user.privateMetadata?.academy;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyState();
  const candidate = raw as Partial<AcademyState>;
  return {
    entitlements: candidate.entitlements && typeof candidate.entitlements === "object" ? candidate.entitlements : {},
    progress: candidate.progress && typeof candidate.progress === "object" ? candidate.progress : {},
  };
}

async function saveState(userId: string, state: AcademyState) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { privateMetadata: { academy: state } });
}

export async function grantCourseAccess(userId: string, courseId: string, paymentReference: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const state = academyStateFromUser(user);
  if (!state.entitlements[courseId]) {
    state.entitlements[courseId] = { enrolledAt: new Date().toISOString(), paymentReference };
    await saveState(userId, state);
  }
}

export async function markLessonComplete(userId: string, courseId: string, lessonIndex: number) {
  const course = courseForId(courseId);
  if (!course || lessonIndex < 0 || lessonIndex >= course.modules.length) throw new Error("Invalid course lesson");
  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) throw new Error("Enrollment required");
  const current = state.progress[courseId] ?? { completedLessons: [] };
  state.progress[courseId] = {
    ...current,
    completedLessons: [...new Set([...current.completedLessons, lessonIndex])].sort((a, b) => a - b),
  };
  await saveState(userId, state);
  return state.progress[courseId];
}

export async function recordAssessment(userId: string, courseId: string, score: number) {
  const course = courseForId(courseId);
  if (!course) throw new Error("Unknown course");
  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) throw new Error("Enrollment required");
  const current = state.progress[courseId] ?? { completedLessons: [] };
  if (current.completedLessons.length !== course.modules.length) throw new Error("Complete every lesson before the assessment");

  const passed = score >= 80;
  let completion = {} as Pick<CourseProgress, "completedAt" | "certificateId" | "signedCertificate">;
  if (passed && !current.signedCertificate) {
    if (!certificateSigningReady()) {
      throw new Error("Certificate signing is not configured. Contact Obserra Academy support.");
    }
    const completedAt = current.completedAt ?? new Date().toISOString();
    const certificateId = current.certificateId ?? `OBS-${courseId.toUpperCase().replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    completion = {
      completedAt,
      certificateId,
      signedCertificate: signCertificateClaim({ certificateId, courseId, completedAt, assessmentScore: score }),
    };
  }

  state.progress[courseId] = {
    ...current,
    assessmentScore: score,
    ...completion,
  };
  await saveState(userId, state);
  return state.progress[courseId];
}

export async function academyStateWithOwnerAccess(userId: string, courseId: string) {
  const course = courseForId(courseId);
  if (!course) throw new Error("Unknown course");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const state = academyStateFromUser(user);
  if (state.entitlements[courseId]) return state;
  if (!ownerUserIdAllowed(userId)) return state;
  state.entitlements[courseId] = {
    enrolledAt: new Date().toISOString(),
    paymentReference: "owner-identity-access",
  };
  await saveState(userId, state);
  return state;
}

export async function findVerifiedCertificate(certificateId: string) {
  const normalized = certificateId.trim().toUpperCase();
  if (!normalized || normalized.length > 180 || !certificateSigningReady()) return null;
  const client = await clerkClient();
  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;
  do {
    const page = await client.users.getUserList({ limit: pageSize, offset });
    totalCount = page.totalCount;
    for (const user of page.data) {
      const state = academyStateFromUser(user);
      for (const [courseId, progress] of Object.entries(state.progress)) {
        if (progress.certificateId?.toUpperCase() !== normalized || !progress.signedCertificate) continue;
        if (!verifyCertificateClaim(progress.signedCertificate)) return null;
        if (progress.signedCertificate.courseId !== courseId) return null;
        const course = courseForId(courseId);
        if (!course) return null;
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
        return {
          valid: true as const,
          certificateId: progress.certificateId,
          learnerName: fullName || "Obserra Academy Learner",
          courseId,
          courseTitle: course.title,
          completedAt: progress.completedAt,
          assessmentScore: progress.assessmentScore,
          trainingHours: course.duration,
          signerName: progress.signedCertificate.signerName,
          issuer: progress.signedCertificate.issuer,
          signatureAlgorithm: progress.signedCertificate.signatureAlgorithm,
          publicKeyFingerprint: progress.signedCertificate.publicKeyFingerprint,
        };
      }
    }
    offset += page.data.length;
  } while (offset < totalCount && offset < 10_000);
  return null;
}

export async function getAcademyAggregateMetrics() {
  const client = await clerkClient();
  const users = [] as Awaited<ReturnType<typeof client.users.getUserList>>["data"];
  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;
  do {
    const page = await client.users.getUserList({ limit: pageSize, offset });
    users.push(...page.data);
    totalCount = page.totalCount;
    offset += page.data.length;
  } while (offset < totalCount && offset < 10_000);

  let enrollments = 0;
  let certificates = 0;
  const coursesByEnrollment = Object.fromEntries(courses.map((course) => [course.id, 0])) as Record<string, number>;
  const coursesByCertificate = Object.fromEntries(courses.map((course) => [course.id, 0])) as Record<string, number>;
  for (const user of users) {
    const state = academyStateFromUser(user);
    for (const courseId of Object.keys(state.entitlements)) {
      enrollments += 1;
      if (courseId in coursesByEnrollment) coursesByEnrollment[courseId] += 1;
    }
    for (const [courseId, progress] of Object.entries(state.progress)) {
      if (!progress.signedCertificate || !verifyCertificateClaim(progress.signedCertificate)) continue;
      certificates += 1;
      if (courseId in coursesByCertificate) coursesByCertificate[courseId] += 1;
    }
  }
  return { learnerAccounts: totalCount, enrollments, certificates, coursesByEnrollment, coursesByCertificate, sampledLearners: users.length };
}

export async function getAcademyCommerceMetrics() {
  try {
    const stripe = getStripe();
    let startingAfter: string | undefined;
    let paidCheckouts = 0;
    let grossUsdCents = 0;
    do {
      const page = await stripe.checkout.sessions.list({ limit: 100, starting_after: startingAfter });
      for (const session of page.data) {
        if (session.mode === "payment" && session.payment_status === "paid" && session.currency === "usd") {
          paidCheckouts += 1;
          grossUsdCents += session.amount_total ?? 0;
        }
      }
      startingAfter = page.data.at(-1)?.id;
      if (!page.has_more) break;
    } while (startingAfter);
    return { available: true, paidCheckouts, grossUsdCents };
  } catch {
    return { available: false, paidCheckouts: 0, grossUsdCents: 0 };
  }
}
