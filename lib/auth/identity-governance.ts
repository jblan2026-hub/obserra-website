export type GovernedIdentityLink = {
  provider: string;
  providerSubject: string;
  principalId: string;
  status: "active" | "deprovisioned";
  version: number;
};

export type ClaimedIdentityLink = {
  provider: string;
  providerSubject: string;
  claimedPrincipalId: string;
};

type IdentityLinkMutation = {
  existingLink: GovernedIdentityLink | null;
  candidateLink: GovernedIdentityLink;
  providerPrincipalBoundToSubject: string | null;
};

type RoleAuthorization = {
  claimedRoles: readonly string[];
  claimedRoleVersion: number | null;
  authoritativeRoles: readonly string[];
  authoritativeRoleVersion: number | null;
  subjectStatus: "active" | "deprovisioned";
  linkStatus: "active" | "deprovisioned";
  sessionStatus: "active" | "revoked";
  requiredRoles: readonly string[];
};

type InternalOwnerAuthorization = {
  roles: readonly string[];
  emailVerified: boolean;
  internalIdentityAuthorized: boolean;
  assuranceLevel: "aal1" | "aal2" | null;
  protectedAuthorityReady: boolean;
  previewEnvironment: boolean;
  productionOwnerReviewAuthorized?: boolean;
  productionAuthEnabled: boolean;
};

export type AuthorizationAuditInput = {
  provider: string;
  principalId: string;
  sessionId: string | null;
  roleVersion: number | null;
  decision: "authorized" | "denied";
  reason: string;
  correlationId: string;
};

export function resolveGovernedPrincipal(
  claim: ClaimedIdentityLink,
  durableLink: GovernedIdentityLink | null,
) {
  if (
    !durableLink ||
    durableLink.status !== "active" ||
    durableLink.provider !== claim.provider ||
    durableLink.providerSubject !== claim.providerSubject ||
    durableLink.principalId !== claim.claimedPrincipalId
  ) {
    return null;
  }
  return durableLink.principalId;
}

export function evaluateIdentityLinkMutation(input: IdentityLinkMutation) {
  const { existingLink, candidateLink, providerPrincipalBoundToSubject } = input;
  if (existingLink) {
    const unchanged =
      existingLink.provider === candidateLink.provider &&
      existingLink.providerSubject === candidateLink.providerSubject &&
      existingLink.principalId === candidateLink.principalId &&
      existingLink.status === candidateLink.status &&
      existingLink.version === candidateLink.version;
    return unchanged
      ? { allowed: true, reason: "identity_link_unchanged" as const }
      : { allowed: false, reason: "identity_link_immutable" as const };
  }

  if (
    providerPrincipalBoundToSubject &&
    providerPrincipalBoundToSubject !== candidateLink.providerSubject
  ) {
    return { allowed: false, reason: "identity_link_not_unique" as const };
  }
  return { allowed: true, reason: "identity_link_create" as const };
}

export function evaluateRoleAuthorization(input: RoleAuthorization) {
  if (input.subjectStatus !== "active") {
    return { authorized: false, reason: "subject_deprovisioned" as const };
  }
  if (input.linkStatus !== "active") {
    return { authorized: false, reason: "identity_link_inactive" as const };
  }
  if (input.sessionStatus !== "active") {
    return { authorized: false, reason: "session_revoked" as const };
  }
  if (
    !Number.isSafeInteger(input.claimedRoleVersion) ||
    !Number.isSafeInteger(input.authoritativeRoleVersion) ||
    input.claimedRoleVersion !== input.authoritativeRoleVersion
  ) {
    return { authorized: false, reason: "role_stale" as const };
  }

  const claimedRoles = new Set(input.claimedRoles);
  const authoritativeRoles = new Set(input.authoritativeRoles);
  const granted = input.requiredRoles.some(
    (role) => claimedRoles.has(role) && authoritativeRoles.has(role),
  );
  return granted
    ? { authorized: true, reason: "role_authorized" as const }
    : { authorized: false, reason: "role_not_granted" as const };
}

export function evaluateInternalOwnerAuthorization(input: InternalOwnerAuthorization) {
  if (input.productionAuthEnabled) {
    return { authorized: false, reason: "production_auth_prohibited" as const };
  }
  if (!input.previewEnvironment && !input.productionOwnerReviewAuthorized) {
    return { authorized: false, reason: "internal_uat_environment_invalid" as const };
  }
  if (!input.roles.includes("owner")) {
    return { authorized: false, reason: "owner_role_required" as const };
  }
  if (!input.emailVerified) {
    return { authorized: false, reason: "verified_email_required" as const };
  }
  if (!input.internalIdentityAuthorized) {
    return { authorized: false, reason: "internal_identity_unverified" as const };
  }
  if (input.assuranceLevel !== "aal2") {
    return { authorized: false, reason: "aal2_required" as const };
  }
  if (!input.protectedAuthorityReady) {
    return { authorized: false, reason: "fresh_authority_unavailable" as const };
  }
  return { authorized: true, reason: "internal_owner_authorized" as const };
}

export function authorizationAuditRecord(input: AuthorizationAuditInput) {
  return {
    provider: input.provider,
    principalId: input.principalId,
    sessionId: input.sessionId,
    roleVersion: input.roleVersion,
    decision: input.decision,
    reason: input.reason,
    correlationId: input.correlationId,
  };
}
