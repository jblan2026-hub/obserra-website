import "server-only";

import { createSign } from "node:crypto";

type LegacyRelease = Readonly<{ objectKey: string; artifactFile: string }>;
export type MarketplaceV12Release = Readonly<{
  objectKey: string;
  artifactFile: string;
  artifactSha256: string;
  byteLength: number;
  mediaType: "application/zip";
  installProfile: "skill-upload" | "codex-plugin" | "desktop-installer-bundle" | "collection";
  version: string;
  verifiedAt: string;
}>;

const SHA256 = /^[a-f0-9]{64}$/;
const VERSION = /^(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*)){0,3}(?:[-+][A-Za-z0-9.-]+)?$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function validObjectKey(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9._/-]*\.zip$/.test(value)
    && value.split("/").every((part) => part !== "." && part !== "..");
}

function validArtifactFile(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*\.zip$/.test(value);
}

function validV12Release(value: unknown): value is MarketplaceV12Release {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const release = value as Record<string, unknown>;
  return typeof release.objectKey === "string" && validObjectKey(release.objectKey)
    && typeof release.artifactFile === "string" && validArtifactFile(release.artifactFile)
    && typeof release.artifactSha256 === "string" && SHA256.test(release.artifactSha256)
    && typeof release.byteLength === "number" && Number.isSafeInteger(release.byteLength) && release.byteLength > 0
    && release.mediaType === "application/zip"
    && (release.installProfile === "skill-upload" || release.installProfile === "codex-plugin" || release.installProfile === "desktop-installer-bundle" || release.installProfile === "collection")
    && typeof release.version === "string" && VERSION.test(release.version)
    && typeof release.verifiedAt === "string" && ISO_INSTANT.test(release.verifiedAt) && Number.isFinite(Date.parse(release.verifiedAt));
}

export function aiMarketplaceRelease(product: string) {
  try {
    const release = (JSON.parse(process.env.OBSERRA_AI_MARKETPLACE_DELIVERY_CATALOG_JSON ?? "") as Record<string, LegacyRelease>)[product];
    return release && validObjectKey(release.objectKey) && validArtifactFile(release.artifactFile) ? release : null;
  } catch {
    return null;
  }
}

/** The caller must make the entitlement decision before requesting this URL. */
export function signedAiMarketplaceReleaseUrl(release: { objectKey: string }, ttl = 300) {
  const origin = process.env.OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL?.replace(/\/$/, "") ?? "";
  const key = process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID ?? "";
  const pem = process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "";
  if (!/^https:\/\/[A-Za-z0-9.-]+/.test(origin) || !key || !pem) return null;
  const resource = `${origin}/${release.objectKey.split("/").map(encodeURIComponent).join("/")}`;
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const policy = JSON.stringify({ Statement: [{ Resource: resource, Condition: { DateLessThan: { "AWS:EpochTime": expires } } }] });
  try {
    const signer = createSign("RSA-SHA1");
    signer.update(policy);
    const signature = signer.sign(pem, "base64").replace(/\+/g, "-").replace(/=/g, "_").replace(/\//g, "~");
    return `${resource}?Expires=${expires}&Signature=${signature}&Key-Pair-Id=${encodeURIComponent(key)}`;
  } catch {
    return null;
  }
}

export function aiMarketplaceProtectedDeliveryConfigured() {
  return Boolean(process.env.OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL && process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID && process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY && process.env.OBSERRA_AI_MARKETPLACE_DELIVERY_CATALOG_JSON);
}

/** A v1.2 release must contain immutable size, digest, profile, and version evidence. */
export function marketplaceV12Release(productId: string, revision: string, artifactSha256: string) {
  try {
    const value = JSON.parse(process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON ?? "") as { revision?: string; products?: Record<string, unknown> };
    const release = value.revision === revision ? value.products?.[productId] : null;
    return validV12Release(release) && release.artifactSha256 === artifactSha256 ? release : null;
  } catch {
    return null;
  }
}

export function marketplaceV12ProtectedDeliveryConfigured() {
  return Boolean(process.env.OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL && process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID && process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY && process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON);
}
