import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { verifySaasAccessToken } from "../../../../lib/saas-access-token";
import { tokenPredatesOrganizationCutoff } from "../../../../lib/saas-organization-token-cutoff";
import { tokenIsRevoked } from "../../../../lib/saas-token-revocation";
import { enforceValidationRateLimit } from "../../../../lib/saas-token-validation-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ValidationRequest = {
  token?: unknown;
  productSlug?: unknown;
  organizationId?: unknown;
};

type ResponseHeaders = Record<string, string>;

function response(body: unknown, status = 200, additionalHeaders: ResponseHeaders = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      ...additionalHeaders,
    },
  });
}

function serviceCredentialIsValid(provided: string | null) {
  const configured = process.env.OBSERRA_SAAS_TOKEN_VALIDATION_SECRET?.trim();
  if (!configured || configured.length < 32 || !provided) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(configured);
  return left.length === right.length && timingSafeEqual(left, right);
}

function boundedString(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maximumLength ? normalized : "";
}

function boundedServiceId(value: string | null) {
  if (!value) return "";
  const normalized = value.trim();
  if (!normalized || normalized.length > 120 || !/^[A-Za-z0-9._:@/-]+$/.test(normalized)) return "";
  return normalized;
}

export async function POST(request: Request) {
  if (!serviceCredentialIsValid(request.headers.get("x-obserra-service-key"))) {
    return response({ valid: false, reason: "service-authentication-required" }, 401);
  }

  const serviceId = boundedServiceId(request.headers.get("x-obserra-service-id"));
  if (!serviceId) {
    return response({ valid: false, reason: "service-identity-required" }, 400);
  }

  let body: ValidationRequest;
  try {
    body = (await request.json()) as ValidationRequest;
  } catch {
    return response({ valid: false, reason: "invalid-json" }, 400);
  }

  const token = boundedString(body.token, 8_192);
  const productSlug = boundedString(body.productSlug, 120);
  const organizationId = body.organizationId === undefined ? undefined : boundedString(body.organizationId, 200);
  if (!token || !productSlug || (body.organizationId !== undefined && !organizationId)) {
    return response({ valid: false, reason: "invalid-request" }, 400);
  }

  let rateLimit;
  try {
    rateLimit = await enforceValidationRateLimit({ serviceId, productSlug, organizationId });
  } catch {
    return response({ valid: false, reason: "rate-limit-service-unavailable" }, 503);
  }

  const rateLimitHeaders = {
    "RateLimit-Limit": String(rateLimit.limit),
    "RateLimit-Remaining": String(rateLimit.remaining),
    "RateLimit-Reset": String(rateLimit.resetAt),
  };

  if (!rateLimit.allowed) {
    const retryAfter = Math.max(1, rateLimit.resetAt - Math.floor(Date.now() / 1000));
    console.warn("SaaS token validation rate limited", {
      serviceId,
      productSlug,
      organizationScoped: Boolean(organizationId),
      resetAt: rateLimit.resetAt,
    });
    return response(
      { valid: false, reason: "rate-limit-exceeded" },
      429,
      { ...rateLimitHeaders, "Retry-After": String(retryAfter) },
    );
  }

  let result;
  try {
    result = verifySaasAccessToken(token, { productSlug, organizationId });
  } catch {
    return response({ valid: false, reason: "validation-service-unavailable" }, 503, rateLimitHeaders);
  }

  if (!result.valid) return response(result, 401, rateLimitHeaders);

  try {
    const [revoked, predatesCutoff] = await Promise.all([
      tokenIsRevoked({
        nonce: result.claims.nonce,
        organizationId: result.claims.organizationId,
        productSlug: result.claims.productSlug,
      }),
      tokenPredatesOrganizationCutoff({
        organizationId: result.claims.organizationId,
        issuedAt: result.claims.issuedAt,
      }),
    ]);
    if (revoked) return response({ valid: false, reason: "token-revoked" }, 401, rateLimitHeaders);
    if (predatesCutoff) {
      return response({ valid: false, reason: "organization-token-cutoff" }, 401, rateLimitHeaders);
    }
  } catch {
    return response({ valid: false, reason: "containment-service-unavailable" }, 503, rateLimitHeaders);
  }

  return response(
    {
      valid: true,
      claims: {
        subject: result.claims.subject,
        organizationId: result.claims.organizationId,
        tenantId: result.claims.tenantId,
        productSlug: result.claims.productSlug,
        planId: result.claims.planId,
        features: result.claims.features,
        issuedAt: result.claims.issuedAt,
        expiresAt: result.claims.expiresAt,
      },
    },
    200,
    rateLimitHeaders,
  );
}
