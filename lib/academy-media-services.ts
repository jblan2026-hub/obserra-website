import "server-only";

import rawConfiguration from "../config/academy-media-services.json";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const IDENTIFIER_PATTERN = /^[a-zA-Z0-9._:-]{2,240}$/;

type ProviderMode = "manual" | "api";

type ProviderConfiguration = {
  role: string;
  defaultIntegrationMode: ProviderMode;
  apiBaseUrl?: string;
  templatesPath?: string;
  creditBalancePath?: string;
  apiKeyHeader?: string;
  officialDocumentation: string;
  requiredManualEvidence?: string[];
  requiredApiEnvironment: string[];
  optionalApiEnvironment?: string[];
};

type MediaServicesConfiguration = {
  schemaVersion: string;
  status: string;
  heygen: ProviderConfiguration;
  pollo: ProviderConfiguration;
  learnworlds: ProviderConfiguration;
  security: {
    secretsInSourceControl: boolean;
    ownerOnlyReadinessEndpoint: boolean;
    automaticProviderSpending: boolean;
    automaticCreditRefill: boolean;
    failClosedOnInvalidProviderUrl: boolean;
    probeTimeoutMilliseconds: number;
    downloadExternalMediaImmediately: boolean;
    externalProviderRetentionIsNotArchive: boolean;
  };
};

function normalized(value: unknown, maximum = 1000): string {
  return String(value ?? "").trim().slice(0, maximum);
}

function booleanEnvironment(name: string): boolean {
  return TRUE_VALUES.has(normalized(process.env[name], 20).toLowerCase());
}

function providerMode(name: string, fallback: ProviderMode): ProviderMode {
  return normalized(process.env[name], 20).toLowerCase() === "api" ? "api" : fallback;
}

function validatedHttpsOrigin(value: unknown, allowedHost: string, label: string): URL {
  let url: URL;
  try {
    url = new URL(normalized(value, 2000));
  } catch {
    throw new Error(`Invalid ${label} URL.`);
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hostname.toLowerCase() !== allowedHost
  ) {
    throw new Error(`${label} must use the governed HTTPS hostname ${allowedHost}.`);
  }
  return url;
}

function joinProviderUrl(base: URL, path: string): URL {
  const basePath = base.pathname.endsWith("/") ? base.pathname.slice(0, -1) : base.pathname;
  const subPath = path.startsWith("/") ? path : `/${path}`;
  const joined = new URL(base.toString());
  joined.pathname = `${basePath}${subPath}`;
  return joined;
}

function validatedPath(value: unknown, label: string): string {
  const path = normalized(value, 300);
  if (!path.startsWith("/") || path.includes("..") || path.includes("\\")) {
    throw new Error(`Invalid ${label} path.`);
  }
  return path;
}

