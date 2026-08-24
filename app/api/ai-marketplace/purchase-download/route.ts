import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { marketplaceV12DeliveryEntitlement, recordMarketplaceV12Download } from "../../../../lib/ai-marketplace-commerce";
import { marketplaceV12Release } from "../../../../lib/ai-marketplace-delivery";
import { applicationsCommerceLivemode, getApplicationsStripe } from "../../../../lib/applications-stripe";
import { marketplaceV12SignedAzureReleaseUrl } from "../../../../lib/marketplace-v12-azure-delivery";
import { marketplaceV12CommerceSubjects, marketplaceV12Product } from "../../../../lib/marketplace-v12-catalog";
import { verifyMarketplaceV12GuestDownloadToken } from "../../../../lib/marketplace-v12-guest-purchase";
import { ensureMarketplaceV12RuntimeSecrets } from "../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SESSION = /^cs_(?:live|test)_[A-Za-z0-9_]+$/;
const sid = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id;
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function protectedHeaders() {
  return {
    "cache-control": "no-store, private",
    "x-robots-tag": "noindex, nofollow, noarchive",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  };
}

function unavailable(status = 503) {
  return NextResponse.json({ error: "Protected purchase delivery unavailable" }, { status, headers: protectedHeaders() });
}

function pending(request: Request) {
  const retryUrl = new URL(request.url);
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Preparing download | Obserra EPI</title></head><body style="font-family:system-ui,sans-serif;max-width:720px;margin:10vh auto;padding:24px"><h1>Payment verified</h1><p>Stripe confirmed your payment. Your protected download is being finalized.</p><p><a href="${retryUrl.toString().replaceAll("&", "&amp;")}">Retry download</a></p></body></html>`;
  return new NextResponse(body, { status: 202, headers: { ...protectedHeaders(), "content-type": "text/html; charset=utf-8", "retry-after": "2" } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product") ?? "";
  const sessionId = url.searchParams.get("purchase_session") ?? "";
  const tokenValue = url.searchParams.get("purchase_token") ?? "";
  if (!SESSION.test(sessionId) || !tokenValue) return unavailable(400);

  try {
    await ensureMarketplaceV12RuntimeSecrets();
    const token = verifyMarketplaceV12GuestDownloadToken(tokenValue);
    if (!token || token.productId !== productId) return unavailable(403);

    const product = marketplaceV12Product(productId);
    const subject = product && marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
    if (!product || !subject || token.revision.length !== 64 || subject.artifactSha256 !== token.artifactSha256) return unavailable(403);

    const live = applicationsCommerceLivemode();
    if (live !== true) return unavailable();
    const session = await getApplicationsStripe().checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata ?? {};
    if (session.livemode !== live
      || session.status !== "complete"
      || session.payment_status !== "paid"
      || metadata.commerceSource !== "obserra-ai-marketplace-v12"
      || metadata.buyerType !== "guest"
      || metadata.checkoutAttemptId !== token.attemptId
      || metadata.productId !== token.productId
      || metadata.catalogRevision !== token.revision
      || metadata.artifactSha256 !== token.artifactSha256
      || metadata.clerkUserId !== token.subjectId
      || metadata.tenantId !== token.tenantId
      || session.client_reference_id !== token.subjectId
      || !sid(session.customer)) return unavailable(403);

    let entitled = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const decision = await marketplaceV12DeliveryEntitlement(token.subjectId, token.tenantId, token.productId, token.revision, token.artifactSha256);
      if (decision.allowed) {
        entitled = true;
        break;
      }
      await wait(750);
    }
    if (!entitled) return pending(request);

    const release = marketplaceV12Release(token.productId, token.revision, token.artifactSha256);
    if (!release) return unavailable();
    const decision = await recordMarketplaceV12Download({
      subjectId: token.subjectId,
      tenantId: token.tenantId,
      productId: token.productId,
      revision: token.revision,
      artifactSha256: token.artifactSha256,
      correlationId: randomUUID(),
    });
    if (!decision.allowed) return unavailable(403);

    const downloadUrl = await marketplaceV12SignedAzureReleaseUrl({ release, productId: token.productId, revision: token.revision });
    if (!downloadUrl) return unavailable();
    const response = NextResponse.redirect(downloadUrl, 303);
    for (const [name, value] of Object.entries(protectedHeaders())) response.headers.set(name, value);
    response.headers.set("content-disposition", `attachment; filename="${release.artifactFile}"`);
    return response;
  } catch {
    return unavailable();
  }
}
