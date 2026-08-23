import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { findAiMarketplaceProduct } from "../../../../lib/ai-marketplace-catalog";
import { aiMarketplaceEntitlement, aiMarketplaceTenantId, marketplaceV12DeliveryEntitlement, recordMarketplaceV12Download } from "../../../../lib/ai-marketplace-commerce";
import { aiMarketplaceRelease, marketplaceV12Release, signedAiMarketplaceReleaseUrl } from "../../../../lib/ai-marketplace-delivery";
import { marketplaceV12SignedAzureReleaseUrl } from "../../../../lib/marketplace-v12-azure-delivery";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "../../../../lib/marketplace-v12-catalog";
import { ensureMarketplaceV12RuntimeSecrets } from "../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({ error: "Protected delivery unavailable" }, { status: 503, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow, noarchive" } });
}

export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("product") ?? "";
  const catalog = marketplaceV12Product(productId);
  const subject = catalog && marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === catalog.product_id);
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
  try {
    if (catalog && subject) {
      await ensureMarketplaceV12RuntimeSecrets();
      const revision = marketplaceV12Summary().revision;
      const tenantId = aiMarketplaceTenantId(userId, orgId);
      const entitled = await marketplaceV12DeliveryEntitlement(userId, tenantId, catalog.product_id, revision, subject.artifactSha256);
      if (!entitled.allowed) return NextResponse.json({ error: "Entitlement required" }, { status: 403, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
      const release = marketplaceV12Release(catalog.product_id, revision, subject.artifactSha256);
      if (!release) return unavailable();
      const decision = await recordMarketplaceV12Download({ subjectId: userId, tenantId, productId: catalog.product_id, revision, artifactSha256: subject.artifactSha256, correlationId: randomUUID() });
      if (!decision.allowed) return NextResponse.json({ error: "Entitlement required" }, { status: 403, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
      const url = await marketplaceV12SignedAzureReleaseUrl({ release, productId: catalog.product_id, revision });
      if (!url) return unavailable();
      const response = NextResponse.redirect(url, 303);
      response.headers.set("cache-control", "no-store, private");
      response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
      response.headers.set("referrer-policy", "no-referrer");
      response.headers.set("x-content-type-options", "nosniff");
      response.headers.set("content-disposition", `attachment; filename="${release.artifactFile}"`);
      return response;
    }
    if (!findAiMarketplaceProduct(productId)) return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } });
    if (!(await aiMarketplaceEntitlement(userId, aiMarketplaceTenantId(userId, orgId), productId)).allowed) return NextResponse.json({ error: "Entitlement required" }, { status: 403, headers: { "cache-control": "no-store" } });
    const release = aiMarketplaceRelease(productId);
    const url = release && signedAiMarketplaceReleaseUrl(release);
    if (!url) return unavailable();
    const response = NextResponse.redirect(url, 303);
    response.headers.set("cache-control", "no-store, private");
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    response.headers.set("referrer-policy", "no-referrer");
    response.headers.set("x-content-type-options", "nosniff");
    return response;
  } catch {
    return unavailable();
  }
}
