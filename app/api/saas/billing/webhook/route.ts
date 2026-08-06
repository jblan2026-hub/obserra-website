import { NextResponse } from "next/server";
import { reconcileStripeBillingEvent } from "../../../../../lib/saas-billing-reconciliation";
import { getStripe } from "../../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SAAS_WEBHOOK_SECRET?.trim();
  if (!secret) return response({ error: "webhook-not-configured" }, 503);

  const signature = request.headers.get("stripe-signature");
  if (!signature) return response({ error: "missing-signature" }, 400);

  const rawBody = await request.text();

  try {
    const event = await getStripe().webhooks.constructEventAsync(rawBody, signature, secret);
    const result = await reconcileStripeBillingEvent(event);
    return response({ received: true, ...result });
  } catch (error) {
    console.error("SaaS billing webhook rejected", {
      error: error instanceof Error ? error.message : String(error),
    });
    return response({ error: "invalid-or-unprocessed-event" }, 400);
  }
}
