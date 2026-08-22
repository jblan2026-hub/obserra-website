import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  applyDurableApplicationReversal,
  applyDurableApplicationSubscription,
  type ApplicationsSubscriptionSnapshot,
} from "../../../../lib/applications-commerce";
import {
  applicationsCommerceLivemode,
  applicationsStripeWebhookSecret,
  getApplicationsStripe,
} from "../../../../lib/applications-stripe";
import { readStripeWebhookBody, StripeWebhookBodyError } from "../../../../lib/stripe-webhook-body";

export const runtime = "nodejs";

const COMMERCE_SOURCE = "obserra-website-application-commerce";
const SUBJECT_ID = /^user_[A-Za-z0-9_-]{8,}$/;
const TENANT_ID = /^(?:org_[A-Za-z0-9_-]{8,}|subject:user_[A-Za-z0-9_-]{8,})$/;
const APP_SLUG = /^obserra-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ATTEMPT_ID = /^[0-9a-f-]{36}$/;
const ACCEPTED_STATUSES = new Set(["active", "trialing", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused"]);

class ApplicationsWebhookVerificationError extends Error {
  constructor(readonly reason: string) {
    super(reason);
    this.name = "ApplicationsWebhookVerificationError";
  }
}

function fail(reason: string): never {
  throw new ApplicationsWebhookVerificationError(reason);
}

function objectId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id;
}

function accessStatus(status: string) {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid" || status === "paused") return "suspended";
  if (status === "canceled" || status === "incomplete_expired") return "revoked";
  return "pending";
}

function requireMetadata(metadata: Stripe.Metadata) {
  const subjectId = metadata.clerkUserId ?? "";
  const tenantId = metadata.tenantId ?? "";
  const appSlug = metadata.obserraApp ?? "";
  const planId = metadata.plan ?? "";
  const billingInterval = metadata.billingInterval ?? "";
  const deploymentModel = metadata.deploymentModel ?? "";
  const checkoutAttemptId = metadata.checkoutAttemptId ?? "";
  const seatsPurchased = Number(metadata.seatsPurchased ?? "");
  if (!SUBJECT_ID.test(subjectId)) fail("subject-invalid");
  if (!TENANT_ID.test(tenantId)) fail("tenant-invalid");
  if (!APP_SLUG.test(appSlug)) fail("application-invalid");
  if (!new Set(["professional", "enterprise"]).has(planId)) fail("plan-invalid");
  if (!new Set(["monthly", "annual"]).has(billingInterval)) fail("billing-interval-invalid");
  if (!new Set(["SaaS", "Private Cloud", "Hybrid", "On-Premises"]).has(deploymentModel)) fail("deployment-model-invalid");
  if (!ATTEMPT_ID.test(checkoutAttemptId)) fail("checkout-attempt-invalid");
  if (!Number.isSafeInteger(seatsPurchased) || seatsPurchased < 1) fail("seats-purchased-invalid");
  if (metadata.commerceSource !== COMMERCE_SOURCE) fail("commerce-source-invalid");
  return { subjectId, tenantId, appSlug, planId, billingInterval, deploymentModel, seatsPurchased };
}

async function canonicalSubscriptionSnapshot(input: {
  subscriptionId: string;
  checkoutSessionId?: string;
  event: Stripe.Event;
  eventObjectId: string;
  payloadSha256: string;
  expectedLivemode: boolean;
}): Promise<ApplicationsSubscriptionSnapshot> {
  const stripe = getApplicationsStripe();
  const subscription = await stripe.subscriptions.retrieve(input.subscriptionId, {
    expand: ["items.data.price.product"],
  });
  if (subscription.livemode !== input.expectedLivemode || subscription.livemode !== input.event.livemode) fail("subscription-mode-mismatch");
  if (!ACCEPTED_STATUSES.has(subscription.status)) fail("subscription-status-unsupported");
  const metadata = requireMetadata(subscription.metadata);
  if (subscription.items.has_more || subscription.items.data.length !== 1) fail("subscription-items-ambiguous");
  const item = subscription.items.data[0];
  const price = item.price;
  const product = typeof price.product === "string" ? null : price.product;
  const expectedInterval = metadata.billingInterval === "monthly" ? "month" : "year";
  if (
    !price.active ||
    price.livemode !== input.expectedLivemode ||
    price.type !== "recurring" ||
    price.currency !== "usd" ||
    !Number.isSafeInteger(price.unit_amount) ||
    Number(price.unit_amount) <= 0 ||
    price.recurring?.interval !== expectedInterval ||
    price.recurring.interval_count !== 1 ||
    !product ||
    product.object !== "product" ||
    product.deleted ||
    !product.active ||
    product.metadata.obserraApp !== metadata.appSlug ||
    product.metadata.plan !== metadata.planId ||
    product.metadata.billingInterval !== metadata.billingInterval ||
    product.metadata.commerceSource !== COMMERCE_SOURCE
  ) fail("subscription-price-governance-failed");
  const customerId = objectId(subscription.customer);
  if (!customerId?.startsWith("cus_")) fail("subscription-customer-invalid");
  const quantity = item.quantity ?? 1;
  if (!Number.isSafeInteger(quantity) || quantity < 1) fail("subscription-quantity-invalid");
  if (Number(metadata.seatsPurchased ?? quantity) !== quantity) fail("subscription-seat-binding-invalid");
  return {
    eventId: input.event.id,
    eventType: input.event.type,
    eventObjectId: input.eventObjectId,
    payloadSha256: input.payloadSha256,
    eventCreated: input.event.created,
    livemode: input.event.livemode,
    subscriptionId: subscription.id,
    customerId,
    checkoutSessionId: input.checkoutSessionId,
    ...metadata,
    stripeStatus: subscription.status,
    accessStatus: accessStatus(subscription.status),
    currency: price.currency,
    unitAmount: Number(price.unit_amount),
    quantity,
    currentPeriodEnd: item.current_period_end,
    cancelAt: subscription.cancel_at ?? undefined,
  };
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  if (invoice.parent?.type !== "subscription_details") return undefined;
  return objectId(invoice.parent.subscription_details?.subscription);
}

async function subscriptionIdForPaymentIntent(paymentIntentId: string) {
  const stripe = getApplicationsStripe();
  const payments = await stripe.invoicePayments.list({
    payment: { type: "payment_intent", payment_intent: paymentIntentId },
    limit: 2,
  });
  if (payments.has_more || payments.data.length !== 1) fail("reversal-invoice-payment-ambiguous");
  const invoiceId = objectId(payments.data[0].invoice);
  if (!invoiceId) fail("reversal-invoice-invalid");
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) fail("reversal-subscription-unavailable");
  return subscriptionId;
}

