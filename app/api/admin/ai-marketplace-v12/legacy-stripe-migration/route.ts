import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const AZURE_TENANT_ID = "7d8b7b64-c80c-4c8a-a514-66f6b1cf8607";
const DELIVERY_CLIENT_ID = "b8da232a-713f-4c25-a61e-4fb34d13e229";
const KEY_VAULT_URI = "https://kv-obserra-prod-38d660.vault.azure.net";
const TOKEN_AUDIENCE = "api://AzureADTokenExchange";
const TOKEN_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_PRODUCTION_SUBJECT = "repo:jblan2026-hub@309821056/obserra-website@1321156321:environment:production";
const KEY_VAULT_SCOPE = "https://vault.azure.net/.default";
const KEY_VAULT_API_VERSION = "7.4";

const HEADERS = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow, noarchive" };

type GitHubClaims = Readonly<{ aud?: unknown; exp?: unknown; iss?: unknown; nbf?: unknown; sub?: unknown }>;

type VaultState = "existing" | "created";

function failure(status: 403 | 409 | 503, code: string) {
  return NextResponse.json({ migrated: false, code }, { status, headers: HEADERS });
}

function bearer(request: Request) {
  const value = request.headers.get("authorization") ?? "";
  const match = value.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] ?? "";
}

function decodeClaims(assertion: string): GitHubClaims | null {
  const payload = assertion.split(".")[1];
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as GitHubClaims;
  } catch {
    return null;
  }
}

function validGitHubAssertion(assertion: string) {
  if (assertion.length < 128 || assertion.length > 16_384) return false;
  const claims = decodeClaims(assertion);
  const now = Math.floor(Date.now() / 1000);
  return Boolean(
    claims
    && claims.iss === TOKEN_ISSUER
    && claims.sub === GITHUB_PRODUCTION_SUBJECT
    && claims.aud === TOKEN_AUDIENCE
    && typeof claims.exp === "number"
    && claims.exp > now + 30
    && (typeof claims.nbf !== "number" || claims.nbf <= now + 30)
  );
}

async function exchangeForVaultToken(assertion: string) {
  const body = new URLSearchParams({
    client_id: DELIVERY_CLIENT_ID,
    scope: KEY_VAULT_SCOPE,
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: assertion,
  });
  const response = await fetch(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!response?.ok) return null;
  const payload = await response.json().catch(() => null) as { access_token?: unknown } | null;
  return typeof payload?.access_token === "string" && payload.access_token.length > 100 ? payload.access_token : null;
}

async function secretExists(name: string, token: string) {
  const response = await fetch(`${KEY_VAULT_URI}/secrets/${encodeURIComponent(name)}?api-version=${KEY_VAULT_API_VERSION}`, {
    cache: "no-store",
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!response) throw new Error("vault_transport");
  if (response.status === 404) return false;
  if (!response.ok) throw new Error("vault_read");
  return true;
}

async function createMissingSecret(name: string, value: string, token: string): Promise<VaultState> {
  if (await secretExists(name, token)) return "existing";
  const response = await fetch(`${KEY_VAULT_URI}/secrets/${encodeURIComponent(name)}?api-version=${KEY_VAULT_API_VERSION}`, {
    method: "PUT",
    cache: "no-store",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ value, attributes: { enabled: true } }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);
  if (!response?.ok) throw new Error("vault_write");
  return "created";
}

function firstValue(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim() ?? "";
    if (value) return { key, value };
  }
  return null;
}

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== "production") return failure(403, "production_only");
  const assertion = bearer(request);
  if (!validGitHubAssertion(assertion)) return failure(403, "github_oidc_required");
  const vaultToken = await exchangeForVaultToken(assertion);
  if (!vaultToken) return failure(403, "azure_federation_rejected");

  const supabase = firstValue("OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY");
  const stripe = firstValue("APPLICATIONS_STRIPE_SECRET_KEY", "STRIPE_SECRET_KEY");
  const hash = firstValue("OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET") ?? {
    key: "generated-first-party-hmac",
    value: randomBytes(48).toString("base64url"),
  };

  if (!supabase || supabase.value.length < 32 || /\s/.test(supabase.value)) return failure(503, "legacy_supabase_authority_unavailable");
  if (!stripe || !/^(?:sk|rk)_live_[A-Za-z0-9_]+$/.test(stripe.value)) return failure(503, "legacy_live_stripe_authority_unavailable");
  if (hash.value.length < 32 || /\s/.test(hash.value)) return failure(503, "commerce_hash_authority_invalid");

  try {
    const states = {
      supabase: await createMissingSecret("applications-supabase-service-role-key", supabase.value, vaultToken),
      commerceHash: await createMissingSecret("applications-commerce-hash-secret", hash.value, vaultToken),
      stripe: await createMissingSecret("applications-stripe-secret-key", stripe.value, vaultToken),
    };
    return NextResponse.json({
      migrated: true,
      contract: "obserra-marketplace-v12-legacy-authority-migration-v1",
      states,
      sources: {
        supabase: supabase.key,
        commerceHash: hash.key,
        stripe: stripe.key,
      },
      webhookSecretMigrated: false,
    }, { headers: HEADERS });
  } catch {
    return failure(503, "key_vault_migration_failed");
  }
}
