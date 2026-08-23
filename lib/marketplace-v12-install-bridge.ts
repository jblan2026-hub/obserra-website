import "server-only";

import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

import { marketplaceV12BridgeEnrollment } from "./ai-marketplace-commerce";
import { marketplaceV12ProtectedDeliveryConfigured, signedAiMarketplaceReleaseUrl, type MarketplaceV12Release } from "./ai-marketplace-delivery";

const BRIDGE = /^bridge_[A-Za-z0-9_-]{16,128}$/;
const KEY_ID = /^obserra-[a-z0-9][a-z0-9._-]{2,63}$/;
const NONCE = /^[A-Za-z0-9_-]{22,128}$/;
const SIGNATURE = /^[A-Za-z0-9_-]{80,128}$/;

export type MarketplaceV12BridgeGrant = Readonly<{
  grantId: string;
  productId: string;
  catalogRevision: string;
  artifactSha256: string;
  platform: string;
  installProfile: string;
  correlationId: string;
}>;

function signingConfig() {
  const keyId = process.env.OBSERRA_AI_MARKETPLACE_INSTALL_MANIFEST_KEY_ID?.trim() ?? "";
  const pem = process.env.OBSERRA_AI_MARKETPLACE_INSTALL_MANIFEST_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "";
  const protocol = process.env.OBSERRA_AI_MARKETPLACE_INSTALL_BRIDGE_PROTOCOL?.trim() ?? "";
  if (!KEY_ID.test(keyId) || protocol !== "obserra://install" || !pem) return null;
  try {
    const key = createPrivateKey(pem);
    return key.asymmetricKeyType === "ed25519" ? { keyId, key, protocol } : null;
  } catch {
    return null;
  }
}

export function marketplaceV12InstallBridgeConfigured() {
  return marketplaceV12ProtectedDeliveryConfigured() && signingConfig() !== null;
}

function canonical(value: Record<string, unknown>) {
  return JSON.stringify(Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))));
}

/** Verifies a bridge-held Ed25519 private key; browser-controlled headers alone never satisfy this. */
export async function verifyMarketplaceV12BridgeRequest(headers: Headers, grantId: string, audience: "exchange" | "receipt", payloadDigest = "-") {
  const bridgeId = headers.get("x-obserra-bridge-id") ?? "";
  const timestamp = headers.get("x-obserra-bridge-timestamp") ?? "";
  const nonce = headers.get("x-obserra-bridge-nonce") ?? "";
  const signature = headers.get("x-obserra-bridge-signature") ?? "";
  const seconds = Number(timestamp);
  if (!BRIDGE.test(bridgeId) || !Number.isSafeInteger(seconds) || Math.abs(Math.floor(Date.now() / 1000) - seconds) > 120 || !NONCE.test(nonce) || !SIGNATURE.test(signature)) return null;
  const enrollment = await marketplaceV12BridgeEnrollment(bridgeId);
  if (!enrollment) return null;
  try {
    const key = createPublicKey(enrollment.publicKeyPem);
    if (key.asymmetricKeyType !== "ed25519") return null;
    const payload = `${bridgeId}\n${timestamp}\n${nonce}\n${grantId}\n${audience}\n${payloadDigest}`;
    return verify(null, Buffer.from(payload), key, Buffer.from(signature, "base64url")) ? enrollment : null;
  } catch {
    return null;
  }
}

export function marketplaceV12InstallManifest(grant: MarketplaceV12BridgeGrant, release: MarketplaceV12Release) {
  const config = signingConfig();
  if (!config || release.artifactSha256 !== grant.artifactSha256) return null;
  const manifest = {
    contract: "obserra-marketplace-install-manifest-v1",
    signingKeyId: config.keyId,
    productId: grant.productId,
    catalogRevision: grant.catalogRevision,
    artifactSha256: grant.artifactSha256,
    artifactFile: release.artifactFile,
    byteLength: release.byteLength,
    mediaType: release.mediaType,
    releaseVersion: release.version,
    verifiedAt: release.verifiedAt,
    platform: grant.platform,
    installProfile: grant.installProfile,
    correlationId: grant.correlationId,
  };
  const payload = canonical(manifest);
  return { manifest, signature: sign(null, Buffer.from(payload), config.key).toString("base64url"), protocol: config.protocol };
}

export function marketplaceV12BridgeArtifactUrl(release: MarketplaceV12Release) {
  return signedAiMarketplaceReleaseUrl(release, 300);
}
