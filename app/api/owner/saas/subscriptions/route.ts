import { NextResponse } from "next/server";

import { authorizeOwner } from "../../../../../lib/owner-authorization";
import type { SubscriptionStatus, TenantSubscription } from "../../../../../lib/saas-control-plane";
import { planForId } from "../../../../../lib/saas-control-plane";
import {
  readSubscriptionByOrganization,
  recordBillingEvent,
  upsertSubscription,
} from "../../../../../lib/saas-subscription-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OwnerAction = "suspend" | "restore" | "set-grace-period" | "change-plan" | "set-seats";

type OwnerRequest = {
  organizationId?: unknown;
  action?: unknown;
  planId?: unknown;
  seatsUsed?: unknown;
  gracePeriodEnd?: unknown;
  changeReason?: unknown;
};

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function validAction(value: unknown): value is OwnerAction {
  return ["suspend", "restore", "set-grace-period", "change-plan", "set-seats"].includes(String(value));
}

function normalizedStatus(action: OwnerAction, current: SubscriptionStatus): SubscriptionStatus {
  if (action === "suspend") return "suspended";
  if (action === "restore") return current === "trialing" ? "trialing" : "active";
  if (action === "set-grace-period") return "grace_period";
  return current;
}

export async function POST(request: Request) {
  const owner = await authorizeOwner();
  if (!owner.allowed) {
    return noStore({ error: owner.reason }, owner.reason === "authentication-required" ? 401 : 403);
  }

  let body: OwnerRequest;
  try {
    body = (await request.json()) as OwnerRequest;
  } catch {
    return noStore({ error: "invalid-json" }, 400);
  }

  const organizationId = typeof body.organizationId === "string" ? body.organizationId.trim() : "";
  const changeReason = typeof body.changeReason === "string" ? body.changeReason.trim() : "";
  if (!organizationId || !validAction(body.action) || changeReason.length < 8 || changeReason.length > 500) {
    return noStore({ error: "invalid-request" }, 400);
  }

  const existing = await readSubscriptionByOrganization(organizationId);
  if (!existing) return noStore({ error: "subscription-not-found" }, 404);

  const action = body.action;
  let next: TenantSubscription = {
    ...existing,
    status: normalizedStatus(action, existing.status),
    updatedAt: new Date().toISOString(),
  };

  if (action === "set-seats") {
    if (!Number.isInteger(body.seatsUsed) || Number(body.seatsUsed) < 0 || Number(body.seatsUsed) > 1_000_000) {
      return noStore({ error: "invalid-seat-count" }, 400);
    }
    next = { ...next, seatsUsed: Number(body.seatsUsed) };
  }

  if (action === "change-plan") {
    const planId = typeof body.planId === "string" ? body.planId.trim() : "";
    if (!planForId(planId)) return noStore({ error: "invalid-plan" }, 400);
    next = { ...next, planId };
  }

  if (action === "set-grace-period") {
    const gracePeriodEnd = typeof body.gracePeriodEnd === "string" ? body.gracePeriodEnd.trim() : "";
    const timestamp = Date.parse(gracePeriodEnd);
    const maximum = Date.now() + 30 * 24 * 60 * 60 * 1000;
    if (!Number.isFinite(timestamp) || timestamp <= Date.now() || timestamp > maximum) {
      return noStore({ error: "invalid-grace-period" }, 400);
    }
    next = { ...next, gracePeriodEnd: new Date(timestamp).toISOString() };
  } else if (action === "restore") {
    next = { ...next, gracePeriodEnd: null };
  }

  const operationId = request.headers.get("idempotency-key")?.trim();
  if (!operationId || operationId.length < 12 || operationId.length > 200) {
    return noStore({ error: "idempotency-key-required" }, 400);
  }

  await upsertSubscription(next, operationId);
  await recordBillingEvent({
    eventId: operationId,
    eventType: `owner.subscription.${action}`,
    tenantId: next.tenantId,
    organizationId: next.organizationId,
    receivedAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
    outcome: "applied",
  });

  console.info("Owner SaaS subscription operation applied", {
    operationId,
    action,
    actorUserId: owner.userId,
    organizationId: next.organizationId,
    tenantId: next.tenantId,
    previousStatus: existing.status,
    nextStatus: next.status,
    previousPlanId: existing.planId,
    nextPlanId: next.planId,
    reasonLength: changeReason.length,
  });

  return noStore({
    applied: true,
    operationId,
    action,
    organizationId: next.organizationId,
    tenantId: next.tenantId,
    status: next.status,
    planId: next.planId,
    seatsUsed: next.seatsUsed,
    gracePeriodEnd: next.gracePeriodEnd,
    updatedAt: next.updatedAt,
  });
}
