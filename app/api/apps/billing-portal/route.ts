import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findAppBySlug } from "../../../apps/appsData";
import { resolveAppEntitlement } from "../../../../lib/app-entitlements";
import { getStripe } from "../../../../lib/stripe";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("app") ?? "";
  const app = findAppBySlug(slug);
  if (!app) return NextResponse.redirect(new URL("/portal?billing=invalid-app", requestUrl));

  const { userId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", requestUrl.toString());
    return NextResponse.redirect(signIn);
  }

  const entitlement = await resolveAppEntitlement(userId, app.slug);
  if (!entitlement.customerId) return NextResponse.redirect(new URL(`/apps/${app.slug}/subscribe?billing=no-subscription`, requestUrl));

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: entitlement.customerId,
      return_url: new URL(`/portal?app=${app.slug}`, requestUrl).toString(),
    });
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("billing portal session failed", error);
    return NextResponse.redirect(new URL(`/portal?billing=unavailable&app=${app.slug}`, requestUrl));
  }
}
