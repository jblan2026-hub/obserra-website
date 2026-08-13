import "server-only";

import { createHash, randomInt } from "node:crypto";
import { floridaClassDMakeupEnabled, FloridaClassDMakeupError } from "./florida-class-d-makeup";

const DEFAULT_SUPABASE_URL = "https://nwxnyqlyzyufgoadtqxs.supabase.co";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEARTBEAT_SECONDS = 30;
const CHALLENGE_INTERVAL_MINUTES = 110;
const CHALLENGE_EXPIRY_MINUTES = 5;

export const FLORIDA_CLASS_D_RECORDED_MAKEUP_POLICY = {
  heartbeatSeconds: HEARTBEAT_SECONDS,
  challengeIntervalMinutes: CHALLENGE_INTERVAL_MINUTES,
  challengeExpiryMinutes: CHALLENGE_EXPIRY_MINUTES,
  playbackRate: 1,
  seekForwardCreditAllowed: false,
  hiddenTabCreditAllowed: false,
  directAssetUrlExposed: false,
  completionRequiresVerifiedWatchTime: true,
  completionRequiresNoPendingChallenge: true,
  completionCreatesReviewEvidenceOnly: true,
} as const;

type AssignmentRow = {
  id: string;
  enrollment_id: string;
  delivery_method: string;
  assigned_minutes: number;
  recording_asset_reference?: string | null;
  status: string;
};

type EnrollmentRow = { id: string; clerk_user_id: string };
type PlaybackRow = {
  id: string;
  assignment_id: string;
  enrollment_id: string;
  clerk_user_id: string;
  clerk_session_id: string;
  browser_instance_id: string;
  status: string;
  playback_position_seconds: number;
  verified_watch_seconds: number;
  uncredited_seconds: number;
  started_at: string;
  last_heartbeat_at: string;
  challenge_due_at: string;
  completed_at?: string | null;
};

type ChallengeRow = {
  id: string;
  playback_session_id: string;
  challenge_code_digest: string;
  status: string;
  expires_at: string;
  attempt_count: number;
};

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

export function floridaClassDRecordedMakeupEnabled() {
  return (
    floridaClassDMakeupEnabled() &&
    enabled(process.env.OBSERRA_FDACS_CLASS_D_RECORDED_MAKEUP_ENABLED) &&
    Boolean(process.env.OBSERRA_FDACS_RECORDED_MEDIA_ORIGIN?.trim())
  );
}

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const mediaOrigin = process.env.OBSERRA_FDACS_RECORDED_MEDIA_ORIGIN?.trim().replace(/\/$/, "") || "";
  if (!key || !url.startsWith("https://") || !mediaOrigin.startsWith("https://")) {
    throw new FloridaClassDMakeupError("Recorded make-up delivery is not configured.", 503, "FDACS_RECORDED_MAKEUP_NOT_CONFIGURED");
  }
  return { key, url, mediaOrigin };
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
    throw new FloridaClassDMakeupError(typeof record?.message === "string" ? record.message : "Recorded make-up operation failed.", response.status >= 500 ? 502 : response.status, typeof record?.code === "string" ? record.code : "FDACS_RECORDED_MAKEUP_FAILED");
  }
  return payload as T;
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDMakeupError(`Invalid ${field}.`, 400, "FDACS_RECORDED_MAKEUP_INVALID_IDENTIFIER");
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function assignmentForStudent(userId: string, assignmentId: string) {
  requireUuid(assignmentId, "assignment id");
  const assignments = await request<AssignmentRow[]>(`fdacs_class_d_makeup_assignments?${new URLSearchParams({ select: "id,enrollment_id,delivery_method,assigned_minutes,recording_asset_reference,status", id: `eq.${assignmentId}`, limit: "1" })}`);
  const assignment = assignments[0];
  if (!assignment || assignment.delivery_method !== "recorded_makeup" || !assignment.recording_asset_reference) {
    throw new FloridaClassDMakeupError("Recorded make-up assignment is not available.", 404, "FDACS_RECORDED_MAKEUP_ASSIGNMENT_NOT_AVAILABLE");
  }
  if (["cancelled", "failed", "certified"].includes(assignment.status)) {
    throw new FloridaClassDMakeupError("Recorded make-up assignment is closed.", 409, "FDACS_RECORDED_MAKEUP_ASSIGNMENT_CLOSED");
  }
  const enrollments = await request<EnrollmentRow[]>(`fdacs_class_d_enrollments?${new URLSearchParams({ select: "id,clerk_user_id", id: `eq.${assignment.enrollment_id}`, limit: "1" })}`);
  if (!enrollments[0] || enrollments[0].clerk_user_id !== userId) {
    throw new FloridaClassDMakeupError("You are not authorized for this recorded make-up assignment.", 403, "FDACS_RECORDED_MAKEUP_STUDENT_MISMATCH");
  }
  return assignment;
}

