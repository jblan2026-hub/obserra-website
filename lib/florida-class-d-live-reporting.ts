import "server-only";

import type { FloridaClassDStaffRole } from "./florida-class-d-auth";
import { floridaClassDSupabaseServerConfigAuthorized } from "./florida-class-d-supabase-config";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type FloridaClassDTimeSummary = {
  connectedSeconds: number;
  instructionalPresenceSeconds: number;
  breakPresenceSeconds: number;
  uncreditedConnectedSeconds: number;
  unresolvedChallengeAbsences: number;
};

function config() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!floridaClassDSupabaseServerConfigAuthorized(url, key)) throw new Error("Class D regulated reporting persistence is not configured.");
  return { key, url };
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new Error(`Invalid ${field}.`);
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
    const message = payload && typeof payload === "object" && !Array.isArray(payload) && typeof (payload as Record<string, unknown>).message === "string"
      ? String((payload as Record<string, unknown>).message)
      : "Class D reporting operation failed.";
    throw new Error(message);
  }
  return payload as T;
}

function asCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function emptySummary(): FloridaClassDTimeSummary {
  return {
    connectedSeconds: 0,
    instructionalPresenceSeconds: 0,
    breakPresenceSeconds: 0,
    uncreditedConnectedSeconds: 0,
    unresolvedChallengeAbsences: 0,
  };
}

function summarize(rows: Record<string, unknown>[]): FloridaClassDTimeSummary {
  return rows.reduce<FloridaClassDTimeSummary>((summary, row) => ({
    connectedSeconds: summary.connectedSeconds + asCount(row.connected_seconds),
    instructionalPresenceSeconds: summary.instructionalPresenceSeconds + asCount(row.instructional_presence_seconds),
    breakPresenceSeconds: summary.breakPresenceSeconds + asCount(row.break_presence_seconds),
    uncreditedConnectedSeconds: summary.uncreditedConnectedSeconds + asCount(row.uncredited_connected_seconds),
    unresolvedChallengeAbsences: summary.unresolvedChallengeAbsences + (row.presence_state === "absent_challenge" ? 1 : 0),
  }), emptySummary());
}

async function resolveEnrollmentForSession(userId: string, liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  const sessionQuery = new URLSearchParams({ select: "id,cohort_id,day", id: `eq.${liveSessionId}`, limit: "1" });
  const sessions = await request<Record<string, unknown>[]>(`fdacs_class_d_live_sessions?${sessionQuery}`);
  const session = sessions[0];
  if (!session || typeof session.cohort_id !== "string" || typeof session.day !== "number") throw new Error("Live session not found.");
  const enrollmentQuery = new URLSearchParams({ select: "id", clerk_user_id: `eq.${userId}`, cohort_id: `eq.${session.cohort_id}`, limit: "1" });
  const enrollments = await request<Record<string, unknown>[]>(`fdacs_class_d_enrollments?${enrollmentQuery}`);
  const enrollmentId = enrollments[0]?.id;
  if (typeof enrollmentId !== "string") throw new Error("Student is not enrolled in this live cohort.");
  return { enrollmentId, day: session.day };
}

export async function getFloridaClassDStudentTimeLedger(userId: string, liveSessionId: string) {
  const { enrollmentId, day } = await resolveEnrollmentForSession(userId, liveSessionId);
  const query = new URLSearchParams({
    select: "day,connected_seconds,instructional_presence_seconds,break_presence_seconds,uncredited_connected_seconds,presence_state",
    enrollment_id: `eq.${enrollmentId}`,
    order: "day.asc,created_at.asc",
    limit: "500",
  });
  const rows = await request<Record<string, unknown>[]>(`fdacs_class_d_live_time_totals?${query}`);
  return {
    enrollmentId,
    day,
    dayTime: summarize(rows.filter((row) => row.day === day)),
    courseTime: summarize(rows),
  };
}

export async function getFloridaClassDRosterTimeLedgers(enrollmentIds: string[], day: number) {
  const validIds = [...new Set(enrollmentIds.filter((id) => UUID_PATTERN.test(id)))];
  if (!validIds.length) return new Map<string, { dayTime: FloridaClassDTimeSummary; courseTime: FloridaClassDTimeSummary }>();
  const query = new URLSearchParams({
    select: "enrollment_id,day,connected_seconds,instructional_presence_seconds,break_presence_seconds,uncredited_connected_seconds,presence_state",
    enrollment_id: `in.(${validIds.join(",")})`,
    order: "day.asc,created_at.asc",
    limit: "5000",
  });
  const rows = await request<Record<string, unknown>[]>(`fdacs_class_d_live_time_totals?${query}`);
  const result = new Map<string, { dayTime: FloridaClassDTimeSummary; courseTime: FloridaClassDTimeSummary }>();
  for (const enrollmentId of validIds) {
    const studentRows = rows.filter((row) => row.enrollment_id === enrollmentId);
    result.set(enrollmentId, {
      dayTime: summarize(studentRows.filter((row) => row.day === day)),
      courseTime: summarize(studentRows),
    });
  }
  return result;
}

export async function certifyFloridaClassDLiveDay(
  actor: { userId: string; role: FloridaClassDStaffRole },
  input: {
    enrollmentId: string;
    day: 1 | 2 | 3 | 4 | 5;
    status: "present" | "partial" | "absent" | "makeup_required";
    idempotencyKey: string;
    correlationId: string;
  },
) {
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.correlationId, "correlation id");
  if (input.idempotencyKey.length < 12 || input.idempotencyKey.length > 180) throw new Error("Invalid attendance certification idempotency key.");
  return request<Record<string, unknown>>("rpc/fdacs_class_d_certify_live_day", {
    method: "POST",
    body: JSON.stringify({
      p_enrollment_id: input.enrollmentId,
      p_day: input.day,
      p_status: input.status,
      p_actor_role: actor.role,
      p_actor_clerk_user_id: actor.userId,
      p_idempotency_key: input.idempotencyKey,
      p_correlation_id: input.correlationId,
    }),
  });
}
