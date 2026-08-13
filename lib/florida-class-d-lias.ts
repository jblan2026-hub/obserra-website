import "server-only";

import { randomUUID } from "node:crypto";
import { FloridaClassDExamError } from "./florida-class-d-exam";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FLORIDA_CLASS_D_LIAS_POLICY = {
  featureFlag: "OBSERRA_FDACS_CLASS_D_LIAS_WORKFLOW_ENABLED",
  reportingWindowBusinessDays: 3,
  executionMode: "manual_queue_only",
  directPortalAutomationAllowed: false,
  certificateForm: "FDACS-16103",
  completionDoesNotEqualLicense: true,
} as const;

export type FloridaClassDLiasQueueItem = {
  id: string;
  completion_record_id: string;
  enrollment_id: string;
  status: "prepared" | "submitted" | "confirmed" | "exception" | "cancelled";
  prepared_at: string;
  reporting_due_on: string;
  submission_reference?: string | null;
  submitted_at?: string | null;
  submitted_by_clerk_user_id?: string | null;
  confirmed_at?: string | null;
  confirmed_by_clerk_user_id?: string | null;
  certificate_reference?: string | null;
  exception_note?: string | null;
  exception_at?: string | null;
};

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDLiasWorkflowEnabled() {
  return enabled(process.env.OBSERRA_FDACS_CLASS_D_LIAS_WORKFLOW_ENABLED);
}

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDExamError("LIAS workflow service is not configured.", 503, "FDACS_LIAS_NOT_CONFIGURED");
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
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) as unknown : null;
  if (!response.ok) {
    const record = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDExamError(
      typeof record?.message === "string" ? record.message : "LIAS workflow request failed.",
      response.status >= 500 ? 502 : response.status,
      typeof record?.code === "string" ? record.code : "FDACS_LIAS_REQUEST_FAILED",
    );
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_LIAS_INVALID_IDENTIFIER");
}

function requireWorkflowEnabled() {
  if (!floridaClassDLiasWorkflowEnabled()) {
    throw new FloridaClassDExamError("LIAS workflow is disabled.", 503, "FDACS_LIAS_DISABLED");
  }
}

export async function listFloridaClassDLiasWorkflowQueue() {
  return request<FloridaClassDLiasQueueItem[]>(
    "fdacs_class_d_lias_reporting_queue?" + new URLSearchParams({
      select: "id,completion_record_id,enrollment_id,status,prepared_at,reporting_due_on,submission_reference,submitted_at,submitted_by_clerk_user_id,confirmed_at,confirmed_by_clerk_user_id,certificate_reference,exception_note,exception_at",
      order: "reporting_due_on.asc,prepared_at.asc",
      limit: "200",
    }),
  );
}

export async function listFloridaClassDLiasWorkflowEvents(queueId: string) {
  requireUuid(queueId, "queue id");
  return request<Array<Record<string, unknown>>>(
    "fdacs_class_d_lias_workflow_events?" + new URLSearchParams({
      select: "id,queue_id,completion_record_id,enrollment_id,event_type,actor_clerk_user_id,event_note,submission_reference,certificate_reference,correlation_id,occurred_at,metadata",
      queue_id: `eq.${queueId}`,
      order: "occurred_at.asc,id.asc",
      limit: "500",
    }),
  );
}

export async function markFloridaClassDLiasSubmitted(
  actorUserId: string,
  input: { queueId: string; submissionReference: string; correlationId?: string },
) {
  requireWorkflowEnabled();
  requireUuid(input.queueId, "queue id");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");
  const submissionReference = input.submissionReference.trim();
  if (submissionReference.length < 3 || submissionReference.length > 500) {
    throw new FloridaClassDExamError("LIAS submission reference is required.", 400, "FDACS_LIAS_SUBMISSION_REFERENCE_REQUIRED");
  }
  await request("rpc/fdacs_class_d_mark_lias_submitted", {
    method: "POST",
    body: JSON.stringify({
      p_queue_id: input.queueId,
      p_actor_clerk_user_id: actorUserId,
      p_submission_reference: submissionReference,
      p_correlation_id: correlationId,
    }),
  });
  return { queueId: input.queueId, status: "submitted", submissionReference, correlationId };
}

export async function confirmFloridaClassDLiasCertificate(
  actorUserId: string,
  input: { queueId: string; certificateReference: string; correlationId?: string },
) {
  requireWorkflowEnabled();
  requireUuid(input.queueId, "queue id");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");
  const certificateReference = input.certificateReference.trim();
  if (certificateReference.length < 3 || certificateReference.length > 500) {
    throw new FloridaClassDExamError("FDACS-16103 certificate reference is required.", 400, "FDACS_LIAS_CERTIFICATE_REFERENCE_REQUIRED");
  }
  await request("rpc/fdacs_class_d_confirm_lias_certificate", {
    method: "POST",
    body: JSON.stringify({
      p_queue_id: input.queueId,
      p_actor_clerk_user_id: actorUserId,
      p_certificate_reference: certificateReference,
      p_correlation_id: correlationId,
    }),
  });
  return { queueId: input.queueId, status: "confirmed", certificateReference, correlationId };
}

