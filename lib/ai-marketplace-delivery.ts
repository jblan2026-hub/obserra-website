import "server-only";

import { createHash, createPrivateKey, createSign } from "node:crypto";

import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary, type MarketplaceV12Card } from "./marketplace-v12-catalog";

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

type MarketplaceV12DeliveryReceipt = Readonly<{
  contract: "obserra-marketplace-v12-runtime-delivery-receipt-v1";
  revision: string;
  requiredProducts: number;
  deliveryCatalogSha256: string;
  protectedArtifactSetComplete: true;
  verifiedAt: string;
}>;

type MarketplaceV12ReleaseCard = MarketplaceV12Card & Readonly<{
  artifact?: Readonly<{
    deployment_key?: unknown;
    filename?: unknown;
    sha256?: unknown;
    bytes?: unknown;
    media_type?: unknown;
  }>;
  install?: Readonly<{ profile?: unknown }>;
}>;

const SHA256 = /^[a-f0-9]{64}$/;
const VERSION = /^(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*)){0,3}(?:[-+][A-Za-z0-9.-]+)?$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const CLOUDFRONT_KEY_PAIR_ID = /^[A-Za-z0-9_-]{8,128}$/;
const EXPECTED_PRODUCT_COUNT = 11_390;
let cachedDeliveryReceipt: { raw: string; value: MarketplaceV12DeliveryReceipt | null } | null = null;

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

function releaseFromCatalog(productId: string, verifiedAt: string): MarketplaceV12Release | null {
  const product = marketplaceV12Product(productId) as MarketplaceV12ReleaseCard | null;
  const artifact = product?.artifact;
  const release = product && artifact ? {
    objectKey: artifact.deployment_key,
    artifactFile: artifact.filename,
    artifactSha256: artifact.sha256,
    byteLength: artifact.bytes,
    mediaType: artifact.media_type,
    installProfile: product.install?.profile,
    version: product.version,
    verifiedAt,
  } : null;
  return validV12Release(release) ? release : null;
}

/**
 * The exact 11,390-record delivery catalog is several megabytes and cannot be
 * stored safely in Key Vault or a Vercel environment value. Runtime therefore
 * reconstructs the deterministic catalog from the already digest-pinned
 * product catalog and checks it against a small, signed delivery receipt.
 */
function reconstructedDeliveryCatalogSha256(revision: string, verifiedAt: string) {
  const products: Record<string, MarketplaceV12Release> = {};
  const subjects = [...marketplaceV12CommerceSubjects()].sort((left, right) => left.productId.localeCompare(right.productId));
  if (subjects.length !== EXPECTED_PRODUCT_COUNT) return null;
  for (const subject of subjects) {
    const release = releaseFromCatalog(subject.productId, verifiedAt);
    if (!release || release.artifactSha256 !== subject.artifactSha256) return null;
    products[subject.productId] = release;
  }
  return createHash("sha256").update(`${JSON.stringify({ revision, products })}\n`).digest("hex");
}

function marketplaceV12DeliveryReceipt() {
  const raw = process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON?.trim() ?? "";
  if (cachedDeliveryReceipt?.raw === raw) return cachedDeliveryReceipt.value;
  let value: MarketplaceV12DeliveryReceipt | null = null;
  try {
    const receipt = JSON.parse(raw) as Partial<MarketplaceV12DeliveryReceipt>;
    const revision = marketplaceV12Summary().revision;
    const verifiedAt = receipt.verifiedAt ?? "";
    const reconstructedDigest = receipt.revision === revision && ISO_INSTANT.test(verifiedAt)
      ? reconstructedDeliveryCatalogSha256(revision, verifiedAt)
      : null;
    if (
      receipt.contract === "obserra-marketplace-v12-runtime-delivery-receipt-v1"
      && receipt.revision === revision
      && receipt.requiredProducts === EXPECTED_PRODUCT_COUNT
      && receipt.protectedArtifactSetComplete === true
      && SHA256.test(receipt.deliveryCatalogSha256 ?? "")
      && reconstructedDigest === receipt.deliveryCatalogSha256
    ) value = receipt as MarketplaceV12DeliveryReceipt;
  } catch {
    value = null;
  }
  cachedDeliveryReceipt = { raw, value };
  return value;
}

export function aiMarketplaceRelease(product: string) {
  try {
    const release = (JSON.parse(process.env.OBSERRA_AI_MARKETPLACE_DELIVERY_CATALOG_JSON ?? "") as Record<string, LegacyRelease>)[product];
    return release && validObjectKey(release.objectKey) && validArtifactFile(release.artifactFile) ? release : null;
  } catch {
    return null;
  }
}

function cloudFrontSigningConfig() {
  const rawOrigin = process.env.OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL?.trim().replace(/\/$/, "") ?? "";
  const keyPairId = process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID?.trim() ?? "";
  const pem = process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, "\n").trim() ?? "";
  try {
    const origin = new URL(rawOrigin);
    const privateKey = createPrivateKey(pem);
    if (
      origin.protocol !== "https:"
      || origin.username !== ""
      || origin.password !== ""
      || origin.pathname !== "/"
      || origin.search !== ""
      || origin.hash !== ""
      || origin.origin !== rawOrigin
      || !origin.hostname.includes(".")
      || !CLOUDFRONT_KEY_PAIR_ID.test(keyPairId)
      || privateKey.asymmetricKeyType !== "rsa"
    ) return null;
    return { origin: origin.origin, keyPairId, privateKey };
  } catch {
    return null;
  }
}

/** The caller must make the entitlement decision before requesting this URL. */
export function signedAiMarketplaceReleaseUrl(release: { objectKey: string }, ttl = 300) {
  const config = cloudFrontSigningConfig();
  if (!config) return null;
  const resource = `${config.origin}/${release.objectKey.split("/").map(encodeURIComponent).join("/")}`;
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const policy = JSON.stringify({ Statement: [{ Resource: resource, Condition: { DateLessThan: { "AWS:EpochTime": expires } } }] });
  try {
    const signer = createSign("RSA-SHA1");
    signer.update(policy);
    const signature = signer.sign(config.privateKey, "base64").replace(/\+/g, "-").replace(/=/g, "_").replace(/\//g, "~");
    return `${resource}?Expires=${expires}&Signature=${signature}&Key-Pair-Id=${encodeURIComponent(config.keyPairId)}`;
  } catch {
    return null;
  }
}

export function aiMarketplaceProtectedDeliveryConfigured() {
  return cloudFrontSigningConfig() !== null && Boolean(process.env.OBSERRA_AI_MARKETPLACE_DELIVERY_CATALOG_JSON);
}

/** A v1.2 release must contain immutable size, digest, profile, and version evidence. */
export function marketplaceV12Release(productId: string, revision: string, artifactSha256: string) {
  const receipt = marketplaceV12DeliveryReceipt();
  const release = receipt?.revision === revision ? releaseFromCatalog(productId, receipt.verifiedAt) : null;
  return release?.artifactSha256 === artifactSha256 ? release : null;
}

export function marketplaceV12ProtectedDeliveryConfigured() {
  return cloudFrontSigningConfig() !== null && marketplaceV12DeliveryReceipt() !== null;
}
