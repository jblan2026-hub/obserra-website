import "server-only";

import {
  identityFromVerifiedClaims,
  isMissingSupabaseAuthSession,
  type VerifiedSupabaseIdentity,
} from "./claims";
import { prepareSupabaseAuthRuntime, type SupabaseAuthRuntimeReason } from "./runtime-config";
import { createSupabaseServerClient } from "../supabase/server";

export type SafeSupabaseIdentity = {
  configured: boolean;
  authenticated: boolean;
  identity: VerifiedSupabaseIdentity | null;
  jwksVerified: boolean;
  jwtKeyId: string | null;
  jwtAlgorithm: "ES256" | "RS256" | null;
  reasonCodes: SupabaseAuthRuntimeReason[];
  status: "ready" | "configuration_unavailable" | "claims_unavailable" | "signed_out" | "claims_invalid";
};

export class SupabaseAuthenticationError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 503,
  ) {
    super(message);
    this.name = "SupabaseAuthenticationError";
  }
}

export async function safeSupabaseIdentity(): Promise<SafeSupabaseIdentity> {
  const runtime = prepareSupabaseAuthRuntime();
  if (!runtime.ready) {
    return {
      configured: false,
      authenticated: false,
      identity: null,
      jwksVerified: false,
      jwtKeyId: null,
      jwtAlgorithm: null,
      reasonCodes: runtime.reasonCodes,
      status: "configuration_unavailable",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error) {
      return {
        configured: true,
        authenticated: false,
        identity: null,
        jwksVerified: false,
        jwtKeyId: null,
        jwtAlgorithm: null,
        reasonCodes: [],
        status: isMissingSupabaseAuthSession(error) ? "signed_out" : "claims_unavailable",
      };
    }

    if (!data?.claims) {
      return {
        configured: true,
        authenticated: false,
        identity: null,
        jwksVerified: false,
        jwtKeyId: null,
        jwtAlgorithm: null,
        reasonCodes: [],
        status: "signed_out",
      };
    }

    const identity = identityFromVerifiedClaims(data.claims);
    // getClaims verifies the JWT, but its return shape does not prove whether
    // verification used JWKS or the server fallback. Keep the stricter JWKS
    // readiness signal false until an explicit asymmetric-key preflight exists.
    const jwksVerified = false;
    const headerAlgorithm: unknown = data.header.alg;
    const jwtAlgorithm: "ES256" | "RS256" | null = headerAlgorithm === "ES256" || headerAlgorithm === "RS256"
      ? headerAlgorithm
      : null;
    const jwtKeyId = typeof data.header.kid === "string"
      && /^[A-Za-z0-9_.:-]{1,200}$/.test(data.header.kid)
      ? data.header.kid
      : null;
    return identity
      ? {
          configured: true,
          authenticated: true,
          identity,
          jwksVerified,
          jwtKeyId,
          jwtAlgorithm,
          reasonCodes: [],
          status: "ready",
        }
      : {
          configured: true,
          authenticated: false,
          identity: null,
          jwksVerified: false,
          jwtKeyId: null,
          jwtAlgorithm: null,
          reasonCodes: [],
          status: "claims_invalid",
        };
  } catch (error) {
    return {
      configured: true,
      authenticated: false,
      identity: null,
      jwksVerified: false,
      jwtKeyId: null,
      jwtAlgorithm: null,
      reasonCodes: [],
      status: isMissingSupabaseAuthSession(error) ? "signed_out" : "claims_unavailable",
    };
  }
}

export async function requireSupabaseIdentity() {
  const result = await safeSupabaseIdentity();
  if (result.identity) return result.identity;
  if (!result.configured || result.status === "claims_unavailable") {
    throw new SupabaseAuthenticationError("Identity service is unavailable.", 503);
  }
  throw new SupabaseAuthenticationError("Sign in is required.", 401);
}
