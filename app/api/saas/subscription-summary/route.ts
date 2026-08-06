import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { planForId, subscriptionForOrganization } from "../../../../lib/saas-control-plane";
import { usageSummary } from "../../../../lib/saas-usage-metering";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStore(body: unknown, status = 200) {
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
  if (!identity.userId) return noStore({ error: "authentication-required" }, 401);
  if (!identity.orgId) return noStore({ error: "organization-required" }, 403);

  const url = new URL(request.url);
  const productSlug = url.searchParams.get("product")?.trim() || "";
  const period = url.searchParams.get("period")?.trim() || undefined;
  if (!productSlug || productSlug.length > 160) return noStore({ error: "product-required" }, 400);
  if (period && !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return noStore({ error: "invalid-period" }, 400);

  const subscription = await subscriptionForOrganization(identity.orgId);
  if (!subscription) return noStore({ error: "subscription-unavailable" }, 403);

  const plan = planForId(subscription.planId);
  if (!plan) return noStore({ error: "plan-unavailable" }, 403);

  const productIncluded = plan.productSlugs.includes("*") || plan.productSlugs.includes(productSlug);
  if (!productIncluded) return noStore({ error: "product-not-in-plan" }, 403);

  let usage: Awaited<ReturnType<typeof usageSummary>> | null = null;
  let usageState: "available" | "unavailable" = "available";
  try {
    usage = await usageSummary({ organizationId: identity.orgId, productSlug, period });
  } catch {
    usageState = "unavailable";
  }

  return noStore({
    organizationId: subscription.organizationId,
    tenantId: subscription.tenantId,
    productSlug,
    subscription: {
      status: subscription.status,
      planId: subscription.planId,
      currentPeriodEnd: subscription.currentPeriodEnd,
      gracePeriodEnd: subscription.gracePeriodEnd,
      seatsUsed: subscription.seatsUsed,
      updatedAt: subscription.updatedAt,
    },
    plan: {
      id: plan.id,
      name: plan.name,
      seatLimit: plan.seatLimit,
      features: plan.features,
    },
    usageState,
    usage,
    billingManagementAvailable: Boolean(
      process.env.STRIPE_SECRET_KEY?.trim() &&
        process.env.OBSERRA_CONTROL_PLANE_STORE_URL?.trim() &&
        process.env.OBSERRA_CONTROL_PLANE_STORE_TOKEN?.trim(),
    ),
  });
}
