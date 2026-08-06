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

type SigningKey = { id: string; secret: string };

const MAX_TTL_SECONDS = 300;
const LEGACY_KEY_ID = "legacy";

function validKeyId(value: string) {
  return /^[A-Za-z0-9_-]{1,64}$/.test(value);
}

function configuredKeyRing(): SigningKey[] {
  const raw = process.env.OBSERRA_SAAS_ACCESS_TOKEN_KEYS_JSON?.trim();
  if (raw) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("SaaS access-token key ring is invalid JSON");
    }
    if (!Array.isArray(parsed)) throw new Error("SaaS access-token key ring must be an array");
    const keys = parsed.map((entry) => {
      const value = entry as { id?: unknown; secret?: unknown };
      const id = typeof value.id === "string" ? value.id.trim() : "";
      const secret = typeof value.secret === "string" ? value.secret.trim() : "";
      if (!validKeyId(id) || secret.length < 32) throw new Error("SaaS access-token key ring contains an invalid key");
      return { id, secret };
    });
    if (!keys.length || new Set(keys.map((key) => key.id)).size !== keys.length) {
      throw new Error("SaaS access-token key ring is empty or contains duplicate key identifiers");
    }
    return keys;
  }

  const legacy = process.env.OBSERRA_SAAS_ACCESS_TOKEN_SECRET?.trim();
  if (!legacy || legacy.length < 32) throw new Error("SaaS access-token signing is not configured");
  return [{ id: LEGACY_KEY_ID, secret: legacy }];
}

function activeSigningKey() {
  const keys = configuredKeyRing();
  const requested = process.env.OBSERRA_SAAS_ACCESS_TOKEN_ACTIVE_KID?.trim();
  if (!requested) return keys[0];
  const key = keys.find((candidate) => candidate.id === requested);
  if (!key) throw new Error("Configured SaaS access-token active key was not found");
  return key;
}

function keyForVerification(keyId: string) {
  return configuredKeyRing().find((key) => key.id === keyId) ?? null;
}

function encode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(provided: string, expected: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
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
  const key = activeSigningKey();
  return { token: `${key.id}.${payload}.${signature(payload, key.secret)}`, keyId: key.id, expiresAt: claims.expiresAt, ttlSeconds };
}

export function verifySaasAccessToken(token: string, expected?: { productSlug?: string; organizationId?: string }) {
  const parts = token.split(".");
  let keyId: string;
  let payload: string;
  let providedSignature: string;

  if (parts.length === 3) {
    [keyId, payload, providedSignature] = parts;
  } else if (parts.length === 2) {
    keyId = LEGACY_KEY_ID;
    [payload, providedSignature] = parts;
  } else {
    return { valid: false as const, reason: "malformed-token" };
  }

  if (!validKeyId(keyId) || !payload || !providedSignature) return { valid: false as const, reason: "malformed-token" };
  const key = keyForVerification(keyId);
  if (!key) return { valid: false as const, reason: "unknown-key" };
  if (!signaturesMatch(providedSignature, signature(payload, key.secret))) {
    return { valid: false as const, reason: "invalid-signature" };
  }

  let claims: SaasAccessTokenClaims;
  try {
    claims = JSON.parse(decode(payload)) as SaasAccessTokenClaims;
  } catch {
    return { valid: false as const, reason: "invalid-payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (claims.version !== 1 || claims.expiresAt <= now || claims.issuedAt > now + 30 || claims.expiresAt - claims.issuedAt > MAX_TTL_SECONDS) {
    return { valid: false as const, reason: "expired-or-invalid-time" };
  }
  if (expected?.productSlug && claims.productSlug !== expected.productSlug) {
    return { valid: false as const, reason: "product-mismatch" };
  }
  if (expected?.organizationId && claims.organizationId !== expected.organizationId) {
    return { valid: false as const, reason: "organization-mismatch" };
  }
  return { valid: true as const, keyId, claims };
}

export function saasAccessTokenHealth() {
  try {
    const keys = configuredKeyRing();
    const active = activeSigningKey();
    return {
      configured: true,
      algorithm: "HMAC-SHA256",
      activeKeyId: active.id,
      verificationKeyCount: keys.length,
      rotationEnabled: keys.length > 1,
      legacyVerificationEnabled: keys.some((key) => key.id === LEGACY_KEY_ID),
      maximumTtlSeconds: MAX_TTL_SECONDS,
      failClosed: true,
    };
  } catch {
    return {
      configured: false,
      algorithm: "HMAC-SHA256",
      activeKeyId: null,
      verificationKeyCount: 0,
      rotationEnabled: false,
      legacyVerificationEnabled: false,
      maximumTtlSeconds: MAX_TTL_SECONDS,
      failClosed: true,
    };
  }
}
