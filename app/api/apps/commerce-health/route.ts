import { NextResponse } from "next/server";
import { applicationsCommerceHealth } from "../../../../lib/applications-commerce";
import { applicationsCommerceConfigured, applicationsCommerceLivemode, getApplicationsStripe } from "../../../../lib/applications-stripe";
import { prepareClerkRuntime } from "../../../../lib/clerk-runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
] as const;

export async function GET() {
  try {
    const storage = await applicationsCommerceHealth();
    const providerConfigured = applicationsCommerceConfigured();
    const identity = prepareClerkRuntime();
    let providerConnected = false;
    let chargesEnabled = false;
    if (providerConfigured) {
      try {
        const account = await getApplicationsStripe().accounts.retrieve(null);
        providerConnected = true;
        chargesEnabled = account.charges_enabled;
      } catch (error) {
        console.error("Applications Stripe health verification failed", {
          error: error instanceof Error ? error.name : "unknown",
        });
      }
    }
    const operational = storage.operational && providerConfigured && providerConnected && chargesEnabled && identity.ready;
    const response = NextResponse.json({
      contract: "applications-commerce-health-v1",
      operational,
      schemaVersion: storage.schemaVersion,
      eventLedger: storage.eventLedger,
      entitlementAuthority: storage.entitlementAuthority,
      stripeConfigured: providerConfigured,
      stripeLivemode: applicationsCommerceLivemode(),
      providerConnected,
      chargesEnabled,
      identityReady: identity.ready,
      requiredWebhookEvents: REQUIRED_WEBHOOK_EVENTS,
    }, { status: operational ? 200 : 503 });
    response.headers.set("cache-control", "no-store");
    return response;
  } catch {
    return NextResponse.json({
      contract: "applications-commerce-health-v1",
      operational: false,
      schemaVersion: "applications-commerce-v1",
      eventLedger: "unavailable",
      entitlementAuthority: "unavailable",
      stripeConfigured: false,
      stripeLivemode: false,
      providerConnected: false,
      chargesEnabled: false,
      identityReady: false,
      requiredWebhookEvents: REQUIRED_WEBHOOK_EVENTS,
      error: "durable-commerce-unavailable",
    }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
