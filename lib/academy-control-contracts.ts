import type { Course } from "../app/academy/courseData";
import type { KnowledgeCheck, LessonBrief } from "../app/academy/courseExperience";

export const ACADEMY_OWNER_CONTROL_URL =
  "https://nwxnyqlyzyufgoadtqxs.supabase.co/functions/v1/academy-owner-control";
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

export type AcademyCourseDocument = {
  schemaVersion: "1.0";
  course: Course;
  lessons: LessonBrief[];
  assessment: KnowledgeCheck[];
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

export type AcademyOwnerCatalogResponse = {
  controls: Array<{
    course_id: string;
    lifecycle: AcademyCourseLifecycle;
    public_visible: boolean;
    purchase_enabled: boolean;
    preserve_existing_entitlements: true;
    reason: string | null;
    revision: number;
    updated_at: string;
  }>;
  contentOverrides: Array<{
    course_id: string;
    course_summary: Course | null;
    content_hash: string;
    revision: number;
    updated_at: string;
  }>;
  requestId: string;
};

export type AcademyOwnerCourseResponse = {
  control: {
    course_id: string;
    lifecycle: AcademyCourseLifecycle;
    public_visible: boolean;
    purchase_enabled: boolean;
    preserve_existing_entitlements: true;
    reason: string | null;
    revision: number;
    updated_at: string;
  } | null;
  contentOverride: {
    course_id: string;
    document: AcademyCourseDocument;
    content_hash: string;
    revision: number;
    updated_at: string;
  } | null;
  events: Array<{
    event_id: string;
    course_id: string;
    actor_user_id: string;
    action: string;
    request_id: string;
    previous_state: unknown;
    next_state: unknown;
    created_at: string;
  }>;
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