function validateProvider(value: unknown, label: string): ProviderConfiguration {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label} provider configuration.`);
  }
  const candidate = value as Partial<ProviderConfiguration>;
  const defaultIntegrationMode = candidate.defaultIntegrationMode === "api" ? "api" : "manual";
  const requiredApiEnvironment = Array.isArray(candidate.requiredApiEnvironment)
    ? candidate.requiredApiEnvironment.map((item) => normalized(item, 120)).filter(Boolean)
    : [];
  if (!normalized(candidate.role, 120) || !normalized(candidate.officialDocumentation, 1000)) {
    throw new Error(`${label} provider role and documentation are required.`);
  }
  if (!requiredApiEnvironment.length) {
    throw new Error(`${label} must declare required API environment variables.`);
  }
  return {
    role: normalized(candidate.role, 120),
    defaultIntegrationMode,
    apiBaseUrl: candidate.apiBaseUrl ? normalized(candidate.apiBaseUrl, 1000) : undefined,
    templatesPath: candidate.templatesPath ? validatedPath(candidate.templatesPath, `${label} templates`) : undefined,
    creditBalancePath: candidate.creditBalancePath
      ? validatedPath(candidate.creditBalancePath, `${label} credit balance`)
      : undefined,
    apiKeyHeader: candidate.apiKeyHeader ? normalized(candidate.apiKeyHeader, 80) : undefined,
    officialDocumentation: normalized(candidate.officialDocumentation, 1000),
    requiredManualEvidence: Array.isArray(candidate.requiredManualEvidence)
      ? candidate.requiredManualEvidence.map((item) => normalized(item, 120)).filter(Boolean)
      : [],
    requiredApiEnvironment,
    optionalApiEnvironment: Array.isArray(candidate.optionalApiEnvironment)
      ? candidate.optionalApiEnvironment.map((item) => normalized(item, 120)).filter(Boolean)
      : [],
  };
}

function validateConfiguration(value: unknown): MediaServicesConfiguration {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Academy media-services configuration must be an object.");
  }
  const candidate = value as Partial<MediaServicesConfiguration>;
  const security = candidate.security;
  if (!security || typeof security !== "object" || Array.isArray(security)) {
    throw new Error("Academy media-services security configuration is required.");
  }
  if (
    security.secretsInSourceControl !== false ||
    security.ownerOnlyReadinessEndpoint !== true ||
    security.automaticProviderSpending !== false ||
    security.automaticCreditRefill !== false ||
    security.failClosedOnInvalidProviderUrl !== true
  ) {
    throw new Error("Academy media-services security controls must remain fail closed.");
  }
  return {
    schemaVersion: normalized(candidate.schemaVersion, 40),
    status: normalized(candidate.status, 80),
    heygen: validateProvider(candidate.heygen, "HeyGen"),
    pollo: validateProvider(candidate.pollo, "Pollo"),
    learnworlds: validateProvider(candidate.learnworlds, "LearnWorlds"),
    security: {
      ...security,
      probeTimeoutMilliseconds: Math.max(
        2_000,
        Math.min(15_000, Number(security.probeTimeoutMilliseconds || 8_000)),
      ),
    },
  };
}

const configuration = validateConfiguration(rawConfiguration);
const heyGenBaseUrl = validatedHttpsOrigin(configuration.heygen.apiBaseUrl, "api.heygen.com", "HeyGen API");
const polloBaseUrl = validatedHttpsOrigin(configuration.pollo.apiBaseUrl, "pollo.ai", "Pollo API");

function environmentStatus(names: string[]) {
  return Object.fromEntries(names.map((name) => [name, Boolean(normalized(process.env[name], 5000))]));
}

function validIdentifier(name: string): boolean {
  const value = normalized(process.env[name], 240);
  return Boolean(value && IDENTIFIER_PATTERN.test(value));
}

export function academyMediaConfigurationStatus() {
  const heygenMode = providerMode("HEYGEN_INTEGRATION_MODE", configuration.heygen.defaultIntegrationMode);
  const polloMode = providerMode("POLLO_INTEGRATION_MODE", configuration.pollo.defaultIntegrationMode);
  const heygenApiEnvironment = environmentStatus(configuration.heygen.requiredApiEnvironment);
  const polloApiEnvironment = environmentStatus(configuration.pollo.requiredApiEnvironment);
  const heygenIdentityReady = validIdentifier("HEYGEN_AVATAR_ID") && validIdentifier("HEYGEN_VOICE_ID");
  const heygenTemplatesReady =
    validIdentifier("HEYGEN_TEMPLATE_16X9_ID") && validIdentifier("HEYGEN_TEMPLATE_9X16_ID");
  const heygenManualReady =
    booleanEnvironment("HEYGEN_MANUAL_SETUP_COMPLETE") &&
    heygenIdentityReady &&
    heygenTemplatesReady;
  const polloManualReady =
    booleanEnvironment("POLLO_MANUAL_SETUP_COMPLETE") &&
    booleanEnvironment("POLLO_PRIVATE_MODE_CONFIRMED");
  const heygenApiReady = Object.values(heygenApiEnvironment).every(Boolean) && heygenIdentityReady;
  const polloApiReady = Object.values(polloApiEnvironment).every(Boolean);

  return {
    schemaVersion: configuration.schemaVersion,
    status: configuration.status,
    automaticProviderSpending: configuration.security.automaticProviderSpending,
    automaticCreditRefill: configuration.security.automaticCreditRefill,
    heygen: {
      role: configuration.heygen.role,
      mode: heygenMode,
      identityReady: heygenIdentityReady,
      templatesReady: heygenTemplatesReady,
      manualReady: heygenManualReady,
      apiReady: heygenApiReady,
      ready: heygenMode === "api" ? heygenApiReady : heygenManualReady,
      environment: heygenApiEnvironment,
      officialDocumentation: configuration.heygen.officialDocumentation,
    },
    pollo: {
      role: configuration.pollo.role,
      mode: polloMode,
      privateModeConfirmed: booleanEnvironment("POLLO_PRIVATE_MODE_CONFIRMED"),
      manualReady: polloManualReady,
      apiReady: polloApiReady,
      ready: polloMode === "api" ? polloApiReady : polloManualReady,
      environment: polloApiEnvironment,
      officialDocumentation: configuration.pollo.officialDocumentation,
    },
  } as const;
}

async function fetchWithTimeout(url: URL, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), configuration.security.probeTimeoutMilliseconds);
  try {
    return await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function probeAcademyMediaServices() {
  const status = academyMediaConfigurationStatus();
  const result = {
    checkedAt: new Date().toISOString(),
    heygen: {
      attempted: false,
      reachable: false,
      authorized: false,
      templatesAvailable: null as number | null,
      statusCode: null as number | null,
      error: null as string | null,
    },
    pollo: {
      attempted: false,
      reachable: false,
      authorized: false,
      availableCredits: null as number | null,
      totalCredits: null as number | null,
      statusCode: null as number | null,
      error: null as string | null,
    },
  };

  if (status.heygen.mode === "api" && status.heygen.apiReady) {
    result.heygen.attempted = true;
    try {
      const url = joinProviderUrl(heyGenBaseUrl, configuration.heygen.templatesPath || "/v2/templates");
      const response = await fetchWithTimeout(url, {
        accept: "application/json",
        "X-Api-Key": normalized(process.env.HEYGEN_API_KEY, 5000),
      });
      result.heygen.statusCode = response.status;
      result.heygen.reachable = true;
      result.heygen.authorized = response.ok;
      if (response.ok) {
        const payload = (await response.json()) as { data?: { templates?: unknown[] } };
        result.heygen.templatesAvailable = Array.isArray(payload?.data?.templates)
          ? payload.data.templates.length
          : 0;
      } else {
        result.heygen.error = `heygen-http-${response.status}`;
      }
    } catch (error) {
      result.heygen.error = error instanceof Error ? error.name : "heygen-probe-failed";
    }
  }

  if (status.pollo.mode === "api" && status.pollo.apiReady) {
    result.pollo.attempted = true;
    try {
      const url = joinProviderUrl(polloBaseUrl, configuration.pollo.creditBalancePath || "/credit/balance");
      const response = await fetchWithTimeout(url, {
        accept: "application/json",
        "x-api-key": normalized(process.env.POLLO_API_KEY, 5000),
      });
      result.pollo.statusCode = response.status;
      result.pollo.reachable = true;
      result.pollo.authorized = response.ok;
      if (response.ok) {
        const payload = (await response.json()) as {
          availableCredits?: number;
          totalCredits?: number;
        };
        result.pollo.availableCredits = Number.isFinite(payload.availableCredits)
          ? Number(payload.availableCredits)
          : null;
        result.pollo.totalCredits = Number.isFinite(payload.totalCredits)
          ? Number(payload.totalCredits)
          : null;
      } else {
        result.pollo.error = `pollo-http-${response.status}`;
      }
    } catch (error) {
      result.pollo.error = error instanceof Error ? error.name : "pollo-probe-failed";
    }
  }

  return { status, probe: result } as const;
}
