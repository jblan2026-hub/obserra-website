import "server-only";

import { createHash } from "node:crypto";
import type { FloridaClassDStaffRole } from "./florida-class-d-auth";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BROWSER_INSTANCE_PATTERN = /^[A-Za-z0-9._:-]{12,180}$/;

export class FloridaClassDLivePersistenceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDLivePersistenceError";
  }
}

type StaffActor = { userId: string; role: FloridaClassDStaffRole };

type LiveInteractionType =
  | "student_question"
  | "instructor_answer"
  | "instructor_prompt"
  | "student_response"
  | "hand_raise"
  | "poll_response";

function serviceRoleKey() {
  return process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
}

function config() {
  const key = serviceRoleKey();
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key) throw new FloridaClassDLivePersistenceError("Class D live persistence is not configured.", 503, "FDACS_LIVE_PERSISTENCE_NOT_CONFIGURED");
  if (!url.startsWith("https://")) throw new FloridaClassDLivePersistenceError("Class D live persistence URL is invalid.", 503, "FDACS_LIVE_PERSISTENCE_INVALID_URL");
  return { key, url };
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDLivePersistenceError(`Invalid ${field}.`, 400, "FDACS_LIVE_INVALID_IDENTIFIER");
}

function requireBrowserInstance(value: string) {
  if (!BROWSER_INSTANCE_PATTERN.test(value)) throw new FloridaClassDLivePersistenceError("Invalid browser instance identifier.", 400, "FDACS_LIVE_INVALID_BROWSER_INSTANCE");
}

function digestAnswer(answer: string) {
  const normalized = answer.trim().toLowerCase();
  if (!normalized || normalized.length > 500) throw new FloridaClassDLivePersistenceError("Invalid challenge response.", 400, "FDACS_LIVE_INVALID_CHALLENGE_RESPONSE");
  return createHash("sha256").update(normalized, "utf8").digest("hex");
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
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDLivePersistenceError("Class D live persistence returned an invalid response.", 502, "FDACS_LIVE_INVALID_RESPONSE");
    }
  }
  if (!response.ok) {
    const error = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    throw new FloridaClassDLivePersistenceError(
      typeof error?.message === "string" ? error.message : "Class D live persistence operation failed.",
      response.status,
      typeof error?.code === "string" ? error.code : "FDACS_LIVE_PERSISTENCE_FAILED",
    );
  }
  return payload as T;
}

function rpc<T>(name: string, body: Record<string, unknown>) {
  return request<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}

async function resolveStudentEnrollment(userId: string, liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  const sessionQuery = new URLSearchParams({ select: "id,cohort_id,day,lesson_id,status,current_segment_type,started_at,ended_at", id: `eq.${liveSessionId}`, limit: "1" });
  const sessions = await request<Record<string, unknown>[]>(`fdacs_class_d_live_sessions?${sessionQuery}`);
  const session = sessions[0];
  if (!session || typeof session.cohort_id !== "string") throw new FloridaClassDLivePersistenceError("Live session not found.", 404, "FDACS_LIVE_SESSION_NOT_FOUND");

  const enrollmentQuery = new URLSearchParams({
    select: "id,status,cohort_id,student_identity_id",
    clerk_user_id: `eq.${userId}`,
    cohort_id: `eq.${session.cohort_id}`,
    limit: "1",
  });
  const enrollments = await request<Record<string, unknown>[]>(`fdacs_class_d_enrollments?${enrollmentQuery}`);
  const enrollment = enrollments[0];
  if (!enrollment || typeof enrollment.id !== "string") throw new FloridaClassDLivePersistenceError("Student is not enrolled in this live cohort.", 403, "FDACS_LIVE_NOT_ENROLLED");
  return { session, enrollmentId: enrollment.id };
}

export async function scheduleFloridaClassDLiveSession(actor: StaffActor, input: {
  cohortId: string;
  day: 1 | 2 | 3 | 4 | 5;
  lessonId: string;
  instructorLicenseNumber: string;
  schoolLicenseNumber: string;
  correlationId: string;
}) {
  requireUuid(input.cohortId, "cohort id");
  requireUuid(input.correlationId, "correlation id");
  if (!/^D[1-5]-L[1-4]$/.test(input.lessonId)) throw new FloridaClassDLivePersistenceError("Invalid lesson id.", 400, "FDACS_LIVE_INVALID_LESSON");
  const rows = await request<Record<string, unknown>[]>("fdacs_class_d_live_sessions", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      cohort_id: input.cohortId,
      day: input.day,
      lesson_id: input.lessonId,
      instructor_clerk_user_id: actor.userId,
      instructor_license_number: input.instructorLicenseNumber,
      school_license_number: input.schoolLicenseNumber,
      physical_location_state: "FL",
      status: "scheduled",
    }),
  });
  return rows[0] ?? null;
}