async function recordReversal(event: Stripe.Event, payloadSha256: string, expectedLivemode: boolean) {
  let paymentIntentId: string | undefined;
  let eventObjectId: string;
  let reversalStatus: "full_refund" | "partial_refund_review" | "dispute_open" | "dispute_closed_review";
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    if (charge.livemode !== expectedLivemode || charge.livemode !== event.livemode) fail("reversal-mode-mismatch");
    paymentIntentId = objectId(charge.payment_intent);
    eventObjectId = charge.id;
    reversalStatus = charge.refunded && charge.amount_refunded === charge.amount_captured
      ? "full_refund"
      : "partial_refund_review";
  } else if (event.type === "charge.dispute.created" || event.type === "charge.dispute.closed") {
    const dispute = event.data.object as Stripe.Dispute;
    if (dispute.livemode !== expectedLivemode || dispute.livemode !== event.livemode) fail("reversal-mode-mismatch");
    paymentIntentId = objectId(dispute.payment_intent);
    eventObjectId = dispute.id;
    reversalStatus = event.type === "charge.dispute.created" ? "dispute_open" : "dispute_closed_review";
  } else {
    fail("reversal-event-unsupported");
  }
  if (!paymentIntentId) fail("reversal-payment-intent-unavailable");
  const subscriptionId = await subscriptionIdForPaymentIntent(paymentIntentId);
  return applyDurableApplicationReversal({
    eventId: event.id,
    eventType: event.type,
    eventObjectId,
    payloadSha256,
    eventCreated: event.created,
    livemode: event.livemode,
    subscriptionId,
    reversalStatus,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = applicationsStripeWebhookSecret();
  if (!signature || !webhookSecret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  let event: Stripe.Event;
  let rawBody: string;
  try {
    rawBody = await readStripeWebhookBody(request);
    event = getApplicationsStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    if (error instanceof StripeWebhookBodyError) return NextResponse.json({ error: "Webhook payload too large" }, { status: error.status });
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
  const expectedLivemode = applicationsCommerceLivemode();
  if (expectedLivemode === null) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  if (event.livemode !== expectedLivemode) return NextResponse.json({ error: "Webhook mode mismatch" }, { status: 409 });
  const payloadSha256 = createHash("sha256").update(rawBody).digest("hex");

  try {
    if (event.type === "charge.refunded" || event.type === "charge.dispute.created" || event.type === "charge.dispute.closed") {
      const result = await recordReversal(event, payloadSha256, expectedLivemode);
      return NextResponse.json({ received: true, eventId: event.id, eventType: event.type, result });
    }

    let subscriptionId: string | undefined;
    let checkoutSessionId: string | undefined;
    let eventObjectId: string | undefined;
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || session.livemode !== event.livemode) fail("checkout-session-invalid");
      subscriptionId = objectId(session.subscription);
      checkoutSessionId = session.id;
      eventObjectId = session.id;
    } else if (event.type.startsWith("customer.subscription.")) {
      const subscription = event.data.object as Stripe.Subscription;
      subscriptionId = subscription.id;
      eventObjectId = subscription.id;
    } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      subscriptionId = invoiceSubscriptionId(invoice);
      eventObjectId = invoice.id;
    }

    if (!subscriptionId || !eventObjectId) {
      return NextResponse.json({ received: true, eventId: event.id, eventType: event.type, state: "not-applicable" });
    }
    const snapshot = await canonicalSubscriptionSnapshot({
      subscriptionId,
      checkoutSessionId,
      event,
      eventObjectId,
      payloadSha256,
      expectedLivemode,
    });
    const result = await applyDurableApplicationSubscription(snapshot);
    return NextResponse.json({ received: true, eventId: event.id, eventType: event.type, result });
  } catch (error) {
    if (error instanceof ApplicationsWebhookVerificationError) {
      console.warn("Applications Stripe webhook rejected", { eventId: event.id, eventType: event.type, reason: error.reason });
      return NextResponse.json({ error: "Webhook verification failed" }, { status: 409 });
    }
    throw error;
  }
}

export async function GET() {
  return NextResponse.json({ error: "Webhook requires POST" }, { status: 405, headers: { allow: "POST" } });
}
