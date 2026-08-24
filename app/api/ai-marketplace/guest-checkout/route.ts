import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  aiMarketplaceCustomer,
  aiMarketplaceCustomerKey,
  bindAiMarketplaceCustomer,
  recordMarketplaceV12Checkout,
  reserveMarketplaceV12Checkout,
} from "../../../../lib/ai-marketplace-commerce";
import { applicationsCommerceConfigured, applicationsCommerceLivemode, getApplicationsStripe } from "../../../../lib/applications-stripe";
import { boundMarketplaceV12Price, marketplaceV12BindingCoverage, marketplaceV12Offer, type MarketplaceV12PurchaseOption } from "../../../../lib/marketplace-v12-bindings";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "../../../../lib/marketplace-v12-catalog";
import { createMarketplaceV12GuestDownloadToken, createMarketplaceV12GuestIdentity } from "../../../../lib/marketplace-v12-guest-purchase";
import { marketplaceV12ProductCommerce } from "../../../../lib/marketplace-v12-runtime";
import { ensureMarketplaceV12RuntimeSecrets } from "../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";
export const maxDuration = 60;

const V12_SOURCE = "obserra-ai-marketplace-v12";
const sid = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id;

function redirect(request: Request, code: string, product = "") {
  const url = new URL("/ai-marketplace", request.url);
  url.searchParams.set("checkout", code);
  if (product) url.searchParams.set("product", product);
  return NextResponse.redirect(url, 303);
}

function sameOrigin(request: Request) {
  try {
    return new URL(request.headers.get("origin") ?? "invalid").origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function validV12Price(price: Stripe.Price, input: { productId: string; option: MarketplaceV12PurchaseOption; amountMinor: number; live: boolean; revision: string; artifactSha256: string; bindingKey: string }) {
  const product = typeof price.product === "string" ? null : price.product;
  const recurring = input.option === "recurring:month" || input.option === "recurring:year";
  const interval = input.option === "recurring:month" ? "month" : "year";
  return price.active && price.livemode === input.live && price.currency === "usd" && price.unit_amount === input.amountMinor
    && (recurring ? price.type === "recurring" && price.recurring?.interval === interval && price.recurring.interval_count === 1 : price.type === "one_time")
    && !!product && !product.deleted && product.active
    && product.metadata.obserraMarketplaceProduct === input.productId
    && product.metadata.catalogRevision === input.revision
    && product.metadata.artifactSha256 === input.artifactSha256
    && product.metadata.commerceSource === V12_SOURCE
    && price.metadata.bindingKey === input.bindingKey;
}

async function requireGuestCustomer(subjectId: string, tenantId: string) {
  const existing = await aiMarketplaceCustomer(subjectId, tenantId, "marketplace-v12");
  if (existing) return existing;
  const created = await getApplicationsStripe().customers.create({
    metadata: { clerkUserId: subjectId, tenantId, commerceSource: V12_SOURCE, buyerType: "guest" },
  }, { idempotencyKey: aiMarketplaceCustomerKey(subjectId, tenantId) });
  return bindAiMarketplaceCustomer(subjectId, tenantId, created.id, "marketplace-v12");
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirect(request, "same-origin-required");
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/x-www-form-urlencoded")) return redirect(request, "unsupported-request");

  const form = await request.formData();
  const productId = String(form.get("product") ?? "");
  const option = String(form.get("purchaseOption") ?? "") as MarketplaceV12PurchaseOption;

  try {
    await ensureMarketplaceV12RuntimeSecrets();
    const product = marketplaceV12Product(productId);
    const revision = marketplaceV12Summary().revision;
    const subject = product && marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
    const offer = product && marketplaceV12Offer(product, option);
    if (!product || !subject || !offer) return redirect(request, "catalog-v12-configuration-required", productId);

    const [priceId, coverage, commerce] = await Promise.all([
      boundMarketplaceV12Price(product, option),
      marketplaceV12BindingCoverage(),
      marketplaceV12ProductCommerce(product),
    ]);
    if (!priceId || !coverage.complete || !commerce.checkoutEnabled) return redirect(request, "catalog-v12-activation-blocked", productId);

    const live = applicationsCommerceLivemode();
    if (live !== true || !applicationsCommerceConfigured()) return redirect(request, "catalog-v12-configuration-required", productId);

    const { subjectId, tenantId } = createMarketplaceV12GuestIdentity();
    const reservation = await reserveMarketplaceV12Checkout({
      subjectId,
      tenantId,
      productId: product.product_id,
      option,
      revision,
      artifactSha256: subject.artifactSha256,
    });

    const stripe = getApplicationsStripe();
    const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
    const bindingKey = `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}`;
    if (!validV12Price(price, { productId: product.product_id, option, amountMinor: offer.amount_minor, live, revision, artifactSha256: subject.artifactSha256, bindingKey })) {
      return redirect(request, "catalog-v12-price-governance-failed", productId);
    }

    const customer = await requireGuestCustomer(subjectId, tenantId);
    const metadata = {
      commerceSource: V12_SOURCE,
      checkoutAttemptId: reservation.attemptId,
      productId: product.product_id,
      purchaseOption: option,
      catalogRevision: revision,
      artifactSha256: subject.artifactSha256,
      bindingKey,
      clerkUserId: subjectId,
      tenantId,
      buyerType: "guest",
    };

    const downloadToken = createMarketplaceV12GuestDownloadToken({
      subjectId,
      tenantId,
      attemptId: reservation.attemptId,
      productId: product.product_id,
      revision,
      artifactSha256: subject.artifactSha256,
      expiresAt: Math.floor(Date.now() / 1000) + 7200,
    });
    const success = new URL("/api/ai-marketplace/purchase-download", request.url);
    success.searchParams.set("product", product.product_id);
    success.searchParams.set("purchase_token", downloadToken);
    const successUrl = `${success.toString()}&purchase_session={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: offer.kind === "recurring" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customer.stripeCustomerId,
      client_reference_id: subjectId,
      metadata,
      ...(offer.kind === "recurring" ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
      success_url: successUrl,
      cancel_url: new URL(`/ai-marketplace/${encodeURIComponent(product.slug)}?checkout=cancelled`, request.url).toString(),
      expires_at: reservation.expiresAt,
      billing_address_collection: "required",
      customer_update: { address: "auto", name: "auto" },
      consent_collection: { terms_of_service: "required" },
    }, { idempotencyKey: `ai-marketplace-v12-guest-checkout-${reservation.attemptId}` });

    if (!session.url || session.livemode !== live || sid(session.customer) !== customer.stripeCustomerId || session.metadata?.checkoutAttemptId !== reservation.attemptId) {
      throw new Error("Marketplace guest checkout creation mismatch");
    }

    await recordMarketplaceV12Checkout({
      attemptId: reservation.attemptId,
      customerId: customer.stripeCustomerId,
      sessionId: session.id,
      subscriptionId: sid(session.subscription),
      paymentIntentId: sid(session.payment_intent),
    });

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("AI Marketplace guest checkout unavailable", { name: error instanceof Error ? error.name : "unknown", productId });
    return redirect(request, "catalog-v12-unavailable", productId);
  }
}

export async function GET(request: Request) {
  return redirect(request, "post-required");
}
