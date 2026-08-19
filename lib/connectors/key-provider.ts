import "server-only";

import { createHash } from "node:crypto";
import { ConnectorRuntimeError } from "./contracts";
import { exponentialBackoff, retryAfter, sleepWithAbort } from "./resilience";

const ENVIRONMENT_PROVIDER = "environment";
const AZURE_KEY_VAULT_PROVIDER = "azure-key-vault";
const KEY_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,64}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AZURE_SECRET_NAME_PATTERN = /^[A-Za-z0-9-]{1,127}$/;
const AZURE_SECRET_VERSION_PATTERN = /^[A-Za-z0-9-]{1,64}$/;
const AZURE_API_VERSION_PATTERN = /^(?:\d+\.\d+|\d{4}-\d{2}-\d{2}(?:-preview)?)$/;
const MAX_KEY_VALUE_CHARS = 4_096;
const AZURE_REQUEST_TIMEOUT_MS = 7_500;
const AZURE_MAX_ATTEMPTS = 3;
const AZURE_KEY_CACHE_TTL_MS = 5 * 60 * 1_000;
const TOKEN_REFRESH_SKEW_MS = 60_000;

type ConnectorKeyProviderName = typeof ENVIRONMENT_PROVIDER | typeof AZURE_KEY_VAULT_PROVIDER;

type AzureKeyBinding = {
  name: string;
  version: string;
};

type AzureAccessTokenCache = {
  cacheKey: string;
  token: string;
  expiresAtMs: number;
};

type AzureKeyCacheEntry = {
  material: Buffer;
  expiresAtMs: number;
  bindingDigest: string;
};

export type ConnectorEncryptionKey = {
  keyId: string;
  material: Buffer;
  provider: ConnectorKeyProviderName;
};

let azureAccessTokenCache: AzureAccessTokenCache | null = null;
let azureAccessTokenFlight: Promise<AzureAccessTokenCache> | null = null;
const azureKeyCache = new Map<string, AzureKeyCacheEntry>();
const azureKeyFlights = new Map<string, Promise<Buffer>>();

function configurationError(message: string, code: string): never {
  throw new ConnectorRuntimeError(message, code, "configuration", 503, false);
}

function authenticationError(message: string, code: string): never {
  throw new ConnectorRuntimeError(message, code, "authentication", 503, false);
}

function authorizationError(message: string, code: string): never {
  throw new ConnectorRuntimeError(message, code, "authorization", 503, false);
}

function requireKeyId(value: string) {
  const normalized = value.trim();
  if (!KEY_ID_PATTERN.test(normalized)) {
    configurationError("Connector encryption key ID is invalid.", "OBSERRA_CONNECTOR_ENCRYPTION_KEY_ID_INVALID");
  }
  return normalized;
}

function parseKeyMaterial(value: string, keyId: string) {
  let decoded: Buffer;
  try {
    decoded = Buffer.from(value.trim(), "base64url");
  } catch {
    decoded = Buffer.alloc(0);
  }
  if (decoded.length !== 32) {
    configurationError(
      `Connector encryption key ${keyId} must decode to exactly 32 bytes.`,
      "OBSERRA_CONNECTOR_ENCRYPTION_KEY_INVALID",
    );
  }
  return decoded;
}

export function activeConnectorEncryptionKeyId() {
  return requireKeyId(process.env.OBSERRA_CONNECTOR_ENCRYPTION_KEY_ID?.trim() || "primary");
}

export function connectorEncryptionKeyProviderName(): ConnectorKeyProviderName {
  const configured = process.env.OBSERRA_CONNECTOR_KEY_PROVIDER?.trim().toLowerCase();
  const provider = configured || (process.env.VERCEL_ENV === "production" ? AZURE_KEY_VAULT_PROVIDER : ENVIRONMENT_PROVIDER);
  if (provider !== ENVIRONMENT_PROVIDER && provider !== AZURE_KEY_VAULT_PROVIDER) {
    configurationError("Connector encryption key provider is invalid.", "OBSERRA_CONNECTOR_KEY_PROVIDER_INVALID");
  }
  if (provider === ENVIRONMENT_PROVIDER && process.env.VERCEL_ENV === "production") {
    configurationError(
      "Environment-backed connector encryption keys are forbidden in the production Vercel environment.",
      "OBSERRA_CONNECTOR_ENVIRONMENT_KEY_PROVIDER_FORBIDDEN",
    );
  }
  return provider;
}

