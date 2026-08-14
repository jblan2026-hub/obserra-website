import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findStorefrontAppBySlug } from "../../../apps/storefront";
import { resolveAppEntitlement } from "../../../../lib/app-entitlements";
import { getStripe } from "../../../../lib/stripe";

function privateRedirect(url: URL, status = 307) {
  const response = NextResponse.redirect(url, status);
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("app") ?? "";
  const app = findStorefrontAppBySlug(slug);
  if (!app) return privateRedirect(new URL("/portal?billing=invalid-app", requestUrl));

  const { userId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", requestUrl.toString());
    return privateRedirect(signIn);
  }

  const entitlement = await resolveAppEntitlement(userId, app.slug);
  if (!entitlement.customerId) {
    return privateRedirect(new URL(`/apps/${app.slug}/subscribe?billing=no-subscription`, requestUrl));
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: entitlement.customerId,
      return_url: new URL(`/portal?app=${app.slug}`, requestUrl).toString(),
    });
    return privateRedirect(new URL(session.url), 303);
  } catch (error) {
    console.error("billing portal session failed", error);
    return privateRedirect(new URL(`/portal?billing=unavailable&app=${app.slug}`, requestUrl));
  }
}
