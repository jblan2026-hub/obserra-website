import "server-only";

import type { VerifiedSupabaseIdentity } from "./auth/claims";
import {
  safeSupabaseIdentity,
  SupabaseAuthenticationError,
  type SafeSupabaseIdentity,
} from "./auth/identity";
import { prepareSupabaseAuthRuntime } from "./auth/runtime-config";
import { ACADEMY_BRAND_NAME } from "./legal-identity";

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export type SafeAcademyIdentity = {
  configured: boolean;
  authenticated: boolean;
  identity: VerifiedSupabaseIdentity | null;
  principalId: string | null;
  email: string | null;
  emailVerified: boolean;
  status: SafeSupabaseIdentity["status"];
};

export function academyIdentityRuntimeReady(environment: RuntimeEnvironment = process.env) {
  const runtime = prepareSupabaseAuthRuntime(environment);
  return runtime.runtimeEnabled && runtime.ready;
}

export function academyIdentityEnvironment(environment: RuntimeEnvironment = process.env) {
  if (!academyIdentityRuntimeReady(environment)) return "unavailable" as const;
  return environment.VERCEL_ENV?.trim().toLowerCase() === "production"
    ? "live" as const
    : "nonproduction" as const;
}

export async function safeAcademyIdentity(): Promise<SafeAcademyIdentity> {
  const result = await safeSupabaseIdentity();
  return {
    configured: result.configured,
    authenticated: result.authenticated,
    identity: result.identity,
    principalId: result.identity?.principalId ?? null,
    email: result.identity?.email ?? null,
    emailVerified: result.identity?.emailVerified === true,
    status: result.status,
  };
}

export async function requireAcademyIdentity() {
  const result = await safeAcademyIdentity();
  if (result.identity) return result.identity;
  if (!result.configured || result.status === "claims_unavailable") {
    throw new SupabaseAuthenticationError("Academy identity service is unavailable.", 503);
  }
  throw new SupabaseAuthenticationError("Sign in is required.", 401);
}

export function academyLearnerDisplayName(identity: VerifiedSupabaseIdentity) {
  const displayName = identity.displayName?.trim();
  if (displayName) return displayName;
  if (identity.emailVerified && identity.email) return identity.email;
  return `${ACADEMY_BRAND_NAME} Learner`;
}