function environmentKeyRing() {
  const activeKeyId = activeConnectorEncryptionKeyId();
  const activeKey = process.env.OBSERRA_CONNECTOR_ENCRYPTION_KEY?.trim();
  if (!activeKey) {
    configurationError(
      "Connector encrypted credential storage is not configured.",
      "OBSERRA_CONNECTOR_ENCRYPTION_KEY_MISSING",
    );
  }

  const keys = new Map<string, Buffer>();
  keys.set(activeKeyId, parseKeyMaterial(activeKey, activeKeyId));

  const historical = process.env.OBSERRA_CONNECTOR_ENCRYPTION_KEYS_JSON?.trim();
  if (historical) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(historical) as unknown;
    } catch {
      configurationError(
        "Connector encryption key ring is invalid JSON.",
        "OBSERRA_CONNECTOR_ENCRYPTION_KEYRING_INVALID",
      );
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      configurationError(
        "Connector encryption key ring must be a JSON object.",
        "OBSERRA_CONNECTOR_ENCRYPTION_KEYRING_INVALID",
      );
    }

    for (const [keyId, material] of Object.entries(parsed as Record<string, unknown>)) {
      if (!KEY_ID_PATTERN.test(keyId) || typeof material !== "string") {
        configurationError(
          "Connector encryption key ring contains an invalid entry.",
          "OBSERRA_CONNECTOR_ENCRYPTION_KEYRING_INVALID",
        );
      }
      keys.set(keyId, parseKeyMaterial(material, keyId));
    }
  }

  return { activeKeyId, keys };
}

function requireUuid(value: string | undefined, field: string, code: string) {
  const normalized = value?.trim() || "";
  if (!UUID_PATTERN.test(normalized)) {
    configurationError(`${field} is not configured correctly.`, code);
  }
  return normalized;
}

function azureVaultConfiguration() {
  const rawVaultUrl = process.env.OBSERRA_CONNECTOR_AZURE_KEY_VAULT_URL?.trim() || "";
  let vaultUrl: URL;
  try {
    vaultUrl = new URL(rawVaultUrl);
  } catch {
    configurationError("Azure Key Vault URL is invalid.", "OBSERRA_CONNECTOR_AZURE_KEY_VAULT_URL_INVALID");
  }

  if (
    vaultUrl.protocol !== "https:"
    || !vaultUrl.hostname.endsWith(".vault.azure.net")
    || vaultUrl.username
    || vaultUrl.password
    || vaultUrl.port
    || vaultUrl.search
    || vaultUrl.hash
    || (vaultUrl.pathname !== "/" && vaultUrl.pathname !== "")
  ) {
    configurationError("Azure Key Vault URL is not an approved vault origin.", "OBSERRA_CONNECTOR_AZURE_KEY_VAULT_URL_INVALID");
  }

  const tenantId = requireUuid(
    process.env.AZURE_TENANT_ID,
    "Azure tenant ID",
    "OBSERRA_CONNECTOR_AZURE_TENANT_ID_INVALID",
  );
  const clientId = requireUuid(
    process.env.AZURE_CLIENT_ID,
    "Azure client ID",
    "OBSERRA_CONNECTOR_AZURE_CLIENT_ID_INVALID",
  );
  const apiVersion = process.env.OBSERRA_CONNECTOR_AZURE_KEY_VAULT_API_VERSION?.trim() || "";
  if (!AZURE_API_VERSION_PATTERN.test(apiVersion)) {
    configurationError(
      "Azure Key Vault API version must be explicitly configured.",
      "OBSERRA_CONNECTOR_AZURE_KEY_VAULT_API_VERSION_INVALID",
    );
  }

  return { vaultUrl, tenantId, clientId, apiVersion };
}

