import "server-only";

import { randomUUID } from "node:crypto";
import { getVercelOidcToken } from "@vercel/oidc";

const KEY_VAULT_URI = "https://kv-obserra-prod-38d660.vault.azure.net";
const AZURE_TOKEN_AUDIENCE = "api://AzureADTokenExchange";
const ACADEMY_GATEWAY_AUDIENCE = "https://vercel.com/obserra";
const AZURE_KEY_VAULT_SCOPE = "https://vault.azure.net/.default";
const VERCEL_OIDC_ISSUER = "https://oidc.vercel.com/obserra";
const VERCEL_PRODUCTION_SUBJECT = "owner:obserra:project:obserra-website-live:environment:production";
const KEY_VAULT_API_VERSION = "7.4";
const CACHE_MS = 5 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Changes to this boundary intentionally invoke the governed production bootstrap,
// which converges the Vercel workload identity and runtime bindings without
// persisting secret values in the repository.

type Binding = Readonly<{
  environmentKey: string;
  keyVaultSecretName: string;
}>;

const APPLICATION_BINDINGS: readonly Binding[] = [
  {
    environmentKey: "OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY",
    keyVaultSecretName: "applications-supabase-service-role-key",
  },
  {
    environmentKey: "OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET",
    keyVaultSecretName: "applications-commerce-hash-secret",
  },
  {
    environmentKey: "APPLICATIONS_STRIPE_SECRET_KEY",
    keyVaultSecretName: "applications-stripe-secret-key",
  },
  {
    environmentKey: "APPLICATIONS_STRIPE_WEBHOOK_SECRET",
    keyVaultSecretName: "applications-stripe-webhook-secret",
  },
  {
    environmentKey: "OBSERRA_APPLICATIONS_PRICE_CATALOG_JSON",
    keyVaultSecretName: "applications-stripe-price-catalog-json",
  },
];

const MARKETPLACE_V12_COMMERCE_BINDINGS: readonly Binding[] = [
  {
    environmentKey: "OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY",
    keyVaultSecretName: "applications-supabase-service-role-key",
  },
  // v1.2 reservations and durable binding evidence independently HMAC the
  // immutable purchase identity. This is commerce-critical, unlike the legacy
  // Applications price-catalog JSON, so it belongs in the isolated scope.
  {
    environmentKey: "OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET",
    keyVaultSecretName: "applications-commerce-hash-secret",
  },
  {
    environmentKey: "APPLICATIONS_STRIPE_SECRET_KEY",
    keyVaultSecretName: "applications-stripe-secret-key",
  },
  {
    environmentKey: "APPLICATIONS_STRIPE_WEBHOOK_SECRET",
    keyVaultSecretName: "applications-stripe-webhook-secret",
  },
];

const MARKETPLACE_V12_BINDINGS: readonly Binding[] = [
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON",
    keyVaultSecretName: "ai-marketplace-v12-binding-receipt-json",
  },
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON",
    keyVaultSecretName: "ai-marketplace-v12-delivery-catalog-json",
  },
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_V12_RELEASE_EVIDENCE_JSON",
    keyVaultSecretName: "ai-marketplace-v12-release-evidence-json",
  },
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_V12_RELEASE_EVIDENCE_SIGNATURE",
    keyVaultSecretName: "ai-marketplace-v12-release-evidence-signature",
  },
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_V12_RELEASE_EVIDENCE_HMAC_KEY",
    keyVaultSecretName: "ai-marketplace-v12-release-evidence-hmac-key",
  },
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_V12_ACTIVATION_APPROVED_REVISION",
    keyVaultSecretName: "ai-marketplace-v12-activation-approved-revision",
  },
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL",
    keyVaultSecretName: "ai-marketplace-release-cdn-url",
  },
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID",
    keyVaultSecretName: "ai-marketplace-cloudfront-key-pair-id",
  },
  {
    environmentKey: "OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY",
    keyVaultSecretName: "ai-marketplace-cloudfront-private-key",
  },
];

