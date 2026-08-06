import "server-only";

import type Stripe from "stripe";
import { getStripe } from "./stripe";
import type { SubscriptionStatus, TenantSubscription } from "./saas-control-plane";
import {
  billingEventWasProcessed,
  readSubscriptionByStripeId,
  recordBillingEvent,
  upsertSubscription,
} from "./saas-subscription-store";

const supportedEventTypes = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.paid",
]);

function isoFromUnix(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "paused":
      return "suspended";
    case "incomplete":
    default:
      return "suspended";
  }
}

function subscriptionMetadata(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId?.trim();
  const tenantId = subscription.metadata.tenantId?.trim();
  const planId = subscription.metadata.planId?.trim();
  if (!organizationId || !tenantId || !planId) {
    throw new Error("Stripe subscription metadata must include organizationId, tenantId, and planId");
  }
  return { organizationId, tenantId, planId };
}

function seatsForSubscription(subscription: Stripe.Subscription) {
  return subscription.items.data.reduce((total, item) => total + (item.quantity ?? 0), 0);
}

async function subscriptionFromInvoice(invoice: Stripe.Invoice) {
  const subscriptionReference = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof subscriptionReference === "string"
    ? subscriptionReference
    : subscriptionReference?.id;
  if (!subscriptionId) return null;
  return getStripe().subscriptions.retrieve(subscriptionId);
}

async function resolveStripeSubscription(event: Stripe.Event) {
  if (event.type.startsWith("customer.subscription.")) {
    return event.data.object as Stripe.Subscription;
  }
  if (event.type === "invoice.payment_failed" || event.type === "invoice.paid") {
    return subscriptionFromInvoice(event.data.object as Stripe.Invoice);
  }
  return null;
}

function gracePeriodEnd(now = new Date()) {
  const days = Number(process.env.OBSERRA_SAAS_GRACE_PERIOD_DAYS ?? "7");
  const boundedDays = Number.isFinite(days) ? Math.max(1, Math.min(days, 30)) : 7;
  return new Date(now.getTime() + boundedDays * 86_400_000).toISOString();
}

function reconcileStatus(event: Stripe.Event, subscription: Stripe.Subscription): SubscriptionStatus {
  if (event.type === "invoice.payment_failed") return "grace_period";
  if (event.type === "invoice.paid" && subscription.status === "active") return "active";
  if (event.type === "customer.subscription.deleted") return "canceled";
  return mapStripeStatus(subscription.status);
}

export async function reconcileStripeBillingEvent(event: Stripe.Event) {
  const receivedAt = new Date().toISOString();

  if (!supportedEventTypes.has(event.type)) {
    return { applied: false, duplicate: false, reason: "unsupported-event" as const };
  }

  if (await billingEventWasProcessed(event.id)) {
    return { applied: false, duplicate: true, reason: "already-processed" as const };
  }

  const stripeSubscription = await resolveStripeSubscription(event);
  if (!stripeSubscription) {
    await recordBillingEvent({
      eventId: event.id,
      eventType: event.type,
      tenantId: null,
      organizationId: null,
      receivedAt,
      processedAt: new Date().toISOString(),
      outcome: "ignored",
    });
    return { applied: false, duplicate: false, reason: "subscription-unavailable" as const };
  }

  const metadata = subscriptionMetadata(stripeSubscription);
  const previous = await readSubscriptionByStripeId(stripeSubscription.id);
  if (previous && previous.organizationId !== metadata.organizationId) {
    throw new Error("Stripe subscription organization metadata does not match the persisted tenant");
  }

  const status = reconcileStatus(event, stripeSubscription);
  const record: TenantSubscription = {
    tenantId: metadata.tenantId,
    organizationId: metadata.organizationId,
    stripeCustomerId:
      typeof stripeSubscription.customer === "string"
        ? stripeSubscription.customer
        : stripeSubscription.customer.id,
    stripeSubscriptionId: stripeSubscription.id,
    planId: metadata.planId,
    status,
    seatsUsed: seatsForSubscription(stripeSubscription),
    currentPeriodEnd: isoFromUnix(stripeSubscription.items.data[0]?.current_period_end),
    gracePeriodEnd: status === "grace_period" ? gracePeriodEnd() : null,
    updatedAt: new Date().toISOString(),
  };

  await upsertSubscription(record, event.id);
  await recordBillingEvent({
    eventId: event.id,
    eventType: event.type,
    tenantId: record.tenantId,
    organizationId: record.organizationId,
    receivedAt,
    processedAt: new Date().toISOString(),
    outcome: "applied",
  });

  return {
    applied: true,
    duplicate: false,
    reason: "subscription-updated" as const,
    organizationId: record.organizationId,
    tenantId: record.tenantId,
    status: record.status,
  };
}
