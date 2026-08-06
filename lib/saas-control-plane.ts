import "server-only";

import { readSubscriptionByOrganization, subscriptionStoreHealth } from "./saas-subscription-store";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "grace_period"
  | "suspended"
  | "canceled"
  | "expired";

export type SaasPlan = {
  id: string;
  name: string;
  productSlugs: string[];
  seatLimit: number | null;
  trialDays: number;
  features: string[];
};

export type TenantSubscription = {
  tenantId: string;
  organizationId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planId: string;
  status: SubscriptionStatus;
  seatsUsed: number;
  currentPeriodEnd: string | null;
  gracePeriodEnd: string | null;
  updatedAt: string;
};

export type EntitlementDecision = {
  allowed: boolean;
  reason:
    | "entitled"
    | "subscription-unavailable"
    | "subscription-inactive"
    | "product-not-in-plan"
    | "seat-limit-exceeded"
    | "tenant-mismatch";
  tenantId: string | null;
  organizationId: string | null;
  planId: string | null;
  status: SubscriptionStatus | null;
  productSlug: string;
  features: string[];
};

const plans: Record<string, SaasPlan> = {
  foundation: {
    id: "foundation",
    name: "Obserra Foundation",
    productSlugs: ["obserra-cyber-risk-register", "obserra-asset-intelligence"],
    seatLimit: 25,
    trialDays: 14,
    features: ["operational-dashboard", "ai-recommendations", "standard-reporting"],
  },
  enterprise: {
    id: "enterprise",
    name: "Obserra Enterprise",
    productSlugs: ["*"],
    seatLimit: null,
    trialDays: 30,
    features: [
      "operational-dashboard",
      "ai-recommendations",
      "advanced-reporting",
      "api-access",
      "enterprise-integrations",
      "eios-integration",
    ],
  },
};

function isTimeBoundStatusUsable(subscription: TenantSubscription, now: Date) {
  if (subscription.status === "active" || subscription.status === "trialing") return true;
  if (subscription.status !== "grace_period") return false;
  if (!subscription.gracePeriodEnd) return false;
  return new Date(subscription.gracePeriodEnd).getTime() > now.getTime();
}

function denied(
  reason: Exclude<EntitlementDecision["reason"], "entitled">,
  productSlug: string,
  subscription?: TenantSubscription | null,
): EntitlementDecision {
  return {
    allowed: false,
    reason,
    tenantId: subscription?.tenantId ?? null,
    organizationId: subscription?.organizationId ?? null,
    planId: subscription?.planId ?? null,
    status: subscription?.status ?? null,
    productSlug,
    features: [],
  };
}

export function listSaasPlans() {
  return Object.values(plans).map((plan) => ({
    ...plan,
    productSlugs: [...plan.productSlugs],
    features: [...plan.features],
  }));
}

export function planForId(planId: string) {
  const plan = plans[planId];
  return plan ? { ...plan, productSlugs: [...plan.productSlugs], features: [...plan.features] } : null;
}

export async function subscriptionForOrganization(organizationId: string) {
  try {
    return await readSubscriptionByOrganization(organizationId);
  } catch (error) {
    console.error("SaaS subscription lookup failed", {
      organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function evaluateProductEntitlement(input: {
  organizationId: string | null;
  tenantId?: string | null;
  productSlug: string;
  now?: Date;
}): Promise<EntitlementDecision> {
  const { organizationId, productSlug } = input;
  if (!organizationId) return denied("subscription-unavailable", productSlug);

  const subscription = await subscriptionForOrganization(organizationId);
  if (!subscription) {
    return {
      ...denied("subscription-unavailable", productSlug),
      organizationId,
    };
  }

  if (input.tenantId && input.tenantId !== subscription.tenantId) {
    return denied("tenant-mismatch", productSlug, subscription);
  }

  const plan = plans[subscription.planId];
  if (!plan) return denied("subscription-unavailable", productSlug, subscription);

  if (!isTimeBoundStatusUsable(subscription, input.now ?? new Date())) {
    return denied("subscription-inactive", productSlug, subscription);
  }

  if (!plan.productSlugs.includes("*") && !plan.productSlugs.includes(productSlug)) {
    return denied("product-not-in-plan", productSlug, subscription);
  }

  if (plan.seatLimit !== null && subscription.seatsUsed > plan.seatLimit) {
    return denied("seat-limit-exceeded", productSlug, subscription);
  }

  return {
    allowed: true,
    reason: "entitled",
    tenantId: subscription.tenantId,
    organizationId,
    planId: plan.id,
    status: subscription.status,
    productSlug,
    features: [...plan.features],
  };
}

export function saasControlPlaneHealth() {
  const storage = subscriptionStoreHealth();
  return {
    configured: storage.configured,
    failClosed: true,
    planCount: Object.keys(plans).length,
    supportedStatuses: ["trialing", "active", "past_due", "grace_period", "suspended", "canceled", "expired"],
    storage,
  };
}
