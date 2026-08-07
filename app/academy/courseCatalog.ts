import { courses as mergedCourses } from "./courseData";
import {
  studioCatalogStatus,
  studioCourses,
} from "./studioCatalog";
import type { Course } from "./courseData";

/**
 * The Academy runtime preserves the reviewed website catalog as a safe
 * baseline and applies only publication-approved Studio records through the
 * validated adapter in studioCatalog.ts. Matching Studio course IDs replace
 * the baseline record, while new approved IDs are appended automatically.
 *
 * This intentionally avoids an all-or-nothing 60-course parity gate. A newly
 * approved course must be able to enter the catalog without requiring every
 * historical website course to be republished from Studio at the same time.
 * Empty, unsupported, malformed, draft, or unapproved Studio catalogs fail
 * closed to the reviewed website baseline.
 */
export const courses: Course[] = mergedCourses;

export const academyCatalogSource =
  studioCourses.length > 0 ? "hybrid-live-and-academy-production-studio" : "live-production-contract";

export const academyCatalogGeneratedAt =
  studioCourses.length > 0 ? studioCatalogStatus.generatedAt : null;

export const academyCatalogParity = {
  baselineCourses: mergedCourses.length - studioCourses.filter((studioCourse) =>
    !mergedCourses.some((course) => course.id === studioCourse.id && course === studioCourse),
  ).length,
  synchronizedCourses: studioCatalogStatus.sourceCourseCount,
  acceptedStudioCourses: studioCatalogStatus.acceptedCourseCount,
  rejectedStudioCourses: studioCatalogStatus.rejectedCourseCount,
  runtimeCourses: mergedCourses.length,
  schemaVersion: studioCatalogStatus.schemaVersion,
  schemaSupported: studioCatalogStatus.supported,
  mode: studioCourses.length > 0 ? "additive-governed-merge" : "baseline-fallback",
} as const;

export type { Course, CourseLevel, Department } from "./courseData";
