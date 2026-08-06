import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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
  const identity = await auth();
  if (!identity.userId) return noStoreJson({ error: "authentication-required" }, 401);
  if (!identity.orgId) return noStoreJson({ error: "organization-required" }, 403);

  const subscription = await subscriptionForOrganization(identity.orgId);
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
      organizationId: identity.orgId,
      error: error instanceof Error ? error.message : String(error),
    });
    return noStoreJson({ error: "billing-portal-unavailable" }, 503);
  }
}
