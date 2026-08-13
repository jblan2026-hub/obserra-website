import "server-only";

import type { FloridaClassDStaffRole } from "./florida-class-d-auth";
import { floridaClassDRegulatedRequest } from "./florida-class-d-acceptance";
import { FloridaClassDExamError } from "./florida-class-d-exam";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type StaffActor = { userId: string; role: FloridaClassDStaffRole };

export type FloridaClassDLiveTextScreen = {
  id: string;
  live_session_id: string;
  title: string;
  body: string;
  word_count: number;
  minimum_seconds: number;
  status: "open" | "closed";
  opened_at: string;
  discussion_confirmed_at?: string | null;
  discussion_note?: string | null;
  closed_at?: string | null;
};

export type FloridaClassDLiveTextScreenView = {
  id: string;
  text_screen_id: string;
  enrollment_id: string;
  observed_seconds: number;
  requirement_met_at?: string | null;
  acknowledged_at?: string | null;
};

export type FloridaClassDTextScreenProgress = {
  viewId: string;
  observedSeconds: number;
  minimumSeconds: number;
  requirementMet: boolean;
  acknowledged: boolean;
};

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new FloridaClassDExamError(`Invalid ${field}.`, 400, "FDACS_TEXT_SCREEN_INVALID_IDENTIFIER");
  }
}

function rpc<T>(name: string, body: Record<string, unknown>) {
  return floridaClassDRegulatedRequest<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(body) });
}

export async function getFloridaClassDActiveTextScreen(liveSessionId: string) {
  requireUuid(liveSessionId, "live session id");
  const params = new URLSearchParams({
    select: "id,live_session_id,title,body,word_count,minimum_seconds,status,opened_at,discussion_confirmed_at,discussion_note,closed_at",
    live_session_id: `eq.${liveSessionId}`,
    status: "eq.open",
    order: "opened_at.desc",
    limit: "1",
  });
  const rows = await floridaClassDRegulatedRequest<FloridaClassDLiveTextScreen[]>(`fdacs_class_d_live_text_screens?${params.toString()}`);
  return rows[0] ?? null;
}

export async function getFloridaClassDTextScreenViews(textScreenId: string) {
  requireUuid(textScreenId, "text screen id");
  const params = new URLSearchParams({
    select: "id,text_screen_id,enrollment_id,observed_seconds,requirement_met_at,acknowledged_at",
    text_screen_id: `eq.${textScreenId}`,
    order: "first_seen_at.asc",
  });
  return floridaClassDRegulatedRequest<FloridaClassDLiveTextScreenView[]>(`fdacs_class_d_live_text_screen_views?${params.toString()}`);
}

export async function getFloridaClassDStudentTextScreenView(textScreenId: string, enrollmentId: string) {
  requireUuid(textScreenId, "text screen id");
  requireUuid(enrollmentId, "enrollment id");
  const params = new URLSearchParams({
    select: "id,text_screen_id,enrollment_id,observed_seconds,requirement_met_at,acknowledged_at",
    text_screen_id: `eq.${textScreenId}`,
    enrollment_id: `eq.${enrollmentId}`,
    limit: "1",
  });
  const rows = await floridaClassDRegulatedRequest<FloridaClassDLiveTextScreenView[]>(`fdacs_class_d_live_text_screen_views?${params.toString()}`);
  return rows[0] ?? null;
}

export function openFloridaClassDLiveTextScreen(actor: StaffActor, input: { liveSessionId: string; title: string; body: string; correlationId: string }) {
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<string>("fdacs_class_d_open_live_text_screen", {
    p_live_session_id: input.liveSessionId,
    p_title: input.title,
    p_body: input.body,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  });
}

export function beginFloridaClassDLiveTextScreenView(userId: string, input: { textScreenId: string; deviceLeaseId: string; correlationId: string }) {
  requireUuid(input.textScreenId, "text screen id");
  requireUuid(input.deviceLeaseId, "device lease id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<FloridaClassDTextScreenProgress>("fdacs_class_d_begin_live_text_screen_view", {
    p_text_screen_id: input.textScreenId,
    p_device_lease_id: input.deviceLeaseId,
    p_clerk_user_id: userId,
    p_correlation_id: input.correlationId,
  });
}

export function heartbeatFloridaClassDLiveTextScreenView(userId: string, input: { textScreenId: string; deviceLeaseId: string; correlationId: string }) {
  requireUuid(input.textScreenId, "text screen id");
  requireUuid(input.deviceLeaseId, "device lease id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<FloridaClassDTextScreenProgress>("fdacs_class_d_heartbeat_live_text_screen_view", {
    p_text_screen_id: input.textScreenId,
    p_device_lease_id: input.deviceLeaseId,
    p_clerk_user_id: userId,
    p_correlation_id: input.correlationId,
  });
}

export function acknowledgeFloridaClassDLiveTextScreen(userId: string, input: { textScreenId: string; correlationId: string }) {
  requireUuid(input.textScreenId, "text screen id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<null>("fdacs_class_d_acknowledge_live_text_screen", {
    p_text_screen_id: input.textScreenId,
    p_clerk_user_id: userId,
    p_correlation_id: input.correlationId,
  });
}

export function closeFloridaClassDLiveTextScreen(actor: StaffActor, input: { textScreenId: string; discussionNote: string; correlationId: string }) {
  requireUuid(input.textScreenId, "text screen id");
  requireUuid(input.correlationId, "correlation id");
  return rpc<null>("fdacs_class_d_close_live_text_screen", {
    p_text_screen_id: input.textScreenId,
    p_discussion_note: input.discussionNote,
    p_actor_role: actor.role,
    p_actor_clerk_user_id: actor.userId,
    p_correlation_id: input.correlationId,
  });
}
