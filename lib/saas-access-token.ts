import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export type SaasAccessTokenClaims = {
  version: 1;
  subject: string;
  organizationId: string;
  tenantId: string;
  productSlug: string;
  planId: string;
  features: string[];
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

const MAX_TTL_SECONDS = 300;

function signingSecret() {
  const secret = process.env.OBSERRA_SAAS_ACCESS_TOKEN_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("SaaS access-token signing is not configured");
  }
  return secret;
}

function encode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(payload: string) {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

export function issueSaasAccessToken(input: Omit<SaasAccessTokenClaims, "version" | "issuedAt" | "expiresAt"> & { ttlSeconds?: number }) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const ttlSeconds = Math.min(MAX_TTL_SECONDS, Math.max(30, Math.floor(input.ttlSeconds ?? 120)));
  const claims: SaasAccessTokenClaims = {
    version: 1,
    subject: input.subject,
    organizationId: input.organizationId,
    tenantId: input.tenantId,
    productSlug: input.productSlug,
    planId: input.planId,
    features: [...input.features],
    issuedAt,
    expiresAt: issuedAt + ttlSeconds,
    nonce: input.nonce,
  };
  const payload = encode(JSON.stringify(claims));
  return { token: `${payload}.${signature(payload)}`, expiresAt: claims.expiresAt, ttlSeconds };
}

export function verifySaasAccessToken(token: string, expected?: { productSlug?: string; organizationId?: string }) {
  const [payload, providedSignature, extra] = token.split(".");
  if (!payload || !providedSignature || extra) return { valid: false as const, reason: "malformed-token" };
  const expectedSignature = signature(payload);
  const left = Buffer.from(providedSignature);
  const right = Buffer.from(expectedSignature);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return { valid: false as const, reason: "invalid-signature" };
  }

  let claims: SaasAccessTokenClaims;
  try {
    claims = JSON.parse(decode(payload)) as SaasAccessTokenClaims;
  } catch {
    return { valid: false as const, reason: "invalid-payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (claims.version !== 1 || claims.expiresAt <= now || claims.issuedAt > now + 30) {
    return { valid: false as const, reason: "expired-or-invalid-time" };
  }
  if (expected?.productSlug && claims.productSlug !== expected.productSlug) {
    return { valid: false as const, reason: "product-mismatch" };
  }
  if (expected?.organizationId && claims.organizationId !== expected.organizationId) {
    return { valid: false as const, reason: "organization-mismatch" };
  }
  return { valid: true as const, claims };
}

export function saasAccessTokenHealth() {
  const secret = process.env.OBSERRA_SAAS_ACCESS_TOKEN_SECRET?.trim();
  return {
    configured: Boolean(secret && secret.length >= 32),
    algorithm: "HMAC-SHA256",
    maximumTtlSeconds: MAX_TTL_SECONDS,
    failClosed: true,
  };
}
