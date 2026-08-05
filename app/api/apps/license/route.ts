import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { findAppBySlug } from "../../../apps/appsData";
import { resolveAppEntitlement } from "../../../../lib/app-entitlements";
import { issueApplicationKey } from "../../../../lib/app-license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const slug = requestUrl.searchParams.get("app") ?? "";
  const app = findAppBySlug(slug);
  if (!app) return NextResponse.json({ error: "Unknown application" }, { status: 404 });

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const entitlement = await resolveAppEntitlement(userId, app.slug);
  if (!entitlement.allowed) {
    return NextResponse.json({ error: "Active subscription required", status: entitlement.status }, { status: 403 });
  }

  const licenseKey = issueApplicationKey(app.slug, userId, entitlement);
  if (!licenseKey) return NextResponse.json({ error: "License service is not configured" }, { status: 503 });

  const response = NextResponse.json({
    application: app.slug,
    licenseKey,
    subscriptionStatus: entitlement.status,
    plan: entitlement.plan,
    deploymentModel: entitlement.deploymentModel,
  });
  response.headers.set("Cache-Control", "no-store, private");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