const ACADEMY_BINDINGS: readonly Binding[] = [
  {
    environmentKey: "ACADEMY_STRIPE_SECRET_KEY",
    keyVaultSecretName: "academy-stripe-secret-key",
  },
  {
    environmentKey: "ACADEMY_STRIPE_WEBHOOK_SECRET",
    keyVaultSecretName: "academy-stripe-webhook-secret",
  },
  {
    environmentKey: "OBSERRA_ACADEMY_EMAIL_HASH_SECRET",
    keyVaultSecretName: "academy-email-hash-secret",
  },
];

export type ProductionRuntimeSecretsStage = "identity-configuration" | "vercel-oidc" | "azure-token" | "key-vault" | "environment";
export type ProductionRuntimeSecretsFailureCode =
  | "AZURE_IDENTITY_CONFIGURATION_INVALID"
  | "VERCEL_OIDC_UNAVAILABLE"
  | "VERCEL_OIDC_ASSERTION_INVALID"
  | "AZURE_TOKEN_TRANSPORT_FAILURE"
  | "AZURE_TOKEN_EXCHANGE_REJECTED"
  | "AZURE_TOKEN_INVALID_RESPONSE"
  | "KEY_VAULT_TRANSPORT_FAILURE"
  | "KEY_VAULT_AUTHENTICATION_REJECTED"
  | "KEY_VAULT_AUTHORIZATION_REJECTED"
  | "KEY_VAULT_SECRET_UNAVAILABLE"
  | "KEY_VAULT_RATE_LIMITED"
  | "KEY_VAULT_INVALID_RESPONSE"
  | "KEY_VAULT_UPSTREAM_FAILURE"
  | "RUNTIME_ENVIRONMENT_WRITE_FAILED"
  | "UNEXPECTED_RUNTIME_FAILURE";

export type ProductionRuntimeSecretsEvidence = Readonly<
  | { required: false; state: "not-required"; stage: "environment"; bindingCount: 0 }
  | { required: true; state: "ready"; stage: "environment"; bindingCount: number }
  | { required: true; state: "failed"; stage: ProductionRuntimeSecretsStage; code: ProductionRuntimeSecretsFailureCode; retryable: boolean; bindingCount: 0 }
>;

export class ProductionRuntimeSecretsError extends Error {
  constructor(
    readonly stage: ProductionRuntimeSecretsStage = "environment",
    readonly code: ProductionRuntimeSecretsFailureCode = "UNEXPECTED_RUNTIME_FAILURE",
    readonly retryable = true,
  ) {
    super("Production runtime secrets are unavailable.");
    this.name = "ProductionRuntimeSecretsError";
  }
}

type CacheEntry = Readonly<{
  value: string;
  expiresAt: number;
}>;

const secretCache = new Map<string, CacheEntry>();
const hydrationPromises = new Map<"applications" | "academy" | "marketplace-v12", Promise<ProductionRuntimeSecretsEvidence>>();
let azureAccessToken: CacheEntry | null = null;

function vercelProductionRuntime() {
  return process.env.VERCEL_ENV === "production";
}

function requiredAzureIdentifier(environmentKey: string) {
  const value = process.env[environmentKey]?.trim() ?? "";
  if (!UUID.test(value)) throw new ProductionRuntimeSecretsError("identity-configuration", "AZURE_IDENTITY_CONFIGURATION_INVALID", false);
  return value;
}

export function productionRuntimeSecretsEvidence(error: unknown): ProductionRuntimeSecretsEvidence {
  if (error instanceof ProductionRuntimeSecretsError) {
    return { required: true, state: "failed", stage: error.stage, code: error.code, retryable: error.retryable, bindingCount: 0 };
  }
  return { required: true, state: "failed", stage: "environment", code: "UNEXPECTED_RUNTIME_FAILURE", retryable: true, bindingCount: 0 };
}

function cachedValue(cache: CacheEntry | null | undefined) {
  return cache && cache.expiresAt > Date.now() ? cache.value : null;
}

type VercelOidcClaims = Readonly<{
  aud?: unknown;
  exp?: unknown;
  iss?: unknown;
  nbf?: unknown;
  sub?: unknown;
}>;

function decodeVercelOidcClaims(assertion: string): VercelOidcClaims | null {
  const encodedPayload = assertion.split(".")[1];
  if (!encodedPayload) return null;
  try {
    return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as VercelOidcClaims;
  } catch {
    return null;
  }
}

