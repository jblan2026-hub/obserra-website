import "server-only";

import { randomUUID } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";

const DEFAULT_SUPABASE_URL = "https://nwxnyqlyzyufgoadtqxs.supabase.co";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FLORIDA_CLASS_D_QUALITY_POLICY = {
  featureFlag: "OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED",
  regulatoryMinimumRetentionYears: 2,
  operationalRetentionYears: 3,
  dispositionRequiresHumanAuthorization: true,
  legalHoldBlocksDisposition: true,
  qualityEventHistoryAppendOnly: true,
} as const;

export type FloridaClassDQualityCase = {
  id: string;
  case_type: "incident" | "complaint" | "attendance_exception" | "exam_exception" | "lias_exception" | "security_event" | "quality_finding";
  status: "open" | "investigating" | "action_required" | "verification" | "closed" | "voided";
  severity: "low" | "medium" | "high" | "critical";
  enrollment_id?: string | null;
  cohort_id?: string | null;
  title: string;
  description: string;
  root_cause?: string | null;
  corrective_action?: string | null;
  preventive_action?: string | null;
  assigned_to_clerk_user_id?: string | null;
  due_at?: string | null;
  opened_by_clerk_user_id: string;
  opened_at: string;
  verified_at?: string | null;
  closed_at?: string | null;
};

export type FloridaClassDRetentionReview = {
  id: string;
  enrollment_id: string;
  completion_record_id?: string | null;
  minimum_retain_until: string;
  operational_retain_until: string;
  next_review_on: string;
  legal_hold_active: boolean;
  status: "retained" | "review_due" | "eligible_for_disposition" | "disposition_blocked" | "disposed";
  review_note?: string | null;
  reviewed_at?: string | null;
};

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDQualityEnabled() {
  return enabled(process.env.OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED);
}

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDExamError("Quality-management service is not configured.", 503, "FDACS_QUALITY_NOT_CONFIGURED");
  }
  return { key, url };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { key, url } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(15_000),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) as unknown : null;
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDExamError(
      typeof record?.message === "string" ? record.message : "Quality-management request failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_QUALITY_REQUEST_FAILED",
    );
  }
  return payload as T;
}

function requireEnabled() {
  if (!floridaClassDQualityEnabled()) {
    throw new FloridaClassDExamError("Quality-management actions are disabled.", 503, "FDACS_QUALITY_DISABLED");
  }
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_QUALITY_INVALID_IDENTIFIER");
}

function optionalUuid(value: string | null | undefined, field: string) {
  const normalized = value?.trim() || "";
  if (!normalized) return null;
  requireUuid(normalized, field);
  return normalized;
}

export async function listFloridaClassDQualityCases() {
  return request<FloridaClassDQualityCase[]>(
    `fdacs_class_d_quality_cases?${new URLSearchParams({ select: "id,case_type,status,severity,enrollment_id,cohort_id,title,description,root_cause,corrective_action,preventive_action,assigned_to_clerk_user_id,due_at,opened_by_clerk_user_id,opened_at,verified_at,closed_at", order: "status.asc,severity.desc,opened_at.desc", limit: "300" })}`,
  );
}

export async function listFloridaClassDRetentionReviews() {
  return request<FloridaClassDRetentionReview[]>(
    `fdacs_class_d_retention_reviews?${new URLSearchParams({ select: "id,enrollment_id,completion_record_id,minimum_retain_until,operational_retain_until,next_review_on,legal_hold_active,status,review_note,reviewed_at", order: "next_review_on.asc", limit: "500" })}`,
  );
}