function azureKeyBindings() {
  const raw = process.env.OBSERRA_CONNECTOR_AZURE_KEY_MAP_JSON?.trim();
  if (!raw) {
    configurationError(
      "Azure Key Vault connector encryption key mapping is not configured.",
      "OBSERRA_CONNECTOR_AZURE_KEY_MAP_MISSING",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    configurationError(
      "Azure Key Vault connector encryption key mapping is invalid JSON.",
      "OBSERRA_CONNECTOR_AZURE_KEY_MAP_INVALID",
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    configurationError(
      "Azure Key Vault connector encryption key mapping must be an object.",
      "OBSERRA_CONNECTOR_AZURE_KEY_MAP_INVALID",
    );
  }

  const bindings = new Map<string, AzureKeyBinding>();
  for (const [rawKeyId, rawBinding] of Object.entries(parsed as Record<string, unknown>)) {
    const keyId = requireKeyId(rawKeyId);
    if (!rawBinding || typeof rawBinding !== "object" || Array.isArray(rawBinding)) {
      configurationError("Azure Key Vault connector key mapping contains an invalid binding.", "OBSERRA_CONNECTOR_AZURE_KEY_MAP_INVALID");
    }
    const binding = rawBinding as Record<string, unknown>;
    const name = typeof binding.name === "string" ? binding.name.trim() : "";
    const version = typeof binding.version === "string" ? binding.version.trim() : "";
    if (!AZURE_SECRET_NAME_PATTERN.test(name) || !AZURE_SECRET_VERSION_PATTERN.test(version)) {
      configurationError(
        "Azure Key Vault connector key mappings require a valid secret name and immutable secret version.",
        "OBSERRA_CONNECTOR_AZURE_KEY_MAP_INVALID",
      );
    }
    bindings.set(keyId, { name, version });
  }

  if (!bindings.has(activeConnectorEncryptionKeyId())) {
    configurationError(
      "Azure Key Vault connector key mapping does not contain the active encryption key ID.",
      "OBSERRA_CONNECTOR_AZURE_ACTIVE_KEY_MISSING",
    );
  }
  return bindings;
}

function jwtAudience(assertion: string) {
  const parts = assertion.split(".");
  if (parts.length !== 3) return [];
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      aud?: unknown;
      exp?: unknown;
    };
    const audience = Array.isArray(payload.aud)
      ? payload.aud.filter((value): value is string => typeof value === "string")
      : typeof payload.aud === "string"
        ? [payload.aud]
        : [];
    const expiresAtSeconds = typeof payload.exp === "number" ? payload.exp : 0;
    if (expiresAtSeconds * 1_000 <= Date.now() + TOKEN_REFRESH_SKEW_MS) return [];
    return audience;
  } catch {
    return [];
  }
}

function azureAuthentication() {
  const mode = process.env.OBSERRA_CONNECTOR_AZURE_AUTH_MODE?.trim().toLowerCase()
    || (process.env.VERCEL_OIDC_TOKEN?.trim() ? "federated" : "client-secret");

  if (mode === "federated") {
    const assertion = process.env.OBSERRA_CONNECTOR_AZURE_FEDERATED_ASSERTION?.trim()
      || process.env.VERCEL_OIDC_TOKEN?.trim()
      || "";
    const expectedAudience = process.env.OBSERRA_CONNECTOR_AZURE_FEDERATED_AUDIENCE?.trim() || "";
    if (!assertion || !expectedAudience || !jwtAudience(assertion).includes(expectedAudience)) {
      authenticationError(
        "Azure federated workload identity assertion is unavailable, expired, or has the wrong audience.",
        "OBSERRA_CONNECTOR_AZURE_FEDERATED_ASSERTION_INVALID",
      );
    }
    return { mode, assertion } as const;
  }

  if (mode === "client-secret") {
    const clientSecret = process.env.OBSERRA_CONNECTOR_AZURE_CLIENT_SECRET?.trim()
      || process.env.AZURE_CLIENT_SECRET?.trim()
      || "";
    if (!clientSecret || clientSecret.length < 16 || clientSecret.length > 4_096) {
      authenticationError(
        "Azure connector Key Vault client credential is unavailable.",
        "OBSERRA_CONNECTOR_AZURE_CLIENT_SECRET_INVALID",
      );
    }
    return { mode, clientSecret } as const;
  }

  configurationError("Azure connector Key Vault authentication mode is invalid.", "OBSERRA_CONNECTOR_AZURE_AUTH_MODE_INVALID");
}

