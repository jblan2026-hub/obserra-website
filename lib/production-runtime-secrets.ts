import "server-only";

import { getVercelOidcToken } from "@vercel/oidc";

const KEY_VAULT_URI = "https://kv-obserra-prod-38d660.vault.azure.net";
const AZURE_TOKEN_AUDIENCE = "api://AzureADTokenExchange";
const ACADEMY_GATEWAY_AUDIENCE = "https://vercel.com/obserra";
const AZURE_KEY_VAULT_SCOPE = "https://vault.azure.net/.default";
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

export class ProductionRuntimeSecretsError extends Error {
  constructor(message = "Production runtime secrets are unavailable.") {
    super(message);
    this.name = "ProductionRuntimeSecretsError";
  }
}

type CacheEntry = Readonly<{
  value: string;
  expiresAt: number;
}>;

const secretCache = new Map<string, CacheEntry>();
const hydrationPromises = new Map<"applications" | "academy", Promise<void>>();
let azureAccessToken: CacheEntry | null = null;

function vercelProductionRuntime() {
  return process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
}

function requiredAzureIdentifier(environmentKey: string) {
  const value = process.env[environmentKey]?.trim() ?? "";
  if (!UUID.test(value)) throw new ProductionRuntimeSecretsError();
  return value;
}

function cachedValue(cache: CacheEntry | null | undefined) {
  return cache && cache.expiresAt > Date.now() ? cache.value : null;
}

async function azureKeyVaultAccessToken() {
  const cached = cachedValue(azureAccessToken);
  if (cached) return cached;

  const tenantId = requiredAzureIdentifier("OBSERRA_KEY_VAULT_TENANT_ID");
  const clientId = requiredAzureIdentifier("OBSERRA_KEY_VAULT_CLIENT_ID");
  let assertion: string;
  try {
    assertion = await getVercelOidcToken({ audience: AZURE_TOKEN_AUDIENCE });
  } catch {
    throw new ProductionRuntimeSecretsError();
  }
  if (!assertion || assertion.length < 128) throw new ProductionRuntimeSecretsError();

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
    throw new ProductionRuntimeSecretsError();
  });
  if (!response.ok) throw new ProductionRuntimeSecretsError();

  const payload = await response.json().catch(() => null) as { access_token?: unknown; expires_in?: unknown } | null;
  const value = typeof payload?.access_token === "string" ? payload.access_token : "";
  const expiresIn = Number(payload?.expires_in);
  if (!value || !Number.isFinite(expiresIn) || expiresIn < 60) throw new ProductionRuntimeSecretsError();

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
    throw new ProductionRuntimeSecretsError();
  });
  if (!response.ok) throw new ProductionRuntimeSecretsError();

  const payload = await response.json().catch(() => null) as { value?: unknown } | null;
  const value = typeof payload?.value === "string" ? payload.value.trim() : "";
  if (!value) throw new ProductionRuntimeSecretsError();
  secretCache.set(binding.keyVaultSecretName, { value, expiresAt: Date.now() + CACHE_MS });
  return value;
}

async function hydrate(bindings: readonly Binding[]) {
  const accessToken = await azureKeyVaultAccessToken();
  const values = await Promise.all(bindings.map((binding) => keyVaultSecret(binding, accessToken)));
  for (let index = 0; index < bindings.length; index += 1) {
    process.env[bindings[index].environmentKey] = values[index];
  }
}

async function ensureBindings(scope: "applications" | "academy", bindings: readonly Binding[]) {
  if (!vercelProductionRuntime()) return;
  const existing = hydrationPromises.get(scope);
  if (existing) return existing;

  const pending = hydrate(bindings).finally(() => {
    hydrationPromises.delete(scope);
  });
  hydrationPromises.set(scope, pending);
  return pending;
}

/**
 * Hydrates only the five Applications server-side bindings from Key Vault.
 * Production never falls back to a persisted Vercel secret for these values.
 */
export async function ensureApplicationsRuntimeSecrets() {
  await ensureBindings("applications", APPLICATION_BINDINGS);
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
      throw new ProductionRuntimeSecretsError();
    }),
    ensureBindings("academy", ACADEMY_BINDINGS),
  ]);
  if (!oidcToken || oidcToken.length < 128) throw new ProductionRuntimeSecretsError();
  return oidcToken;
}
