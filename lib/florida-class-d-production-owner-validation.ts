import "server-only";

import { getInternalOwnerAuthority } from "./auth/authority-repository";
import { floridaClassDSupabaseOriginAuthorized, floridaClassDServiceRoleKeyAuthorized } from "./florida-class-d-supabase-config";

const SHA40 = /^[0-9a-f]{40}$/i;
const SHA256 = /^[0-9a-f]{64}$/i;
const REQUIRED_FDACS_PROJECT_REF = "ggkxgjhsbgbifiqrhavr";
const REQUIRED_IDENTITY_PROJECT_REF = "ftkjhmtfyfkartfsnkjb";
const REQUIRED_IDENTITY_ORIGIN = `https://${REQUIRED_IDENTITY_PROJECT_REF}.supabase.co`;
const MAX_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export const FLORIDA_CLASS_D_PRODUCTION_OWNER_VALIDATION_WATERMARK =
  "PRODUCTION OWNER VALIDATION — REAL SERVICES — NON-CREDIT UNTIL FDACS ACTIVATION";

export class FloridaClassDProductionOwnerAuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 503,
    readonly code: string,
  ) {
    super(message);
    this.name = "FloridaClassDProductionOwnerAuthorizationError";
  }
}

function value(name: string) {
  return process.env[name]?.trim() ?? "";
}

function enabled(name: string) {
  return value(name).toLowerCase() === "enabled";
}

function trueFlag(name: string) {
  return value(name).toLowerCase() === "true";
}

function releaseReady() {
  const configured = value("OBSERRA_FDACS_PRODUCTION_OWNER_VALIDATION_RELEASE_SHA");
  const deployed = value("VERCEL_GIT_COMMIT_SHA");
  return SHA40.test(configured) && SHA40.test(deployed) && configured.toLowerCase() === deployed.toLowerCase();
}

function expiryReady() {
  const parsed = Date.parse(value("OBSERRA_FDACS_PRODUCTION_OWNER_VALIDATION_EXPIRES_AT"));
  const now = Date.now();
  return Number.isFinite(parsed) && parsed > now && parsed - now <= MAX_WINDOW_MS;
}

export function getFloridaClassDProductionOwnerValidationConfiguration() {
  const forbidden = [
    "OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED",
    "OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED",
    "OBSERRA_FDACS_NONPROD_EXECUTION_AUTHORIZED",
    "OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY",
  ].filter(enabled);

  const checks = {
    productionEnvironment: value("VERCEL_ENV").toLowerCase() === "production",
    explicitlyAuthorized: enabled("OBSERRA_FDACS_PRODUCTION_OWNER_VALIDATION_AUTHORIZED"),
    nonCreditAcknowledged: value("OBSERRA_FDACS_PRODUCTION_OWNER_VALIDATION_NON_CREDIT").toLowerCase() === "acknowledged",
    exactRelease: releaseReady(),
    shortLivedAuthorization: expiryReady(),
    evidenceDigest: SHA256.test(value("OBSERRA_FDACS_PRODUCTION_OWNER_VALIDATION_EVIDENCE_SHA256")),
    supabaseIdentityRuntime: trueFlag("OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED"),
    identityProject:
      value("NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL") === REQUIRED_IDENTITY_ORIGIN &&
      value("OBSERRA_AUTH_SUPABASE_PROJECT_REF") === REQUIRED_IDENTITY_PROJECT_REF &&
      value("NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY").startsWith("sb_publishable_"),
    fdacsDatabase:
      floridaClassDSupabaseOriginAuthorized(value("OBSERRA_FDACS_SUPABASE_URL"), value("OBSERRA_FDACS_SUPABASE_PROJECT_REF")) &&
      value("OBSERRA_FDACS_SUPABASE_PROJECT_REF") === REQUIRED_FDACS_PROJECT_REF &&
      floridaClassDServiceRoleKeyAuthorized(value("OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY")),
    daily:
      value("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER").toLowerCase() === "daily" &&
      Boolean(value("OBSERRA_FDACS_DAILY_API_KEY")),
    stripeIdentity:
      value("STRIPE_SECRET_KEY").startsWith("sk_live_") &&
      /^whsec_[A-Za-z0-9_]+$/.test(value("STRIPE_IDENTITY_WEBHOOK_SECRET")),
    productionActivationStillLocked: forbidden.length === 0,
  } as const;

  return {
    authorized: Object.values(checks).every(Boolean),
    checks,
    blockingKeys: Object.entries(checks).filter(([, ready]) => !ready).map(([key]) => key),
    releaseCommitSha: SHA40.test(value("OBSERRA_FDACS_PRODUCTION_OWNER_VALIDATION_RELEASE_SHA"))
      ? value("OBSERRA_FDACS_PRODUCTION_OWNER_VALIDATION_RELEASE_SHA").toLowerCase()
      : null,
    expiresAt: expiryReady() ? new Date(value("OBSERRA_FDACS_PRODUCTION_OWNER_VALIDATION_EXPIRES_AT")).toISOString() : null,
    watermark: FLORIDA_CLASS_D_PRODUCTION_OWNER_VALIDATION_WATERMARK,
    trainingCreditEligible: false,
    productionSoftwareEnvironment: true,
    realProvidersRequired: true,
    realFdacsDatabaseRequired: true,
    mockDataAllowed: false,
    placeholderCredentialsAllowed: false,
    completionAuthorized: false,
    liasAuthorized: false,
    fdacsApprovalClaimed: false,
  } as const;
}

