import { NextResponse } from "next/server";
import { safeIdentity } from "../../../../lib/identity-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLAIM_POLICY = "purchaser-email-match-v1";
const CONTRACT_VERSION = "academy-commerce-health-v1";

export async function GET() {
  const identity = await safeIdentity();
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const webhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
  const operational = stripeConfigured && webhookConfigured;

  return NextResponse.json(
    {
      contract: CONTRACT_VERSION,
      operational,
      paymentProvider: stripeConfigured ? "stripe" : "unavailable",
      webhookVerification: webhookConfigured ? "required" : "unavailable",
      checkoutModes: ["authenticated", "guest-email"],
      claimPolicy: CLAIM_POLICY,
      identity: identity.configured ? "available" : "degraded",
      fulfillment: {
        authenticated: "immediate-entitlement",
        guest: "paid-pending-account-claim",
        idempotencyKey: "stripe-checkout-session-id",
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
