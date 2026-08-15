import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { courses } from "../app/academy/courseData";
import { studioCoursePublicationMetadataById } from "../app/academy/studioCatalog";
import {
  claimPaidCheckout,
  completeDurableLesson,
  durableAcademyAggregateMetrics,
  durableAcademyState,
  durableCertificate,
  importLegacyAcademyState,
  recordDurableAssessment,
  type DurableAcademyState,
} from "./academy-persistence";
import {
  certificateSigningReady,
  signCertificateClaim,
  type SignedCertificateClaim,
  verifyCertificateClaim,
} from "./certificate-signing";
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

function governedCourseVersion(courseId: string) {
  const version = studioCoursePublicationMetadataById.get(courseId)?.version?.trim();
  return version && /^\d+\.\d+\.\d+$/.test(version) ? version : "1.0.0";
}

function signedCertificate(value: DurableAcademyState["signed_certificate"]) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as unknown as SignedCertificateClaim
    : undefined;
}

function progressFromDurableState(value: DurableAcademyState): CourseProgress {
  const progress: CourseProgress = {
    completedLessons: [...new Set(value.completed_lessons.filter((item) => Number.isSafeInteger(item) && item >= 0))]
      .sort((a, b) => a - b),
  };
  const score = value.assessment_score === null ? undefined : Number(value.assessment_score);
  if (Number.isFinite(score)) progress.assessmentScore = score;
  if (value.completed_at) progress.completedAt = value.completed_at;
  if (value.certificate_id) progress.certificateId = value.certificate_id;
  const claim = signedCertificate(value.signed_certificate);
  if (claim) progress.signedCertificate = claim;
  return progress;
}

