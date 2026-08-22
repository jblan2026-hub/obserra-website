export type LicenseType = "individual" | "professional" | "team" | "enterprise" | "government" | "education" | "trial" | "evaluation" | "internal";
export type LicenseStatus = "pending" | "active" | "suspended" | "expired" | "revoked";
export type EntitlementEffect = "allow" | "deny";

export type ProductEntitlementDefinition = {
  id: string;
  productSlug: string;
  name: string;
  description: string;
  effect: EntitlementEffect;
  resource: string;
  action: string;
  requiredPlans?: string[];
  requiredDeploymentModels?: string[];
};

export type LicenseRecord = {
  id: string;
  tenantId: string;
  productSlug: string;
  licenseType: LicenseType;
  status: LicenseStatus;
  seatsPurchased: number;
  seatsAssigned: number;
  startsAt: string;
  expiresAt?: string;
  renewalAt?: string;
  supportLevel?: string;
  deploymentModel?: string;
  maintenanceActive: boolean;
  source: "applications-commerce-ledger" | "stripe" | "contract" | "manual" | "trial";
  externalReference?: string;
};

export type SeatAssignment = {
  id: string;
  licenseId: string;
  tenantId: string;
  subjectId: string;
  assignedAt: string;
  assignedBy: string;
  status: "active" | "released";
};

export type EntitlementDecision = {
  allowed: boolean;
  reason: string;
  entitlementId: string;
  productSlug: string;
  licenseId?: string;
  evaluatedAt: string;
};

export const productEntitlementRegistry: ProductEntitlementDefinition[] = [
  {
    id: "eios.launch",
    productSlug: "obserra-eios",
    name: "Launch Obserra EIOS",
    description: "Permits an assigned user to launch the Obserra EIOS SaaS application.",
    effect: "allow",
    resource: "application:obserra-eios",
    action: "launch",
    requiredPlans: ["professional", "team", "enterprise", "government", "trial"],
    requiredDeploymentModels: ["SaaS", "Private Cloud", "Hybrid"],
  },
  {
    id: "eios.download",
    productSlug: "obserra-eios",
    name: "Download approved EIOS release",
    description: "Permits secure download of an approved EIOS release when the deployment model supports customer-hosted delivery.",
    effect: "allow",
    resource: "release:obserra-eios",
    action: "download",
    requiredPlans: ["enterprise", "government"],
    requiredDeploymentModels: ["Private Cloud", "Hybrid", "On-Premises"],
  },
];

export function seatsAvailable(license: Pick<LicenseRecord, "seatsPurchased" | "seatsAssigned">) {
  return Math.max(0, license.seatsPurchased - license.seatsAssigned);
}

export function validateLicenseRecord(license: LicenseRecord): string[] {
  const errors: string[] = [];
  if (!license.id.trim()) errors.push("License ID is required");
  if (!license.tenantId.trim()) errors.push("Tenant ID is required");
  if (!license.productSlug.trim()) errors.push("Product slug is required");
  if (license.seatsPurchased < 1) errors.push("At least one purchased seat is required");
  if (license.seatsAssigned < 0) errors.push("Assigned seats cannot be negative");
  if (license.seatsAssigned > license.seatsPurchased) errors.push("Assigned seats cannot exceed purchased seats");
  return errors;
}

export function evaluateEntitlement(input: {
  entitlement: ProductEntitlementDefinition;
  license?: LicenseRecord;
  plan?: string;
  deploymentModel?: string;
}): EntitlementDecision {
  const evaluatedAt = new Date().toISOString();
  const { entitlement, license, plan, deploymentModel } = input;
  if (!license) return { allowed: false, reason: "No license record", entitlementId: entitlement.id, productSlug: entitlement.productSlug, evaluatedAt };
  if (license.status !== "active") return { allowed: false, reason: `License is ${license.status}`, entitlementId: entitlement.id, productSlug: entitlement.productSlug, licenseId: license.id, evaluatedAt };
  if (license.expiresAt && new Date(license.expiresAt).getTime() <= Date.now()) return { allowed: false, reason: "License has expired", entitlementId: entitlement.id, productSlug: entitlement.productSlug, licenseId: license.id, evaluatedAt };
  if (entitlement.requiredPlans?.length && (!plan || !entitlement.requiredPlans.includes(plan))) return { allowed: false, reason: "Plan does not satisfy entitlement policy", entitlementId: entitlement.id, productSlug: entitlement.productSlug, licenseId: license.id, evaluatedAt };
  if (entitlement.requiredDeploymentModels?.length && (!deploymentModel || !entitlement.requiredDeploymentModels.includes(deploymentModel))) return { allowed: false, reason: "Deployment model does not satisfy entitlement policy", entitlementId: entitlement.id, productSlug: entitlement.productSlug, licenseId: license.id, evaluatedAt };
  return { allowed: entitlement.effect === "allow", reason: entitlement.effect === "allow" ? "Entitlement policy satisfied" : "Explicit deny policy", entitlementId: entitlement.id, productSlug: entitlement.productSlug, licenseId: license.id, evaluatedAt };
}
