import type { MarketplaceApp } from "./appsData";

export type BillingInterval = "monthly" | "annual";
export type CommercePlan = {
  id: "professional" | "enterprise";
  name: string;
  description: string;
  billing: BillingInterval[];
  deployment: MarketplaceApp["deployment"];
  includes: string[];
};

export const commercePlans: CommercePlan[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Subscription access for a defined team, controlled onboarding, standard support, and SaaS deployment.",
    billing: ["monthly", "annual"],
    deployment: ["SaaS"],
    includes: ["Named-user access", "Standard onboarding", "Product updates", "Customer portal access", "Standard support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Enterprise licensing, deployment planning, integrations, governance controls, and dedicated implementation support.",
    billing: ["annual"],
    deployment: ["SaaS", "Private Cloud", "Hybrid", "On-Premises"],
    includes: ["Enterprise tenant", "Role-based administration", "Integration planning", "Security review", "Deployment assistance", "Priority support"],
  },
];

export function stripePriceEnvironmentKey(slug: string, plan: string, interval: BillingInterval) {
  const normalized = slug.replace(/[^a-z0-9]+/gi, "_").toUpperCase();
  return `STRIPE_PRICE_${normalized}_${plan.toUpperCase()}_${interval.toUpperCase()}`;
}

export function availablePlansFor(app: MarketplaceApp) {
  return app.status === "Available" ? commercePlans : [];
}
