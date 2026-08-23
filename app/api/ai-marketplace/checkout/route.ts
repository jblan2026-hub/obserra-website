import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { aiMarketplaceAmountCents, findAiMarketplaceProduct, validAiMarketplaceProduct } from "../../../../lib/ai-marketplace-catalog";
import { aiMarketplaceBindingCoverage, boundAiMarketplacePrice, requiredBillingIntervals, type AiMarketplaceBillingInterval } from "../../../../lib/ai-marketplace-payment-bindings";
import {
  aiMarketplaceCustomer,
  aiMarketplaceCustomerKey,
  aiMarketplaceTenantId,
  bindAiMarketplaceCustomer,
  recordAiMarketplaceCheckout,
  recordMarketplaceV12Checkout,
  reserveAiMarketplaceCheckout,
  reserveMarketplaceV12Checkout,
} from "../../../../lib/ai-marketplace-commerce";
import { applicationsCommerceConfigured, applicationsCommerceLivemode, getApplicationsStripe } from "../../../../lib/applications-stripe";
import { primaryAccountEmail } from "../../../../lib/app-entitlements";
import { boundMarketplaceV12Price, marketplaceV12BindingCoverage, marketplaceV12Offer, type MarketplaceV12PurchaseOption } from "../../../../lib/marketplace-v12-bindings";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "../../../../lib/marketplace-v12-catalog";
import { marketplaceV12ProductCommerce } from "../../../../lib/marketplace-v12-runtime";
import { ensureApplicationsRuntimeSecrets, ensureMarketplaceV12RuntimeSecrets } from "../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";
export const maxDuration = 60;

const LEGACY_SOURCE = "obserra-ai-marketplace-v1";
const V12_SOURCE = "obserra-ai-marketplace-v12";
const sid = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id;

function redirect(request: Request, code: string, product = "") {
  const url = new URL("/ai-marketplace", request.url);
  url.searchParams.set("checkout", code);
  if (product) url.searchParams.set("product", product);
  return NextResponse.redirect(url, 303);
}

function sameOrigin(request: Request) {
  try { return new URL(request.headers.get("origin") ?? "invalid").origin === new URL(request.url).origin; } catch { return false; }
}

