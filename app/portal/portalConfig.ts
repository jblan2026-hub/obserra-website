export type PortalStatus = "available" | "assisted" | "controlled" | "planned";

export type PortalKpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  status: PortalStatus;
};

export type PortalModule = {
  id: string;
  title: string;
  description: string;
  href: string;
  action: string;
  status: PortalStatus;
  requiredRoles?: string[];
  featureFlag?: string;
};

export type PortalActivity = {
  id: string;
  title: string;
  detail: string;
};

export type PortalQuickAction = {
  id: string;
  label: string;
  href: string;
};

export const portalKpis: PortalKpi[] = [
  { id: "learning", label: "LEARNING", value: "Available now", detail: "Course catalog, secure enrollment, account-based progress, and assessments.", status: "available" },
  { id: "licensing", label: "LICENSING", value: "Assisted service", detail: "Application, EIOS, team training, renewal, and procurement coordination.", status: "assisted" },
  { id: "deliverables", label: "DELIVERABLES", value: "Controlled access", detail: "Executive reports and engagement materials released through approved channels.", status: "controlled" },
  { id: "support", label: "SUPPORT", value: "Active", detail: "Confidential assistance for customers, learners, buyers, and enterprise teams.", status: "available" },
];

export const portalModules: PortalModule[] = [
  { id: "academy", title: "Academy", description: "Browse purchased and available training, continue learning, and request team pathways.", href: "/academy", action: "Open learning center", status: "available" },
  { id: "certificates", title: "Certificates", description: "Request completion records, certificate support, or verification assistance.", href: "/contact?interest=certificate-support", action: "Manage records", status: "assisted" },
  { id: "licensing", title: "Licensing", description: "Coordinate applications, EIOS editions, team seats, renewals, and procurement.", href: "/contact?interest=enterprise-licensing", action: "Review licensing", status: "assisted", requiredRoles: ["customer_admin", "procurement"] },
  { id: "reports", title: "Reports", description: "Request approved executive reports, board materials, and engagement deliverables.", href: "/contact?interest=customer-reports", action: "Request deliverables", status: "controlled", requiredRoles: ["customer_admin", "executive"] },
];

export const portalActivities: PortalActivity[] = [
  { id: "academy-enrollment", title: "Enroll in Academy training", detail: "Secure Stripe checkout and account-based access" },
  { id: "enterprise-licensing", title: "Request enterprise licensing", detail: "EIOS, applications, training, and deployment planning" },
  { id: "customer-support", title: "Obtain support", detail: "Billing, certificates, reports, access, and active engagements" },
  { id: "trust-center", title: "Review trust documentation", detail: "Security, privacy, governance, and procurement materials" },
];

export const portalQuickActions: PortalQuickAction[] = [
  { id: "training", label: "Browse training", href: "/academy" },
  { id: "applications", label: "Explore applications", href: "/apps" },
  { id: "eios", label: "Review EIOS", href: "/eios" },
  { id: "trust", label: "Visit Trust Center", href: "/trust" },
  { id: "billing", label: "Billing assistance", href: "/contact?interest=billing-support" },
];

export function getVisiblePortalModules(enabledFeatures: Set<string> = new Set()) {
  return portalModules.filter((module) => !module.featureFlag || enabledFeatures.has(module.featureFlag));
}
