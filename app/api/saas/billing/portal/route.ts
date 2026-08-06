import { NextResponse } from "next/server";
import { requireStepUp } from "../../../../../lib/require-step-up";
import { subscriptionForOrganization } from "../../../../../lib/saas-control-plane";
import { getStripe } from "../../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function POST(request: Request) {
  const stepUp = await requireStepUp("strict");
  if (!stepUp.allowed) return stepUp.response;
  if (!stepUp.organizationId) return noStoreJson({ error: "organization-required" }, 403);

  const subscription = await subscriptionForOrganization(stepUp.organizationId);
  if (!subscription?.stripeCustomerId) {
    return noStoreJson({ error: "billing-account-unavailable" }, 404);
  }

  const requestUrl = new URL(request.url);
  const returnUrl = new URL("/apps", requestUrl.origin);
  returnUrl.searchParams.set("billing", "returned");

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl.toString(),
    });

    return NextResponse.json(
      { url: session.url },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  } catch (error) {
    console.error("SaaS billing portal creation failed", {
      organizationId: stepUp.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return noStoreJson({ error: "billing-portal-unavailable" }, 503);
  }
}
