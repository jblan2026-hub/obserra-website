import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const SUBJECT = /^user_guest_[A-Za-z0-9_-]{24,}$/;
const TENANT = /^subject:user_guest_[A-Za-z0-9_-]{24,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REVISION = /^[a-f0-9]{64}$/;
const PRODUCT = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/;
const TOKEN_VERSION = 1;
const TOKEN_KIND = "marketplace-v12-guest-download";

type GuestDownloadPayload = Readonly<{
  v: 1;
  k: typeof TOKEN_KIND;
  subjectId: string;
  tenantId: string;
  attemptId: string;
  productId: string;
  revision: string;
  artifactSha256: string;
  expiresAt: number;
}>;

function commerceSecret() {
  const value = process.env.OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET?.trim() ?? "";
  if (value.length < 32) throw new Error("Marketplace guest purchase signing is unavailable.");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", commerceSecret()).update(`marketplace-v12-guest:${payload}`).digest("base64url");
}

function validPayload(value: unknown): value is GuestDownloadPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return payload.v === TOKEN_VERSION
    && payload.k === TOKEN_KIND
    && typeof payload.subjectId === "string" && SUBJECT.test(payload.subjectId)
    && typeof payload.tenantId === "string" && TENANT.test(payload.tenantId) && payload.tenantId === `subject:${payload.subjectId}`
    && typeof payload.attemptId === "string" && UUID.test(payload.attemptId)
    && typeof payload.productId === "string" && PRODUCT.test(payload.productId)
    && typeof payload.revision === "string" && REVISION.test(payload.revision)
    && typeof payload.artifactSha256 === "string" && REVISION.test(payload.artifactSha256)
    && typeof payload.expiresAt === "number" && Number.isSafeInteger(payload.expiresAt) && payload.expiresAt > Math.floor(Date.now() / 1000);
}

export function createMarketplaceV12GuestIdentity() {
  const subjectId = `user_guest_${randomBytes(24).toString("base64url")}`;
  return { subjectId, tenantId: `subject:${subjectId}` } as const;
}

export function createMarketplaceV12GuestDownloadToken(input: Omit<GuestDownloadPayload, "v" | "k">) {
  if (!validPayload({ ...input, v: TOKEN_VERSION, k: TOKEN_KIND })) throw new Error("Marketplace guest purchase identity is invalid.");
  const payload = Buffer.from(JSON.stringify({ ...input, v: TOKEN_VERSION, k: TOKEN_KIND }), "utf8").toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyMarketplaceV12GuestDownloadToken(token: string) {
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra !== undefined) return null;
  const expected = signature(payload);
  const suppliedBytes = Buffer.from(suppliedSignature, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  if (suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as unknown;
    return validPayload(value) ? value : null;
  } catch {
    return null;
  }
}
