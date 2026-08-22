import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { findStorefrontAppBySlug } from "../../../apps/storefront";
import { availablePlansFor, type BillingInterval } from "../../../apps/commerce";
import {
  applicationsCommerceHealth,
  applicationsCustomerIdempotencyKey,
  applicationsTenantId,
  bindDurableApplicationsCustomer,
  durableApplicationEntitlement,
  durableApplicationsCustomer,
  recordApplicationsCheckoutSession,
  reserveApplicationsCheckout,
} from "../../../../lib/applications-commerce";
import {
  applicationsCommerceConfigured,
  applicationsCommerceLivemode,
  applicationsStripePriceId,
  getApplicationsStripe,
} from "../../../../lib/applications-stripe";
import { primaryAccountEmail } from "../../../../lib/app-entitlements";

export const runtime = "nodejs";
export const maxDuration = 60;

const LEGAL_MERCHANT_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const COMMERCE_SOURCE = "obserra-website-application-commerce";
const NO_STORE = "no-store, private";

function rejected(status: number, message: string) {
  const response = NextResponse.json({ error: message }, { status });
  response.headers.set("cache-control", NO_STORE);
  return response;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isSupportedFormContentType(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  return contentType.startsWith("application/x-www-form-urlencoded") || contentType.startsWith("multipart/form-data");
}

function stripeObjectId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id;
}

function validateGovernedPrice(
  price: Stripe.Price,
  input: { priceId: string; appSlug: string; planId: string; interval: BillingInterval; livemode: boolean },
) {
  const product = typeof price.product === "string" ? null : price.product;
  const expectedInterval = input.interval === "monthly" ? "month" : "year";
  return price.id === input.priceId &&
    price.active &&
    price.livemode === input.livemode &&
    price.type === "recurring" &&
    price.currency === "usd" &&
    Number.isSafeInteger(price.unit_amount) &&
    Number(price.unit_amount) > 0 &&
    price.recurring?.interval === expectedInterval &&
    price.recurring.interval_count === 1 &&
    product?.object === "product" &&
    !product.deleted &&
    product.active &&
    product.metadata.obserraApp === input.appSlug &&
    product.metadata.plan === input.planId &&
    product.metadata.billingInterval === input.interval &&
    product.metadata.commerceSource === COMMERCE_SOURCE;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  if (!isSameOrigin(request)) return rejected(403, "Same-origin checkout required");
  if (!isSupportedFormContentType(request)) return rejected(415, "Unsupported checkout media type");
  const form = await request.formData();
  const slug = String(form.get("app") ?? "");
  const planId = String(form.get("plan") ?? "professional");
  const interval = String(form.get("interval") ?? "monthly") as BillingInterval;
  const deployment = String(form.get("deployment") ?? "SaaS");
  const app = findStorefrontAppBySlug(slug);

  if (!app) return NextResponse.redirect(new URL("/apps?checkout=invalid-app", requestUrl));
  const plan = availablePlansFor(app).find((entry) => entry.id === planId);
  if (!plan || !plan.billing.includes(interval) || !plan.deployment.includes(deployment as never) || !app.deployment.includes(deployment as never)) {
    return NextResponse.redirect(new URL(`/apps/${app.slug}/subscribe?checkout=invalid-selection`, requestUrl));
  }
  if (deployment !== "SaaS") {
    return NextResponse.redirect(new URL(`/contact?interest=enterprise-deployment&app=${app.slug}`, requestUrl), 303);
  }

  const { userId, orgId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", new URL(`/apps/${app.slug}/subscribe`, requestUrl).toString());
    return NextResponse.redirect(signIn);
  }

  const priceId = applicationsStripePriceId(app.slug, plan.id, interval) ?? "";
  if (!priceId || !applicationsCommerceConfigured()) {
    const unavailable = new URL(`/apps/${app.slug}/subscribe`, requestUrl);
    unavailable.searchParams.set("checkout", "configuration-required");
    unavailable.searchParams.set("plan", plan.id);
    unavailable.searchParams.set("deployment", deployment);
    return NextResponse.redirect(unavailable);
  }

  try {
    await applicationsCommerceHealth();
    const stripe = getApplicationsStripe();
    const livemode = applicationsCommerceLivemode();
    if (livemode === null) throw new Error("Applications Stripe mode is invalid");
    const tenantId = applicationsTenantId(userId, orgId);
    const existingEntitlement = await durableApplicationEntitlement(userId, tenantId, app.slug);
    if (existingEntitlement.allowed) {
      return NextResponse.redirect(new URL(`/portal/applications?subscription=already-active&app=${app.slug}`, requestUrl), 303);
    }
    const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
    if (!validateGovernedPrice(price, { priceId, appSlug: app.slug, planId: plan.id, interval, livemode })) {
      console.error("application checkout rejected ungoverned Stripe price", { app: app.slug, plan: plan.id, interval, priceId });
      return NextResponse.redirect(new URL(`/apps/${app.slug}/subscribe?checkout=price-governance-failed`, requestUrl), 303);
    }

    const reservation = await reserveApplicationsCheckout({
      subjectId: userId,
      tenantId,
      appSlug: app.slug,
      planId: plan.id,
      billingInterval: interval,
      deploymentModel: "SaaS",
    });
    if (reservation.stripeSessionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId);
      if (
        existingSession.metadata?.checkoutAttemptId !== reservation.attemptId ||
        existingSession.metadata?.clerkUserId !== userId ||
        existingSession.metadata?.tenantId !== tenantId ||
        !existingSession.url
      ) throw new Error("Durable checkout replay did not match Stripe");
      return NextResponse.redirect(existingSession.url, 303);
    }

    const email = await primaryAccountEmail();
    let customer = await durableApplicationsCustomer(userId, tenantId);
    if (!customer) {
      const created = await stripe.customers.create({
        email,
        name: email ? undefined : LEGAL_MERCHANT_NAME,
        metadata: { clerkUserId: userId, tenantId, commerceSource: COMMERCE_SOURCE },
      }, { idempotencyKey: applicationsCustomerIdempotencyKey(userId, tenantId) });
      customer = await bindDurableApplicationsCustomer(userId, tenantId, created.id);
    }

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
      tenantId,
      seatsPurchased: "1",
      checkoutAttemptId: reservation.attemptId,
      entitlementRevision: "1",
      merchantLegalName: LEGAL_MERCHANT_NAME,
      commerceSource: COMMERCE_SOURCE,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      customer: customer.stripeCustomerId,
      customer_update: { address: "auto", name: "auto" },
      metadata,
      subscription_data: { metadata },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      allow_promotion_codes: true,
      billing_address_collection: "required",
      automatic_tax: { enabled: process.env.OBSERRA_APPLICATIONS_AUTOMATIC_TAX_ENABLED === "true" },
      tax_id_collection: { enabled: true },
      consent_collection: { terms_of_service: "required" },
    }, { idempotencyKey: `applications-checkout-v1-${reservation.attemptId}` });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    if (stripeObjectId(session.customer) !== customer.stripeCustomerId) throw new Error("Stripe checkout customer mismatch");
    await recordApplicationsCheckoutSession(reservation.attemptId, customer.stripeCustomerId, session.id);
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    console.error("application subscription checkout failed", error);
    return NextResponse.redirect(new URL(`/apps/${app.slug}/subscribe?checkout=unavailable`, requestUrl));
  }
}

export async function GET() {
  const response = rejected(405, "Checkout requires POST");
  response.headers.set("allow", "POST");
  return response;
}
