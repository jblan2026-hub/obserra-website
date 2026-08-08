import studioCatalogJson from "./generated/studio-catalog.json";
import { mergeStudioCourseSets, parseStudioCatalog } from "./studioCatalogCore.mjs";
import type { Course } from "./courseData";

export type StudioCoursePublicationMetadata = {
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

const parsedCatalog = parseStudioCatalog(studioCatalogJson);

export const studioCatalogStatus = parsedCatalog.status;

export const studioCoursePublicationMetadataById =
  parsedCatalog.publicationMetadataById as Map<string, StudioCoursePublicationMetadata>;

export const studioCourses = parsedCatalog.courses as Course[];

export function mergeStudioCourses(fallbackCourses: Course[]): Course[] {
  return mergeStudioCourseSets(fallbackCourses, studioCourses);
}
