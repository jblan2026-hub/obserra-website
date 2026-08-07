import type { Course } from "../app/academy/courseData";

export const ACADEMY_PUBLIC_CATALOG_URL =
  "https://nwxnyqlyzyufgoadtqxs.supabase.co/functions/v1/academy-public-catalog";

export type AcademyCourseLifecycle =
  | "published"
  | "sales_paused"
  | "unpublished"
  | "cancelled";

export type AcademyCourseControl = {
  courseId: string;
  lifecycle: AcademyCourseLifecycle;
  publicVisible: boolean;
  purchaseEnabled: boolean;
  preserveExistingEntitlements: true;
  revision: number;
  updatedAt: string | null;
  reason?: string | null;
};

export type AcademyCourseOverrideSummary = {
  courseId: string;
  course: Course | null;
  revision: number;
  contentHash: string;
  updatedAt: string;
};

export type AcademyPublicCatalogResponse = {
  schemaVersion: "1.0";
  controls: AcademyCourseControl[];
  courseOverrides: AcademyCourseOverrideSummary[];
  requestId: string;
};

export type AcademyPublicCourseResponse = {
  schemaVersion: "1.0";
  control: AcademyCourseControl;
  courseOverride: AcademyCourseOverrideSummary | null;
  requestId: string;
};

export function defaultAcademyCourseControl(courseId: string): AcademyCourseControl {
  return {
    courseId,
    lifecycle: "published",
    publicVisible: true,
    purchaseEnabled: true,
    preserveExistingEntitlements: true,
    revision: 0,
    updatedAt: null,
    reason: null,
  };
}
