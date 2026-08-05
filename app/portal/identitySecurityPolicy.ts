import type { SecurityFrameworkId } from "./securityStandards";

export type IdentityAssuranceLevel = "IAL1" | "IAL2" | "IAL3";
export type AuthenticationAssuranceLevel = "AAL1" | "AAL2" | "AAL3";
export type FederationAssuranceLevel = "FAL1" | "FAL2" | "FAL3";
export type PortalRiskTier = "standard" | "elevated" | "high";
export type AuthenticatorClass = "password" | "otp" | "passkey" | "hardware-key" | "certificate";

export type IdentityJourneyPolicy = {
  id: string;
  journey: string;
  riskTier: PortalRiskTier;
  identityAssurance: IdentityAssuranceLevel;
  authenticationAssurance: AuthenticationAssuranceLevel;
  federationAssurance: FederationAssuranceLevel;
  allowedAuthenticators: AuthenticatorClass[];
  phishingResistantRequired: boolean;
  reauthenticationMinutes: number;
  requiredRoles?: string[];
  requiredSignals: Array<"identity" | "tenant" | "role" | "device" | "session" | "resource" | "transaction">;
  frameworks: SecurityFrameworkId[];
};

export type ZeroTrustDecisionContext = {
  subjectId: string;
  tenantId: string;
  roles: string[];
  resource: string;
  action: string;
  deviceTrusted: boolean;
  sessionAgeMinutes: number;
  authenticationAssurance: AuthenticationAssuranceLevel;
  riskScore: number;
};

export type ZeroTrustDecision = {
  allow: boolean;
  reason: string;
  requireReauthentication: boolean;
};

export const identityJourneyPolicies: IdentityJourneyPolicy[] = [
  {
    id: "portal-standard-access",
    journey: "Access customer portal services",
    riskTier: "standard",
    identityAssurance: "IAL1",
    authenticationAssurance: "AAL2",
    federationAssurance: "FAL1",
    allowedAuthenticators: ["passkey", "hardware-key", "certificate", "password", "otp"],
    phishingResistantRequired: false,
    reauthenticationMinutes: 480,
    requiredSignals: ["identity", "tenant", "role", "session", "resource"],
    frameworks: ["nist-800-63-r4", "nist-800-207", "nist-csf-2", "owasp-asvs-5"],
  },
  {
    id: "portal-privileged-administration",
    journey: "Administer users, roles, licensing, or tenant settings",
    riskTier: "high",
    identityAssurance: "IAL2",
    authenticationAssurance: "AAL2",
    federationAssurance: "FAL2",
    allowedAuthenticators: ["passkey", "hardware-key", "certificate"],
    phishingResistantRequired: true,
    reauthenticationMinutes: 30,
    requiredRoles: ["customer_admin"],
    requiredSignals: ["identity", "tenant", "role", "device", "session", "resource", "transaction"],
    frameworks: ["nist-800-63-r4", "nist-800-207", "nist-csf-2", "owasp-asvs-5"],
  },
  {
    id: "portal-payment-administration",
    journey: "Manage billing, subscriptions, invoices, or payment settings",
    riskTier: "high",
    identityAssurance: "IAL2",
    authenticationAssurance: "AAL2",
    federationAssurance: "FAL2",
    allowedAuthenticators: ["passkey", "hardware-key", "certificate"],
    phishingResistantRequired: true,
    reauthenticationMinutes: 15,
    requiredRoles: ["customer_admin", "procurement"],
    requiredSignals: ["identity", "tenant", "role", "device", "session", "resource", "transaction"],
    frameworks: ["nist-800-63-r4", "nist-800-207", "nist-csf-2", "owasp-asvs-5", "pci-dss-4-0-1"],
  },
];

export function evaluateZeroTrustAccess(
  policy: IdentityJourneyPolicy,
  context: ZeroTrustDecisionContext,
): ZeroTrustDecision {
  if (!context.subjectId || !context.tenantId) {
    return { allow: false, reason: "Missing verified subject or tenant context", requireReauthentication: false };
  }

  if (policy.requiredRoles?.length && !policy.requiredRoles.some((role) => context.roles.includes(role))) {
    return { allow: false, reason: "Required role is not present", requireReauthentication: false };
  }

  if (policy.riskTier === "high" && !context.deviceTrusted) {
    return { allow: false, reason: "Trusted device signal is required", requireReauthentication: true };
  }

  if (context.sessionAgeMinutes > policy.reauthenticationMinutes) {
    return { allow: false, reason: "Session exceeds reauthentication threshold", requireReauthentication: true };
  }

  if (policy.authenticationAssurance === "AAL2" && context.authenticationAssurance === "AAL1") {
    return { allow: false, reason: "Authentication assurance is insufficient", requireReauthentication: true };
  }

  if (context.riskScore >= 70) {
    return { allow: false, reason: "Risk score exceeds policy threshold", requireReauthentication: true };
  }

  return { allow: true, reason: "Explicit policy requirements satisfied", requireReauthentication: false };
}
