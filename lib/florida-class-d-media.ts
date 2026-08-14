import "server-only";

import { createHash } from "node:crypto";
import { floridaClassDLiveInstructionEnabled } from "./florida-class-d-live-policy";

const DAILY_API_BASE = "https://api.daily.co/v1";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class FloridaClassDMediaError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDMediaError";
  }
}

type DailyRoom = {
  name?: string;
  url?: string;
};

type DailyTokenResponse = {
  token?: string;
};

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "enabled";
}

function dailyConfig() {
  const apiKey = process.env.OBSERRA_FDACS_DAILY_API_KEY?.trim() || "";
  if (!apiKey) throw new FloridaClassDMediaError("Class D live media provider is not configured.", 503, "FDACS_MEDIA_NOT_CONFIGURED");
  return { apiKey };
}

function supabaseConfig() {
  const key = process.env.OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_FDACS_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDMediaError("Class D media authorization persistence is not configured.", 503, "FDACS_MEDIA_PERSISTENCE_NOT_CONFIGURED");
  }
  return { key, url };
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) throw new FloridaClassDMediaError(`Invalid ${field}.`, 400, "FDACS_MEDIA_INVALID_IDENTIFIER");
}

async function supabaseRequest<T>(path: string): Promise<T> {
  const { key, url } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      apikey: key,
      authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(10_000),
  });
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDMediaError("Class D media persistence returned an invalid response.", 502, "FDACS_MEDIA_INVALID_PERSISTENCE_RESPONSE");
    }
  }
  if (!response.ok) throw new FloridaClassDMediaError("Class D media authorization lookup failed.", response.status, "FDACS_MEDIA_PERSISTENCE_FAILED");
  return payload as T;
}

