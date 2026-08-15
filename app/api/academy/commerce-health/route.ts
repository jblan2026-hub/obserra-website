import { NextResponse } from "next/server";
import {
  academyPersistenceConfigured,
  academyPurchaserHashConfigured,
  academyStorageHealth,
} from "../../../../lib/academy-persistence";
import { safeIdentity } from "../../../../lib/identity-runtime";
import { getAcademyStripe } from "../../../../lib/academy-stripe";
import { academyStripeWebhookSecret } from "../../../../lib/academy-payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLAIM_POLICY = "purchaser-email-match-v1";
const CONTRACT_VERSION = "academy-commerce-health-v1";

export async function GET() {
  const identity = await safeIdentity();
  const stripeKey = process.env.ACADEMY_STRIPE_SECRET_KEY?.trim() ?? "";
  const stripeEnvironment = stripeKey.startsWith("rk_live_")
    ? "live"
    : stripeKey.startsWith("rk_test_")
      ? "test"
      : "unavailable";
  const productionModeAccepted = process.env.VERCEL_ENV === "production"
    ? stripeEnvironment === "live"
    : stripeEnvironment !== "unavailable";
  const webhookConfigured = academyStripeWebhookSecret() !== null;
  const purchaserHashConfigured = academyPurchaserHashConfigured();
  let providerConnected = false;
  let chargesEnabled = false;
  if (productionModeAccepted) {
    try {
      const account = await getAcademyStripe().accounts.retrieve(null);
      providerConnected = true;
      chargesEnabled = account.charges_enabled;
    } catch (error) {
      console.error("Academy Stripe health verification failed", {
        error: error instanceof Error ? error.name : "unknown",
      });
    }
  }

  let storageOperational = false;
  let storageSchema: string | null = null;
  if (academyPersistenceConfigured()) {
    try {
      const storage = await academyStorageHealth();
      storageOperational = storage.operational;
      storageSchema = storage.schemaVersion;
    } catch (error) {
      console.error("Academy durable storage health verification failed", {
        error: error instanceof Error ? error.name : "unknown",
      });
    }
  }

  const paymentOperational = productionModeAccepted && providerConnected && chargesEnabled && webhookConfigured;
  const operational = paymentOperational && storageOperational && purchaserHashConfigured && identity.configured;

  return NextResponse.json(
    {
      contract: CONTRACT_VERSION,
      operational,
      paymentProvider: paymentOperational ? "stripe" : "unavailable",
      providerVerification: {
        environment: stripeEnvironment,
        connected: providerConnected,
        chargesEnabled,
      },
      webhookVerification: webhookConfigured ? "required" : "unavailable",
      requiredWebhookEvents: [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "charge.refunded",
        "charge.dispute.created",
        "charge.dispute.closed",
      ],
      checkoutModes: ["authenticated", "guest-email"],
      claimPolicy: CLAIM_POLICY,
      identity: identity.configured ? "available" : "degraded",
      identityEnvironment: identity.environment,
      durableStorage: storageOperational ? "available" : "unavailable",
      storageSchema,
      purchaserIdentityHashing: purchaserHashConfigured ? "available" : "unavailable",
      fulfillment: {
        authenticated: "immediate-entitlement",
        guest: "paid-pending-account-claim",
        idempotencyKey: "stripe-event-id",
        auditLedger: "durable-supabase",
        reversalPolicy: "full-refund-refunded-partial-or-dispute-revoked-no-automatic-restoration",
      },
    },
    {
      status: operational ? 200 : 503,
      headers: {
        "cache-control": "no-store",
        "x-obserra-commerce-contract": CONTRACT_VERSION,
        "x-obserra-claim-policy": CLAIM_POLICY,
      },
    },
  );
}