async function requestWithTransientRetry(url: URL, init: RequestInit) {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= AZURE_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(AZURE_REQUEST_TIMEOUT_MS),
      });
      if (response.ok || (response.status !== 408 && response.status !== 425 && response.status !== 429 && response.status < 500)) {
        return response;
      }
      if (attempt >= AZURE_MAX_ATTEMPTS) return response;
      const delay = retryAfter(response.headers.get("retry-after")) ?? exponentialBackoff(attempt);
      await sleepWithAbort(Math.min(4_000, delay));
    } catch (error) {
      lastError = error;
      if (attempt >= AZURE_MAX_ATTEMPTS) break;
      await sleepWithAbort(exponentialBackoff(attempt));
    }
  }

  throw new ConnectorRuntimeError(
    lastError instanceof Error ? "Azure connector key provider request failed in transport." : "Azure connector key provider request failed.",
    "OBSERRA_CONNECTOR_AZURE_TRANSPORT_FAILURE",
    "timeout",
    503,
    true,
  );
}

function tokenCacheKey(input: {
  tenantId: string;
  clientId: string;
  auth: ReturnType<typeof azureAuthentication>;
}) {
  const credentialDigest = createHash("sha256")
    .update(input.auth.mode === "federated" ? input.auth.assertion : input.auth.clientSecret, "utf8")
    .digest("hex");
  return `${input.tenantId}:${input.clientId}:${input.auth.mode}:${credentialDigest}`;
}