function validLegacyPrice(price: Stripe.Price, productId: string, interval: AiMarketplaceBillingInterval, amount: number, live: boolean) {
  const product = typeof price.product === "string" ? null : price.product;
  return price.active && price.livemode === live && price.currency === "usd" && price.unit_amount === amount
    && (interval === "one-time" ? price.type === "one_time" : price.type === "recurring" && price.recurring?.interval === (interval === "monthly" ? "month" : "year") && price.recurring.interval_count === 1)
    && !!product && !product.deleted && product.active && product.metadata.obserraMarketplaceProduct === productId && product.metadata.billingInterval === interval && product.metadata.commerceSource === LEGACY_SOURCE;
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

async function requireCustomer(subjectId: string, tenantId: string, source: string) {
  const scope: "applications" | "marketplace-v12" = source === V12_SOURCE ? "marketplace-v12" : "applications";
  const existing = await aiMarketplaceCustomer(subjectId, tenantId, scope);
  if (existing) return existing;
  const created = await getApplicationsStripe().customers.create({
    email: await primaryAccountEmail(),
    metadata: { clerkUserId: subjectId, tenantId, commerceSource: source },
  }, { idempotencyKey: aiMarketplaceCustomerKey(subjectId, tenantId) });
  return bindAiMarketplaceCustomer(subjectId, tenantId, created.id, scope);
}

async function v12Checkout(request: Request, input: { productId: string; option: string }) {
  const product = marketplaceV12Product(input.productId);
  const expectedRevision = marketplaceV12Summary().revision;
  const option = input.option as MarketplaceV12PurchaseOption;
  const subject = product && marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  const offer = product && marketplaceV12Offer(product, option);
  if (!product || !subject || !offer) return redirect(request, "catalog-v12-configuration-required", input.productId);

  const { userId, orgId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("redirect_url", new URL(`/ai-marketplace/${encodeURIComponent(product.slug)}`, request.url).toString());
    return NextResponse.redirect(signIn, 303);
  }
  await ensureMarketplaceV12RuntimeSecrets();
  const [priceId, coverage] = await Promise.all([boundMarketplaceV12Price(product, option), marketplaceV12BindingCoverage()]);
  if (!priceId || !coverage.complete) return redirect(request, "catalog-v12-configuration-required", input.productId);
  if (!(await marketplaceV12ProductCommerce(product)).checkoutEnabled) return redirect(request, "catalog-v12-activation-blocked", input.productId);
  const live = applicationsCommerceLivemode();
  if (live !== true || !applicationsCommerceConfigured()) return redirect(request, "catalog-v12-configuration-required", input.productId);

  const tenantId = aiMarketplaceTenantId(userId, orgId);
  const reservation = await reserveMarketplaceV12Checkout({ subjectId: userId, tenantId, productId: product.product_id, option, revision: expectedRevision, artifactSha256: subject.artifactSha256 });
  const stripe = getApplicationsStripe();
  if (reservation.stripeSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId);
    if (existing.metadata?.commerceSource === V12_SOURCE && existing.metadata.checkoutAttemptId === reservation.attemptId && existing.metadata.productId === product.product_id && existing.metadata.purchaseOption === option && existing.metadata.catalogRevision === expectedRevision && existing.metadata.artifactSha256 === subject.artifactSha256 && existing.url) return NextResponse.redirect(existing.url, 303);
    throw new Error("Marketplace checkout replay mismatch");
  }

  const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
  const bindingKey = `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}`;
  if (!validV12Price(price, { productId: product.product_id, option, amountMinor: offer.amount_minor, live, revision: expectedRevision, artifactSha256: subject.artifactSha256, bindingKey })) return redirect(request, "catalog-v12-price-governance-failed", input.productId);

  const customer = await requireCustomer(userId, tenantId, V12_SOURCE);
  const metadata = { commerceSource: V12_SOURCE, checkoutAttemptId: reservation.attemptId, productId: product.product_id, purchaseOption: option, catalogRevision: expectedRevision, artifactSha256: subject.artifactSha256, bindingKey, clerkUserId: userId, tenantId };
  const success = new URL(`/ai-marketplace/${encodeURIComponent(product.slug)}`, request.url);
  success.searchParams.set("purchase", "pending-fulfillment");
  const session = await stripe.checkout.sessions.create({
    mode: offer.kind === "recurring" ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customer.stripeCustomerId,
    client_reference_id: userId,
    metadata,
    ...(offer.kind === "recurring" ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
    success_url: success.toString(),
    cancel_url: new URL(`/ai-marketplace/${encodeURIComponent(product.slug)}?checkout=cancelled`, request.url).toString(),
    expires_at: reservation.expiresAt,
    billing_address_collection: "required",
    consent_collection: { terms_of_service: "required" },
  }, { idempotencyKey: `ai-marketplace-v12-checkout-${reservation.attemptId}` });
  if (!session.url || session.livemode !== live || sid(session.customer) !== customer.stripeCustomerId || session.metadata?.checkoutAttemptId !== reservation.attemptId) throw new Error("Marketplace checkout creation mismatch");
  await recordMarketplaceV12Checkout({ attemptId: reservation.attemptId, customerId: customer.stripeCustomerId, sessionId: session.id, subscriptionId: sid(session.subscription), paymentIntentId: sid(session.payment_intent) });
  return NextResponse.redirect(session.url, 303);
}

async function legacyCheckout(request: Request, input: { productId: string; interval: string }) {
  const interval = input.interval as AiMarketplaceBillingInterval;
  const product = findAiMarketplaceProduct(input.productId);
  if (!validAiMarketplaceProduct(product) || !requiredBillingIntervals(product).includes(interval)) return redirect(request, "invalid-product", input.productId);
  const { userId, orgId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("redirect_url", new URL(`/ai-marketplace?product=${encodeURIComponent(input.productId)}`, request.url).toString());
    return NextResponse.redirect(signIn, 303);
  }
  const priceId = boundAiMarketplacePrice(product, interval);
  const amount = aiMarketplaceAmountCents(product, interval);
  const live = applicationsCommerceLivemode();
  if (!priceId || !amount || !aiMarketplaceBindingCoverage().complete || !applicationsCommerceConfigured() || live === null) return redirect(request, "configuration-required", input.productId);
  const tenantId = aiMarketplaceTenantId(userId, orgId);
  const reservation = await reserveAiMarketplaceCheckout({ subjectId: userId, tenantId, productId: input.productId, interval });
  const stripe = getApplicationsStripe();
  if (reservation.stripeSessionId) {
    const existing = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId);
    if (existing.metadata?.checkoutAttemptId === reservation.attemptId && existing.metadata?.productId === input.productId && existing.url) return NextResponse.redirect(existing.url, 303);
    throw new Error("Marketplace checkout replay mismatch");
  }
  const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
  if (!validLegacyPrice(price, input.productId, interval, amount, live)) return redirect(request, "price-governance-failed", input.productId);
  const customer = await requireCustomer(userId, tenantId, LEGACY_SOURCE);
  const success = new URL("/ai-marketplace", request.url);
  success.searchParams.set("purchase", "pending-fulfillment");
  success.searchParams.set("product", input.productId);
  const metadata = { commerceSource: LEGACY_SOURCE, checkoutAttemptId: reservation.attemptId, productId: input.productId, billingInterval: interval, clerkUserId: userId, tenantId, catalogVersion: product.version };
  const session = await stripe.checkout.sessions.create({ mode: interval === "one-time" ? "payment" : "subscription", line_items: [{ price: priceId, quantity: 1 }], customer: customer.stripeCustomerId, client_reference_id: userId, metadata, subscription_data: interval === "one-time" ? undefined : { metadata }, success_url: success.toString(), cancel_url: new URL(`/ai-marketplace?checkout=cancelled&product=${encodeURIComponent(input.productId)}`, request.url).toString(), billing_address_collection: "required", consent_collection: { terms_of_service: "required" } }, { idempotencyKey: `ai-marketplace-checkout-v1-${reservation.attemptId}` });
  if (!session.url || sid(session.customer) !== customer.stripeCustomerId) throw new Error("Stripe checkout identity mismatch");
  await recordAiMarketplaceCheckout(reservation.attemptId, customer.stripeCustomerId, session.id);
  return NextResponse.redirect(session.url, 303);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirect(request, "same-origin-required");
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/x-www-form-urlencoded")) return redirect(request, "unsupported-request");
  const form = await request.formData();
  const productId = String(form.get("product") ?? "");
  const v12Product = marketplaceV12Product(productId);
  try {
    if (v12Product) return await v12Checkout(request, { productId, option: String(form.get("purchaseOption") ?? "") });
    await ensureApplicationsRuntimeSecrets();
    return await legacyCheckout(request, { productId, interval: String(form.get("interval") ?? "") });
  } catch (error) {
    console.error("AI marketplace checkout unavailable", { name: error instanceof Error ? error.name : "unknown", productId, generation: v12Product ? "v12" : "legacy" });
    return redirect(request, v12Product ? "catalog-v12-unavailable" : "unavailable", productId);
  }
}

export async function GET(request: Request) { return redirect(request, "post-required"); }