export function startFloridaClassDLiveSession(actor: StaffActor, input: {
  liveSessionId: string;
  instructorLicenseNumber: string;
  schoolLicenseNumber: string;
  inspectionAccessReference?: string | null;
  correlationId: string;
}) {
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<null>("fdacs_class_d_start_live_session", {
    p_live_session_id: input.liveSessionId,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_instructor_license_number: input.instructorLicenseNumber,
    p_school_license_number: input.schoolLicenseNumber,
    p_inspection_access_reference: input.inspectionAccessReference ?? null,
    p_correlation_id: input.correlationId,
  });
}

export function setFloridaClassDLiveSegment(actor: StaffActor, input: {
  liveSessionId: string;
  segmentType: "instruction" | "break";
  correlationId: string;
}) {
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<null>("fdacs_class_d_set_live_segment", {
    p_live_session_id: input.liveSessionId,
    p_segment_type: input.segmentType,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  });
}

export function endFloridaClassDLiveSession(actor: StaffActor, input: { liveSessionId: string; correlationId: string }) {
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<null>("fdacs_class_d_end_live_session", {
    p_live_session_id: input.liveSessionId,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  });
}

export async function acquireFloridaClassDDeviceLease(userId: string, input: {
  liveSessionId: string;
  clerkSessionId: string;
  browserInstanceId: string;
  correlationId: string;
}) {
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  requireBrowserInstance(input.browserInstanceId);
  if (input.clerkSessionId.length < 3 || input.clerkSessionId.length > 255) throw new FloridaClassDLivePersistenceError("Invalid authenticated session.", 400, "FDACS_LIVE_INVALID_SESSION");
  return rpc<string>("fdacs_class_d_acquire_device_lease", {
    p_live_session_id: input.liveSessionId,
    p_clerk_user_id: userId,
    p_clerk_session_id: input.clerkSessionId,
    p_browser_instance_id: input.browserInstanceId,
    p_correlation_id: input.correlationId,
  });
}

export function recordFloridaClassDLiveHeartbeat(userId: string, input: { deviceLeaseId: string; correlationId: string }) {
  requireUuid(input.deviceLeaseId, "device lease id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<Record<string, unknown>>("fdacs_class_d_record_live_heartbeat", {
    p_device_lease_id: input.deviceLeaseId,
    p_clerk_user_id: userId,
    p_correlation_id: input.correlationId,
  });
}

export async function releaseFloridaClassDDeviceLease(userId: string, deviceLeaseId: string) {
  requireUuid(deviceLeaseId, "device lease id");
  const leaseQuery = new URLSearchParams({ select: "id,enrollment_id,released_at", id: `eq.${deviceLeaseId}`, limit: "1" });
  const leases = await request<Record<string, unknown>[]>(`fdacs_class_d_device_leases?${leaseQuery}`);
  const lease = leases[0];
  if (!lease || typeof lease.enrollment_id !== "string") return;
  const ownerQuery = new URLSearchParams({ select: "id", id: `eq.${lease.enrollment_id}`, clerk_user_id: `eq.${userId}`, limit: "1" });
  const owners = await request<Record<string, unknown>[]>(`fdacs_class_d_enrollments?${ownerQuery}`);
  if (!owners[0]) throw new FloridaClassDLivePersistenceError("Device lease does not belong to authenticated student.", 403, "FDACS_LIVE_LEASE_FORBIDDEN");
  await request(`fdacs_class_d_device_leases?id=eq.${deviceLeaseId}&released_at=is.null`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ released_at: new Date().toISOString(), release_reason: "student_left_live_class" }),
  });
}

export async function getFloridaClassDLiveStudentState(userId: string, liveSessionId: string) {
  const { session, enrollmentId } = await resolveStudentEnrollment(userId, liveSessionId);
  const timeQuery = new URLSearchParams({ select: "connected_seconds,instructional_presence_seconds,break_presence_seconds,uncredited_connected_seconds,presence_state,last_heartbeat_at", enrollment_id: `eq.${enrollmentId}`, live_session_id: `eq.${liveSessionId}`, limit: "1" });
  const challengeQuery = new URLSearchParams({ select: "id,challenge_type,prompt,issued_at,expires_at,retry_expires_at,attempt_count,status", enrollment_id: `eq.${enrollmentId}`, live_session_id: `eq.${liveSessionId}`, or: "(status.eq.pending,status.eq.retry_required)", order: "issued_at.desc", limit: "1" });
  const interactionQuery = new URLSearchParams({ select: "id,enrollment_id,actor_role,interaction_type,content,parent_interaction_id,created_at", live_session_id: `eq.${liveSessionId}`, order: "created_at.asc", limit: "200" });
  const [timeRows, challengeRows, interactions] = await Promise.all([
    request<Record<string, unknown>[]>(`fdacs_class_d_live_time_totals?${timeQuery}`),
    request<Record<string, unknown>[]>(`fdacs_class_d_presence_challenges?${challengeQuery}`),
    request<Record<string, unknown>[]>(`fdacs_class_d_live_interactions?${interactionQuery}`),
  ]);
  return { session, enrollmentId, time: timeRows[0] ?? null, pendingChallenge: challengeRows[0] ?? null, interactions };
}

