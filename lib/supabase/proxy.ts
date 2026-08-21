import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMissingSupabaseAuthSession } from "../auth/claims";
import { supabaseAuthCookieOptions } from "../auth/cookie-contract";
import { prepareSupabaseAuthRuntime, type SupabaseAuthRuntimeReason } from "../auth/runtime-config";
import { isProductionRuntime } from "../runtime-environment";

export type SupabaseAuthProxyResult = {
  configured: boolean;
  claims: unknown | null;
  jwtKeyId: string | null;
  jwtAlgorithm: "ES256" | "RS256" | null;
  queryCurrentAuthority: ((correlationId: string) => Promise<{ data: unknown; error: unknown }>) | null;
  response: NextResponse;
  reasonCodes: SupabaseAuthRuntimeReason[];
  claimsUnavailable: boolean;
};

export async function updateSupabaseAuthSession(
  request: NextRequest,
): Promise<SupabaseAuthProxyResult> {
  const runtime = prepareSupabaseAuthRuntime();
  let supabaseResponse = NextResponse.next({ request });

  if (!runtime.ready || !runtime.url || !runtime.projectRef || !runtime.publishableKey) {
    return {
      configured: false,
      claims: null,
      jwtKeyId: null,
      jwtAlgorithm: null,
      queryCurrentAuthority: null,
      response: supabaseResponse,
      reasonCodes: runtime.reasonCodes,
      claimsUnavailable: false,
    };
  }

  const supabase = createServerClient(runtime.url, runtime.publishableKey, {
    cookieOptions: supabaseAuthCookieOptions({
      projectRef: runtime.projectRef,
      production: isProductionRuntime(),
    }),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  try {
    const { data, error } = await supabase.auth.getClaims();
    const headerAlgorithm: unknown = data?.header.alg;
    const jwtAlgorithm: "ES256" | "RS256" | null = headerAlgorithm === "ES256" || headerAlgorithm === "RS256"
      ? headerAlgorithm
      : null;
    const jwtKeyId = typeof data?.header.kid === "string"
      && /^[A-Za-z0-9_.:-]{1,200}$/.test(data.header.kid)
      ? data.header.kid
      : null;
    return {
      configured: true,
      claims: error ? null : data?.claims ?? null,
      jwtKeyId: error ? null : jwtKeyId,
      jwtAlgorithm: error ? null : jwtAlgorithm,
      queryCurrentAuthority: async (correlationId) => {
        const result = await supabase.rpc("obserra_current_identity_authority", {
          p_correlation_id: correlationId,
        });
        return { data: result.data, error: result.error };
      },
      response: supabaseResponse,
      reasonCodes: [],
      claimsUnavailable: Boolean(error && !isMissingSupabaseAuthSession(error)),
    };
  } catch (error) {
    return {
      configured: true,
      claims: null,
      jwtKeyId: null,
      jwtAlgorithm: null,
      queryCurrentAuthority: null,
      response: supabaseResponse,
      reasonCodes: [],
      claimsUnavailable: !isMissingSupabaseAuthSession(error),
    };
  }
}