function mediaUrl(assetReference: string) {
  const { mediaOrigin } = config();
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{2,240}$/.test(assetReference) || assetReference.includes("..")) {
    throw new FloridaClassDMakeupError("Recorded asset reference is invalid.", 500, "FDACS_RECORDED_MAKEUP_ASSET_INVALID");
  }
  return `${mediaOrigin}/${assetReference}`;
}

export async function startFloridaClassDRecordedMakeup(userId: string, clerkSessionId: string | null, input: { assignmentId: string; browserInstanceId: string; correlationId: string }) {
  requireUuid(input.correlationId, "correlation id");
  if (!clerkSessionId || clerkSessionId.length < 3) throw new FloridaClassDMakeupError("A valid authenticated session is required.", 401, "FDACS_RECORDED_MAKEUP_SESSION_REQUIRED");
  if (input.browserInstanceId.length < 12 || input.browserInstanceId.length > 180) throw new FloridaClassDMakeupError("Browser instance identifier is invalid.", 400, "FDACS_RECORDED_MAKEUP_DEVICE_INVALID");
  const assignment = await assignmentForStudent(userId, input.assignmentId);

  const existing = await request<PlaybackRow[]>(`fdacs_class_d_recorded_playback_sessions?${new URLSearchParams({ select: "id,assignment_id,enrollment_id,clerk_user_id,clerk_session_id,browser_instance_id,status,playback_position_seconds,verified_watch_seconds,uncredited_seconds,started_at,last_heartbeat_at,challenge_due_at,completed_at", enrollment_id: `eq.${assignment.enrollment_id}`, status: "in.(active,paused,challenge_required)", order: "created_at.desc", limit: "1" })}`);
  if (existing[0]) {
    if (existing[0].browser_instance_id !== input.browserInstanceId || existing[0].clerk_session_id !== clerkSessionId) {
      throw new FloridaClassDMakeupError("Recorded make-up is already active on another device or session.", 409, "FDACS_RECORDED_MAKEUP_SINGLE_DEVICE");
    }
    return { playback: existing[0], mediaUrl: mediaUrl(assignment.recording_asset_reference), requiredWatchSeconds: assignment.assigned_minutes * 60, resumed: true };
  }

  const rows = await request<PlaybackRow[]>("fdacs_class_d_recorded_playback_sessions", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      assignment_id: assignment.id,
      enrollment_id: assignment.enrollment_id,
      clerk_user_id: userId,
      clerk_session_id: clerkSessionId,
      browser_instance_id: input.browserInstanceId,
      status: "active",
      correlation_id: input.correlationId,
    }),
  });
  const playback = rows[0];
  if (!playback?.id) throw new FloridaClassDMakeupError("Recorded make-up session was not created.", 502, "FDACS_RECORDED_MAKEUP_SESSION_CREATE_FAILED");
  await request(`fdacs_class_d_makeup_assignments?${new URLSearchParams({ id: `eq.${assignment.id}` })}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ status: "in_progress", updated_at: new Date().toISOString() }) });
  return { playback, mediaUrl: mediaUrl(assignment.recording_asset_reference), requiredWatchSeconds: assignment.assigned_minutes * 60, resumed: false };
}

export async function heartbeatFloridaClassDRecordedMakeup(userId: string, input: { playbackSessionId: string; browserInstanceId: string; observedPositionSeconds: number; pageVisible: boolean; correlationId: string }) {
  requireUuid(input.playbackSessionId, "playback session id");
  requireUuid(input.correlationId, "correlation id");
  if (!Number.isInteger(input.observedPositionSeconds) || input.observedPositionSeconds < 0) throw new FloridaClassDMakeupError("Playback position is invalid.", 400, "FDACS_RECORDED_MAKEUP_POSITION_INVALID");
  const rows = await request<Array<Record<string, unknown>>>("rpc/fdacs_class_d_record_recorded_playback_heartbeat", {
    method: "POST",
    body: JSON.stringify({
      p_playback_session_id: input.playbackSessionId,
      p_clerk_user_id: userId,
      p_browser_instance_id: input.browserInstanceId,
      p_observed_position_seconds: input.observedPositionSeconds,
      p_page_visible: input.pageVisible,
      p_correlation_id: input.correlationId,
    }),
  });
  return Array.isArray(rows) ? rows[0] ?? rows : rows;
}

export async function issueFloridaClassDRecordedMakeupChallenge(userId: string, input: { playbackSessionId: string; correlationId: string }) {
  requireUuid(input.playbackSessionId, "playback session id");
  requireUuid(input.correlationId, "correlation id");
  const sessions = await request<PlaybackRow[]>(`fdacs_class_d_recorded_playback_sessions?${new URLSearchParams({ select: "id,assignment_id,enrollment_id,clerk_user_id,clerk_session_id,browser_instance_id,status,playback_position_seconds,verified_watch_seconds,uncredited_seconds,started_at,last_heartbeat_at,challenge_due_at,completed_at", id: `eq.${input.playbackSessionId}`, clerk_user_id: `eq.${userId}`, limit: "1" })}`);
  const session = sessions[0];
  if (!session) throw new FloridaClassDMakeupError("Recorded make-up session was not found.", 404, "FDACS_RECORDED_MAKEUP_SESSION_NOT_FOUND");
  const pending = await request<ChallengeRow[]>(`fdacs_class_d_recorded_playback_challenges?${new URLSearchParams({ select: "id,playback_session_id,challenge_code_digest,status,expires_at,attempt_count", playback_session_id: `eq.${session.id}`, status: "eq.pending", limit: "1" })}`);
  if (pending[0]) return { challengeId: pending[0].id, expiresAt: pending[0].expires_at, alreadyPending: true };

  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + CHALLENGE_EXPIRY_MINUTES * 60_000).toISOString();
  const rows = await request<ChallengeRow[]>("fdacs_class_d_recorded_playback_challenges", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({ playback_session_id: session.id, assignment_id: session.assignment_id, enrollment_id: session.enrollment_id, challenge_code_digest: digest(code), expires_at: expiresAt, correlation_id: input.correlationId }),
  });
  await request(`fdacs_class_d_recorded_playback_sessions?${new URLSearchParams({ id: `eq.${session.id}` })}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ status: "challenge_required", updated_at: new Date().toISOString() }) });
  return { challengeId: rows[0]?.id, code, expiresAt, alreadyPending: false };
}

