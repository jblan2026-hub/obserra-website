import "server-only";

import { getInternalOwnerAuthority } from "./auth/authority-repository";

const SHA40 = /^[0-9a-f]{40}$/i;
const ALLOWED_OWNER_TEST_ENVIRONMENTS = new Set(["preview", "production"]);

export class FloridaClassDOwnerTestAuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 503,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDOwnerTestAuthorizationError";
  }
}

function deployedReleaseSha() {
  const value = process.env.VERCEL_GIT_COMMIT_SHA?.trim().toLowerCase() ?? "";
  if (!SHA40.test(value)) {
    throw new FloridaClassDOwnerTestAuthorizationError(
      "Owner LMS test release binding is unavailable.",
      503,
      "FDACS_OWNER_TEST_RELEASE_BINDING_UNAVAILABLE",
    );
  }
  return value;
}

function requireOwnerTestEnvironment() {
  const environment = process.env.VERCEL_ENV?.trim().toLowerCase() ?? "";
  if (!ALLOWED_OWNER_TEST_ENVIRONMENTS.has(environment)) {
    throw new FloridaClassDOwnerTestAuthorizationError(
      "Owner LMS validation is available only on governed Vercel preview or production deployments.",
      503,
      "FDACS_OWNER_TEST_ENVIRONMENT_UNAVAILABLE",
    );
  }
}

export async function requireFloridaClassDOwnerTestPrincipal() {
  requireOwnerTestEnvironment();

  let authority;
  try {
    authority = await getInternalOwnerAuthority();
  } catch {
    throw new FloridaClassDOwnerTestAuthorizationError(
      "Protected owner authority is temporarily unavailable.",
      503,
      "FDACS_OWNER_TEST_AUTHORITY_UNAVAILABLE",
    );
  }

  if (authority.status === "unavailable") {
    throw new FloridaClassDOwnerTestAuthorizationError(
      "Protected owner authority is temporarily unavailable.",
      503,
      "FDACS_OWNER_TEST_AUTHORITY_UNAVAILABLE",
    );
  }

  if (
    authority.status !== "ready" ||
    !authority.identity ||
    !authority.internalIdentityAuthorized ||
    !authority.emailVerified ||
    !authority.protectedReadiness.ready ||
    !authority.identity.roles.includes("owner") ||
    authority.identity.assuranceLevel !== "aal2"
  ) {
    throw new FloridaClassDOwnerTestAuthorizationError(
      "Verified internal owner authority with AAL2 is required for the owner LMS test.",
      403,
      "FDACS_OWNER_TEST_AAL2_REQUIRED",
    );
  }

  return {
    principalId: authority.identity.principalId,
    sessionId: authority.identity.sessionId,
    correlationId: authority.correlationId,
    releaseCommitSha: deployedReleaseSha(),
  } as const;
}
