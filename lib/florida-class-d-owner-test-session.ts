import "server-only";

import { requireFloridaClassDProductionOwnerPrincipal } from "./florida-class-d-production-owner-validation";

const SHA40 = /^[0-9a-f]{40}$/i;

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

export async function requireFloridaClassDOwnerTestPrincipal() {
  try {
    const principal = await requireFloridaClassDProductionOwnerPrincipal();
    return {
      ...principal,
      releaseCommitSha: deployedReleaseSha(),
    } as const;
  } catch (error) {
    if (error instanceof FloridaClassDOwnerTestAuthorizationError) throw error;
    throw new FloridaClassDOwnerTestAuthorizationError(
      "Verified internal owner authority with AAL2 is required for the owner LMS test.",
      403,
      "FDACS_OWNER_TEST_AAL2_REQUIRED",
    );
  }
}
