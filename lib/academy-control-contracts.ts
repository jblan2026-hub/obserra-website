import type { Course } from "../app/academy/courseData";
import type { KnowledgeCheck, LessonBrief } from "../app/academy/courseExperience";

export const ACADEMY_PUBLIC_CATALOG_URL =
  "https://nwxnyqlyzyufgoadtqxs.supabase.co/functions/v1/academy-public-catalog";

export const ACADEMY_OWNER_EDGE_URL =
  "https://nwxnyqlyzyufgoadtqxs.supabase.co/functions/v1/academy-owner-control";

export const ACADEMY_OWNER_CONTROL_URL =
  typeof window === "undefined" ? ACADEMY_OWNER_EDGE_URL : "/api/owner/academy";

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

export type AcademyOwnerControlRecord = {
  course_id: string;
  lifecycle: AcademyCourseLifecycle;
  public_visible: boolean;
  purchase_enabled: boolean;
  preserve_existing_entitlements: true;
  reason: string | null;
  revision: number;
  updated_at: string;
};

export type AcademyOwnerContentSummary = {
  course_id: string;
  course_summary: Course | null;
  content_hash: string;
  revision: number;
  updated_at: string;
};

export type AcademyOwnerContentRecord = AcademyOwnerContentSummary & {
  document: AcademyCourseDocument;
  updated_by?: string;
  created_at?: string;
};

export type AcademyOwnerEvent = {
  event_id: string;
  course_id: string;
  actor_user_id: string;
  action: string;
  request_id: string;
  previous_state: unknown;
  next_state: unknown;
  created_at: string;
};

export type AcademyOwnerCatalogResponse = {
  controls: AcademyOwnerControlRecord[];
  contentOverrides: AcademyOwnerContentSummary[];
  requestId: string;
};

export type AcademyOwnerCourseResponse = {
  control: AcademyOwnerControlRecord | null;
  contentOverride: AcademyOwnerContentRecord | null;
  events: AcademyOwnerEvent[];
  requestId: string;
};

export type AcademyOwnerVerificationResponse = {
  authorized: true;
  ownerUserId: string;
  claimedAt: string;
  requestId: string;
};

export function defaultAcademyCourseControl(courseId: string): AcademyCourseControl {
  return {
    courseId,
    lifecycle: "unpublished",
    publicVisible: false,
    purchaseEnabled: false,
    preserveExistingEntitlements: true,
    revision: 0,
    updatedAt: null,
    reason: "Control plane unavailable or course control missing.",
  };
}
