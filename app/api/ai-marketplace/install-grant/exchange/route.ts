import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { consumeMarketplaceV12InstallGrant, lookupMarketplaceV12InstallGrant } from "../../../../../lib/ai-marketplace-commerce";
import { marketplaceV12Release } from "../../../../../lib/ai-marketplace-delivery";
import { marketplaceV12BridgeArtifactUrl, marketplaceV12InstallBridgeConfigured, marketplaceV12InstallManifest, verifyMarketplaceV12BridgeRequest } from "../../../../../lib/marketplace-v12-install-bridge";
import { ensureMarketplaceV12RuntimeSecrets } from "../../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function failure(status: 400 | 401 | 403 | 409 | 503) {
  return NextResponse.json({ error: "Install exchange unavailable" }, { status, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "referrer-policy": "no-referrer" } });
}

export async function POST(request: Request) {
  let body: { grantId?: unknown };
  try { body = await request.json() as typeof body; } catch { return failure(400); }
  if (typeof body.grantId !== "string") return failure(400);
  try {
    await ensureMarketplaceV12RuntimeSecrets();
    if (!marketplaceV12InstallBridgeConfigured()) return failure(503);
    const bridge = await verifyMarketplaceV12BridgeRequest(request.headers, body.grantId, "exchange");
    if (!bridge) return failure(401);
    const grant = await lookupMarketplaceV12InstallGrant({ grantId: body.grantId, bridgeId: bridge.bridgeId });
    if (!grant || grant.platform !== bridge.platform) return failure(403);
    const release = marketplaceV12Release(grant.productId, grant.catalogRevision, grant.artifactSha256);
    if (!release || release.installProfile !== grant.installProfile) return failure(409);
    const manifest = marketplaceV12InstallManifest({ grantId: body.grantId, ...grant }, release);
    const artifactUrl = manifest && marketplaceV12BridgeArtifactUrl(release);
    if (!manifest || !artifactUrl) return failure(503);
    const receiptCorrelationId = randomUUID();
    await consumeMarketplaceV12InstallGrant({ grantId: body.grantId, bridgeId: bridge.bridgeId, receiptCorrelationId });
    return NextResponse.json({ contract: "obserra-marketplace-install-exchange-v1", manifest: manifest.manifest, signature: manifest.signature, artifactUrl, receiptCorrelationId }, { headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", "referrer-policy": "no-referrer" } });
  } catch {
    return failure(503);
  }
}
