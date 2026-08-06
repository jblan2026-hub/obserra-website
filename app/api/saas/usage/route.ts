import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { recordUsage, usageSummary, type UsageMetric } from "../../../../lib/saas-usage-metering";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const metrics = new Set<UsageMetric>(["api_calls", "ai_actions", "reports_generated", "active_assets"]);

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function GET(request: Request) {
  const identity = await auth();
  if (!identity.userId) return json({ error: "authentication-required" }, 401);
  if (!identity.orgId) return json({ error: "organization-required" }, 403);

  const url = new URL(request.url);
  const productSlug = url.searchParams.get("product")?.trim();
  if (!productSlug) return json({ error: "product-required" }, 400);

  try {
    const summary = await usageSummary({
      organizationId: identity.orgId,
      productSlug,
      period: url.searchParams.get("period") ?? undefined,
    });
    return json(summary);
  } catch (error) {
    console.error("SaaS usage summary failed", {
      organizationId: identity.orgId,
      productSlug,
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ error: "usage-unavailable" }, 503);
  }
}

export async function POST(request: Request) {
  const identity = await auth();
  if (!identity.userId) return json({ error: "authentication-required" }, 401);
  if (!identity.orgId) return json({ error: "organization-required" }, 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid-json" }, 400);
  }

  const input = body as Partial<{
    tenantId: string;
    productSlug: string;
    metric: UsageMetric;
    quantity: number;
    eventId: string;
  }>;

  if (!input.tenantId?.trim() || !input.productSlug?.trim() || !input.metric || !metrics.has(input.metric)) {
    return json({ error: "invalid-usage-event" }, 400);
  }

  try {
    const result = await recordUsage({
      organizationId: identity.orgId,
      tenantId: input.tenantId.trim(),
      productSlug: input.productSlug.trim(),
      metric: input.metric,
      quantity: input.quantity ?? 1,
      actorUserId: identity.userId,
      eventId: input.eventId,
    });
    return json({ accepted: result.accepted, duplicate: result.duplicate }, result.duplicate ? 200 : 202);
  } catch (error) {
    console.error("SaaS usage event rejected", {
      organizationId: identity.orgId,
      metric: input.metric,
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ error: "usage-rejected" }, 403);
  }
}
