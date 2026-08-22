import { createRemoteJWKSet, jwtVerify } from "npm:jose@6.1.0";

const ISSUER = "https://oidc.vercel.com/obserra";
const AUDIENCE = "https://vercel.com/obserra";
const SUBJECT = "owner:obserra:project:obserra-website-live:environment:production";
const OWNER_ID = "team_xpUE1GefY2JHuFFCqbAdnZAj";
const PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC";
const PROJECT_NAME = "obserra-website-live";
const MAX_BODY_BYTES = 64 * 1024;
const MAX_TOKEN_AGE_SECONDS = 2 * 60 * 60 + 120;
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks`));

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

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function serviceKey() {
  try {
    const modern = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}") as Record<string, unknown>;
    const candidate = typeof modern.default === "string" ? modern.default.trim() : "";
    if (candidate.startsWith("sb_secret_") && candidate.length >= 32) {
      return { value: candidate, legacyJwt: false };
    }
  } catch {
    // Use the legacy server credential only when the managed project does not
    // expose a modern default secret key yet.
  }

  const legacy = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();
  if (legacy.split(".").length === 3 && legacy.length >= 32) {
    return { value: legacy, legacyJwt: true };
  }
  throw new Error("supabase-admin-key-unavailable");
}

async function authenticate(req: Request) {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("missing-bearer");
  const token = header.slice(7).trim();
  if (!token || token.length > 16_384) throw new Error("invalid-bearer");

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: ISSUER,
    audience: AUDIENCE,
    subject: SUBJECT,
    algorithms: ["RS256"],
    clockTolerance: 30,
  });

  if (
    payload.owner !== "obserra" ||
    payload.owner_id !== OWNER_ID ||
    payload.project !== PROJECT_NAME ||
    payload.project_id !== PROJECT_ID ||
    payload.environment !== "production" ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number" ||
    payload.exp <= payload.iat ||
    Math.floor(Date.now() / 1000) - payload.iat > MAX_TOKEN_AGE_SECONDS
  ) {
    throw new Error("workload-claims-rejected");
  }
}

Deno.serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();

  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed", requestId });
  }

  const declaredLength = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json(413, { error: "payload_too_large", requestId });
  }

  try {
    await authenticate(req);
  } catch (error) {
    console.warn("academy_persistence_gateway_auth_rejected", {
      requestId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return json(401, { error: "unauthorized", requestId });
  }

  let raw = "";
  try {
    raw = await req.text();
    if (!raw || new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json(413, { error: "payload_too_large", requestId });
    }
  } catch {
    return json(400, { error: "invalid_body", requestId });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json(400, { error: "invalid_json", requestId });
  }

  if (!isPlainObject(parsed)) return json(400, { error: "invalid_request", requestId });
  const operation = typeof parsed.operation === "string" ? parsed.operation : "";
  const body = parsed.body;
  if (!ALLOWED_OPERATIONS.has(operation) || !isPlainObject(body)) {
    return json(403, { error: "operation_not_allowed", requestId });
  }

  const supabaseUrl = (Deno.env.get("SUPABASE_URL") || "").trim().replace(/\/$/, "");
  if (!supabaseUrl.startsWith("https://")) {
    console.error("academy_persistence_gateway_configuration_error", { requestId, component: "supabase_url" });
    return json(503, { error: "storage_unavailable", requestId });
  }

  let admin;
  try {
    admin = serviceKey();
  } catch {
    console.error("academy_persistence_gateway_configuration_error", { requestId, component: "admin_key" });
    return json(503, { error: "storage_unavailable", requestId });
  }

  const headers: Record<string, string> = {
    apikey: admin.value,
    "content-type": "application/json",
    accept: "application/json",
    "x-obserra-request-id": requestId,
  };
  if (admin.legacyJwt) headers.authorization = `Bearer ${admin.value}`;

  let upstream: Response;
  try {
    upstream = await fetch(`${supabaseUrl}/rest/v1/rpc/${operation}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("academy_persistence_gateway_upstream_unavailable", {
      requestId,
      operation,
      error: error instanceof Error ? error.name : "unknown",
    });
    return json(503, { error: "storage_unavailable", requestId });
  }

  const responseText = await upstream.text();
  console.log("academy_persistence_gateway_request", {
    requestId,
    operation,
    status: upstream.status,
    durationMs: Math.round(performance.now() - startedAt),
  });

  return new Response(responseText, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-obserra-request-id": requestId,
    },
  });
});
