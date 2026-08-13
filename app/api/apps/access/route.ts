import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findStorefrontAppBySlug } from "../../../apps/storefront";
import { resolveUnifiedEntitlement } from "../../../../lib/unified-entitlements";

function launchEnvironmentKey(slug: string) {
  return `APP_LAUNCH_${slug.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("app") ?? "";
  const app = findStorefrontAppBySlug(slug);
  if (!app) return NextResponse.redirect(new URL("/apps?access=invalid-app", requestUrl));

  const { userId, orgId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", requestUrl.toString());
    return NextResponse.redirect(signIn);
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
    return NextResponse.redirect(subscribe);
  }

  if (entitlement.deploymentModel !== "SaaS") {
    return NextResponse.redirect(
      new URL(
        `/portal?deployment=${encodeURIComponent(entitlement.deploymentModel ?? "managed")}&app=${app.slug}`,
        requestUrl,
      ),
    );
  }

  const launchUrl = process.env[launchEnvironmentKey(app.slug)];
  if (!launchUrl) return NextResponse.redirect(new URL(`/portal?launch=provisioning&app=${app.slug}`, requestUrl));
  return NextResponse.redirect(launchUrl, 303);
}
