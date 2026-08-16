import { randomUUID } from "node:crypto";

const SHA40 = /^[0-9a-f]{40}$/i;
const NONCE = /^[a-z0-9]{8,24}$/;
const ROOM_LIFETIME_SECONDS = 60 * 60;
const TOKEN_LIFETIME_SECONDS = 45 * 60;

export type FloridaClassDDailyRequest = <T>(
  path: string,
  init?: RequestInit,
  allowNotFound?: boolean,
) => Promise<T | null>;

type DailyRoom = { name?: string; url?: string };
type DailyToken = { token?: string };

export type FloridaClassDOwnerPreviewDailyAccess = {
  provider: "daily";
  roomName: string;
  instructorJoinUrl: string;
  participantJoinUrl: string;
  participantJoinUrls: string[];
  roomExpiresAt: string;
  tokenExpiresAt: string;
  maximumParticipants: 4;
  recordingEnabled: false;
  trainingCreditEligible: false;
  attendanceCredited: false;
  instructionalTimeCredited: false;
  ownerOnly: true;
  secretsExposed: false;
};

function requireReleaseSha(releaseSha: string) {
  const normalized = releaseSha.trim().toLowerCase();
  if (!SHA40.test(normalized)) throw new Error("A valid exact-release SHA is required for the Daily owner preview.");
  return normalized;
}

function roomPrefix(releaseSha: string) {
  return `fdacs-owner-uat-${requireReleaseSha(releaseSha).slice(0, 12)}-`;
}

function requireOwnedRoomName(roomName: string, releaseSha: string) {
  const prefix = roomPrefix(releaseSha);
  if (!roomName.startsWith(prefix) || !NONCE.test(roomName.slice(prefix.length))) {
    throw new Error("The Daily room is not owned by this exact owner-preview release.");
  }
  return roomName;
}

function validatedRoomUrl(value: string | undefined) {
  if (!value) throw new Error("Daily did not return a room URL.");
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" || !(parsed.hostname === "daily.co" || parsed.hostname.endsWith(".daily.co"))) {
    throw new Error("Daily returned an invalid room URL.");
  }
  return parsed.toString().replace(/\/$/, "");
}

function joinUrl(roomUrl: string, token: string | undefined) {
  if (!token) throw new Error("Daily did not return a time-bounded meeting token.");
  const url = new URL(roomUrl);
  url.searchParams.set("t", token);
  return url.toString();
}

async function createToken(
  request: FloridaClassDDailyRequest,
  properties: Record<string, unknown>,
) {
  return request<DailyToken>("/meeting-tokens", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
}

export async function deleteFloridaClassDOwnerPreviewDailyRoom(input: {
  request: FloridaClassDDailyRequest;
  roomName: string;
  releaseSha: string;
}) {
  const roomName = requireOwnedRoomName(input.roomName, input.releaseSha);
  await input.request<Record<string, unknown>>(
    `/rooms/${encodeURIComponent(roomName)}`,
    { method: "DELETE" },
    true,
  );
  return { deleted: true as const, roomName };
}

export async function createFloridaClassDOwnerPreviewDailySession(input: {
  request: FloridaClassDDailyRequest;
  releaseSha: string;
  nowMs?: number;
  nonce?: string;
}): Promise<FloridaClassDOwnerPreviewDailyAccess> {
  const releaseSha = requireReleaseSha(input.releaseSha);
  const nowMs = input.nowMs ?? Date.now();
  if (!Number.isFinite(nowMs) || nowMs <= 0) throw new Error("A valid owner-preview clock is required.");
  const nonce = (input.nonce ?? randomUUID().replaceAll("-", "").slice(0, 12)).toLowerCase();
  if (!NONCE.test(nonce)) throw new Error("A valid owner-preview room nonce is required.");
  const roomName = `${roomPrefix(releaseSha)}${nonce}`;
  const now = Math.floor(nowMs / 1000);
  const roomExp = now + ROOM_LIFETIME_SECONDS;
  const tokenExp = now + TOKEN_LIFETIME_SECONDS;
  let roomCreated = false;

  try {
    const room = await input.request<DailyRoom>("/rooms", {
      method: "POST",
      body: JSON.stringify({
        name: roomName,
        privacy: "private",
        properties: {
          exp: roomExp,
          eject_at_room_exp: true,
          max_participants: 4,
          enable_people_ui: true,
          enable_prejoin_ui: true,
          enable_network_ui: true,
          enable_screenshare: true,
          enable_chat: true,
          enable_emoji_reactions: true,
          enable_hand_raising: true,
          enable_recording_ui: false,
          start_video_off: false,
          start_audio_off: true,
          enforce_unique_user_ids: true,
        },
      }),
    });
    roomCreated = true;
    if (!room || room.name !== roomName) throw new Error("Daily returned an invalid exact-release room.");
    const roomUrl = validatedRoomUrl(room.url);

    const instructorToken = await createToken(input.request, {
      room_name: roomName,
      user_id: "internal_owner_instructor_uat",
      user_name: "Internal Owner Instructor UAT",
      nbf: now - 30,
      exp: tokenExp,
      eject_at_token_exp: true,
      is_owner: true,
      enable_screenshare: true,
      start_video_off: false,
      start_audio_off: false,
      enable_prejoin_ui: true,
      enable_live_captions_ui: true,
      enable_recording_ui: false,
      permissions: { hasPresence: true, canSend: true, canAdmin: true },
    });
    const participantTokens = await Promise.all([1, 2, 3].map((index) => createToken(input.request, {
      room_name: roomName,
      user_id: `internal_owner_participant_uat_${index}`,
      user_name: `Internal Owner Learner View ${index}`,
      nbf: now - 30,
      exp: tokenExp,
      eject_at_token_exp: true,
      is_owner: false,
      enable_screenshare: false,
      start_video_off: true,
      start_audio_off: true,
      enable_prejoin_ui: true,
      enable_live_captions_ui: true,
      enable_recording_ui: false,
      permissions: { hasPresence: true, canSend: true, canAdmin: false },
    })));
    const participantJoinUrls = participantTokens.map((token) => joinUrl(roomUrl, token?.token));
    return {
      provider: "daily",
      roomName,
      instructorJoinUrl: joinUrl(roomUrl, instructorToken?.token),
      participantJoinUrl: participantJoinUrls[0],
      participantJoinUrls,
      roomExpiresAt: new Date(roomExp * 1000).toISOString(),
      tokenExpiresAt: new Date(tokenExp * 1000).toISOString(),
      maximumParticipants: 4,
      recordingEnabled: false,
      trainingCreditEligible: false,
      attendanceCredited: false,
      instructionalTimeCredited: false,
      ownerOnly: true,
      secretsExposed: false,
    };
  } catch (error) {
    if (roomCreated) {
      await input.request<Record<string, unknown>>(
        `/rooms/${encodeURIComponent(roomName)}`,
        { method: "DELETE" },
        true,
      ).catch(() => null);
    }
    throw error;
  }
}
