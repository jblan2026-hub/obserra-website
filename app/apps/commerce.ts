import type { DeploymentMode, MarketplaceApp } from "./appsData";

export type BillingInterval = "monthly" | "annual";
export type CommercePlan = {
  id: "professional" | "enterprise";
  name: string;
  description: string;
  billing: BillingInterval[];
  deployment: DeploymentMode[];
  includes: string[];
};

export const commercePlans: CommercePlan[] = [
  {
    id: "professional",
    name: "Professional",
    description: "A future subscription shape that remains hidden until exact commercial approval is bound.",
    billing: ["monthly", "annual"],
    deployment: ["SaaS"],
    includes: ["Named-user access", "Standard onboarding", "Product updates", "Customer portal access", "Standard support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "A future enterprise agreement shape that remains hidden until exact commercial approval is bound.",
    billing: ["annual"],
    deployment: ["Local / on-prem", "SaaS", "Outbound tenant agent"],
    includes: ["Enterprise tenant", "Role-based administration", "Integration planning", "Security review", "Deployment assistance", "Priority support"],
  },
];

export function stripePriceEnvironmentKey(slug: string, plan: string, interval: BillingInterval) {
  const normalized = slug.replace(/[^a-z0-9]+/gi, "_").toUpperCase();
  return `STRIPE_PRICE_${normalized}_${plan.toUpperCase()}_${interval.toUpperCase()}`;
}

export function availablePlansFor(app: MarketplaceApp) {
  const hasApprovedSubscription = app.actions.some((action) => action.kind === "Subscribe");
  if (!hasApprovedSubscription) return [];

  return commercePlans;
}
