import { studioCoursePublicationMetadataById } from "./studioCatalog";

export type CoursePublicationView = {
  source: "academy-production-studio" | "live-production-contract";
  prerequisites: string[];
  assessmentRequired: boolean;
  assessmentDuration: string | null;
  passingScore: number;
  certificateIssued: boolean;
  credentialDisclaimer: string | null;
  acknowledgementRequired: boolean;
  version: string | null;
  releaseStatus: "approved" | "published" | null;
};

type CompletionLike = {
  assessmentRequired?: unknown;
  assessmentDuration?: unknown;
  passingScore?: unknown;
  certificateIssued?: unknown;
  credentialDisclaimer?: unknown;
};

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function boundedPassingScore(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 100) return fallback;
  return parsed;
}

export function publicationForCourse(courseId: string): CoursePublicationView {
  const metadata = studioCoursePublicationMetadataById.get(courseId);
  if (!metadata) {
    return {
      source: "live-production-contract",
      prerequisites: [],
      assessmentRequired: true,
      assessmentDuration: null,
      passingScore: 80,
      certificateIssued: true,
      credentialDisclaimer: "Completion is a course completion record and is not professional certification, licensure, accreditation, or regulatory approval.",
      acknowledgementRequired: true,
      version: null,
      releaseStatus: null,
    };
  }

  const completion = (metadata.completion ?? {}) as CompletionLike;
  return {
    source: "academy-production-studio",
    prerequisites: metadata.prerequisites,
    assessmentRequired: completion.assessmentRequired !== false,
    assessmentDuration: nonEmptyString(completion.assessmentDuration),
    passingScore: boundedPassingScore(completion.passingScore, 80),
    certificateIssued: completion.certificateIssued !== false,
    credentialDisclaimer: nonEmptyString(completion.credentialDisclaimer),
    acknowledgementRequired: metadata.acknowledgementRequired,
    version: metadata.version,
    releaseStatus: metadata.releaseStatus,
  };
}
