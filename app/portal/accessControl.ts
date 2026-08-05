import type { AuthenticationAssuranceLevel, IdentityJourneyPolicy } from "./identitySecurityPolicy";
import { evaluateZeroTrustAccess } from "./identitySecurityPolicy";

export type PortalRole =
  | "customer_user"
  | "customer_admin"
  | "procurement"
  | "executive"
  | "learner"
  | "support_agent"
  | "platform_admin";

export type PortalPermission =
  | "portal.read"
  | "academy.read"
  | "academy.manage"
  | "billing.read"
  | "billing.manage"
  | "licenses.read"
  | "licenses.manage"
  | "reports.read"
  | "reports.manage"
  | "users.read"
  | "users.manage"
  | "support.create"
  | "support.manage"
  | "tenant.manage";

export type TenantContext = {
  tenantId: string;
  tenantSlug: string;
  region?: string;
  dataResidency?: string;
};

export type AuthenticatedSubject = {
  subjectId: string;
  email?: string;
  roles: PortalRole[];
  permissions: PortalPermission[];
  tenant: TenantContext;
  authenticationAssurance: AuthenticationAssuranceLevel;
  deviceTrusted: boolean;
  sessionIssuedAt: Date;
  riskScore: number;
};

export type ResourceAuthorizationRequest = {
  resource: string;
  action: string;
  requiredPermissions: PortalPermission[];
  policy: IdentityJourneyPolicy;
  subject: AuthenticatedSubject | null;
};

export type ResourceAuthorizationDecision = {
  allow: boolean;
  code:
    | "ALLOW"
    | "UNAUTHENTICATED"
    | "TENANT_CONTEXT_MISSING"
    | "PERMISSION_DENIED"
    | "REAUTHENTICATION_REQUIRED"
    | "ZERO_TRUST_DENIED";
  reason: string;
  requireReauthentication: boolean;
};

export const rolePermissions: Record<PortalRole, PortalPermission[]> = {
  customer_user: ["portal.read", "academy.read", "billing.read", "licenses.read", "reports.read", "support.create"],
  customer_admin: [
    "portal.read",
    "academy.read",
    "academy.manage",
    "billing.read",
    "billing.manage",
    "licenses.read",
    "licenses.manage",
    "reports.read",
    "reports.manage",
    "users.read",
    "users.manage",
    "support.create",
    "tenant.manage",
  ],
  procurement: ["portal.read", "billing.read", "billing.manage", "licenses.read", "licenses.manage", "support.create"],
  executive: ["portal.read", "reports.read", "licenses.read", "support.create"],
  learner: ["portal.read", "academy.read", "support.create"],
  support_agent: ["portal.read", "users.read", "support.manage"],
  platform_admin: [
    "portal.read",
    "academy.read",
    "academy.manage",
    "billing.read",
    "billing.manage",
    "licenses.read",
    "licenses.manage",
    "reports.read",
    "reports.manage",
    "users.read",
    "users.manage",
    "support.create",
    "support.manage",
    "tenant.manage",
  ],
};

export function derivePermissions(roles: PortalRole[]): PortalPermission[] {
  return [...new Set(roles.flatMap((role) => rolePermissions[role]))];
}

export function authorizePortalResource(request: ResourceAuthorizationRequest): ResourceAuthorizationDecision {
  const { subject, requiredPermissions, policy, resource, action } = request;

  if (!subject) {
    return {
      allow: false,
      code: "UNAUTHENTICATED",
      reason: "A verified authenticated subject is required",
      requireReauthentication: false,
    };
  }

  if (!subject.tenant.tenantId) {
    return {
      allow: false,
      code: "TENANT_CONTEXT_MISSING",
      reason: "A verified tenant boundary is required",
      requireReauthentication: false,
    };
  }

  const permissions = new Set([...subject.permissions, ...derivePermissions(subject.roles)]);
  const missingPermission = requiredPermissions.find((permission) => !permissions.has(permission));
  if (missingPermission) {
    return {
      allow: false,
      code: "PERMISSION_DENIED",
      reason: `Missing required permission: ${missingPermission}`,
      requireReauthentication: false,
    };
  }

  const sessionAgeMinutes = Math.max(0, (Date.now() - subject.sessionIssuedAt.getTime()) / 60_000);
  const zeroTrustDecision = evaluateZeroTrustAccess(policy, {
    subjectId: subject.subjectId,
    tenantId: subject.tenant.tenantId,
    roles: subject.roles,
    resource,
    action,
    deviceTrusted: subject.deviceTrusted,
    sessionAgeMinutes,
    authenticationAssurance: subject.authenticationAssurance,
    riskScore: subject.riskScore,
  });

  if (!zeroTrustDecision.allow) {
    return {
      allow: false,
      code: zeroTrustDecision.requireReauthentication ? "REAUTHENTICATION_REQUIRED" : "ZERO_TRUST_DENIED",
      reason: zeroTrustDecision.reason,
      requireReauthentication: zeroTrustDecision.requireReauthentication,
    };
  }

  return {
    allow: true,
    code: "ALLOW",
    reason: "Tenant, permission, assurance, device, session, and risk requirements satisfied",
    requireReauthentication: false,
  };
}
