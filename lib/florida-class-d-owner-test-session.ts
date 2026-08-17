import "server-only";

import { requireFloridaClassDProductionOwnerPrincipal } from "./florida-class-d-production-owner-validation";

const SHA40 = /^[0-9a-f]{40}$/i;

function deployedReleaseSha() {
  const value = process.env.VERCEL_GIT_COMMIT_SHA?.trim().toLowerCase() ?? "";
  if (!SHA40.test(value)) {
    throw new Error("Owner LMS test release binding is unavailable.");
  }
  return value;
}

export async function requireFloridaClassDOwnerTestPrincipal() {
  const principal = await requireFloridaClassDProductionOwnerPrincipal();
  return {
    ...principal,
    releaseCommitSha: deployedReleaseSha(),
  } as const;
}
