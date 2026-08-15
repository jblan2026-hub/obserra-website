export type CustomerSuccessStatus = "healthy" | "attention" | "at-risk" | "unavailable";

export type CustomerSuccessMetric = {
  id: string;
  label: string;
  value?: string;
  description: string;
  status: CustomerSuccessStatus;
  source: string;
  lastVerifiedAt?: string;
};

export type CustomerSuccessModule = {
  id: string;
  title: string;
  description: string;
  href: string;
  action: string;
  status: "available" | "request-based" | "integration-required";
  requiredSystems: string[];
};

export type CustomerSuccessSnapshot = {
  customerId: string;
  organizationId?: string;
  generatedAt: string;
  metrics: CustomerSuccessMetric[];
  modules: CustomerSuccessModule[];
};

export const customerSuccessModules: CustomerSuccessModule[] = [
  {
    id: "subscriptions",
    title: "Subscriptions and renewals",
    description: "Review active SaaS subscriptions, renewal timing, billing status, and upgrade pathways after verified Stripe account reconciliation.",
    href: "/portal/orders",
    action: "Open subscriptions",
    status: "available",
    requiredSystems: ["Clerk", "Stripe"],
  },
  {
    id: "applications",
    title: "Application adoption",
    description: "Review entitled applications, deployment options, access actions, and future product-usage analytics.",
    href: "/portal/applications",
    action: "Open applications",
    status: "available",
    requiredSystems: ["Clerk", "Stripe", "Application telemetry"],
  },
  {
    id: "licenses",
    title: "License utilization",
    description: "Track seats, assignments, expiration dates, and utilization after the production licensing system of record is connected.",
    href: "/contact?interest=enterprise-licensing",
    action: "Contact licensing",
    status: "integration-required",
    requiredSystems: ["Licensing service", "Tenant directory"],
  },
  {
    id: "academy",
    title: "Learning and course completion",
    description: "Access Academy programs and prepare for future organization-level completion, course-completion records, and continuing-education reporting.",
    href: "/academy",
    action: "Open Academy",
    status: "available",
    requiredSystems: ["Clerk", "Academy records"],
  },
  {
    id: "support",
    title: "Customer support",
    description: "Open a confidential support request and prepare for customer-scoped case status and service-level reporting.",
    href: "/contact?interest=customer-support",
    action: "Open support",
    status: "request-based",
    requiredSystems: ["Support platform"],
  },
  {
    id: "executive-reporting",
    title: "Executive value reporting",
    description: "Generate adoption, risk reduction, value realization, and renewal reporting after validated product and engagement data sources are connected.",
    href: "/contact?interest=customer-reports",
    action: "Request executive report",
    status: "integration-required",
    requiredSystems: ["Usage analytics", "Licensing", "Engagement records"],
  },
];

export function createCustomerSuccessSnapshot(customerId: string, organizationId?: string): CustomerSuccessSnapshot {
  return {
    customerId,
    organizationId,
    generatedAt: new Date().toISOString(),
    metrics: [
      {
        id: "identity",
        label: "Identity status",
        value: "Verified",
        description: "Authenticated customer session is active.",
        status: "healthy",
        source: "Clerk",
      },
      {
        id: "subscription-health",
        label: "Subscription health",
        description: "Displayed only after verified Stripe customer reconciliation.",
        status: "unavailable",
        source: "Stripe",
      },
      {
        id: "license-utilization",
        label: "License utilization",
        description: "Displayed only after tenant-scoped licensing data is connected.",
        status: "unavailable",
        source: "Licensing system",
      },
      {
        id: "product-adoption",
        label: "Product adoption",
        description: "Displayed only after privacy-reviewed product telemetry is connected.",
        status: "unavailable",
        source: "Application telemetry",
      },
    ],
    modules: customerSuccessModules,
  };
}
