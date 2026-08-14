import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findStorefrontAppBySlug } from "../../../apps/storefront";
import { resolveApprovedApplicationLaunchUrl } from "../../../../lib/application-launch";
import { resolveUnifiedEntitlement } from "../../../../lib/unified-entitlements";

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
  if (!app) return privateRedirect(new URL("/apps?access=invalid-app", requestUrl));
  if (app.status === "Coming Soon") {
    return privateRedirect(new URL(`/apps/${app.slug}?access=release-not-approved`, requestUrl));
  }

  const { userId, orgId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", requestUrl.toString());
    return privateRedirect(signIn);
  }

  const entitlement = await resolveUnifiedEntitlement({
    subjectId: userId,
    tenantId: orgId ?? undefined,
    productSlug: app.slug,
    action: "launch",
  });

  if (!entitlement.allowed) {
    const subscribe = new URL(`/apps/${app.slug}/subscribe`, requestUrl);
    subscribe.searchParams.set("access", entitlement.authoritative ? "not-entitled" : "licensing-unavailable");
    return privateRedirect(subscribe);
  }

  if (entitlement.deploymentModel !== "SaaS") {
    return privateRedirect(
      new URL(
        `/portal?deployment=${encodeURIComponent(entitlement.deploymentModel ?? "managed")}&app=${app.slug}`,
        requestUrl,
      ),
    );
  }

  const launch = resolveApprovedApplicationLaunchUrl(app.slug);
  if (launch.status === "not-configured") {
    return privateRedirect(new URL(`/portal?launch=provisioning&app=${app.slug}`, requestUrl));
  }
  if (launch.status === "not-approved") {
    return privateRedirect(new URL(`/portal?launch=configuration-required&app=${app.slug}`, requestUrl));
  }
  return privateRedirect(new URL(launch.url), 303);
}
