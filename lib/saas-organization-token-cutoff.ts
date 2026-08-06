import "server-only";

export type OrganizationTokenCutoff = {
  organizationId: string;
  invalidateBefore: number;
  changedAt: string;
  changedBy: string;
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
    throw new Error("Organization token cutoff persistence is not configured");
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
  if (response.status === 404 && init.method === "GET") return null as T;
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Organization token cutoff request failed with ${response.status}: ${detail.slice(0, 200)}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function setOrganizationTokenCutoff(record: OrganizationTokenCutoff, idempotencyKey: string) {
  if (!record.organizationId || record.organizationId.length > 200) throw new Error("Invalid organization identity");
  if (!Number.isSafeInteger(record.invalidateBefore) || record.invalidateBefore > Math.floor(Date.now() / 1000) + 60) {
    throw new Error("Invalid token cutoff timestamp");
  }
  if (record.reason.length < 8 || record.reason.length > 500) throw new Error("A bounded operational reason is required");
  return requestStore<{ accepted: boolean; duplicate: boolean }>(
    `/v1/organization-token-cutoffs/${encode(record.organizationId)}`,
    {
      method: "PUT",
      headers: { "idempotency-key": idempotencyKey },
      body: JSON.stringify(record),
    },
  );
}

export async function tokenPredatesOrganizationCutoff(input: { organizationId: string; issuedAt: number }) {
  const cutoff = await requestStore<OrganizationTokenCutoff | null>(
    `/v1/organization-token-cutoffs/${encode(input.organizationId)}`,
    { method: "GET" },
  );
  if (!cutoff) return false;
  if (cutoff.organizationId !== input.organizationId) throw new Error("Organization cutoff audience mismatch");
  return input.issuedAt < cutoff.invalidateBefore;
}

export function organizationTokenCutoffHealth() {
  const config = configuration();
  return {
    configured: config.configured,
    failClosed: true,
    lookupTimeoutMs: 3_000,
    durable: true,
    idempotentWrites: true,
  };
}
