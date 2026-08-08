import type { Course } from "./courseData";

export type StudioCoursePublicationMetadataCore = {
  prerequisites: string[];
  tags: unknown;
  commerce: unknown;
  licensing: unknown;
  completion: unknown;
  certificate: unknown;
  branding: unknown;
  disclaimer: unknown;
  acknowledgementRequired: true;
  version: string | null;
  releaseStatus: "approved" | "published";
};

export type StudioCatalogStatusCore = {
  schemaVersion: string;
  generatedAt: string | null;
  publisher: string | null;
  supported: boolean;
  sourceCourseCount: number;
  acceptedCourseCount: number;
  rejectedCourseCount: number;
};

export type ParsedStudioCatalog = {
  status: StudioCatalogStatusCore;
  courses: Course[];
  publicationMetadataById: Map<string, StudioCoursePublicationMetadataCore>;
};

export const SUPPORTED_SCHEMA_VERSIONS: readonly string[];

export function parseStudioCatalog(catalog: unknown): ParsedStudioCatalog;

export function mergeStudioCourseSets(
  fallbackCourses: readonly Course[],
  studioCourses: readonly Course[],
): Course[];
