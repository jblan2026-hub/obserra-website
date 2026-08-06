import "server-only";

export type SessionRevocationRecord = {
  sessionId: string;
  userId: string;
  organizationId: string;
  expiresAt: number;
  revokedAt: string;
  revokedBy: string;
  reason: string;
};

function configuration() {
  const baseUrl = process.env.OBSERRA_CONTROL_PLANE_STORE_URL?.trim().replace(/\/$/, "") || null;
  const token = process.env.OBSERRA_CONTROL_PLANE_STORE_TOKEN?.trim() || null;
  return { baseUrl, token, configured: Boolean(baseUrl && token) };
}

function encode(value: string) {
  return encodeURIComponent(value);
}

async function requestStore<T>(path: string, init: RequestInit): Promise<T> {
  const config = configuration();
  if (!config.configured || !config.baseUrl || !config.token) {
    throw new Error("SaaS session revocation persistence is not configured");
  }
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(3_000),
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Session revocation store request failed with ${response.status}: ${detail.slice(0, 200)}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function revokeSession(record: SessionRevocationRecord, idempotencyKey: string) {
  if (!record.sessionId || record.sessionId.length > 200) throw new Error("Invalid session identifier");
  if (!record.userId || !record.organizationId) throw new Error("Session revocation identity is required");
  if (!Number.isSafeInteger(record.expiresAt) || record.expiresAt <= Math.floor(Date.now() / 1000)) {
    throw new Error("Session revocation expiration must be in the future");
  }
  return requestStore<{ accepted: boolean; duplicate: boolean }>(`/v1/session-revocations/${encode(record.sessionId)}`, {
    method: "PUT",
    headers: { "idempotency-key": idempotencyKey },
    body: JSON.stringify(record),
  });
}

export async function sessionIsRevoked(input: { sessionId: string; userId: string; organizationId: string }) {
  const result = await requestStore<{
    revoked: boolean;
    userId?: string;
    organizationId?: string;
    expiresAt?: number;
  }>(`/v1/session-revocations/${encode(input.sessionId)}`, { method: "GET" });
  if (!result.revoked) return false;
  if (result.userId !== input.userId || result.organizationId !== input.organizationId) {
    throw new Error("Session revocation audience mismatch");
  }
  return !result.expiresAt || result.expiresAt > Math.floor(Date.now() / 1000);
}

export function sessionRevocationHealth() {
  const config = configuration();
  return {
    configured: config.configured,
    failClosed: true,
    lookupTimeoutMs: 3_000,
    durable: true,
    idempotentWrites: true,
  };
}