async function fetchAzureAccessToken() {
  const config = azureVaultConfiguration();
  const auth = azureAuthentication();
  const cacheKey = tokenCacheKey({ tenantId: config.tenantId, clientId: config.clientId, auth });
  if (
    azureAccessTokenCache
    && azureAccessTokenCache.cacheKey === cacheKey
    && azureAccessTokenCache.expiresAtMs > Date.now() + TOKEN_REFRESH_SKEW_MS
  ) {
    return azureAccessTokenCache;
  }

  if (azureAccessTokenFlight) return azureAccessTokenFlight;

  azureAccessTokenFlight = (async () => {
    const body = new URLSearchParams({
      client_id: config.clientId,
      grant_type: "client_credentials",
      scope: "https://vault.azure.net/.default",
    });
    if (auth.mode === "client-secret") {
      body.set("client_secret", auth.clientSecret);
    } else {
      body.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
      body.set("client_assertion", auth.assertion);
    }

    const tokenUrl = new URL(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`);
    const response = await requestWithTransientRetry(tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) {
      if (response.status === 401) authenticationError("Azure workload identity authentication was rejected.", "OBSERRA_CONNECTOR_AZURE_AUTHENTICATION_REJECTED");
      if (response.status === 403) authorizationError("Azure workload identity is not authorized.", "OBSERRA_CONNECTOR_AZURE_AUTHORIZATION_REJECTED");
      throw new ConnectorRuntimeError(
        "Azure workload identity token service is unavailable.",
        "OBSERRA_CONNECTOR_AZURE_TOKEN_UNAVAILABLE",
        response.status === 429 ? "rate_limit" : "transient",
        503,
        true,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json() as unknown;
    } catch {
      authenticationError("Azure workload identity token response is invalid.", "OBSERRA_CONNECTOR_AZURE_TOKEN_INVALID");
    }
    const tokenPayload = payload as { access_token?: unknown; expires_in?: unknown };
    const token = typeof tokenPayload.access_token === "string" ? tokenPayload.access_token.trim() : "";
    const expiresIn = typeof tokenPayload.expires_in === "number"
      ? tokenPayload.expires_in
      : Number(tokenPayload.expires_in);
    if (!token || token.length > 32_768 || !Number.isFinite(expiresIn) || expiresIn <= 0) {
      authenticationError("Azure workload identity token response is invalid.", "OBSERRA_CONNECTOR_AZURE_TOKEN_INVALID");
    }

    const next = {
      cacheKey,
      token,
      expiresAtMs: Date.now() + Math.max(60, Math.floor(expiresIn)) * 1_000,
    };
    azureAccessTokenCache = next;
    return next;
  })();

  try {
    return await azureAccessTokenFlight;
  } finally {
    azureAccessTokenFlight = null;
  }
}

function clearAzureTokenCache() {
  azureAccessTokenCache = null;
}

function bindingDigest(binding: AzureKeyBinding) {
  return createHash("sha256").update(`${binding.name}:${binding.version}`, "utf8").digest("hex");
}

async function fetchAzureKeyMaterial(keyId: string, binding: AzureKeyBinding) {
  const config = azureVaultConfiguration();
  const digest = bindingDigest(binding);
  const cached = azureKeyCache.get(keyId);
  if (cached && cached.bindingDigest === digest && cached.expiresAtMs > Date.now()) {
    return Buffer.from(cached.material);
  }

  const inFlight = azureKeyFlights.get(keyId);
  if (inFlight) return Buffer.from(await inFlight);

  const flight = (async () => {
    for (let authenticationAttempt = 1; authenticationAttempt <= 2; authenticationAttempt += 1) {
      const token = await fetchAzureAccessToken();
      const secretUrl = new URL(
        `/secrets/${encodeURIComponent(binding.name)}/${encodeURIComponent(binding.version)}`,
        config.vaultUrl,
      );
      secretUrl.searchParams.set("api-version", config.apiVersion);
      const response = await requestWithTransientRetry(secretUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${token.token}`,
        },
      });

      if (response.status === 401 && authenticationAttempt === 1) {
        clearAzureTokenCache();
        continue;
      }
      if (response.status === 401) authenticationError("Azure Key Vault rejected connector key authentication.", "OBSERRA_CONNECTOR_AZURE_KEY_AUTHENTICATION_REJECTED");
      if (response.status === 403) authorizationError("Azure Key Vault denied connector key access.", "OBSERRA_CONNECTOR_AZURE_KEY_AUTHORIZATION_REJECTED");
      if (response.status === 404) configurationError("Azure Key Vault connector encryption key version was not found.", "OBSERRA_CONNECTOR_AZURE_KEY_NOT_FOUND");
      if (!response.ok) {
        throw new ConnectorRuntimeError(
          "Azure Key Vault connector encryption key is temporarily unavailable.",
          "OBSERRA_CONNECTOR_AZURE_KEY_UNAVAILABLE",
          response.status === 429 ? "rate_limit" : "transient",
          503,
          true,
        );
      }

      let payload: unknown;
      try {
        payload = await response.json() as unknown;
      } catch {
        configurationError("Azure Key Vault returned an invalid connector key response.", "OBSERRA_CONNECTOR_AZURE_KEY_INVALID_RESPONSE");
      }
      const secretPayload = payload as { value?: unknown };
      const value = typeof secretPayload.value === "string" ? secretPayload.value.trim() : "";
      if (!value || value.length > MAX_KEY_VALUE_CHARS) {
        configurationError("Azure Key Vault returned an invalid connector encryption key.", "OBSERRA_CONNECTOR_AZURE_KEY_INVALID_RESPONSE");
      }

      const material = parseKeyMaterial(value, keyId);
      azureKeyCache.set(keyId, {
        material: Buffer.from(material),
        expiresAtMs: Date.now() + AZURE_KEY_CACHE_TTL_MS,
        bindingDigest: digest,
      });
      return material;
    }

    authenticationError("Azure Key Vault connector encryption key authentication failed.", "OBSERRA_CONNECTOR_AZURE_KEY_AUTHENTICATION_REJECTED");
  })();

  azureKeyFlights.set(keyId, flight);
  try {
    return Buffer.from(await flight);
  } finally {
    azureKeyFlights.delete(keyId);
  }
}

export async function resolveConnectorEncryptionKey(keyIdInput: string): Promise<ConnectorEncryptionKey> {
  const keyId = requireKeyId(keyIdInput);
  const provider = connectorEncryptionKeyProviderName();
  if (provider === ENVIRONMENT_PROVIDER) {
    const key = environmentKeyRing().keys.get(keyId);
    if (!key) {
      configurationError(
        "Connector secret key required for decryption is unavailable.",
        "OBSERRA_CONNECTOR_ENCRYPTION_KEY_MISSING",
      );
    }
    return { keyId, material: Buffer.from(key), provider };
  }

  const binding = azureKeyBindings().get(keyId);
  if (!binding) {
    configurationError(
      "Azure Key Vault mapping for the requested connector encryption key is unavailable.",
      "OBSERRA_CONNECTOR_AZURE_KEY_MAPPING_MISSING",
    );
  }
  return {
    keyId,
    material: await fetchAzureKeyMaterial(keyId, binding),
    provider,
  };
}

export async function resolveActiveConnectorEncryptionKey(): Promise<ConnectorEncryptionKey> {
  return resolveConnectorEncryptionKey(activeConnectorEncryptionKeyId());
}
