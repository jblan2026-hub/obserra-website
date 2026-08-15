import "server-only";

import { getInternalOwnerAuthority } from "./auth/authority-repository";
import { getFloridaClassDOwnerPreviewReport } from "./florida-class-d-owner-preview";

export class FloridaClassDOwnerPreviewAuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 | 503,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDOwnerPreviewAuthorizationError";
  }
}

export async function requireFloridaClassDOwnerPreviewPrincipal() {
  const report = getFloridaClassDOwnerPreviewReport();
  if (!report.authorized || !report.releaseCommitSha || !report.expiresAt) {
    throw new FloridaClassDOwnerPreviewAuthorizationError(
      "Internal owner review is not authorized for this exact release.",
      503,
      "FDACS_OWNER_PREVIEW_NOT_AUTHORIZED",
    );
  }

  const authority = await getInternalOwnerAuthority();
  if (authority.status === "signed_out") {
    throw new FloridaClassDOwnerPreviewAuthorizationError(
      "Sign in is required.",
      401,
      "FDACS_OWNER_PREVIEW_SIGN_IN_REQUIRED",
    );
  }
  if (authority.status === "unavailable" || !authority.identity) {
    throw new FloridaClassDOwnerPreviewAuthorizationError(
      "Protected owner authority is unavailable.",
      503,
      "FDACS_OWNER_PREVIEW_AUTHORITY_UNAVAILABLE",
    );
  }

  const ownerRole = authority.identity.roles.includes("owner");
  const aal2 = authority.identity.assuranceLevel === "aal2";
  if (
    authority.status !== "ready"
    || !authority.internalIdentityAuthorized
    || !authority.emailVerified
    || !authority.protectedReadiness.ready
    || !ownerRole
    || !aal2
  ) {
    throw new FloridaClassDOwnerPreviewAuthorizationError(
      "Verified internal owner authority and AAL2 are required.",
      403,
      "FDACS_OWNER_PREVIEW_OWNER_AUTHORITY_REQUIRED",
    );
  }

  return {
    principalId: authority.identity.principalId,
    sessionId: authority.identity.sessionId,
    correlationId: authority.correlationId,
    role: "internal_owner" as const,
    assuranceLevel: "aal2" as const,
    releaseCommitSha: report.releaseCommitSha,
    expiresAt: report.expiresAt,
  };
}
