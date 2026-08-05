export type SecurityTierId = "public" | "transactional" | "authenticated";

export type SecurityTierPolicy = {
  id: SecurityTierId;
  purpose: string;
  authenticationRequired: boolean;
  tenantContextRequired: boolean;
  auditRequired: boolean;
  pciControlsRequired: boolean;
  noStore: boolean;
  noIndex: boolean;
  examples: string[];
};

export const securityTierPolicies: Record<SecurityTierId, SecurityTierPolicy> = {
  public: {
    id: "public",
    purpose: "Frictionless public browsing, marketing, discovery, and search indexing.",
    authenticationRequired: false,
    tenantContextRequired: false,
    auditRequired: false,
    pciControlsRequired: false,
    noStore: false,
    noIndex: false,
    examples: ["company pages", "service pages", "industry pages", "EIOS marketing", "Academy catalog", "store catalog"],
  },
  transactional: {
    id: "transactional",
    purpose: "Protect checkout, enrollment, billing, subscriptions, and payment-state transitions.",
    authenticationRequired: true,
    tenantContextRequired: false,
    auditRequired: true,
    pciControlsRequired: true,
    noStore: true,
    noIndex: true,
    examples: ["checkout", "Stripe APIs", "orders", "billing", "course enrollment"],
  },
  authenticated: {
    id: "authenticated",
    purpose: "Protect SaaS capabilities, customer data, licensed applications, courses, certificates, reports, and administration.",
    authenticationRequired: true,
    tenantContextRequired: true,
    auditRequired: true,
    pciControlsRequired: false,
    noStore: true,
    noIndex: true,
    examples: ["customer portal", "SaaS applications", "course delivery", "certificates", "enterprise workspaces"],
  },
};

const routeRules: Array<{ prefix: string; tier: SecurityTierId }> = [
  { prefix: "/api/stripe", tier: "transactional" },
  { prefix: "/api/checkout", tier: "transactional" },
  { prefix: "/checkout", tier: "transactional" },
  { prefix: "/portal/orders", tier: "transactional" },
  { prefix: "/portal/billing", tier: "transactional" },
  { prefix: "/academy/enroll", tier: "transactional" },
  { prefix: "/academy/learn", tier: "authenticated" },
  { prefix: "/academy/certificate", tier: "authenticated" },
  { prefix: "/portal", tier: "authenticated" },
  { prefix: "/eios/app", tier: "authenticated" },
];

export function resolveSecurityTier(pathname: string): SecurityTierPolicy {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const matchedRule = routeRules.find(({ prefix }) =>
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

  return securityTierPolicies[matchedRule?.tier ?? "public"];
}
