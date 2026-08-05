export type PortalPriority = "low" | "normal" | "high" | "critical";
export type PortalServiceStatus = "available" | "assisted" | "controlled" | "planned";

export type PortalNotification = {
  id: string;
  title: string;
  detail: string;
  priority: PortalPriority;
  status: PortalServiceStatus;
  href?: string;
  requiredRoles?: string[];
  featureFlag?: string;
};

export type PortalTask = {
  id: string;
  title: string;
  detail: string;
  ownerType: "customer" | "obserra" | "shared";
  priority: PortalPriority;
  status: PortalServiceStatus;
  href?: string;
  requiredRoles?: string[];
  featureFlag?: string;
};

export type PortalDocument = {
  id: string;
  title: string;
  category: "report" | "invoice" | "certificate" | "license" | "policy" | "other";
  detail: string;
  status: PortalServiceStatus;
  href: string;
  requiredRoles?: string[];
  featureFlag?: string;
};

export type PortalPreference = {
  id: string;
  label: string;
  description: string;
  status: PortalServiceStatus;
  featureFlag?: string;
};

export const portalNotifications: PortalNotification[] = [
  {
    id: "support-available",
    title: "Customer support is available",
    detail: "Use the confidential support pathway for billing, access, licensing, reports, or Academy assistance.",
    priority: "normal",
    status: "available",
    href: "/contact?interest=customer-support",
  },
  {
    id: "account-activation",
    title: "Authenticated account services are being activated in phases",
    detail: "Personalized records will remain hidden until identity, authorization, tenant isolation, and audit controls are validated.",
    priority: "high",
    status: "planned",
  },
];

export const portalTasks: PortalTask[] = [
  {
    id: "review-training",
    title: "Review available Academy training",
    detail: "Browse courses or request an enterprise learning path.",
    ownerType: "customer",
    priority: "normal",
    status: "available",
    href: "/academy",
  },
  {
    id: "coordinate-licensing",
    title: "Coordinate enterprise licensing",
    detail: "Request EIOS, applications, training seats, renewal, or procurement support.",
    ownerType: "shared",
    priority: "high",
    status: "assisted",
    href: "/contact?interest=enterprise-licensing",
    requiredRoles: ["customer_admin", "procurement"],
  },
];

export const portalDocuments: PortalDocument[] = [
  {
    id: "trust-center",
    title: "Trust Center materials",
    category: "policy",
    detail: "Security, privacy, governance, and procurement documentation.",
    status: "available",
    href: "/trust",
  },
  {
    id: "customer-reports",
    title: "Executive reports and deliverables",
    category: "report",
    detail: "Controlled release of approved reports, board materials, and engagement documentation.",
    status: "controlled",
    href: "/contact?interest=customer-reports",
    requiredRoles: ["customer_admin", "executive"],
  },
  {
    id: "certificate-records",
    title: "Academy certificate records",
    category: "certificate",
    detail: "Certificate support and completion-record verification.",
    status: "assisted",
    href: "/contact?interest=certificate-support",
  },
];

export const portalPreferences: PortalPreference[] = [
  {
    id: "dashboard-layout",
    label: "Dashboard layout",
    description: "Saved widget order and workspace preferences.",
    status: "planned",
    featureFlag: "portal_preferences",
  },
  {
    id: "notification-delivery",
    label: "Notification delivery",
    description: "Email and in-portal notification preferences.",
    status: "planned",
    featureFlag: "portal_notifications",
  },
];

function featureEnabled(featureFlag: string | undefined, enabledFeatures: Set<string>) {
  return !featureFlag || enabledFeatures.has(featureFlag);
}

export function getPortalPlatformServices(enabledFeatures: Set<string> = new Set()) {
  return {
    notifications: portalNotifications.filter((item) => featureEnabled(item.featureFlag, enabledFeatures)),
    tasks: portalTasks.filter((item) => featureEnabled(item.featureFlag, enabledFeatures)),
    documents: portalDocuments.filter((item) => featureEnabled(item.featureFlag, enabledFeatures)),
    preferences: portalPreferences.filter((item) => featureEnabled(item.featureFlag, enabledFeatures)),
  };
}
