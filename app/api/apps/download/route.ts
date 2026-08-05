import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findAppBySlug } from "../../../apps/appsData";
import { resolveAppEntitlement } from "../../../../lib/app-entitlements";

function downloadEnvironmentKey(slug: string) {
  return `APP_DOWNLOAD_${slug.replace(/[^a-z0-9]+/gi, "_").toUpperCase()}`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("app") ?? "";
  const app = findAppBySlug(slug);
  if (!app) return NextResponse.redirect(new URL("/apps?download=invalid-app", requestUrl));

  const { userId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", requestUrl);
    signIn.searchParams.set("redirect_url", requestUrl.toString());
    return NextResponse.redirect(signIn);
  }

  const entitlement = await resolveAppEntitlement(userId, app.slug);
  if (!entitlement.allowed) {
    const subscribe = new URL(`/apps/${app.slug}/subscribe`, requestUrl);
    subscribe.searchParams.set("download", entitlement.status);
    return NextResponse.redirect(subscribe);
  }

  const downloadUrl = process.env[downloadEnvironmentKey(app.slug)];
  if (!downloadUrl) return NextResponse.redirect(new URL(`/portal?download=not-published&app=${app.slug}`, requestUrl));

  const response = NextResponse.redirect(downloadUrl, 303);
  response.headers.set("Cache-Control", "no-store, private");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
