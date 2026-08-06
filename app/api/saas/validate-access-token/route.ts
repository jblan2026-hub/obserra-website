import { NextResponse } from "next/server";

import { verifySaasAccessToken } from "../../../../lib/saas-access-token";
import { tokenPredatesOrganizationCutoff } from "../../../../lib/saas-organization-token-cutoff";
import { authorizeSaasService } from "../../../../lib/saas-service-credentials";
import { sessionIsRevoked } from "../../../../lib/saas-session-revocation";
import { tokenIsRevoked } from "../../../../lib/saas-token-revocation";
import { enforceValidationRateLimit } from "../../../../lib/saas-token-validation-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ValidationRequest = { token?: unknown; productSlug?: unknown; organizationId?: unknown };

function response(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      ...extraHeaders,
    },
  });
}

function boundedString(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maximumLength ? normalized : "";
}

function boundedServiceId(value: string | null) {
  const normalized = value?.trim() || "";
  return /^[A-Za-z0-9._:@/-]{3,120}$/.test(normalized) ? normalized : "";
}

export async function POST(request: Request) {
  const serviceId = boundedServiceId(request.headers.get("x-obserra-service-id"));
  const serviceSecret = request.headers.get("x-obserra-service-key")?.trim() || "";
  if (!serviceId || !serviceSecret) return response({ valid: false, reason: "service-authentication-required" }, 401);

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

  let serviceAuthorization;
  try {
    serviceAuthorization = authorizeSaasService({ serviceId, secret: serviceSecret, productSlug });
  } catch {
    return response({ valid: false, reason: "service-authorization-unavailable" }, 503);
  }
  if (!serviceAuthorization.allowed) return response({ valid: false, reason: serviceAuthorization.reason }, 403);

  let rateLimit;
  try {
    rateLimit = await enforceValidationRateLimit({ serviceId, productSlug, organizationId });
  } catch {
    return response({ valid: false, reason: "rate-limit-service-unavailable" }, 503);
  }
  const rateHeaders = {
    "RateLimit-Limit": String(rateLimit.limit),
    "RateLimit-Remaining": String(rateLimit.remaining),
    "RateLimit-Reset": String(rateLimit.resetAt),
  };
  if (!rateLimit.allowed) {
    const retryAfter = Math.max(1, rateLimit.resetAt - Math.floor(Date.now() / 1000));
    console.warn("SaaS token validation rate limited", {
      serviceId,
      productSlug,
      organizationAudienceSupplied: Boolean(organizationId),
      resetAt: rateLimit.resetAt,
    });
    return response({ valid: false, reason: "rate-limit-exceeded" }, 429, {
      ...rateHeaders,
      "Retry-After": String(retryAfter),
    });
  }

  let result;
  try {
    result = verifySaasAccessToken(token, { productSlug, organizationId });
  } catch {
    return response({ valid: false, reason: "validation-service-unavailable" }, 503, rateHeaders);
  }
  if (!result.valid) return response(result, 401, rateHeaders);

  const sessionId = result.claims.sessionId;
  if (!sessionId) return response({ valid: false, reason: "session-binding-required" }, 401, rateHeaders);

  try {
    const [revoked, sessionRevoked, predatesCutoff] = await Promise.all([
      tokenIsRevoked({
        nonce: result.claims.nonce,
        organizationId: result.claims.organizationId,
        productSlug: result.claims.productSlug,
      }),
      sessionIsRevoked({
        sessionId,
        userId: result.claims.subject,
        organizationId: result.claims.organizationId,
      }),
      tokenPredatesOrganizationCutoff({
        organizationId: result.claims.organizationId,
        issuedAt: result.claims.issuedAt,
      }),
    ]);
    if (revoked) return response({ valid: false, reason: "token-revoked" }, 401, rateHeaders);
    if (sessionRevoked) return response({ valid: false, reason: "session-revoked" }, 401, rateHeaders);
    if (predatesCutoff) return response({ valid: false, reason: "organization-token-cutoff" }, 401, rateHeaders);
  } catch {
    return response({ valid: false, reason: "containment-service-unavailable" }, 503, rateHeaders);
  }

  return response({
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
      sessionBound: true,
    },
  }, 200, rateHeaders);
}