async function dailyRequest<T>(path: string, init: RequestInit = {}, allowNotFound = false): Promise<T | null> {
  const { apiKey } = dailyConfig();
  const response = await fetch(`${DAILY_API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    redirect: "error",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  if (allowNotFound && response.status === 404) return null;
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDMediaError("Live media provider returned an invalid response.", 502, "FDACS_MEDIA_INVALID_PROVIDER_RESPONSE");
    }
  }
  if (!response.ok) {
    const error = payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
    const providerMessage = typeof error?.info === "string" ? error.info : typeof error?.error === "string" ? error.error : "Live media provider request failed.";
    throw new FloridaClassDMediaError(providerMessage, response.status >= 500 ? 502 : response.status, "FDACS_MEDIA_PROVIDER_FAILED");
  }
  return payload as T;
}

function roomName(liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  return `fdacs_${liveSessionId.replaceAll("-", "")}`;
}

async function loadSession(liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  const query = new URLSearchParams({
    select: "id,cohort_id,day,lesson_id,status,instructor_clerk_user_id",
    id: `eq.${liveSessionId}`,
    limit: "1",
  });
  const rows = await supabaseRequest<Record<string, unknown>[]>(`fdacs_class_d_live_sessions?${query}`);
  const session = rows[0];
  if (!session || typeof session.cohort_id !== "string") throw new FloridaClassDMediaError("Live session not found.", 404, "FDACS_MEDIA_SESSION_NOT_FOUND");
  return session;
}

function legalName(identity: unknown) {
  if (identity && typeof identity === "object" && !Array.isArray(identity)) {
    const value = (identity as Record<string, unknown>).legal_name;
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 80);
  }
  if (Array.isArray(identity) && identity[0] && typeof identity[0] === "object") {
    const value = (identity[0] as Record<string, unknown>).legal_name;
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 80);
  }
  return "Enrolled Student";
}

async function loadStudentEnrollment(userId: string, cohortId: string) {
  const query = new URLSearchParams({
    select: "id,status,student_identity_id,fdacs_class_d_student_identities(id,legal_name,identity_status)",
    clerk_user_id: `eq.${userId}`,
    cohort_id: `eq.${cohortId}`,
    limit: "1",
  });
  const rows = await supabaseRequest<Record<string, unknown>[]>(`fdacs_class_d_enrollments?${query}`);
  const enrollment = rows[0];
  if (!enrollment || typeof enrollment.id !== "string") throw new FloridaClassDMediaError("Student is not enrolled in this live cohort.", 403, "FDACS_MEDIA_NOT_ENROLLED");
  if (!["enrolled", "active", "in_progress"].includes(String(enrollment.status))) {
    throw new FloridaClassDMediaError("Student enrollment is not eligible for live media access.", 403, "FDACS_MEDIA_ENROLLMENT_NOT_ACTIVE");
  }
  return { enrollmentId: enrollment.id, displayName: legalName(enrollment.fdacs_class_d_student_identities) };
}

async function ensureRoom(liveSessionId: string) {
  const name = roomName(liveSessionId);
  const existing = await dailyRequest<DailyRoom>(`/rooms/${encodeURIComponent(name)}`, {}, true);
  if (existing?.url) return existing;

  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  try {
    const created = await dailyRequest<DailyRoom>("/rooms", {
      method: "POST",
      body: JSON.stringify({
        name,
        privacy: "private",
        properties: {
          exp,
          eject_at_room_exp: true,
          max_participants: 75,
          enable_people_ui: true,
          enable_prejoin_ui: true,
          enable_network_ui: true,
          enable_emoji_reactions: false,
          enable_hand_raising: false,
          enable_screenshare: true,
          enable_chat: false,
          start_video_off: false,
          start_audio_off: true,
          enforce_unique_user_ids: true,
        },
      }),
    });
    if (created?.url) return created;
  } catch (error) {
    if (!(error instanceof FloridaClassDMediaError) || error.status >= 500) throw error;
  }

  const raced = await dailyRequest<DailyRoom>(`/rooms/${encodeURIComponent(name)}`, {}, true);
  if (!raced?.url) throw new FloridaClassDMediaError("Unable to provision the secure live classroom room.", 502, "FDACS_MEDIA_ROOM_PROVISION_FAILED");
  return raced;
}

async function createToken(properties: Record<string, unknown>) {
  const response = await dailyRequest<DailyTokenResponse>("/meeting-tokens", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  if (!response?.token) throw new FloridaClassDMediaError("Live media provider did not return an access token.", 502, "FDACS_MEDIA_TOKEN_MISSING");
  return response.token;
}

function shortInstructorId(userId: string) {
  return `inst_${createHash("sha256").update(userId).digest("hex").slice(0, 24)}`;
}

function shortObserverId(grantId: string) {
  requireUuid(grantId, "observer grant id");
  return `obs_${createHash("sha256").update(grantId).digest("hex").slice(0, 24)}`;
}

function joinUrl(roomUrl: string, token: string) {
  return `${roomUrl}?t=${encodeURIComponent(token)}`;
}

export function floridaClassDLiveMediaEnabled() {
  return (
    floridaClassDLiveInstructionEnabled() &&
    enabled(process.env.OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED) &&
    process.env.OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER?.trim().toLowerCase() === "daily" &&
    Boolean(process.env.OBSERRA_FDACS_DAILY_API_KEY?.trim())
  );
}

export async function getFloridaClassDStudentMediaAccess(userId: string, liveSessionId: string) {
  if (!floridaClassDLiveMediaEnabled()) throw new FloridaClassDMediaError("Class D live video is not yet enabled.", 503, "FDACS_MEDIA_NOT_ENABLED");
  const session = await loadSession(liveSessionId);
  if (!["live", "break"].includes(String(session.status))) {
    throw new FloridaClassDMediaError("The live lesson has not started.", 409, "FDACS_MEDIA_LESSON_NOT_LIVE");
  }
  const cohortId = String(session.cohort_id);
  const student = await loadStudentEnrollment(userId, cohortId);
  const room = await ensureRoom(liveSessionId);
  if (!room.name || !room.url) throw new FloridaClassDMediaError("Live media room is incomplete.", 502, "FDACS_MEDIA_ROOM_INVALID");
  const now = Math.floor(Date.now() / 1000);
  const token = await createToken({
    room_name: room.name,
    user_id: student.enrollmentId,
    user_name: student.displayName,
    nbf: now - 30,
    exp: now + 3 * 60 * 60,
    eject_at_token_exp: true,
    is_owner: false,
    enable_screenshare: false,
    start_video_off: false,
    start_audio_off: true,
    enable_prejoin_ui: true,
    enable_live_captions_ui: true,
    enable_recording_ui: false,
    permissions: {
      hasPresence: true,
      canSend: ["video", "audio"],
      canAdmin: false,
    },
  });
  return {
    provider: "daily" as const,
    roomName: room.name,
    joinUrl: joinUrl(room.url, token),
    tokenExpiresAt: new Date((now + 3 * 60 * 60) * 1000).toISOString(),
    recordingEnabled: false,
  };
}

export async function getFloridaClassDInstructorMediaAccess(userId: string, liveSessionId: string) {
  if (!floridaClassDLiveMediaEnabled()) throw new FloridaClassDMediaError("Class D live video is not yet enabled.", 503, "FDACS_MEDIA_NOT_ENABLED");
  const session = await loadSession(liveSessionId);
  if (!["scheduled", "live", "break"].includes(String(session.status))) {
    throw new FloridaClassDMediaError("This lesson is not eligible for live media access.", 409, "FDACS_MEDIA_LESSON_NOT_ELIGIBLE");
  }
  const room = await ensureRoom(liveSessionId);
  if (!room.name || !room.url) throw new FloridaClassDMediaError("Live media room is incomplete.", 502, "FDACS_MEDIA_ROOM_INVALID");
  const now = Math.floor(Date.now() / 1000);
  const token = await createToken({
    room_name: room.name,
    user_id: shortInstructorId(userId),
    user_name: "Class D Instructor",
    nbf: now - 60,
    exp: now + 4 * 60 * 60,
    eject_at_token_exp: true,
    is_owner: true,
    enable_screenshare: true,
    start_video_off: false,
    start_audio_off: false,
    enable_prejoin_ui: true,
    enable_live_captions_ui: true,
    enable_recording_ui: false,
    permissions: {
      hasPresence: true,
      canSend: true,
      canAdmin: true,
    },
  });
  return {
    provider: "daily" as const,
    roomName: room.name,
    joinUrl: joinUrl(room.url, token),
    tokenExpiresAt: new Date((now + 4 * 60 * 60) * 1000).toISOString(),
    recordingEnabled: false,
  };
}

export async function getFloridaClassDObserverMediaAccess(input: {
  liveSessionId: string;
  grantId: string;
  observerLabel: string;
  expiresAt: string;
}) {
  if (!floridaClassDLiveMediaEnabled()) throw new FloridaClassDMediaError("Class D live video is not yet enabled.", 503, "FDACS_MEDIA_NOT_ENABLED");
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.grantId, "observer grant id");
  const grantExpiresAtMs = Date.parse(input.expiresAt);
  if (!Number.isFinite(grantExpiresAtMs) || grantExpiresAtMs <= Date.now()) {
    throw new FloridaClassDMediaError("Observer access grant has expired.", 401, "FDACS_MEDIA_OBSERVER_GRANT_EXPIRED");
  }
  const session = await loadSession(input.liveSessionId);
  if (!["live", "break"].includes(String(session.status))) {
    throw new FloridaClassDMediaError("The live lesson is not currently available for observation.", 409, "FDACS_MEDIA_OBSERVER_SESSION_NOT_LIVE");
  }
  const room = await ensureRoom(input.liveSessionId);
  if (!room.name || !room.url) throw new FloridaClassDMediaError("Live media room is incomplete.", 502, "FDACS_MEDIA_ROOM_INVALID");
  const now = Math.floor(Date.now() / 1000);
  const grantExp = Math.floor(grantExpiresAtMs / 1000);
  const tokenExp = Math.min(grantExp, now + 90 * 60);
  if (tokenExp <= now + 15) {
    throw new FloridaClassDMediaError("Observer access grant is too close to expiration.", 401, "FDACS_MEDIA_OBSERVER_GRANT_EXPIRING");
  }
  const displayName = input.observerLabel.trim().slice(0, 80) || "Authorized Regulatory Observer";
  const token = await createToken({
    room_name: room.name,
    user_id: shortObserverId(input.grantId),
    user_name: displayName,
    nbf: now - 30,
    exp: tokenExp,
    eject_at_token_exp: true,
    is_owner: false,
    enable_screenshare: false,
    start_video_off: true,
    start_audio_off: true,
    enable_prejoin_ui: false,
    enable_live_captions_ui: true,
    enable_recording_ui: false,
    permissions: {
      hasPresence: true,
      canSend: false,
      canAdmin: false,
    },
  });
  return {
    provider: "daily" as const,
    roomName: room.name,
    joinUrl: joinUrl(room.url, token),
    tokenExpiresAt: new Date(tokenExp * 1000).toISOString(),
    recordingEnabled: false,
    observerMode: "view-only" as const,
    lessonId: typeof session.lesson_id === "string" ? session.lesson_id : null,
    day: typeof session.day === "number" ? session.day : null,
  };
}
