import "server-only";

import { prepareSupabaseAuthRuntime } from "./runtime-config";

type Jwk = {
  kid?: unknown;
  alg?: unknown;
  kty?: unknown;
  use?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function verifySupabaseJwksKey(
  keyId: string | null,
  algorithm: "ES256" | "RS256" | null,
) {
  const runtime = prepareSupabaseAuthRuntime();
  if (!runtime.ready || !runtime.url || !keyId || !algorithm) return false;

  try {
    const response = await fetch(`${runtime.url}/auth/v1/.well-known/jwks.json`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) return false;
    const body: unknown = await response.json();
    if (!isRecord(body) || !Array.isArray(body.keys)) return false;
    return body.keys.some((candidate: Jwk) =>
      isRecord(candidate)
      && candidate.kid === keyId
      && candidate.alg === algorithm
      && (candidate.use === undefined || candidate.use === "sig")
      && (
        (algorithm === "ES256" && candidate.kty === "EC")
        || (algorithm === "RS256" && candidate.kty === "RSA")
      ),
    );
  } catch {
    return false;
  }
}