function stateFromDurableState(value: DurableAcademyState): AcademyState {
  if (value.access_status !== "active") return emptyState();
  return {
    entitlements: {
      [value.course_slug]: {
        enrolledAt: value.enrolled_at,
        paymentReference: value.payment_reference,
      },
    },
    progress: { [value.course_slug]: progressFromDurableState(value) },
  };
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

function validIsoDate(value: string | undefined, fallback: string) {
  return value && Number.isFinite(Date.parse(value)) ? value : fallback;
}

async function migrateLegacyCourseState(userId: string, courseId: string, state: AcademyState) {
  const entitlement = state.entitlements[courseId];
  if (!entitlement) return null;
  const course = courseForId(courseId);
  if (!course) return null;
  const progress = state.progress[courseId];
  const completedLessons = (progress?.completedLessons ?? [])
    .filter((item) => Number.isSafeInteger(item) && item >= 0 && item < course.modules.length);
  const hasCompleteCertificate = Boolean(
    progress?.completedAt && progress.certificateId && progress.signedCertificate,
  );
  return importLegacyAcademyState({
    userId,
    courseId,
    courseVersion: governedCourseVersion(courseId),
    enrolledAt: validIsoDate(entitlement.enrolledAt, new Date().toISOString()),
    paymentReference: entitlement.paymentReference?.slice(0, 255) || "legacy-metadata-import",
    completedLessons,
    assessmentScore: typeof progress?.assessmentScore === "number" ? progress.assessmentScore : undefined,
    completedAt: hasCompleteCertificate ? progress?.completedAt : undefined,
    certificateId: hasCompleteCertificate ? progress?.certificateId : undefined,
    signedCertificate: hasCompleteCertificate
      ? progress?.signedCertificate as unknown as Record<string, unknown>
      : undefined,
  });
}

export async function claimCourseAccess(input: {
  userId: string;
  courseId: string;
  courseVersion: string;
  checkoutSessionId: string;
  purchaserEmail?: string;
}) {
  return claimPaidCheckout({
    checkoutSessionId: input.checkoutSessionId,
    courseId: input.courseId,
    courseVersion: input.courseVersion,
    clerkUserId: input.userId,
    purchaserEmail: input.purchaserEmail,
  });
}

export async function markLessonComplete(userId: string, courseId: string, lessonIndex: number) {
  const course = courseForId(courseId);
  if (!course || lessonIndex < 0 || lessonIndex >= course.modules.length) throw new Error("Invalid course lesson");
  const durable = await completeDurableLesson({
    userId,
    courseId,
    lessonIndex,
    lessonCount: course.modules.length,
    courseVersion: governedCourseVersion(courseId),
  });
  return progressFromDurableState(durable);
}

export async function recordAssessment(
  userId: string,
  courseId: string,
  score: number,
  result: { correctCount: number; questionCount: number },
) {
  const course = courseForId(courseId);
  if (!course) throw new Error("Unknown course");
  const state = await academyStateWithOwnerAccess(userId, courseId);
  if (!state.entitlements[courseId]) throw new Error("Enrollment required");
  const current = state.progress[courseId] ?? { completedLessons: [] };
  if (current.completedLessons.length !== course.modules.length) throw new Error("Complete every lesson before the assessment");

  const passed = score >= 80;
  let completedAt: string | undefined;
  let certificateId: string | undefined;
  let certificate: SignedCertificateClaim | undefined;
  if (passed && !current.signedCertificate) {
    if (!certificateSigningReady()) {
      throw new Error("Certificate signing is not configured. Contact Obserra Academy support.");
    }
    completedAt = current.completedAt ?? new Date().toISOString();
    certificateId = current.certificateId ?? `OBS-${courseId.toUpperCase().replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    certificate = signCertificateClaim({
      certificateId,
      courseId,
      courseTitle: course.title,
      courseVersion: governedCourseVersion(courseId),
      completedAt,
      assessmentScore: score,
    });
  }

  const durable = await recordDurableAssessment({
    userId,
    courseId,
    score,
    correctCount: result.correctCount,
    questionCount: result.questionCount,
    lessonCount: course.modules.length,
    assessmentVersion: governedCourseVersion(courseId),
    completedAt,
    certificateId,
    signedCertificate: certificate as unknown as Record<string, unknown> | undefined,
  });
  return progressFromDurableState(durable);
}

export function ownerEmailAllowed(emails: string[]) {
  const singleOwner = process.env.OBSERRA_OWNER_EMAIL?.trim().toLowerCase();
  const ownerList = (process.env.OBSERRA_OWNER_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const approvedOwners = new Set<string>(singleOwner ? [singleOwner, ...ownerList] : ownerList);
  return approvedOwners.size > 0 && emails.some((email) => approvedOwners.has(email.toLowerCase()));
}

function emailsForUser(user: { emailAddresses: { emailAddress: string }[] }) {
  return user.emailAddresses.map((item) => item.emailAddress);
}

export async function academyStateWithOwnerAccess(userId: string, courseId: string) {
  const course = courseForId(courseId);
  if (!course) throw new Error("Unknown course");
  const durable = await durableAcademyState(userId, courseId);
  if (durable) return stateFromDurableState(durable);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const legacy = academyStateFromUser(user);
  const migrated = await migrateLegacyCourseState(userId, courseId, legacy);
  if (migrated) return stateFromDurableState(migrated);
  if (!ownerEmailAllowed(emailsForUser(user))) return emptyState();

  const ownerState = await importLegacyAcademyState({
    userId,
    courseId,
    courseVersion: governedCourseVersion(courseId),
    enrolledAt: new Date().toISOString(),
    paymentReference: "owner-administrator-access",
    completedLessons: [],
  });
  return stateFromDurableState(ownerState);
}

function verifiedCertificateResult(
  user: { firstName: string | null; lastName: string | null },
  courseId: string,
  progress: CourseProgress,
) {
  const signed = progress.signedCertificate;
  const course = courseForId(courseId);
  if (
    !course ||
    !progress.certificateId ||
    !progress.completedAt ||
    !signed ||
    !verifyCertificateClaim(signed) ||
    signed.courseId !== courseId ||
    signed.certificateId !== progress.certificateId
  ) return null;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return {
    valid: true as const,
    certificateId: progress.certificateId,
    learnerName: fullName || "Obserra Academy Learner",
    courseId,
    courseTitle: signed.schemaVersion === "1.1" ? signed.courseTitle : course.title,
    courseVersion: signed.schemaVersion === "1.1" ? signed.courseVersion : governedCourseVersion(courseId),
    completedAt: progress.completedAt,
    assessmentScore: progress.assessmentScore,
    trainingHours: course.duration,
    signerName: signed.signerName,
    issuer: signed.issuer,
    signatureAlgorithm: signed.signatureAlgorithm,
    publicKeyFingerprint: signed.publicKeyFingerprint,
    claimSchemaVersion: signed.schemaVersion,
  };
}

export async function findVerifiedCertificate(certificateId: string) {
  const normalized = certificateId.trim().toUpperCase();
  if (!normalized || normalized.length > 180 || !certificateSigningReady()) return null;
  const client = await clerkClient();
  const durable = await durableCertificate(normalized);
  if (durable) {
    const user = await client.users.getUser(durable.clerk_user_id);
    return verifiedCertificateResult(user, durable.course_slug, progressFromDurableState(durable));
  }

  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;
  do {
    const page = await client.users.getUserList({ limit: pageSize, offset });
    totalCount = page.totalCount;
    for (const user of page.data) {
      const legacy = academyStateFromUser(user);
      for (const [courseId, progress] of Object.entries(legacy.progress)) {
        if (progress.certificateId?.toUpperCase() !== normalized) continue;
        const verified = verifiedCertificateResult(user, courseId, progress);
        if (!verified) return null;
        await migrateLegacyCourseState(user.id, courseId, legacy);
        return verified;
      }
    }
    offset += page.data.length;
  } while (offset < totalCount && offset < 10_000);
  return null;
}

export async function getAcademyAggregateMetrics() {
  const metrics = await durableAcademyAggregateMetrics();
  const coursesByEnrollment = Object.fromEntries(courses.map((course) => [course.id, 0])) as Record<string, number>;
  const coursesByCertificate = Object.fromEntries(courses.map((course) => [course.id, 0])) as Record<string, number>;
  for (const [courseId, count] of Object.entries(metrics.coursesByEnrollment ?? {})) {
    if (courseId in coursesByEnrollment) coursesByEnrollment[courseId] = Number(count) || 0;
  }
  for (const [courseId, count] of Object.entries(metrics.coursesByCertificate ?? {})) {
    if (courseId in coursesByCertificate) coursesByCertificate[courseId] = Number(count) || 0;
  }
  return {
    learnerAccounts: Number(metrics.learnerAccounts) || 0,
    enrollments: Number(metrics.enrollments) || 0,
    certificates: Number(metrics.certificates) || 0,
    coursesByEnrollment,
    coursesByCertificate,
    sampledLearners: Number(metrics.learnerAccounts) || 0,
  };
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
