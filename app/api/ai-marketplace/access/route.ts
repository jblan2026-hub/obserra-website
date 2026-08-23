import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { aiMarketplaceTenantId, marketplaceV12DeliveryEntitlement } from "../../../../lib/ai-marketplace-commerce";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "../../../../lib/marketplace-v12-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Server-only identity propagation. Subject and tenant identifiers never leave this route. */
export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("product") ?? "";
  const product = marketplaceV12Product(productId);
  const subject = product && marketplaceV12CommerceSubjects().find((item) => item.productId === product.product_id);
  if (!product || !subject) return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } });
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: { "cache-control": "no-store" } });
  try {
    const revision = marketplaceV12Summary().revision;
    const entitlement = await marketplaceV12DeliveryEntitlement(userId, aiMarketplaceTenantId(userId, orgId), product.product_id, revision, subject.artifactSha256);
    return NextResponse.json({ contract: "ai-marketplace-v12-access-v1", productId: product.product_id, catalogRevision: revision, authenticated: true, deliveryAuthorized: entitlement.allowed === true, installationAuthorized: false }, { headers: { "cache-control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "Access authority unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
