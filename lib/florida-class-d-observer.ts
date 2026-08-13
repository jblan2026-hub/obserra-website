import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { FloridaClassDStaffRole } from "./florida-class-d-auth";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_SECRET_PATTERN = /^[A-Za-z0-9_-]{40,96}$/;

export class FloridaClassDObserverAccessError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDObserverAccessError";
  }
}

type StaffActor = {
  userId: string;
  role: FloridaClassDStaffRole;
};

type ObserverGrantRow = {
  id?: string;
  live_session_id?: string;
  observer_label?: string;
  purpose?: string;
  expires_at?: string;
  revoked_at?: string | null;
};

function config() {
  const key = process.env.OBSERRA_SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const url = (process.env.OBSERRA_SUPABASE_URL?.trim() || "").replace(/\/$/, "");
  if (!key || !url.startsWith("https://")) {
    throw new FloridaClassDObserverAccessError("Class D observer persistence is not configured.", 503, "FDACS_OBSERVER_PERSISTENCE_NOT_CONFIGURED");
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
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw) as unknown;
    } catch {
      throw new FloridaClassDObserverAccessError("Class D observer persistence returned an invalid response.", 502, "FDACS_OBSERVER_INVALID_PERSISTENCE_RESPONSE");
    }
  }
  if (!response.ok) {
    throw new FloridaClassDObserverAccessError("Class D observer persistence request failed.", response.status >= 500 ? 502 : response.status, "FDACS_OBSERVER_PERSISTENCE_FAILED");
  }
  return payload as T;
}