async function vercelOidcAssertion(audience: string) {
  let assertion: string;
  try {
    assertion = await getVercelOidcToken({
      audience,
      expirationBufferMs: 30_000,
      jti: randomUUID(),
      skipCache: true,
    });
  } catch {
    throw new ProductionRuntimeSecretsError("vercel-oidc", "VERCEL_OIDC_UNAVAILABLE", true);
  }

  const claims = decodeVercelOidcClaims(assertion);
  const now = Math.floor(Date.now() / 1000);
  if (
    assertion.length < 128
    || claims?.aud !== audience
    || claims.iss !== VERCEL_OIDC_ISSUER
    || claims.sub !== VERCEL_PRODUCTION_SUBJECT
    || typeof claims.exp !== "number"
    || claims.exp <= now + 30
    || (typeof claims.nbf === "number" && claims.nbf > now + 30)
  ) {
    throw new ProductionRuntimeSecretsError("vercel-oidc", "VERCEL_OIDC_ASSERTION_INVALID", false);
  }
  return assertion;
}

async function azureKeyVaultAccessToken() {
  const cached = cachedValue(azureAccessToken);
  if (cached) return cached;

  const tenantId = requiredAzureIdentifier("OBSERRA_KEY_VAULT_TENANT_ID");
  const clientId = requiredAzureIdentifier("OBSERRA_KEY_VAULT_CLIENT_ID");
  const assertion = await vercelOidcAssertion(AZURE_TOKEN_AUDIENCE);

  const body = new URLSearchParams({
    client_id: clientId,
    scope: AZURE_KEY_VAULT_SCOPE,
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: assertion,
  });
  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(10_000),
  }).catch(() => {
    throw new ProductionRuntimeSecretsError("azure-token", "AZURE_TOKEN_TRANSPORT_FAILURE", true);
  });
  if (!response.ok) {
    throw new ProductionRuntimeSecretsError(
      "azure-token",
      "AZURE_TOKEN_EXCHANGE_REJECTED",
      response.status === 429 || response.status >= 500,
    );
  }

  const payload = await response.json().catch(() => null) as { access_token?: unknown; expires_in?: unknown } | null;
  const value = typeof payload?.access_token === "string" ? payload.access_token : "";
  const expiresIn = Number(payload?.expires_in);
  if (!value || !Number.isFinite(expiresIn) || expiresIn < 60) {
    throw new ProductionRuntimeSecretsError("azure-token", "AZURE_TOKEN_INVALID_RESPONSE", false);
  }

  azureAccessToken = {
    value,
    expiresAt: Date.now() + Math.max(30_000, (expiresIn - 60) * 1000),
  };
  return value;
}

async function keyVaultSecret(binding: Binding, accessToken: string) {
  const cached = cachedValue(secretCache.get(binding.keyVaultSecretName));
  if (cached) return cached;

  const response = await fetch(
    `${KEY_VAULT_URI}/secrets/${encodeURIComponent(binding.keyVaultSecretName)}?api-version=${KEY_VAULT_API_VERSION}`,
    {
      cache: "no-store",
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    },
  ).catch(() => {
    throw new ProductionRuntimeSecretsError("key-vault", "KEY_VAULT_TRANSPORT_FAILURE", true);
  });
  if (!response.ok) {
    if (response.status === 401) throw new ProductionRuntimeSecretsError("key-vault", "KEY_VAULT_AUTHENTICATION_REJECTED", true);
    if (response.status === 403) throw new ProductionRuntimeSecretsError("key-vault", "KEY_VAULT_AUTHORIZATION_REJECTED", false);
    if (response.status === 404) throw new ProductionRuntimeSecretsError("key-vault", "KEY_VAULT_SECRET_UNAVAILABLE", false);
    if (response.status === 429) throw new ProductionRuntimeSecretsError("key-vault", "KEY_VAULT_RATE_LIMITED", true);
    if (response.status >= 500) throw new ProductionRuntimeSecretsError("key-vault", "KEY_VAULT_UPSTREAM_FAILURE", true);
    throw new ProductionRuntimeSecretsError("key-vault", "KEY_VAULT_INVALID_RESPONSE", false);
  }

  const payload = await response.json().catch(() => null) as { value?: unknown } | null;
  const value = typeof payload?.value === "string" ? payload.value.trim() : "";
  if (!value) throw new ProductionRuntimeSecretsError("key-vault", "KEY_VAULT_INVALID_RESPONSE", false);
  secretCache.set(binding.keyVaultSecretName, { value, expiresAt: Date.now() + CACHE_MS });
  return value;
}