export function respondFloridaClassDPresenceChallenge(userId: string, input: { challengeId: string; answer: string; correlationId: string }) {
  requireUuid(input.challengeId, "challenge id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<Record<string, unknown>>("fdacs_class_d_respond_presence_challenge", {
    p_challenge_id: input.challengeId,
    p_clerk_user_id: userId,
    p_answer_digest: digestAnswer(input.answer),
    p_correlation_id: input.correlationId,
  });
}

export function issueFloridaClassDPresenceChallenge(actor: StaffActor, input: {
  liveSessionId: string;
  enrollmentId: string;
  challengeType: "presence_code" | "lesson_check" | "instructor_prompt";
  prompt: string;
  answer: string;
  correlationId: string;
}) {
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.correlationId, "correlation id");
  if (!input.prompt.trim() || input.prompt.length > 1000) throw new FloridaClassDLivePersistenceError("Invalid challenge prompt.", 400, "FDACS_LIVE_INVALID_CHALLENGE_PROMPT");
  return rpc<string>("fdacs_class_d_issue_presence_challenge", {
    p_live_session_id: input.liveSessionId,
    p_enrollment_id: input.enrollmentId,
    p_challenge_type: input.challengeType,
    p_prompt: input.prompt.trim(),
    p_answer_digest: digestAnswer(input.answer),
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  });
}

export function restoreFloridaClassDPresence(actor: StaffActor, input: {
  enrollmentId: string;
  liveSessionId: string;
  reviewNote: string;
  correlationId: string;
}) {
  requireUuid(input.enrollmentId, "enrollment id");
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<null>("fdacs_class_d_restore_presence_after_review", {
    p_enrollment_id: input.enrollmentId,
    p_live_session_id: input.liveSessionId,
    p_review_note: input.reviewNote,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  });
}

export async function postFloridaClassDLiveInteraction(input: {
  liveSessionId: string;
  actorRole: "student" | "instructor";
  actorUserId: string;
  interactionType: LiveInteractionType;
  content?: string | null;
  parentInteractionId?: string | null;
  correlationId: string;
  enrollmentId?: string | null;
}) {
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  if (input.parentInteractionId) requireUuid(input.parentInteractionId, "parent interaction id");
  let enrollmentId = input.enrollmentId ?? null;
  if (input.actorRole === "student") {
    enrollmentId = (await resolveStudentEnrollment(input.actorUserId, input.liveSessionId)).enrollmentId;
  } else if (enrollmentId) {
    requireUuid(enrollmentId, "enrollment id");
  }
  const content = input.content?.trim() || null;
  if (content && content.length > 4000) throw new FloridaClassDLivePersistenceError("Live interaction is too long.", 400, "FDACS_LIVE_INTERACTION_TOO_LONG");
  const rows = await request<Record<string, unknown>[]>("fdacs_class_d_live_interactions", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      live_session_id: input.liveSessionId,
      enrollment_id: enrollmentId,
      actor_role: input.actorRole,
      actor_clerk_user_id: input.actorUserId,
      interaction_type: input.interactionType,
      content,
      parent_interaction_id: input.parentInteractionId ?? null,
      correlation_id: input.correlationId,
    }),
  });
  return rows[0] ?? null;
}

export async function getFloridaClassDLiveRoster(liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  const sessionQuery = new URLSearchParams({ select: "id,cohort_id,day,lesson_id,status,current_segment_type,started_at,ended_at", id: `eq.${liveSessionId}`, limit: "1" });
  const sessions = await request<Record<string, unknown>[]>(`fdacs_class_d_live_sessions?${sessionQuery}`);
  const session = sessions[0];
  if (!session || typeof session.cohort_id !== "string") throw new FloridaClassDLivePersistenceError("Live session not found.", 404, "FDACS_LIVE_SESSION_NOT_FOUND");
  const enrollmentQuery = new URLSearchParams({ select: "id,status,student_identity_id,fdacs_class_d_student_identities(id,legal_name,identity_status)", cohort_id: `eq.${session.cohort_id}`, order: "created_at.asc", limit: "250" });
  const enrollments = await request<Record<string, unknown>[]>(`fdacs_class_d_enrollments?${enrollmentQuery}`);
  const timeQuery = new URLSearchParams({ select: "enrollment_id,connected_seconds,instructional_presence_seconds,break_presence_seconds,uncredited_connected_seconds,presence_state,last_heartbeat_at", live_session_id: `eq.${liveSessionId}`, limit: "250" });
  const times = await request<Record<string, unknown>[]>(`fdacs_class_d_live_time_totals?${timeQuery}`);
  const timeByEnrollment = new Map(times.map((row) => [row.enrollment_id, row]));
  return { session, students: enrollments.map((enrollment) => ({ ...enrollment, liveTime: timeByEnrollment.get(enrollment.id) ?? null })) };
}