export async function openFloridaClassDLiasException(
  actorUserId: string,
  input: { queueId: string; exceptionNote: string; correlationId?: string },
) {
  requireWorkflowEnabled();
  requireUuid(input.queueId, "queue id");
  const correlationId = input.correlationId ?? randomUUID();
  requireUuid(correlationId, "correlation id");
  const exceptionNote = input.exceptionNote.trim();
  if (exceptionNote.length < 3 || exceptionNote.length > 4000) {
    throw new FloridaClassDExamError("Documented LIAS exception note is required.", 400, "FDACS_LIAS_EXCEPTION_NOTE_REQUIRED");
  }
  await request("rpc/fdacs_class_d_open_lias_exception", {
    method: "POST",
    body: JSON.stringify({
      p_queue_id: input.queueId,
      p_actor_clerk_user_id: actorUserId,
      p_exception_note: exceptionNote,
      p_correlation_id: correlationId,
    }),
  });
  return { queueId: input.queueId, status: "exception", correlationId };
}

export async function getFloridaClassDLiasInspectionPacket(enrollmentId: string) {
  requireUuid(enrollmentId, "enrollment id");
  const [enrollment, identity, attendance, instructionTime, liveTime, moduleProgress, examAttempts, completion, queue, audit] = await Promise.all([
    request<Array<Record<string, unknown>>>(`fdacs_class_d_enrollments?${new URLSearchParams({ select: "id,student_identity_id,course_id,cohort_id,status,enrolled_at,retention_review_after", id: `eq.${enrollmentId}`, limit: "1" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_student_identities?${new URLSearchParams({ select: "id,identity_status,verification_reference,verified_at", clerk_user_id: `eq.__resolved_server_side__`, limit: "0" })}`).catch(() => []),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_attendance_entries?${new URLSearchParams({ select: "id,day,status,checked_in_at,checked_out_at,instructional_minutes_credited,attested_by_clerk_user_id,created_at", enrollment_id: `eq.${enrollmentId}`, order: "day.asc,created_at.asc", limit: "500" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_instruction_time_entries?${new URLSearchParams({ select: "id,module_id,started_at,ended_at,credited_minutes,source,recorded_by_clerk_user_id,created_at", enrollment_id: `eq.${enrollmentId}`, order: "started_at.asc", limit: "1000" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_live_time_totals?${new URLSearchParams({ select: "id,live_session_id,day,connected_seconds,instructional_presence_seconds,break_presence_seconds,uncredited_connected_seconds,presence_state,last_heartbeat_at", enrollment_id: `eq.${enrollmentId}`, order: "day.asc", limit: "500" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_module_progress?${new URLSearchParams({ select: "module_id,status,instructional_minutes_credited,learning_check_passed,completed_at", enrollment_id: `eq.${enrollmentId}`, order: "module_id.asc", limit: "18" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_exam_attempts?${new URLSearchParams({ select: "id,status,started_at,submitted_at,score,passed,bank_id,retest_authorization_id", enrollment_id: `eq.${enrollmentId}`, order: "started_at.asc", limit: "50" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_completion_records?${new URLSearchParams({ select: "id,status,passed_exam_attempt_id,verified_instructional_minutes,completion_evidence,approved_by_clerk_user_id,approved_at,review_note,retention_review_after", enrollment_id: `eq.${enrollmentId}`, limit: "1" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_lias_reporting_queue?${new URLSearchParams({ select: "id,status,prepared_at,reporting_due_on,submission_reference,submitted_at,confirmed_at,certificate_reference,exception_note,exception_at", enrollment_id: `eq.${enrollmentId}`, limit: "1" })}`),
    request<Array<Record<string, unknown>>>(`fdacs_class_d_audit_events?${new URLSearchParams({ select: "id,occurred_at,actor_role,entity_type,entity_id,action,correlation_id,metadata", enrollment_id: `eq.${enrollmentId}`, order: "occurred_at.asc", limit: "2000" })}`),
  ]);

  const enrollmentRecord = enrollment[0];
  if (!enrollmentRecord) throw new FloridaClassDExamError("Enrollment was not found.", 404, "FDACS_LIAS_ENROLLMENT_NOT_FOUND");

  return {
    schema: "obserra.fdacs.class-d.inspection-packet.v1",
    generatedAt: new Date().toISOString(),
    executionMode: FLORIDA_CLASS_D_LIAS_POLICY.executionMode,
    enrollment: enrollmentRecord,
    identityVerification: identity,
    attendance,
    instructionTime,
    liveTime,
    moduleProgress,
    examAttempts,
    completion: completion[0] ?? null,
    lias: queue[0] ?? null,
    audit,
  };
}