async function hydrate(bindings: readonly Binding[]) {
  let accessToken = await azureKeyVaultAccessToken();
  let values: string[];
  try {
    values = await Promise.all(bindings.map((binding) => keyVaultSecret(binding, accessToken)));
  } catch (error) {
    if (!(error instanceof ProductionRuntimeSecretsError) || error.code !== "KEY_VAULT_AUTHENTICATION_REJECTED") throw error;
    azureAccessToken = null;
    accessToken = await azureKeyVaultAccessToken();
    values = await Promise.all(bindings.map((binding) => keyVaultSecret(binding, accessToken)));
  }

  const previousValues = bindings.map((binding) => process.env[binding.environmentKey]);
  try {
    for (let index = 0; index < bindings.length; index += 1) {
      process.env[bindings[index].environmentKey] = values[index];
    }
  } catch {
    for (let index = 0; index < bindings.length; index += 1) {
      const previous = previousValues[index];
      if (previous === undefined) delete process.env[bindings[index].environmentKey];
      else process.env[bindings[index].environmentKey] = previous;
    }
    throw new ProductionRuntimeSecretsError("environment", "RUNTIME_ENVIRONMENT_WRITE_FAILED", false);
  }
  return bindings.length;
}

async function ensureBindings(scope: "applications" | "academy" | "marketplace-v12", bindings: readonly Binding[]): Promise<ProductionRuntimeSecretsEvidence> {
  if (!vercelProductionRuntime()) return { required: false, state: "not-required", stage: "environment", bindingCount: 0 };
  const existing = hydrationPromises.get(scope);
  if (existing) return existing;

  const pending = hydrate(bindings)
    .then((bindingCount): ProductionRuntimeSecretsEvidence => ({ required: true, state: "ready", stage: "environment", bindingCount }))
    .finally(() => {
      hydrationPromises.delete(scope);
    });
  hydrationPromises.set(scope, pending);
  return pending;
}

/**
 * Hydrates only the five Applications server-side bindings from Key Vault.
 * Production never falls back to a persisted Vercel secret for these values.
 */
export async function ensureApplicationsRuntimeSecrets(): Promise<ProductionRuntimeSecretsEvidence> {
  return ensureBindings("applications", APPLICATION_BINDINGS);
}

/**
 * Hydrates the shared Applications commerce authority and every marketplace
 * v1.2 activation/delivery binding as one all-or-nothing environment update.
 * Keeping a separate scope prevents an unavailable marketplace release from
 * taking unrelated Applications commerce offline.
 */
export async function ensureMarketplaceV12RuntimeSecrets(): Promise<ProductionRuntimeSecretsEvidence> {
  return ensureBindings("marketplace-v12", [...MARKETPLACE_V12_COMMERCE_BINDINGS, ...MARKETPLACE_V12_BINDINGS]);
}

/**
 * Hydrates Academy commerce bindings and returns a fresh request-scoped Vercel
 * OIDC token for the Academy persistence gateway. The token is never saved in
 * process.env or reused across requests.
 */
export async function ensureAcademyRuntimeSecrets(): Promise<string | undefined> {
  if (!vercelProductionRuntime()) return undefined;
  const [oidcToken] = await Promise.all([
    getVercelOidcToken({ audience: ACADEMY_GATEWAY_AUDIENCE }).catch(() => {
      throw new ProductionRuntimeSecretsError("vercel-oidc", "VERCEL_OIDC_UNAVAILABLE", true);
    }),
    ensureBindings("academy", ACADEMY_BINDINGS),
  ]);
  if (!oidcToken || oidcToken.length < 128) {
    throw new ProductionRuntimeSecretsError("vercel-oidc", "VERCEL_OIDC_ASSERTION_INVALID", false);
  }
  return oidcToken;
}
