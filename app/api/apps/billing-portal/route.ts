import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { applicationsTenantId, durableApplicationsCustomer } from "../../../../lib/applications-commerce";
import { getApplicationsStripe } from "../../../../lib/applications-stripe";

function sameOriginForm(request: Request) {
  const origin = request.headers.get("origin");
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  try {
    return Boolean(origin) && new URL(origin as string).origin === new URL(request.url).origin &&
      (contentType.startsWith("application/x-www-form-urlencoded") || contentType.startsWith("multipart/form-data"));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  if (!sameOriginForm(request)) return NextResponse.json({ error: "Same-origin form required" }, { status: 403 });
  const form = await request.formData();
  const slug = String(form.get("app") ?? "");

  const { userId, orgId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", new URL("/portal/orders", requestUrl).toString());
    return NextResponse.redirect(signIn, 303);
  }

  try {
    const customer = await durableApplicationsCustomer(userId, applicationsTenantId(userId, orgId));
    if (!customer) return NextResponse.redirect(new URL("/portal/orders?billing=no-subscription", requestUrl), 303);
    const session = await getApplicationsStripe().billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: new URL(slug ? `/portal/applications?app=${encodeURIComponent(slug)}` : "/portal/orders", requestUrl).toString(),
    });
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("billing portal session failed", { error: error instanceof Error ? error.name : "unknown" });
    return NextResponse.redirect(new URL("/portal/orders?billing=unavailable", requestUrl), 303);
  }
}

export async function GET() {
  return NextResponse.json({ error: "Billing portal requires POST" }, { status: 405, headers: { allow: "POST" } });
}
