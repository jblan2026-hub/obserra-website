import "server-only";

export type ValidationRateLimitInput = {
  serviceId: string;
  productSlug: string;
  organizationId?: string;
};

export type ValidationRateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  reason?: "rate-limit-exceeded";
};

const WINDOW_SECONDS = 60;
const REQUEST_LIMIT = 600;

function configuration() {
  const baseUrl = process.env.OBSERRA_CONTROL_PLANE_STORE_URL?.trim().replace(/\/$/, "") || null;
  const token = process.env.OBSERRA_CONTROL_PLANE_STORE_TOKEN?.trim() || null;
  return { baseUrl, token, configured: Boolean(baseUrl && token) };
}

function boundedIdentifier(value: string, maximumLength: number) {
  const normalized = value.trim();
  if (!normalized || normalized.length > maximumLength || !/^[A-Za-z0-9._:@/-]+$/.test(normalized)) {
    throw new Error("Invalid validation rate-limit identifier");
  }
  return normalized;
}

export async function enforceValidationRateLimit(input: ValidationRateLimitInput): Promise<ValidationRateLimitDecision> {
  const config = configuration();
  if (!config.configured || !config.baseUrl || !config.token) {
    throw new Error("SaaS validation rate-limit persistence is not configured");
  }

  const serviceId = boundedIdentifier(input.serviceId, 120);
  const productSlug = boundedIdentifier(input.productSlug, 120);
  const organizationId = input.organizationId ? boundedIdentifier(input.organizationId, 200) : "global";
  const bucket = encodeURIComponent(`${serviceId}:${productSlug}:${organizationId}`);

  const response = await fetch(`${config.baseUrl}/v1/rate-limits/saas-token-validation/${bucket}`, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(2_000),
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ windowSeconds: WINDOW_SECONDS, limit: REQUEST_LIMIT }),
  });

  if (!response.ok) {
    throw new Error(`SaaS validation rate-limit request failed with ${response.status}`);
  }

  const result = (await response.json()) as { allowed?: boolean; remaining?: number; resetAt?: number };
  if (typeof result.allowed !== "boolean" || !Number.isSafeInteger(result.remaining) || !Number.isSafeInteger(result.resetAt)) {
    throw new Error("Invalid SaaS validation rate-limit response");
  }

  return {
    allowed: result.allowed,
    limit: REQUEST_LIMIT,
    remaining: Math.max(0, result.remaining ?? 0),
    resetAt: result.resetAt ?? 0,
    ...(result.allowed ? {} : { reason: "rate-limit-exceeded" as const }),
  };
}

export function validationRateLimitHealth() {
  const config = configuration();
  return {
    configured: config.configured,
    failClosed: true,
    durable: true,
    windowSeconds: WINDOW_SECONDS,
    requestsPerWindow: REQUEST_LIMIT,
    lookupTimeoutMs: 2_000,
  };
}
