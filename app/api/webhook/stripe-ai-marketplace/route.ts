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
const REVISION = /^[a-f0-9]{64}$/;
const PRODUCT = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/;
const SUBJECT = /^user_[A-Za-z0-9_-]{8,}$/;
const TENANT = /^(?:org_[A-Za-z0-9_-]{8,}|subject:user_[A-Za-z0-9_-]{8,})$/;
const PURCHASE_OPTIONS = new Set<MarketplaceV12PurchaseOption>(["recurring:month", "recurring:year", "one_time:once", "team_license:once", "activation:once"]);
const INVOICE = /^in_[A-Za-z0-9]+$/;

type LifecycleMetadata = Readonly<{
  productId: string;
  option: MarketplaceV12PurchaseOption;
  revision: string;
  artifactSha256: string;
  attemptId: string;
  subjectId: string;
  tenantId: string;
}>;

type LifecycleReference = Readonly<{ paymentIntentId?: string; subscriptionId?: string }>;

function validV12Price(price: Stripe.Price, productId: string, option: MarketplaceV12PurchaseOption, amount: number, live: boolean, revision: string, artifactSha256: string, bindingKey: string) {
  const product = typeof price.product === "string" ? null : price.product;
  return price.active && price.livemode === live && price.currency === "usd" && price.unit_amount === amount
    && (option === "recurring:month" ? price.type === "recurring" && price.recurring?.interval === "month" && price.recurring.interval_count === 1 : option === "recurring:year" ? price.type === "recurring" && price.recurring?.interval === "year" && price.recurring.interval_count === 1 : price.type === "one_time")
    && !!product && !product.deleted && product.active && product.metadata.obserraMarketplaceProduct === productId && product.metadata.catalogRevision === revision && product.metadata.artifactSha256 === artifactSha256 && product.metadata.commerceSource === V12_SOURCE && price.metadata.bindingKey === bindingKey;
}

/** Lifecycle events can arrive long after the catalog advances. Validate their immutable Stripe metadata without requiring today's catalog revision. */
function v12LifecycleMetadata(metadata: Stripe.Metadata | null | undefined): LifecycleMetadata | null {
  const value = metadata ?? {};
  const option = value.purchaseOption as MarketplaceV12PurchaseOption;
  if (value.commerceSource !== V12_SOURCE
    || !PRODUCT.test(value.productId ?? "")
    || !PURCHASE_OPTIONS.has(option)
    || !REVISION.test(value.catalogRevision ?? "")
    || !REVISION.test(value.artifactSha256 ?? "")
    || !ATTEMPT.test(value.checkoutAttemptId ?? "")
    || !SUBJECT.test(value.clerkUserId ?? "")
    || !TENANT.test(value.tenantId ?? "")) return null;
  return {
    productId: value.productId,
    option,
    revision: value.catalogRevision,
    artifactSha256: value.artifactSha256,
    attemptId: value.checkoutAttemptId,
    subjectId: value.clerkUserId,
    tenantId: value.tenantId,
  };
}

/** Initial fulfillment remains pinned to the currently verified catalog and price authority. */
function v12Metadata(metadata: Stripe.Metadata | null | undefined) {
  const lifecycle = v12LifecycleMetadata(metadata);
  if (!lifecycle) return null;
  const product = marketplaceV12Product(lifecycle.productId);
  const subject = product && marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  const revision = marketplaceV12Summary().revision;
  if (!product || !subject || lifecycle.revision !== revision || lifecycle.artifactSha256 !== subject.artifactSha256) return null;
  return {
    product,
    option: lifecycle.option,
    subject,
    revision,
    attemptId: lifecycle.attemptId,
    subjectId: lifecycle.subjectId,
    tenantId: lifecycle.tenantId,
  };
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  const parent = invoice.parent as null | undefined | {
    type?: string;
    subscription_details?: null | { subscription?: string | { id: string } | null };
  };
  const current = parent?.type === "subscription_details" ? sid(parent.subscription_details?.subscription) : undefined;
  if (current) return current;
  return sid((invoice as unknown as { subscription?: string | { id: string } | null }).subscription);
}

async function lifecycleReferenceFromPaymentIntent(paymentIntentId: string, live: boolean): Promise<LifecycleReference | null> {
  const stripe = getApplicationsStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.livemode !== live) return null;
  if (v12LifecycleMetadata(paymentIntent.metadata)) return { paymentIntentId };

  const invoicePayments = await stripe.invoicePayments.list({
    payment: { type: "payment_intent", payment_intent: paymentIntentId },
    limit: 2,
  });
  if (invoicePayments.has_more || invoicePayments.data.length !== 1) return null;
  const invoiceId = sid(invoicePayments.data[0]?.invoice);
  if (!invoiceId || !INVOICE.test(invoiceId)) return null;
  const invoice = await stripe.invoices.retrieve(invoiceId);
  if (invoice.livemode !== live) return null;
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return null;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.livemode !== live || !v12LifecycleMetadata(subscription.metadata)) return null;
  return { subscriptionId };
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
  if (subscription.livemode !== event.livemode || !v12LifecycleMetadata(subscription.metadata)) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, subscriptionId: subscription.id });
  return true;
}

async function lifecycleFromInvoice(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (invoice.livemode !== event.livemode || !subscriptionId) return false;
  const subscription = await getApplicationsStripe().subscriptions.retrieve(subscriptionId);
  if (subscription.livemode !== event.livemode || !v12LifecycleMetadata(subscription.metadata)) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, subscriptionId });
  return true;
}

async function lifecycleFromPaymentIntent(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  if (paymentIntent.livemode !== event.livemode) return false;
  const reference = await lifecycleReferenceFromPaymentIntent(paymentIntent.id, live);
  if (!reference) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, ...reference });
  return true;
}

async function lifecycleFromCharge(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId = sid(charge.payment_intent);
  if (charge.livemode !== event.livemode || !paymentIntentId) return false;
  const reference = await lifecycleReferenceFromPaymentIntent(paymentIntentId, live);
  if (!reference) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, ...reference });
  return true;
}

async function lifecycleFromDispute(event: Stripe.Event, lifecycle: MarketplaceV12Lifecycle, raw: string, live: boolean) {
  const dispute = event.data.object as Stripe.Dispute;
  const chargeId = sid(dispute.charge);
  if (dispute.livemode !== event.livemode || !chargeId) return false;
  const charge = await getApplicationsStripe().charges.retrieve(chargeId);
  const paymentIntentId = sid(charge.payment_intent);
  if (charge.livemode !== live || !paymentIntentId) return false;
  const reference = await lifecycleReferenceFromPaymentIntent(paymentIntentId, live);
  if (!reference) return false;
  await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle, ...reference });
  return true;
}

async function processV12Lifecycle(event: Stripe.Event, raw: string, live: boolean) {
  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.livemode !== event.livemode || !v12LifecycleMetadata(session.metadata)) return false;
    await recordMarketplaceV12Lifecycle({ eventId: event.id, eventType: event.type, payloadSha256: createHash("sha256").update(raw).digest("hex"), live, lifecycle: "checkout_failed", sessionId: session.id });
    return true;
  }
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.livemode !== event.livemode || !v12LifecycleMetadata(session.metadata)) return false;
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