export async function openFloridaClassDQualityCase(
  actorUserId: string,
  input: {
    caseType: FloridaClassDQualityCase["case_type"];
    severity: FloridaClassDQualityCase["severity"];
    enrollmentId?: string | null;
    cohortId?: string | null;
    title: string;
    description: string;
    assignedToUserId?: string | null;
    dueAt?: string | null;
    correlationId?: string;
  },
) {
  requireEnabled();
  const enrollmentId = optionalUuid(input.enrollmentId, "enrollment id");
  const cohortId = optionalUuid(input.cohortId, "cohort id");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < 3 || title.length > 250) throw new FloridaClassDExamError("Quality case title is invalid.", 400, "FDACS_QUALITY_TITLE_INVALID");
  if (description.length < 3 || description.length > 8000) throw new FloridaClassDExamError("Quality case description is invalid.", 400, "FDACS_QUALITY_DESCRIPTION_INVALID");
  if (input.dueAt && !Number.isFinite(Date.parse(input.dueAt))) throw new FloridaClassDExamError("Quality case due date is invalid.", 400, "FDACS_QUALITY_DUE_DATE_INVALID");

  const result = await request<string | Array<Record<string, unknown>>>("rpc/fdacs_class_d_open_quality_case", {
    method: "POST",
    body: JSON.stringify({
      p_case_type: input.caseType,
      p_severity: input.severity,
      p_enrollment_id: enrollmentId,
      p_cohort_id: cohortId,
      p_title: title,
      p_description: description,
      p_actor_clerk_user_id: actorUserId,
      p_assigned_to_clerk_user_id: input.assignedToUserId?.trim() || null,
      p_due_at: input.dueAt || null,
      p_correlation_id: correlationId,
    }),
  });
  const caseId = typeof result === "string" ? result : Array.isArray(result) && result[0] ? Object.values(result[0])[0] : null;
  if (typeof caseId !== "string" || !UUID_PATTERN.test(caseId)) throw new FloridaClassDExamError("Quality case creation failed.", 502, "FDACS_QUALITY_CREATE_FAILED");
  return { caseId, correlationId };
}

export async function progressFloridaClassDQualityCase(
  actorUserId: string,
  input: {
    caseId: string;
    status: FloridaClassDQualityCase["status"];
    rootCause?: string | null;
    correctiveAction?: string | null;
    preventiveAction?: string | null;
    eventNote?: string | null;
    correlationId?: string;
  },
) {
  requireEnabled();
  requireUuid(input.caseId, "quality case id");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");
  for (const value of [input.rootCause, input.correctiveAction, input.preventiveAction, input.eventNote]) {
    if (value && value.length > 8000) throw new FloridaClassDExamError("Quality case narrative is too long.", 400, "FDACS_QUALITY_NARRATIVE_TOO_LONG");
  }
  await request("rpc/fdacs_class_d_progress_quality_case", {
    method: "POST",
    body: JSON.stringify({
      p_case_id: input.caseId,
      p_status: input.status,
      p_root_cause: input.rootCause?.trim() || null,
      p_corrective_action: input.correctiveAction?.trim() || null,
      p_preventive_action: input.preventiveAction?.trim() || null,
      p_event_note: input.eventNote?.trim() || null,
      p_actor_clerk_user_id: actorUserId,
      p_correlation_id: correlationId,
    }),
  });
  return { caseId: input.caseId, status: input.status, correlationId };
}

export async function recordFloridaClassDRetentionReview(
  actorUserId: string,
  input: {
    enrollmentId: string;
    completionRecordId: string;
    completionDate: string;
    legalHoldActive: boolean;
    reviewNote?: string | null;
    correlationId?: string;
  },
) {
  requireEnabled();
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.completionRecordId, "completion record id");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.completionDate)) throw new FloridaClassDExamError("Completion date is invalid.", 400, "FDACS_RETENTION_COMPLETION_DATE_INVALID");
  if (input.reviewNote && input.reviewNote.length > 8000) throw new FloridaClassDExamError("Retention review note is too long.", 400, "FDACS_RETENTION_NOTE_TOO_LONG");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");

  const result = await request<string | Array<Record<string, unknown>>>("rpc/fdacs_class_d_upsert_retention_review", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: input.enrollmentId,
      p_completion_record_id: input.completionRecordId,
      p_completion_date: input.completionDate,
      p_legal_hold_active: input.legalHoldActive,
      p_review_note: input.reviewNote?.trim() || null,
      p_actor_clerk_user_id: actorUserId,
      p_correlation_id: correlationId,
    }),
  });
  const reviewId = typeof result === "string" ? result : Array.isArray(result) && result[0] ? Object.values(result[0])[0] : null;
  if (typeof reviewId !== "string" || !UUID_PATTERN.test(reviewId)) throw new FloridaClassDExamError("Retention review failed.", 502, "FDACS_RETENTION_REVIEW_FAILED");
  return { reviewId, correlationId };
}
