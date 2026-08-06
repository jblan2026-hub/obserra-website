import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { evaluateProductEntitlement, listSaasPlans } from "../../../../lib/saas-control-plane";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
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
  if (!identity.userId) return noStoreJson({ error: "authentication-required" }, 401);
  if (!identity.orgId) return noStoreJson({ error: "organization-required" }, 403);

  const requestUrl = new URL(request.url);
  const productSlug = requestUrl.searchParams.get("product")?.trim();
  if (!productSlug) {
    return noStoreJson({
      organizationId: identity.orgId,
      plans: listSaasPlans().map((plan) => ({
        id: plan.id,
        name: plan.name,
        seatLimit: plan.seatLimit,
        trialDays: plan.trialDays,
        features: plan.features,
      })),
    });
  }

  const tenantId = requestUrl.searchParams.get("tenant")?.trim() || null;
  const decision = await evaluateProductEntitlement({
    organizationId: identity.orgId,
    tenantId,
    productSlug,
  });

  return noStoreJson({
    allowed: decision.allowed,
    reason: decision.reason,
    tenantId: decision.tenantId,
    organizationId: decision.organizationId,
    planId: decision.planId,
    status: decision.status,
    productSlug: decision.productSlug,
    features: decision.features,
  }, decision.allowed ? 200 : 403);
}
