import "server-only";

export type TokenRevocationRecord = {
  nonce: string;
  organizationId: string;
  productSlug: string;
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
    throw new Error("SaaS token revocation persistence is not configured");
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
    throw new Error(`Token revocation store request failed with ${response.status}: ${detail.slice(0, 200)}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function revokeToken(record: TokenRevocationRecord, idempotencyKey: string) {
  if (!record.nonce || record.nonce.length > 200) throw new Error("Invalid token nonce");
  if (!record.organizationId || !record.productSlug) throw new Error("Revocation audience is required");
  if (!Number.isSafeInteger(record.expiresAt) || record.expiresAt <= Math.floor(Date.now() / 1000)) {
    throw new Error("Revocation expiration must be in the future");
  }
  return requestStore<{ accepted: boolean; duplicate: boolean }>(`/v1/token-revocations/${encode(record.nonce)}`, {
    method: "PUT",
    headers: { "idempotency-key": idempotencyKey },
    body: JSON.stringify(record),
  });
}

export async function tokenIsRevoked(input: { nonce: string; organizationId: string; productSlug: string }) {
  const result = await requestStore<{ revoked: boolean; organizationId?: string; productSlug?: string; expiresAt?: number }>(
    `/v1/token-revocations/${encode(input.nonce)}`,
    { method: "GET" },
  );
  if (!result.revoked) return false;
  if (result.organizationId !== input.organizationId || result.productSlug !== input.productSlug) {
    throw new Error("Revocation audience mismatch");
  }
  return !result.expiresAt || result.expiresAt > Math.floor(Date.now() / 1000);
}

export function tokenRevocationHealth() {
  const config = configuration();
  return {
    configured: config.configured,
    failClosed: true,
    lookupTimeoutMs: 3_000,
    durable: true,
    idempotentWrites: true,
  };
}
