import "server-only";

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

function parseSubscriptions(): TenantSubscription[] {
  const raw = process.env.OBSERRA_SAAS_SUBSCRIPTIONS_JSON?.trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTenantSubscription);
  } catch {
    return [];
  }
}

function isTenantSubscription(value: unknown): value is TenantSubscription {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TenantSubscription>;
  return Boolean(
    typeof candidate.tenantId === "string" &&
      typeof candidate.organizationId === "string" &&
      typeof candidate.planId === "string" &&
      typeof candidate.status === "string" &&
      typeof candidate.seatsUsed === "number" &&
      typeof candidate.updatedAt === "string",
  );
}

function isTimeBoundStatusUsable(subscription: TenantSubscription, now: Date) {
  if (subscription.status === "active" || subscription.status === "trialing") return true;
  if (subscription.status !== "grace_period") return false;
  if (!subscription.gracePeriodEnd) return false;
  return new Date(subscription.gracePeriodEnd).getTime() > now.getTime();
}

export function listSaasPlans() {
  return Object.values(plans).map((plan) => ({ ...plan, productSlugs: [...plan.productSlugs], features: [...plan.features] }));
}

export function subscriptionForOrganization(organizationId: string) {
  return parseSubscriptions().find((subscription) => subscription.organizationId === organizationId) ?? null;
}

export function evaluateProductEntitlement(input: {
  organizationId: string | null;
  tenantId?: string | null;
  productSlug: string;
  now?: Date;
}): EntitlementDecision {
  const { organizationId, productSlug } = input;
  if (!organizationId) {
    return {
      allowed: false,
      reason: "subscription-unavailable",
      tenantId: null,
      organizationId: null,
      planId: null,
      status: null,
      productSlug,
      features: [],
    };
  }

  const subscription = subscriptionForOrganization(organizationId);
  if (!subscription) {
    return {
      allowed: false,
      reason: "subscription-unavailable",
      tenantId: null,
      organizationId,
      planId: null,
      status: null,
      productSlug,
      features: [],
    };
  }

  if (input.tenantId && input.tenantId !== subscription.tenantId) {
    return {
      allowed: false,
      reason: "tenant-mismatch",
      tenantId: subscription.tenantId,
      organizationId,
      planId: subscription.planId,
      status: subscription.status,
      productSlug,
      features: [],
    };
  }

  const plan = plans[subscription.planId];
  if (!plan) {
    return {
      allowed: false,
      reason: "subscription-unavailable",
      tenantId: subscription.tenantId,
      organizationId,
      planId: subscription.planId,
      status: subscription.status,
      productSlug,
      features: [],
    };
  }

  if (!isTimeBoundStatusUsable(subscription, input.now ?? new Date())) {
    return {
      allowed: false,
      reason: "subscription-inactive",
      tenantId: subscription.tenantId,
      organizationId,
      planId: plan.id,
      status: subscription.status,
      productSlug,
      features: [],
    };
  }

  if (!plan.productSlugs.includes("*") && !plan.productSlugs.includes(productSlug)) {
    return {
      allowed: false,
      reason: "product-not-in-plan",
      tenantId: subscription.tenantId,
      organizationId,
      planId: plan.id,
      status: subscription.status,
      productSlug,
      features: [],
    };
  }

  if (plan.seatLimit !== null && subscription.seatsUsed > plan.seatLimit) {
    return {
      allowed: false,
      reason: "seat-limit-exceeded",
      tenantId: subscription.tenantId,
      organizationId,
      planId: plan.id,
      status: subscription.status,
      productSlug,
      features: [],
    };
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
  const subscriptions = parseSubscriptions();
  return {
    configured: Boolean(process.env.OBSERRA_SAAS_SUBSCRIPTIONS_JSON?.trim()),
    failClosed: true,
    planCount: Object.keys(plans).length,
    subscriptionCount: subscriptions.length,
    supportedStatuses: ["trialing", "active", "past_due", "grace_period", "suspended", "canceled", "expired"],
  };
}
