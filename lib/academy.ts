import "server-only";

import { courses } from "../app/academy/courseData";
import { studioCoursePublicationMetadataById } from "../app/academy/studioCatalog";
import type { ObserraAuthorizationRole } from "./auth/claims";
import { ACADEMY_BRAND_NAME } from "./legal-identity";
import {
  claimPaidCheckout,
  completeDurableLesson,
  durableAcademyAggregateMetrics,
  durableAcademyPrincipalId,
  durableAcademyState,
  durableCertificate,
  provisionAcademyPrincipalState,
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

export async function claimCourseAccess(input: {
  principalId: string;
  courseId: string;
  courseVersion: string;
  checkoutSessionId: string;
  purchaserEmail?: string;
}) {
  return claimPaidCheckout({
    checkoutSessionId: input.checkoutSessionId,
    courseId: input.courseId,
    courseVersion: input.courseVersion,
    academyPrincipalId: input.principalId,
    purchaserEmail: input.purchaserEmail,
  });
}

export async function markLessonComplete(principalId: string, courseId: string, lessonIndex: number) {
  const course = courseForId(courseId);
  if (!course || lessonIndex < 0 || lessonIndex >= course.modules.length) throw new Error("Invalid course lesson");
  const durable = await completeDurableLesson({
    principalId,
    courseId,
    lessonIndex,
    lessonCount: course.modules.length,
    courseVersion: governedCourseVersion(courseId),
  });
  return progressFromDurableState(durable);
}

export async function recordAssessment(
  principalId: string,
  courseId: string,
  score: number,
  result: {
    correctCount: number;
    questionCount: number;
    learnerName: string;
    roles?: readonly ObserraAuthorizationRole[];
  },
) {
  const course = courseForId(courseId);
  if (!course) throw new Error("Unknown course");
  const state = await academyStateWithOwnerAccess(principalId, courseId, result.roles ?? []);
  if (!state.entitlements[courseId]) throw new Error("Enrollment required");
  const current = state.progress[courseId] ?? { completedLessons: [] };
  if (current.completedLessons.length !== course.modules.length) throw new Error("Complete every lesson before the assessment");

  const passed = score >= 80;
  let completedAt: string | undefined;
  let certificateId: string | undefined;
  let certificate: SignedCertificateClaim | undefined;
  if (passed && !current.signedCertificate) {
    if (!certificateSigningReady()) {
      throw new Error(`Certificate signing is not configured. Contact ${ACADEMY_BRAND_NAME} support.`);
    }
    completedAt = current.completedAt ?? new Date().toISOString();
    certificateId = current.certificateId ?? `OBS-${courseId.toUpperCase().replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    certificate = signCertificateClaim({
      certificateId,
      courseId,
      courseTitle: course.title,
      courseVersion: governedCourseVersion(courseId),
      learnerName: result.learnerName,
      completedAt,
      assessmentScore: score,
    });
  }

  const durable = await recordDurableAssessment({
    principalId,
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

export async function academyStateWithOwnerAccess(
  principalId: string,
  courseId: string,
  roles: readonly ObserraAuthorizationRole[] = [],
) {
  const course = courseForId(courseId);
  if (!course) throw new Error("Unknown course");
  const durable = await durableAcademyState(principalId, courseId);
  if (durable) return stateFromDurableState(durable);
  if (!roles.includes("owner")) return emptyState();

  const ownerState = await provisionAcademyPrincipalState({
    principalId,
    courseId,
    courseVersion: governedCourseVersion(courseId),
    enrolledAt: new Date().toISOString(),
    paymentReference: "owner-administrator-access",
    completedLessons: [],
  });
  return stateFromDurableState(ownerState);
}

async function verifiedCertificateResult(
  learnerName: string,
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
  return {
    valid: true as const,
    certificateId: progress.certificateId,
    learnerName,
    courseId,
    courseTitle: signed.schemaVersion === "1.0" ? course.title : signed.courseTitle,
    courseVersion: signed.schemaVersion === "1.0" ? governedCourseVersion(courseId) : signed.courseVersion,
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
  const durable = await durableCertificate(normalized);
  if (durable) {
    const progress = progressFromDurableState(durable);
    const signed = progress.signedCertificate;
    let learnerName = signed?.schemaVersion === "1.2" ? signed.learnerName : null;
    if (!learnerName) {
      const { legacyClerkLearnerName } = await import("./academy-legacy-clerk");
      learnerName = await legacyClerkLearnerName(durableAcademyPrincipalId(durable));
    }
    return verifiedCertificateResult(learnerName || `${ACADEMY_BRAND_NAME} Learner`, durable.course_slug, progress);
  }

  const { findLegacyClerkCertificate } = await import("./academy-legacy-clerk");
  return findLegacyClerkCertificate(normalized);
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