export async function answerFloridaClassDRecordedMakeupChallenge(userId: string, input: { playbackSessionId: string; challengeId: string; answer: string; correlationId: string }) {
  requireUuid(input.playbackSessionId, "playback session id");
  requireUuid(input.challengeId, "challenge id");
  requireUuid(input.correlationId, "correlation id");
  const sessions = await request<PlaybackRow[]>(`fdacs_class_d_recorded_playback_sessions?${new URLSearchParams({ select: "id,clerk_user_id,status", id: `eq.${input.playbackSessionId}`, clerk_user_id: `eq.${userId}`, limit: "1" })}`);
  if (!sessions[0]) throw new FloridaClassDMakeupError("Recorded make-up session was not found.", 404, "FDACS_RECORDED_MAKEUP_SESSION_NOT_FOUND");
  const challenges = await request<ChallengeRow[]>(`fdacs_class_d_recorded_playback_challenges?${new URLSearchParams({ select: "id,playback_session_id,challenge_code_digest,status,expires_at,attempt_count", id: `eq.${input.challengeId}`, playback_session_id: `eq.${input.playbackSessionId}`, limit: "1" })}`);
  const challenge = challenges[0];
  if (!challenge || challenge.status !== "pending") throw new FloridaClassDMakeupError("Presence challenge is not active.", 409, "FDACS_RECORDED_MAKEUP_CHALLENGE_NOT_ACTIVE");
  const expired = Date.parse(challenge.expires_at) <= Date.now();
  const correct = !expired && digest(input.answer.trim()) === challenge.challenge_code_digest;
  const attempts = challenge.attempt_count + 1;
  const passed = correct;
  const failed = expired || (!correct && attempts >= 2);
  const status = passed ? "passed" : failed ? (expired ? "expired" : "failed") : "pending";
  await request(`fdacs_class_d_recorded_playback_challenges?${new URLSearchParams({ id: `eq.${challenge.id}` })}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ attempt_count: attempts, status, passed_at: passed ? new Date().toISOString() : null, failed_at: failed ? new Date().toISOString() : null }) });
  if (passed) {
    await request(`fdacs_class_d_recorded_playback_sessions?${new URLSearchParams({ id: `eq.${input.playbackSessionId}` })}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ status: "active", last_challenge_at: new Date().toISOString(), challenge_due_at: new Date(Date.now() + CHALLENGE_INTERVAL_MINUTES * 60_000).toISOString(), last_heartbeat_at: new Date().toISOString(), updated_at: new Date().toISOString() }) });
  } else if (failed) {
    await request(`fdacs_class_d_recorded_playback_sessions?${new URLSearchParams({ id: `eq.${input.playbackSessionId}` })}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ status: "invalidated", invalidated_at: new Date().toISOString(), invalidation_reason: "presence challenge failed or expired", updated_at: new Date().toISOString() }) });
  }
  return { passed, failed, attemptsRemaining: Math.max(0, 2 - attempts) };
}

export async function completeFloridaClassDRecordedMakeup(userId: string, input: { playbackSessionId: string; correlationId: string }) {
  requireUuid(input.playbackSessionId, "playback session id");
  requireUuid(input.correlationId, "correlation id");
  const sessions = await request<PlaybackRow[]>(`fdacs_class_d_recorded_playback_sessions?${new URLSearchParams({ select: "id,assignment_id,enrollment_id,clerk_user_id,status,verified_watch_seconds,started_at,last_heartbeat_at,challenge_due_at", id: `eq.${input.playbackSessionId}`, clerk_user_id: `eq.${userId}`, limit: "1" })}`);
  const session = sessions[0];
  if (!session) throw new FloridaClassDMakeupError("Recorded make-up session was not found.", 404, "FDACS_RECORDED_MAKEUP_SESSION_NOT_FOUND");
  const assignment = await assignmentForStudent(userId, session.assignment_id);
  const requiredSeconds = assignment.assigned_minutes * 60;
  if (session.status === "challenge_required") throw new FloridaClassDMakeupError("Complete the active presence challenge first.", 409, "FDACS_RECORDED_MAKEUP_CHALLENGE_REQUIRED");
  if (session.verified_watch_seconds < requiredSeconds) throw new FloridaClassDMakeupError("Required verified playback time is not complete.", 409, "FDACS_RECORDED_MAKEUP_TIME_INCOMPLETE");
  const now = new Date().toISOString();
  const evidenceReference = `recorded-playback:${session.id}`;
  await request(`fdacs_class_d_recorded_playback_sessions?${new URLSearchParams({ id: `eq.${session.id}` })}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ status: "completed", completed_at: now, updated_at: now }) });
  await request(`fdacs_class_d_makeup_assignments?${new URLSearchParams({ id: `eq.${assignment.id}` })}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ status: "ready_for_review", evidence_reference: evidenceReference, evidence_started_at: session.started_at, evidence_ended_at: now, updated_at: now }) });
  return { completed: true, assignmentId: assignment.id, playbackSessionId: session.id, evidenceReference, evidenceStartedAt: session.started_at, evidenceEndedAt: now, verifiedWatchSeconds: session.verified_watch_seconds, requiredWatchSeconds: requiredSeconds };
}
