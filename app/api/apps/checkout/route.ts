import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findStorefrontAppBySlug } from "../../../apps/storefront";
import { availablePlansFor, stripePriceEnvironmentKey, type BillingInterval } from "../../../apps/commerce";
import { getStripe } from "../../../../lib/stripe";
import { primaryAccountEmail } from "../../../../lib/app-entitlements";

export const runtime = "nodejs";
export const maxDuration = 60;

const LEGAL_MERCHANT_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const COMMERCE_SOURCE = "obserra-website-application-commerce";

function privateRedirect(url: URL, status = 307) {
  const response = NextResponse.redirect(url, status);
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("app") ?? "";
  const planId = requestUrl.searchParams.get("plan") ?? "professional";
  const interval = (requestUrl.searchParams.get("interval") ?? "monthly") as BillingInterval;
  const deployment = requestUrl.searchParams.get("deployment") ?? "SaaS";
  const app = findStorefrontAppBySlug(slug);

  if (!app) return privateRedirect(new URL("/apps?checkout=invalid-app", requestUrl));
  if (app.status !== "Available") {
    return privateRedirect(new URL(`/apps/${app.slug}/subscribe?checkout=release-not-approved`, requestUrl));
  }

  const plan = availablePlansFor(app).find((entry) => entry.id === planId);
  if (!plan || !plan.billing.includes(interval) || !plan.deployment.includes(deployment as never) || !app.deployment.includes(deployment as never)) {
    return privateRedirect(new URL(`/apps/${app.slug}/subscribe?checkout=invalid-selection`, requestUrl));
  }

  const { userId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", requestUrl.toString());
    return privateRedirect(signIn);
  }

  const priceKey = stripePriceEnvironmentKey(app.slug, plan.id, interval);
  const priceId = process.env[priceKey];
  if (!priceId || !process.env.STRIPE_SECRET_KEY) {
    const unavailable = new URL(`/apps/${app.slug}/subscribe`, requestUrl);
    unavailable.searchParams.set("checkout", "configuration-required");
    unavailable.searchParams.set("plan", plan.id);
    unavailable.searchParams.set("deployment", deployment);
    return privateRedirect(unavailable);
  }

  try {
    const stripe = getStripe();
    const email = await primaryAccountEmail();
    const successUrl = new URL("/portal/applications", requestUrl);
    successUrl.searchParams.set("subscription", "activated");
    successUrl.searchParams.set("app", app.slug);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    const cancelUrl = new URL(`/apps/${app.slug}/subscribe`, requestUrl);
    cancelUrl.searchParams.set("checkout", "cancelled");

    const metadata = {
      obserraApp: app.slug,
      plan: plan.id,
      billingInterval: interval,
      deploymentModel: deployment,
      clerkUserId: userId,
      merchantLegalName: LEGAL_MERCHANT_NAME,
      commerceSource: COMMERCE_SOURCE,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      customer_email: email,
      metadata,
      subscription_data: { metadata },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return privateRedirect(new URL(session.url), 303);
  } catch (error) {
    console.error("application subscription checkout failed", error);
    return privateRedirect(new URL(`/apps/${app.slug}/subscribe?checkout=unavailable`, requestUrl));
  }
}