export async function requireFloridaClassDProductionOwnerPrincipal() {
  if (value("VERCEL_ENV").toLowerCase() !== "production") {
    throw new FloridaClassDProductionOwnerAuthorizationError(
      "Production owner inspection is available only in the production environment.",
      503,
      "FDACS_PRODUCTION_OWNER_ENVIRONMENT_UNAVAILABLE",
    );
  }

  let authority;
  try {
    authority = await getInternalOwnerAuthority();
  } catch {
    throw new FloridaClassDProductionOwnerAuthorizationError(
      "Protected owner authority is unavailable.",
      503,
      "FDACS_PRODUCTION_OWNER_AUTHORITY_UNAVAILABLE",
    );
  }

  if (authority.status === "unavailable") {
    throw new FloridaClassDProductionOwnerAuthorizationError(
      "Protected owner authority is unavailable.",
      503,
      "FDACS_PRODUCTION_OWNER_AUTHORITY_UNAVAILABLE",
    );
  }

  if (
    authority.status !== "ready" ||
    !authority.identity ||
    !authority.internalIdentityAuthorized ||
    !authority.emailVerified ||
    !authority.protectedReadiness.ready ||
    !authority.identity.roles.includes("owner") ||
    authority.identity.assuranceLevel !== "aal2"
  ) {
    throw new FloridaClassDProductionOwnerAuthorizationError(
      "Verified internal owner authority with AAL2 is required for production owner validation.",
      403,
      "FDACS_PRODUCTION_OWNER_AUTHORITY_REQUIRED",
    );
  }

  return {
    principalId: authority.identity.principalId,
    sessionId: authority.identity.sessionId,
    correlationId: authority.correlationId,
  };
}

export async function requireFloridaClassDProductionOwnerValidationPrincipal() {
  const configuration = getFloridaClassDProductionOwnerValidationConfiguration();
  if (!configuration.authorized || !configuration.releaseCommitSha || !configuration.expiresAt) {
    throw new Error(`Production owner validation is not authorized: ${configuration.blockingKeys.join(",") || "unknown"}`);
  }

  const principal = await requireFloridaClassDProductionOwnerPrincipal();
  return {
    ...principal,
    releaseCommitSha: configuration.releaseCommitSha,
    expiresAt: configuration.expiresAt,
    watermark: configuration.watermark,
  };
}
