import "server-only";

import { FloridaClassDExamError } from "./florida-class-d-exam";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const FLORIDA_CLASS_D_EXAM_MONITORING_POLICY = {
  heartbeatSeconds: 30,
  oneDevicePerAttempt: true,
  oneAuthenticatedSessionPerAttempt: true,
  hiddenPageTriggersInterruption: true,
  interruptedAttemptRequiresStaffResume: true,
  invalidationRequiresStaffReason: true,
  directBrowserDatabaseAccessAllowed: false,
} as const;

type AttemptMonitorRow = {
  id: string;
  enrollment_id: string;
  clerk_user_id: string;
  status: string;
  monitoring_status: string;
  started_at: string;
  earliest_submit_at: string;
  last_heartbeat_at?: string | null;
  last_visible_at?: string | null;
  interrupted_at?: string | null;
  interruption_reason?: string | null;
  current_question_index: number;
};

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) throw new FloridaClassDExamError("Exam monitoring service is not configured.", 503, "FDACS_EXAM_MONITORING_NOT_CONFIGURED");
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
    throw new FloridaClassDExamError(typeof record?.message === "string" ? record.message : "Exam monitoring request failed.", response.status >= 500 ? 502 : response.status, typeof record?.code === "string" ? record.code : "FDACS_EXAM_MONITORING_FAILED");
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_EXAM_MONITORING_INVALID_IDENTIFIER");
}

export async function heartbeatFloridaClassDExam(userId: string, clerkSessionId: string | null, input: {
  attemptId: string;
  browserInstanceId: string;
  pageVisible: boolean;
  correlationId: string;
}) {
  requireUuid(input.attemptId, "attempt id");
  requireUuid(input.correlationId, "correlation id");
  if (!clerkSessionId) throw new FloridaClassDExamError("Authenticated session is required for exam monitoring.", 401, "FDACS_EXAM_MONITORING_SESSION_REQUIRED");
  if (input.browserInstanceId.length < 12 || input.browserInstanceId.length > 180) throw new FloridaClassDExamError("Browser instance identifier is invalid.", 400, "FDACS_EXAM_MONITORING_DEVICE_INVALID");

  const rows = await request<Array<{ monitoring_status?: string; last_heartbeat_at?: string }>>("rpc/fdacs_class_d_record_exam_heartbeat", {
    method: "POST",
    body: JSON.stringify({
      p_attempt_id: input.attemptId,
      p_clerk_user_id: userId,
      p_clerk_session_id: clerkSessionId,
      p_browser_instance_id: input.browserInstanceId,
      p_page_visible: input.pageVisible,
      p_correlation_id: input.correlationId,
    }),
  });
  const row = rows[0] ?? {};
  return {
    monitoringStatus: row.monitoring_status ?? "unknown",
    lastHeartbeatAt: row.last_heartbeat_at ?? null,
    heartbeatSeconds: FLORIDA_CLASS_D_EXAM_MONITORING_POLICY.heartbeatSeconds,
  };
}

export async function listFloridaClassDActiveExamAttempts() {
  const rows = await request<AttemptMonitorRow[]>(`fdacs_class_d_exam_attempts?${new URLSearchParams({
    select: "id,enrollment_id,clerk_user_id,status,monitoring_status,started_at,earliest_submit_at,last_heartbeat_at,last_visible_at,interrupted_at,interruption_reason,current_question_index",
    status: "eq.in_progress",
    order: "started_at.asc",
    limit: "200",
  })}`);
  const now = Date.now();
  return rows.map((row) => ({
    attemptId: row.id,
    enrollmentId: row.enrollment_id,
    learnerReference: row.clerk_user_id,
    status: row.status,
    monitoringStatus: row.monitoring_status,
    startedAt: row.started_at,
    earliestSubmitAt: row.earliest_submit_at,
    lastHeartbeatAt: row.last_heartbeat_at ?? null,
    lastVisibleAt: row.last_visible_at ?? null,
    interruptedAt: row.interrupted_at ?? null,
    interruptionReason: row.interruption_reason ?? null,
    questionNumber: Math.min(170, Math.max(1, row.current_question_index + 1)),
    heartbeatStale: !row.last_heartbeat_at || now - Date.parse(row.last_heartbeat_at) > 90_000,
  }));
}

export async function authorizeFloridaClassDExamResume(staffUserId: string, input: { attemptId: string; reason: string; correlationId: string }) {
  requireUuid(input.attemptId, "attempt id");
  requireUuid(input.correlationId, "correlation id");
  if (input.reason.trim().length < 3) throw new FloridaClassDExamError("Resume reason is required.", 400, "FDACS_EXAM_RESUME_REASON_REQUIRED");
  await request("rpc/fdacs_class_d_authorize_exam_resume", {
    method: "POST",
    body: JSON.stringify({ p_attempt_id: input.attemptId, p_staff_clerk_user_id: staffUserId, p_reason: input.reason.trim(), p_correlation_id: input.correlationId }),
  });
  return { attemptId: input.attemptId, monitoringStatus: "resume_authorized" };
}

export async function invalidateFloridaClassDExamAttempt(staffUserId: string, input: { attemptId: string; reason: string; correlationId: string }) {
  requireUuid(input.attemptId, "attempt id");
  requireUuid(input.correlationId, "correlation id");
  if (input.reason.trim().length < 3) throw new FloridaClassDExamError("Invalidation reason is required.", 400, "FDACS_EXAM_INVALIDATION_REASON_REQUIRED");
  await request("rpc/fdacs_class_d_invalidate_exam_attempt", {
    method: "POST",
    body: JSON.stringify({ p_attempt_id: input.attemptId, p_staff_clerk_user_id: staffUserId, p_reason: input.reason.trim(), p_correlation_id: input.correlationId }),
  });
  return { attemptId: input.attemptId, status: "invalidated", monitoringStatus: "invalidated" };
}
