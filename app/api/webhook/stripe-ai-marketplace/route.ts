import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { aiMarketplaceAmountCents, findAiMarketplaceProduct, validAiMarketplaceProduct } from "../../../../lib/ai-marketplace-catalog";
import { boundAiMarketplacePrice, requiredBillingIntervals, type AiMarketplaceBillingInterval } from "../../../../lib/ai-marketplace-payment-bindings";
import { recordAiMarketplacePayment, recordMarketplaceV12Lifecycle, recordMarketplaceV12PaidCheckout, type MarketplaceV12Lifecycle } from "../../../../lib/ai-marketplace-commerce";
import { applicationsCommerceLivemode, applicationsStripeWebhookSecret, getApplicationsStripe } from "../../../../lib/applications-stripe";
import { boundMarketplaceV12Price, marketplaceV12BindingCoverage, marketplaceV12Offer, type MarketplaceV12PurchaseOption } from "../../../../lib/marketplace-v12-bindings";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "../../../../lib/marketplace-v12-catalog";
import { ensureApplicationsRuntimeSecrets, ensureMarketplaceV12RuntimeSecrets } from "../../../../lib/production-runtime-secrets";
import { readStripeWebhookBody } from "../../../../lib/stripe-webhook-body";

export const runtime = "nodejs";
export const maxDuration = 60;

const LEGACY_SOURCE = "obserra-ai-marketplace-v1";
const V12_SOURCE = "obserra-ai-marketplace-v12";
const sid = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id;
const ATTEMPT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validV12Price(price: Stripe.Price, productId: string, option: MarketplaceV12PurchaseOption, amount: number, live: boolean, revision: string, artifactSha256: string, bindingKey: string) {
  const product = typeof price.product === "string" ? null : price.product;
  return price.active && price.livemode === live && price.currency === "usd" && price.unit_amount === amount
    && (option === "recurring:month" ? price.type === "recurring" && price.recurring?.interval === "month" && price.recurring.interval_count === 1 : option === "recurring:year" ? price.type === "recurring" && price.recurring?.interval === "year" && price.recurring.interval_count === 1 : price.type === "one_time")
    && !!product && !product.deleted && product.active && product.metadata.obserraMarketplaceProduct === productId && product.metadata.catalogRevision === revision && product.metadata.artifactSha256 === artifactSha256 && product.metadata.commerceSource === V12_SOURCE && price.metadata.bindingKey === bindingKey;
}

function v12Metadata(metadata: Stripe.Metadata | null | undefined) {
  const value = metadata ?? {};
  const product = marketplaceV12Product(value.productId ?? "");
  const option = value.purchaseOption as MarketplaceV12PurchaseOption;
  const subject = product && marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  const revision = marketplaceV12Summary().revision;
  if (!product || !subject || value.commerceSource !== V12_SOURCE || value.catalogRevision !== revision || value.artifactSha256 !== subject.artifactSha256 || !ATTEMPT.test(value.checkoutAttemptId ?? "") || !value.clerkUserId || !value.tenantId) return null;
  return { product, option, subject, revision, attemptId: value.checkoutAttemptId, subjectId: value.clerkUserId, tenantId: value.tenantId };
}

async function fulfillV12(event: Stripe.Event, session: Stripe.Checkout.Session, raw: string, live: boolean) {
  const metadata = v12Metadata(session.metadata);
  const offer = metadata && marketplaceV12Offer(metadata.product, metadata.option);
  const [coverage, priceId] = metadata ? await Promise.all([marketplaceV12BindingCoverage(), boundMarketplaceV12Price(metadata.product, metadata.option)]) : [null, null];
  const customer = sid(session.customer);
  if (session.livemode !== event.livemode || session.status !== "complete" || session.payment_status !== "paid" || !metadata || !offer || !priceId || !customer || !coverage?.structurallyComplete || !coverage.stripeVerified || session.client_reference_id !== metadata.subjectId) throw new Error("v12 binding evidence unavailable");
  const lines = await getApplicationsStripe().checkout.sessions.listLineItems(session.id, { limit: 2, expand: ["data.price.product"] });
  const price = lines.data[0]?.price;
  const bindingKey = `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}`;
  if (!lines.has_more && lines.data.length === 1 && price && price.livemode === live && price.id === priceId && validV12Price(price, metadata.product.product_id, metadata.option, offer.amount_minor, live, metadata.revision, metadata.subject.artifactSha256, bindingKey)) {
    await recordMarketplaceV12PaidCheckout({
      eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live: event.livemode,
      attemptId: metadata.attemptId, sessionId: session.id, customerId: customer, subjectId: metadata.subjectId, tenantId: metadata.tenantId,
      productId: metadata.product.product_id, option: metadata.option, priceId: price.id, revision: metadata.revision,
      artifactSha256: metadata.subject.artifactSha256, subscriptionId: sid(session.subscription), paymentIntentId: sid(session.payment_intent),
    });
    return;
  }
  throw new Error("v12 price governance failed");
}

async function lifecycleFromSubscription(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const subscription = event.data.object as Stripe.Subscription;
  if (subscription.livemode !== event.livemode || !v12Metadata(subscription.metadata)) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, subscriptionId: subscription.id });
  return true;
}

async function lifecycleFromInvoice(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = sid((invoice as unknown as { subscription?: string | { id: string } | null }).subscription);
  if (invoice.livemode !== event.livemode || !subscriptionId) return false;
  const subscription = await getApplicationsStripe().subscriptions.retrieve(subscriptionId);
  if (subscription.livemode !== event.livemode || !v12Metadata(subscription.metadata)) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, subscriptionId });
  return true;
}