async function rpc<T>(functionName: string, body: Record<string, unknown>): Promise<T> {
  return request<T>(`rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function requireUuid(value: string, field: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new FloridaClassDObserverAccessError(`Invalid ${field}.`, 400, "FDACS_OBSERVER_INVALID_IDENTIFIER");
  }
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function requireObserverAdmin(actor: StaffActor) {
  if (actor.role !== "school_admin" && actor.role !== "compliance_admin") {
    throw new FloridaClassDObserverAccessError("Observer access requires school or compliance administration.", 403, "FDACS_OBSERVER_ADMIN_REQUIRED");
  }
}

function normalizeText(value: string, field: string, maxLength: number) {
  const normalized = value.trim();
  if (normalized.length < 3 || normalized.length > maxLength) {
    throw new FloridaClassDObserverAccessError(`Invalid ${field}.`, 400, "FDACS_OBSERVER_INVALID_TEXT");
  }
  return normalized;
}

async function requireObserverEligibleSession(liveSessionId: string) {
  const query = new URLSearchParams({ select: "id,status", id: `eq.${liveSessionId}`, limit: "1" });
  const rows = await request<Array<{ id?: string; status?: string }>>(`fdacs_class_d_live_sessions?${query}`);
  const session = rows[0];
  if (!session?.id || !["scheduled", "live", "break"].includes(String(session.status))) {
    throw new FloridaClassDObserverAccessError("Live session is not eligible for observer access.", 409, "FDACS_OBSERVER_SESSION_NOT_ELIGIBLE");
  }
}

export async function createFloridaClassDObserverGrant(actor: StaffActor, input: {
  liveSessionId: string;
  observerLabel: string;
  purpose: string;
  durationMinutes: number;
  correlationId: string;
}) {
  requireObserverAdmin(actor);
  requireUuid(input.liveSessionId, "live session id");
  requireUuid(input.correlationId, "correlation id");
  const observerLabel = normalizeText(input.observerLabel, "observer label", 160);
  const purpose = normalizeText(input.purpose, "observer purpose", 500);
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 15 || input.durationMinutes > 240) {
    throw new FloridaClassDObserverAccessError("Observer access duration must be between 15 and 240 minutes.", 400, "FDACS_OBSERVER_INVALID_DURATION");
  }
  await requireObserverEligibleSession(input.liveSessionId);

  const secret = randomBytes(32).toString("base64url");
  const tokenDigest = digest(secret);
  const expiresAt = new Date(Date.now() + input.durationMinutes * 60_000).toISOString();
  const rows = await request<ObserverGrantRow[]>("fdacs_class_d_observer_grants", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      live_session_id: input.liveSessionId,
      token_digest: tokenDigest,
      observer_label: observerLabel,
      purpose,
      created_by_clerk_user_id: actor.userId,
      created_by_role: actor.role,
      expires_at: expiresAt,
      correlation_id: input.correlationId,
    }),
  });
  const grant = rows[0];
  if (!grant?.id || !UUID_PATTERN.test(grant.id)) {
    throw new FloridaClassDObserverAccessError("Observer grant was not created correctly.", 502, "FDACS_OBSERVER_GRANT_INVALID");
  }

  await request("fdacs_class_d_audit_events", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({
      actor_role: actor.role,
      actor_clerk_user_id: actor.userId,
      entity_type: "observer_access",
      entity_id: grant.id,
      action: "external_observer_grant_created",
      correlation_id: input.correlationId,
      metadata: {
        liveSessionId: input.liveSessionId,
        observerLabel,
        purpose,
        expiresAt,
      },
    }),
  });

  return {
    grantId: grant.id,
    accessToken: `${grant.id}.${secret}`,
    expiresAt,
    observerLabel,
    purpose,
  };
}

export async function revokeFloridaClassDObserverGrant(actor: StaffActor, input: {
  grantId: string;
  correlationId: string;
}) {
  requireObserverAdmin(actor);
  requireUuid(input.grantId, "observer grant id");
  requireUuid(input.correlationId, "correlation id");
  const revokedAt = new Date().toISOString();
  const query = new URLSearchParams({ id: `eq.${input.grantId}`, revoked_at: "is.null", select: "id" });
  const rows = await request<Array<{ id?: string }>>(`fdacs_class_d_observer_grants?${query}`, {
    method: "PATCH",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({
      revoked_at: revokedAt,
      revoked_by_clerk_user_id: actor.userId,
    }),
  });
  if (!rows[0]?.id) {
    throw new FloridaClassDObserverAccessError("Observer grant was not active or could not be revoked.", 409, "FDACS_OBSERVER_REVOKE_NOT_APPLIED");
  }
  await request("fdacs_class_d_audit_events", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({
      actor_role: actor.role,
      actor_clerk_user_id: actor.userId,
      entity_type: "observer_access",
      entity_id: input.grantId,
      action: "external_observer_grant_revoked",
      correlation_id: input.correlationId,
    }),
  });
  return { revoked: true, revokedAt };
}

export async function exchangeFloridaClassDObserverToken(accessToken: string, correlationId: string) {
  requireUuid(correlationId, "correlation id");
  const [grantId, secret, ...extra] = accessToken.trim().split(".");
  if (extra.length || !grantId || !secret || !UUID_PATTERN.test(grantId) || !TOKEN_SECRET_PATTERN.test(secret)) {
    throw new FloridaClassDObserverAccessError("Observer access token is invalid.", 401, "FDACS_OBSERVER_TOKEN_INVALID");
  }
  const rows = await rpc<Array<{
    grant_id?: string;
    live_session_id?: string;
    observer_label?: string;
    purpose?: string;
    expires_at?: string;
  }>>("fdacs_class_d_record_observer_access", {
    p_grant_id: grantId,
    p_token_digest: digest(secret),
    p_correlation_id: correlationId,
  });
  const row = rows[0];
  if (!row?.grant_id || !row.live_session_id || !row.observer_label || !row.expires_at) {
    throw new FloridaClassDObserverAccessError("Observer access could not be validated.", 401, "FDACS_OBSERVER_ACCESS_DENIED");
  }
  const expiresAtMs = Date.parse(row.expires_at);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    throw new FloridaClassDObserverAccessError("Observer access has expired.", 401, "FDACS_OBSERVER_ACCESS_EXPIRED");
  }
  return {
    grantId: row.grant_id,
    liveSessionId: row.live_session_id,
    observerLabel: row.observer_label,
    purpose: row.purpose ?? "Regulatory observation",
    expiresAt: row.expires_at,
  };
}
