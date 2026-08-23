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
type Candidate = Readonly<{ keyVaultSecretName: string; environmentKeys: readonly string[]; generated?: "hmac" }>;

const CANDIDATES: readonly Candidate[] = [
  {
    keyVaultSecretName: "ai-marketplace-release-aws-access-key-id",
    environmentKeys: ["OBSERRA_AI_MARKETPLACE_RELEASE_AWS_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID"],
  },
  {
    keyVaultSecretName: "ai-marketplace-release-aws-secret-access-key",
    environmentKeys: ["OBSERRA_AI_MARKETPLACE_RELEASE_AWS_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY"],
  },
  {
    keyVaultSecretName: "ai-marketplace-release-bucket",
    environmentKeys: ["OBSERRA_AI_MARKETPLACE_RELEASE_BUCKET", "OBSERRA_MARKETPLACE_RELEASE_BUCKET", "AI_MARKETPLACE_RELEASE_BUCKET"],
  },
  {
    keyVaultSecretName: "ai-marketplace-release-kms-key-id",
    environmentKeys: ["OBSERRA_AI_MARKETPLACE_RELEASE_KMS_KEY_ID", "OBSERRA_MARKETPLACE_RELEASE_KMS_KEY_ID"],
  },
  {
    keyVaultSecretName: "ai-marketplace-release-cdn-url",
    environmentKeys: ["OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL"],
  },
  {
    keyVaultSecretName: "ai-marketplace-cloudfront-key-pair-id",
    environmentKeys: ["OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID"],
  },
  {
    keyVaultSecretName: "ai-marketplace-cloudfront-private-key",
    environmentKeys: ["OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY"],
  },
  {
    keyVaultSecretName: "ai-marketplace-v12-release-evidence-hmac-key",
    environmentKeys: ["OBSERRA_AI_MARKETPLACE_V12_RELEASE_EVIDENCE_HMAC_KEY"],
    generated: "hmac",
  },
];

function failure(status: 403 | 503, code: string) {
  return NextResponse.json({ migrated: false, code }, { status, headers: HEADERS });
}

function bearer(request: Request) {
  const value = request.headers.get("authorization") ?? "";
  return value.match(/^Bearer\s+([^\s]+)$/i)?.[1] ?? "";
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

async function createSecret(name: string, value: string, token: string): Promise<VaultState> {
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

function firstValue(keys: readonly string[]) {
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

  try {
    const states: Record<string, VaultState> = {};
    const sources: Record<string, string> = {};
    const missing: string[] = [];

    for (const candidate of CANDIDATES) {
      if (await secretExists(candidate.keyVaultSecretName, vaultToken)) {
        states[candidate.keyVaultSecretName] = "existing";
        sources[candidate.keyVaultSecretName] = "key-vault";
        continue;
      }

      let source = firstValue(candidate.environmentKeys);
      if (!source && candidate.generated === "hmac") {
        source = { key: "generated-first-party-hmac", value: randomBytes(48).toString("base64url") };
      }
      if (!source) {
        missing.push(candidate.keyVaultSecretName);
        continue;
      }

      states[candidate.keyVaultSecretName] = await createSecret(candidate.keyVaultSecretName, source.value, vaultToken);
      sources[candidate.keyVaultSecretName] = source.key;
    }

    return NextResponse.json({
      migrated: missing.length === 0,
      contract: "obserra-marketplace-v12-release-authority-migration-v1",
      states,
      sources,
      missing,
    }, { status: missing.length === 0 ? 200 : 503, headers: HEADERS });
  } catch {
    return failure(503, "key_vault_release_migration_failed");
  }
}
