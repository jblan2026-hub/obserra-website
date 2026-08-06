import "server-only";

import { randomUUID } from "node:crypto";
import { subscriptionForOrganization } from "./saas-control-plane";

export type UsageMetric = "api_calls" | "ai_actions" | "reports_generated" | "active_assets";

export type UsageEvent = {
  eventId: string;
  organizationId: string;
  tenantId: string;
  productSlug: string;
  metric: UsageMetric;
  quantity: number;
  occurredAt: string;
  actorUserId: string;
};

export type UsageSummary = {
  organizationId: string;
  tenantId: string;
  productSlug: string;
  periodStart: string;
  periodEnd: string;
  usage: Record<UsageMetric, number>;
  limits: Record<UsageMetric, number | null>;
  withinLimits: boolean;
  exceededMetrics: UsageMetric[];
};

const PLAN_LIMITS: Record<string, Record<UsageMetric, number | null>> = {
  foundation: {
    api_calls: 25_000,
    ai_actions: 2_500,
    reports_generated: 500,
    active_assets: 10_000,
  },
  enterprise: {
    api_calls: null,
    ai_actions: null,
    reports_generated: null,
    active_assets: null,
  },
};

function configuration() {
  const baseUrl = process.env.OBSERRA_CONTROL_PLANE_STORE_URL?.trim().replace(/\/$/, "") || null;
  const token = process.env.OBSERRA_CONTROL_PLANE_STORE_TOKEN?.trim() || null;
  return { baseUrl, token, configured: Boolean(baseUrl && token) };
}

function encode(value: string) {
  return encodeURIComponent(value);
}

async function requestStore<T>(path: string, init: RequestInit): Promise<T> {
  const config = configuration();
  if (!config.configured || !config.baseUrl || !config.token) {
    throw new Error("SaaS usage persistence is not configured");
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Usage store request failed with ${response.status}: ${detail.slice(0, 240)}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function validQuantity(quantity: number) {
  return Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 1_000_000;
}

export async function recordUsage(input: Omit<UsageEvent, "eventId" | "occurredAt"> & { eventId?: string; occurredAt?: string }) {
  if (!validQuantity(input.quantity)) throw new Error("Usage quantity must be a positive bounded integer");

  const subscription = await subscriptionForOrganization(input.organizationId);
  if (!subscription || subscription.tenantId !== input.tenantId) {
    throw new Error("Tenant subscription is unavailable or mismatched");
  }

  const event: UsageEvent = {
    ...input,
    eventId: input.eventId?.trim() || randomUUID(),
    occurredAt: input.occurredAt || new Date().toISOString(),
  };

  return requestStore<{ accepted: boolean; duplicate: boolean }>(
    `/v1/usage-events/${encode(event.eventId)}`,
    {
      method: "PUT",
      headers: { "idempotency-key": event.eventId },
      body: JSON.stringify(event),
    },
  );
}

export async function usageSummary(input: {
  organizationId: string;
  productSlug: string;
  period?: string;
}): Promise<UsageSummary> {
  const subscription = await subscriptionForOrganization(input.organizationId);
  if (!subscription) throw new Error("Tenant subscription is unavailable");

  const period = input.period?.trim() || new Date().toISOString().slice(0, 7);
  const raw = await requestStore<{ usage: Partial<Record<UsageMetric, number>>; periodStart: string; periodEnd: string }>(
    `/v1/usage-summary/organization/${encode(input.organizationId)}/product/${encode(input.productSlug)}?period=${encode(period)}`,
    { method: "GET" },
  );

  const usage: Record<UsageMetric, number> = {
    api_calls: Math.max(0, raw.usage.api_calls ?? 0),
    ai_actions: Math.max(0, raw.usage.ai_actions ?? 0),
    reports_generated: Math.max(0, raw.usage.reports_generated ?? 0),
    active_assets: Math.max(0, raw.usage.active_assets ?? 0),
  };
  const limits = PLAN_LIMITS[subscription.planId] ?? PLAN_LIMITS.foundation;
  const exceededMetrics = (Object.keys(usage) as UsageMetric[]).filter((metric) => {
    const limit = limits[metric];
    return limit !== null && usage[metric] > limit;
  });

  return {
    organizationId: subscription.organizationId,
    tenantId: subscription.tenantId,
    productSlug: input.productSlug,
    periodStart: raw.periodStart,
    periodEnd: raw.periodEnd,
    usage,
    limits: { ...limits },
    withinLimits: exceededMetrics.length === 0,
    exceededMetrics,
  };
}

export function usageMeteringHealth() {
  const config = configuration();
  return {
    configured: config.configured,
    failClosed: true,
    idempotentEvents: true,
    requestTimeoutMs: 8_000,
    supportedMetrics: ["api_calls", "ai_actions", "reports_generated", "active_assets"] as UsageMetric[],
    planLimitProfiles: Object.keys(PLAN_LIMITS).length,
  };
}
