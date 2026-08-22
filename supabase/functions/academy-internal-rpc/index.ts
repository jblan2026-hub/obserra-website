const ALLOWED_OPERATIONS = new Set([
  "academy_storage_health",
  "academy_aggregate_metrics",
  "academy_get_learner_state",
  "academy_reserve_checkout_attempt",
  "academy_bind_checkout_attempt",
  "academy_record_checkout_session",
  "academy_record_paid_checkout",
  "academy_record_payment_reversal",
  "academy_claim_paid_checkout",
  "academy_import_legacy_state",
  "academy_complete_lesson",
  "academy_record_assessment",
  "academy_find_certificate",
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KEY_ID = /^academy-gateway-v[0-9]+$/;
const MAX_CLOCK_SKEW_SECONDS = 90;
const MAX_BODY_BYTES = 65_536;

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function base64UrlBytes(value: string) {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function base64Bytes(value: string) {
  try {
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function hex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function adminConfig() {
  const url = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
  let key = "";
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS")?.trim() ?? "";
  if (modern) {
    try {
      const parsed = JSON.parse(modern) as Record<string, unknown>;
      if (typeof parsed.default === "string") key = parsed.default;
    } catch {
      key = "";
    }
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";
  if (!key) key = legacy;
  if (!url || !key) throw new Error("admin-config-unavailable");
  const headers: Record<string, string> = {
    apikey: key,
    "content-type": "application/json",
  };
  if (legacy && key === legacy) headers.authorization = `Bearer ${key}`;
  return { url: url.replace(/\/$/, ""), headers };
}

async function adminFetch(path: string, init: RequestInit = {}) {
  const config = adminConfig();
  return fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      ...config.headers,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(10_000),
  });
}

async function activePublicKey(keyId: string) {
  const response = await adminFetch(
    `/rest/v1/academy_internal_gateway_keys?key_id=eq.${encodeURIComponent(keyId)}&active=eq.true&select=public_key_spki_b64&limit=1`,
    { method: "GET", headers: { accept: "application/json" } },
  );
  if (!response.ok) return null;
  const rows = await response.json().catch(() => null) as Array<{ public_key_spki_b64?: unknown }> | null;
  const value = rows?.[0]?.public_key_spki_b64;
  return typeof value === "string" ? value : null;
}

async function claimNonce(keyId: string, nonce: string, timestampSeconds: number) {
  const nowIso = new Date().toISOString();
  await adminFetch(
    `/rest/v1/academy_internal_gateway_nonces?expires_at=lt.${encodeURIComponent(nowIso)}`,
    { method: "DELETE", headers: { prefer: "return=minimal" } },
  ).catch(() => undefined);

  const expiresAt = new Date((timestampSeconds + MAX_CLOCK_SKEW_SECONDS + 30) * 1000).toISOString();
  const response = await adminFetch("/rest/v1/academy_internal_gateway_nonces", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify([{ key_id: keyId, nonce, expires_at: expiresAt }]),
  });
  return response.status === 201;
}

async function verifyRequest(
  keyId: string,
  timestamp: string,
  nonce: string,
  signature: string,
  operation: string,
  rawBody: string,
) {
  if (!KEY_ID.test(keyId) || !/^\d{10}$/.test(timestamp) || !UUID.test(nonce)) return false;
  const timestampSeconds = Number(timestamp);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS) {
    return false;
  }

  const publicKeyB64 = await activePublicKey(keyId);
  const publicKeyBytes = publicKeyB64 ? base64Bytes(publicKeyB64) : null;
  const signatureBytes = base64UrlBytes(signature);
  if (!publicKeyBytes || !signatureBytes) return false;

  const bodyDigest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawBody)));
  const canonical = `${timestamp}\n${nonce}\n${operation}\n${hex(bodyDigest)}`;
  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBytes,
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  const verified = await crypto.subtle.verify(
    { name: "Ed25519" },
    publicKey,
    signatureBytes,
    new TextEncoder().encode(canonical),
  );
  if (!verified) return false;
  return claimNonce(keyId, nonce, timestampSeconds);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return jsonResponse(405, { error: "method-not-allowed" });
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) return jsonResponse(415, { error: "unsupported-media-type" });

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: "request-too-large" });
  }

  let parsed: { operation?: unknown; payload?: unknown };
  try {
    parsed = JSON.parse(rawBody) as { operation?: unknown; payload?: unknown };
  } catch {
    return jsonResponse(400, { error: "invalid-json" });
  }
  if (
    typeof parsed.operation !== "string" ||
    !ALLOWED_OPERATIONS.has(parsed.operation) ||
    !parsed.payload ||
    typeof parsed.payload !== "object" ||
    Array.isArray(parsed.payload)
  ) {
    return jsonResponse(400, { error: "invalid-operation" });
  }

  const keyId = request.headers.get("x-obserra-key-id") ?? "";
  const timestamp = request.headers.get("x-obserra-timestamp") ?? "";
  const nonce = request.headers.get("x-obserra-nonce") ?? "";
  const signature = request.headers.get("x-obserra-signature") ?? "";

  let authorized = false;
  try {
    authorized = await verifyRequest(keyId, timestamp, nonce, signature, parsed.operation, rawBody);
  } catch {
    return jsonResponse(503, { error: "authorization-service-unavailable" });
  }
  if (!authorized) return jsonResponse(401, { error: "unauthorized" });

  const upstream = await adminFetch(`/rest/v1/rpc/${parsed.operation}`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: JSON.stringify(parsed.payload),
  }).catch(() => null);
  if (!upstream) return jsonResponse(503, { error: "backend-unavailable" });

  const responseBody = await upstream.text();
  if (!upstream.ok) {
    return jsonResponse(upstream.status >= 500 ? 503 : upstream.status, { error: "backend-rejected" });
  }

  adminFetch(`/rest/v1/academy_internal_gateway_keys?key_id=eq.${encodeURIComponent(keyId)}`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ last_used_at: new Date().toISOString() }),
  }).catch(() => undefined);

  return new Response(responseBody, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-obserra-academy-gateway": "verified",
    },
  });
});
