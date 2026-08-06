import "server-only";

import type { TenantSubscription } from "./saas-control-plane";

export type BillingEventRecord = {
  eventId: string;
  eventType: string;
  tenantId: string | null;
  organizationId: string | null;
  receivedAt: string;
  processedAt: string;
  outcome: "applied" | "ignored" | "rejected";
};

type StoreEnvelope<T> = { value: T | null; version?: string | null };

function storeConfiguration() {
  const baseUrl = process.env.OBSERRA_CONTROL_PLANE_STORE_URL?.trim().replace(/\/$/, "");
  const token = process.env.OBSERRA_CONTROL_PLANE_STORE_TOKEN?.trim();
  return { baseUrl: baseUrl || null, token: token || null, configured: Boolean(baseUrl && token) };
}

function encodeKey(value: string) {
  return encodeURIComponent(value);
}

async function storeRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = storeConfiguration();
  if (!config.configured || !config.baseUrl || !config.token) {
    throw new Error("SaaS control-plane persistence is not configured");
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Control-plane store request failed with ${response.status}: ${detail.slice(0, 240)}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function bootstrapSubscriptions(): TenantSubscription[] {
  const raw = process.env.OBSERRA_SAAS_SUBSCRIPTIONS_JSON?.trim();
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? (value as TenantSubscription[]) : [];
  } catch {
    return [];
  }
}

export async function readSubscriptionByOrganization(organizationId: string): Promise<TenantSubscription | null> {
  const config = storeConfiguration();
  if (!config.configured) {
    return bootstrapSubscriptions().find((item) => item.organizationId === organizationId) ?? null;
  }

  const envelope = await storeRequest<StoreEnvelope<TenantSubscription>>(
    `/v1/subscriptions/organization/${encodeKey(organizationId)}`,
    { method: "GET" },
  );
  return envelope.value ?? null;
}

export async function readSubscriptionByStripeId(stripeSubscriptionId: string): Promise<TenantSubscription | null> {
  const config = storeConfiguration();
  if (!config.configured) {
    return bootstrapSubscriptions().find((item) => item.stripeSubscriptionId === stripeSubscriptionId) ?? null;
  }

  const envelope = await storeRequest<StoreEnvelope<TenantSubscription>>(
    `/v1/subscriptions/stripe/${encodeKey(stripeSubscriptionId)}`,
    { method: "GET" },
  );
  return envelope.value ?? null;
}

export async function upsertSubscription(subscription: TenantSubscription, eventId: string) {
  return storeRequest<{ applied: boolean; version: string }>(
    `/v1/subscriptions/organization/${encodeKey(subscription.organizationId)}`,
    {
      method: "PUT",
      headers: { "idempotency-key": eventId },
      body: JSON.stringify(subscription),
    },
  );
}

export async function billingEventWasProcessed(eventId: string) {
  const config = storeConfiguration();
  if (!config.configured) return false;
  const envelope = await storeRequest<StoreEnvelope<BillingEventRecord>>(
    `/v1/billing-events/${encodeKey(eventId)}`,
    { method: "GET" },
  );
  return Boolean(envelope.value);
}

export async function recordBillingEvent(record: BillingEventRecord) {
  return storeRequest<{ created: boolean }>(`/v1/billing-events/${encodeKey(record.eventId)}`, {
    method: "PUT",
    headers: { "idempotency-key": record.eventId },
    body: JSON.stringify(record),
  });
}

export function subscriptionStoreHealth() {
  const config = storeConfiguration();
  return {
    configured: config.configured,
    mode: config.configured ? "durable-rest-store" : "read-only-bootstrap",
    writeEnabled: config.configured,
    failClosed: true,
    requestTimeoutMs: 8_000,
  };
}