async function lifecycleFromPaymentIntent(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  if (paymentIntent.livemode !== event.livemode || !v12Metadata(paymentIntent.metadata)) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, paymentIntentId: paymentIntent.id });
  return true;
}

async function lifecycleFromCharge(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId = sid(charge.payment_intent);
  if (charge.livemode !== event.livemode || !paymentIntentId) return false;
  const paymentIntent = await getApplicationsStripe().paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.livemode !== event.livemode || !v12Metadata(paymentIntent.metadata)) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, paymentIntentId });
  return true;
}

async function lifecycleFromDispute(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const dispute = event.data.object as Stripe.Dispute;
  const chargeId = sid(dispute.charge);
  if (dispute.livemode !== event.livemode || !chargeId) return false;
  const charge = await getApplicationsStripe().charges.retrieve(chargeId);
  const paymentIntentId = sid(charge.payment_intent);
  if (!paymentIntentId) return false;
  const paymentIntent = await getApplicationsStripe().paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.livemode !== event.livemode || !v12Metadata(paymentIntent.metadata)) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, paymentIntentId });
  return true;
}

async function processV12Lifecycle(event: Stripe.Event, raw: string, live: boolean) {
  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.livemode !== event.livemode || !v12Metadata(session.metadata)) return false;
    await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle: "checkout_failed", sessionId: session.id });
    return true;
  }
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.livemode !== event.livemode || !v12Metadata(session.metadata)) return false;
    await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle: "checkout_expired", sessionId: session.id });
    return true;
  }
  if (event.type === "customer.subscription.deleted") return lifecycleFromSubscription(event, "subscription_cancelled", raw, live);
  if (event.type === "invoice.payment_failed") return lifecycleFromInvoice(event, "payment_failed", raw, live);
  if (event.type === "invoice.paid") return lifecycleFromInvoice(event, "payment_recovered", raw, live);
  if (event.type === "payment_intent.payment_failed") return lifecycleFromPaymentIntent(event, "payment_failed", raw, live);
  if (event.type === "charge.refunded") return lifecycleFromCharge(event, "refund", raw, live);
  if (event.type === "charge.dispute.created") return lifecycleFromDispute(event, "dispute", raw, live);
  if (event.type === "charge.dispute.closed") {
    const dispute = event.data.object as Stripe.Dispute;
    return lifecycleFromDispute(event, dispute.status === "lost" ? "chargeback" : "dispute", raw, live);
  }
  return false;
}

async function fulfillLegacy(event: Stripe.Event, session: Stripe.Checkout.Session, raw: string, live: boolean) {
  const metadata = session.metadata ?? {};
  const product = findAiMarketplaceProduct(metadata.productId ?? "");
  const interval = metadata.billingInterval as AiMarketplaceBillingInterval;
  const customer = sid(session.customer);
  if (session.livemode !== event.livemode || session.payment_status !== "paid" || metadata.commerceSource !== LEGACY_SOURCE || !validAiMarketplaceProduct(product) || !requiredBillingIntervals(product).includes(interval) || !customer) throw new Error("invalid legacy metadata");
  const lines = await getApplicationsStripe().checkout.sessions.listLineItems(session.id, { limit: 2, expand: ["data.price.product"] });
  const price = lines.data[0]?.price;
  const stripeProduct = typeof price?.product === "string" ? null : price?.product;
  if (lines.has_more || lines.data.length !== 1 || !price || price.livemode !== live || price.id !== boundAiMarketplacePrice(product, interval) || price.unit_amount !== aiMarketplaceAmountCents(product, interval) || !stripeProduct || stripeProduct.deleted || !stripeProduct.active || stripeProduct.metadata.obserraMarketplaceProduct !== product.product_id || stripeProduct.metadata.billingInterval !== interval || stripeProduct.metadata.commerceSource !== LEGACY_SOURCE) throw new Error("legacy price governance failed");
  await recordAiMarketplacePayment({ eventId: event.id, eventType: event.type, payload: createHash("sha256").update(raw).digest("hex"), live: event.livemode, session: session.id, customer, subject: metadata.clerkUserId ?? "", tenant: metadata.tenantId ?? "", product: product.product_id, interval, price: price.id });
}

export async function POST(request: Request) {
  try {
    // The v1.2 Stripe credentials are shared with legacy commerce but are
    // intentionally hydrated from the v1.2 scope before payload verification.
    await ensureMarketplaceV12RuntimeSecrets();
    const secret = applicationsStripeWebhookSecret();
    const signature = request.headers.get("stripe-signature");
    if (!secret || !signature) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    const raw = await readStripeWebhookBody(request);
    const event = getApplicationsStripe().webhooks.constructEvent(raw, signature, secret);
    const live = applicationsCommerceLivemode();
    if (live === null || event.livemode !== live) return NextResponse.json({ error: "Webhook mode mismatch" }, { status: 409 });
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.commerceSource === V12_SOURCE) {
        await ensureMarketplaceV12RuntimeSecrets();
        await fulfillV12(event, session, raw, live);
        return NextResponse.json({ received: true });
      }
      await ensureApplicationsRuntimeSecrets();
      await fulfillLegacy(event, session, raw, live);
      return NextResponse.json({ received: true });
    }
    const lifecycleRecorded = await processV12Lifecycle(event, raw, live);
    return NextResponse.json({ received: true, ignored: !lifecycleRecorded });
  } catch {
    return NextResponse.json({ error: "Webhook payload rejected" }, { status: 400 });
  }
}
