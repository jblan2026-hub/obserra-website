import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { verifySaasAccessToken } from "../../../../lib/saas-access-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ValidationRequest = {
  token?: unknown;
  productSlug?: unknown;
  organizationId?: unknown;
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
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

export async function POST(request: Request) {
  if (!serviceCredentialIsValid(request.headers.get("x-obserra-service-key"))) {
    return response({ valid: false, reason: "service-authentication-required" }, 401);
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

  let result;
  try {
    result = verifySaasAccessToken(token, { productSlug, organizationId });
  } catch {
    return response({ valid: false, reason: "validation-service-unavailable" }, 503);
  }

  if (!result.valid) return response(result, 401);

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
    },
  });
}
