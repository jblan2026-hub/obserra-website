import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findStorefrontAppBySlug } from "../../../apps/storefront";
import { resolveAppEntitlement } from "../../../../lib/app-entitlements";
import { publishedReleaseFor, signedReleaseUrl } from "../../../../lib/release-delivery";

export const runtime = "nodejs";

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
  if (!app) return privateRedirect(new URL("/apps?download=invalid-app", requestUrl));
  if (app.status === "Coming Soon") {
    return privateRedirect(new URL(`/apps/${app.slug}?download=release-not-approved`, requestUrl));
  }

  const { userId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", requestUrl.toString());
    return privateRedirect(signIn);
  }

  const entitlement = await resolveAppEntitlement(userId, app.slug);
  if (!entitlement.allowed) {
    const subscribe = new URL(`/apps/${app.slug}/subscribe`, requestUrl);
    subscribe.searchParams.set("download", entitlement.status);
    return privateRedirect(subscribe);
  }

  const release = publishedReleaseFor(app.slug);
  if (!release) return privateRedirect(new URL(`/portal/applications?download=not-published&app=${app.slug}`, requestUrl));

  const downloadUrl = signedReleaseUrl(release);
  if (!downloadUrl) return privateRedirect(new URL(`/portal/applications?download=delivery-not-configured&app=${app.slug}`, requestUrl));

  const response = privateRedirect(new URL(downloadUrl), 303);
  response.headers.set("Content-Disposition", `attachment; filename="${release.artifactFile.replace(/"/g, "")}"`);
  return response;
}
