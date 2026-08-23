import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { aiMarketplaceTenantId, createMarketplaceV12InstallGrant } from "../../../../lib/ai-marketplace-commerce";
import { marketplaceV12Release } from "../../../../lib/ai-marketplace-delivery";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "../../../../lib/marketplace-v12-catalog";
import { marketplaceV12InstallBridgeConfigured } from "../../../../lib/marketplace-v12-install-bridge";
import { ensureMarketplaceV12RuntimeSecrets } from "../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sameOrigin(request: Request) {
  try { return new URL(request.headers.get("origin") ?? "invalid").origin === new URL(request.url).origin; } catch { return false; }
}

function error(message: string, status: 400 | 401 | 403 | 409 | 503) {
  return NextResponse.json({ error: message }, { status, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return error("Same-origin request required", 403);
  const { userId, orgId } = await auth();
  if (!userId) return error("Authentication required", 401);
  const form = await request.formData();
  const productId = String(form.get("product") ?? "");
  const bridgeId = String(form.get("bridgeId") ?? "");
  const platform = String(form.get("platform") ?? "");
  const product = marketplaceV12Product(productId);
  const subject = product && marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  if (!product || !subject || product.product_type === "collection" || product.product_type === "bundle") return error("Invalid installation request", 400);
  const revision = marketplaceV12Summary().revision;
  try {
    await ensureMarketplaceV12RuntimeSecrets();
    const release = marketplaceV12Release(product.product_id, revision, subject.artifactSha256);
    if (!release || !marketplaceV12InstallBridgeConfigured()) return error("Install bridge unavailable", 503);
    const grant = await createMarketplaceV12InstallGrant({
      subjectId: userId, tenantId: aiMarketplaceTenantId(userId, orgId), productId: product.product_id, revision,
      artifactSha256: subject.artifactSha256, bridgeId, platform, installProfile: release.installProfile, correlationId: randomUUID(),
    });
    return NextResponse.json({
      contract: "obserra-marketplace-install-grant-v1",
      protocolUrl: `obserra://install?grant=${encodeURIComponent(grant.grantId)}`,
      expiresAt: grant.expiresAt,
    }, { headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
  } catch {
    return error("Install bridge unavailable", 503);
  }
}
