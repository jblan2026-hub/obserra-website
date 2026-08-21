import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { courses } from "../app/academy/courseData";
import { studioCoursePublicationMetadataById } from "../app/academy/studioCatalog";
import { importLegacyAcademyState } from "./academy-persistence";
import {
  type SignedCertificateClaim,
  verifyCertificateClaim,
} from "./certificate-signing";

export type LegacyAcademyProgress = {
  completedLessons: number[];
  assessmentScore?: number;
  completedAt?: string;
  certificateId?: string;
  signedCertificate?: SignedCertificateClaim;
};

export type LegacyAcademyState = {
  entitlements: Record<string, { enrolledAt: string; paymentReference: string }>;
  progress: Record<string, LegacyAcademyProgress>;
};

function emptyState(): LegacyAcademyState {
  return { entitlements: {}, progress: {} };
}

function courseForId(courseId: string) {
  return courses.find((course) => course.id === courseId);
}

function governedCourseVersion(courseId: string) {
  const version = studioCoursePublicationMetadataById.get(courseId)?.version?.trim();
  return version && /^\d+\.\d+\.\d+$/.test(version) ? version : "1.0.0";
}

function legacyAcademyStateFromUser(user: { privateMetadata: Record<string, unknown> }): LegacyAcademyState {
  const raw = user.privateMetadata?.academy;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyState();
  const candidate = raw as Partial<LegacyAcademyState>;
  return {
    entitlements: candidate.entitlements && typeof candidate.entitlements === "object" ? candidate.entitlements : {},
    progress: candidate.progress && typeof candidate.progress === "object" ? candidate.progress : {},
  };
}

function validIsoDate(value: string | undefined, fallback: string) {
  return value && Number.isFinite(Date.parse(value)) ? value : fallback;
}

async function migrateLegacyCourseState(userId: string, courseId: string, state: LegacyAcademyState) {
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

function learnerName(user: { firstName: string | null; lastName: string | null; emailAddresses?: Array<{ emailAddress: string }> }) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.emailAddresses?.[0]?.emailAddress || "Obserra Academy Learner";
}

function verifiedLegacyCertificateResult(
  user: { firstName: string | null; lastName: string | null; emailAddresses?: Array<{ emailAddress: string }> },
  courseId: string,
  progress: LegacyAcademyProgress,
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
    learnerName: signed.schemaVersion === "1.2" ? signed.learnerName : learnerName(user),
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

export async function legacyClerkLearnerName(userId: string) {
  if (!/^user_[A-Za-z0-9_-]+$/.test(userId)) return null;
  try {
    const user = await (await clerkClient()).users.getUser(userId);
    return learnerName(user);
  } catch {
    return null;
  }
}

export async function findLegacyClerkCertificate(certificateId: string) {
  const normalized = certificateId.trim().toUpperCase();
  const client = await clerkClient();
  const pageSize = 100;
  let offset = 0;
  let totalCount = 0;
  do {
    const page = await client.users.getUserList({ limit: pageSize, offset });
    totalCount = page.totalCount;
    for (const user of page.data) {
      const legacy = legacyAcademyStateFromUser(user);
      for (const [courseId, progress] of Object.entries(legacy.progress)) {
        if (progress.certificateId?.toUpperCase() !== normalized) continue;
        const verified = verifiedLegacyCertificateResult(user, courseId, progress);
        if (!verified) return null;
        await migrateLegacyCourseState(user.id, courseId, legacy);
        return verified;
      }
    }
    offset += page.data.length;
  } while (offset < totalCount && offset < 10_000);
  return null;
}
