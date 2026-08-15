import "server-only";

import { floridaClassDRecordEncryptionConfigured } from "./florida-class-d-instructor-provisioning";

const SHA40 = /^[0-9a-f]{40}$/i;
const SHA256_HEX = /^[0-9a-f]{64}$/i;
const REQUIRED_FDACS_SUPABASE_PROJECT_REF = "ggkxgjhsbgbifiqrhavr";
const MAX_OWNER_UAT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export type FloridaClassDOwnerUatCheck = {
  key: string;
  ready: boolean;
  detail: string;
  sensitive: boolean;
};

export type FloridaClassDOwnerUatReport = {
  profile: "owner_uat_real_identity_noncredit";
  generatedAt: string;
  authorized: boolean;
  releaseCommitSha: string | null;
  expiresAt: string | null;
  publicOrigin: string | null;
  blockingKeys: string[];
  checks: FloridaClassDOwnerUatCheck[];
  productionActivationAuthorized: false;
  trainingCreditEligible: false;
  fdacsApprovalClaimed: false;
  secretsExposed: false;
};

export const FLORIDA_CLASS_D_OWNER_UAT_POLICY = {
  policyVersion: "2026-08-14-owner-uat-v1",
  previewEnvironmentOnly: true,
  realIdentityProviderRequired: true,
  liveStripeIdentityRequired: true,
  governmentIdAndMatchingSelfieRequired: true,
  ownerAllowlistRequired: true,
  exactlyOneOwnerLearnerRequired: true,
  distinctInstructorAccessRequired: true,
  exactReleaseBindingRequired: true,
  maximumAuthorizationDays: 14,
  syntheticIdentityProhibited: true,
  productionActivationProhibited: true,
  trainingCreditEligible: false,
  completionAndLiasProhibited: true,
  fdacsApprovalClaimed: false,
  secretsExposed: false,
} as const;

function value(name: string) {
  return process.env[name]?.trim() || "";
}

function enabled(name: string) {
  return value(name).toLowerCase() === "enabled";
}

function trueFlag(name: string) {
  return value(name).toLowerCase() === "true";
}

function check(
  key: string,
  ready: boolean,
  readyDetail: string,
  blockedDetail: string,
  sensitive = false,
): FloridaClassDOwnerUatCheck {
  return { key, ready, detail: ready ? readyDetail : blockedDetail, sensitive };
}

function releaseBindingReady() {
  const configured = value("OBSERRA_FDACS_OWNER_UAT_RELEASE_SHA");
  const deployed = value("VERCEL_GIT_COMMIT_SHA");
  return SHA40.test(configured) && SHA40.test(deployed) && configured.toLowerCase() === deployed.toLowerCase();
}

function expiryState() {
  const raw = value("OBSERRA_FDACS_OWNER_UAT_EXPIRES_AT");
  const parsed = Date.parse(raw);
  const now = Date.now();
  const ready = Number.isFinite(parsed) && parsed > now && parsed - now <= MAX_OWNER_UAT_WINDOW_MS;
  return { raw, parsed, ready };
}

function previewPublicOrigin() {
  const hostname = value("VERCEL_URL").toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.vercel\.app$/.test(hostname)) {
    return null;
  }
  return `https://${hostname}`;
}

function ownerAllowlistState() {
  const entries = [value("OBSERRA_OWNER_EMAIL"), ...value("OBSERRA_OWNER_EMAILS").split(",")]
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  const unique = [...new Set(entries)];
  return {
    ready: unique.length === 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(unique[0]),
    count: unique.length,
  };
}

function checks(): FloridaClassDOwnerUatCheck[] {
  const expectedDatabaseOrigin = `https://${REQUIRED_FDACS_SUPABASE_PROJECT_REF}.supabase.co`;
  const expiry = expiryState();
  const origin = previewPublicOrigin();
  const stripeKey = value("STRIPE_SECRET_KEY");
  const ownerAllowlist = ownerAllowlistState();

  return [
    check(
      "preview_environment",
      value("VERCEL_ENV").toLowerCase() === "preview",
      "Vercel Preview environment confirmed.",
      "Owner UAT is available only in a Vercel Preview deployment.",
    ),
    check(
      "uat_runtime_designation",
      value("OBSERRA_FDACS_RUNTIME_ENVIRONMENT").toLowerCase() === "uat",
      "Runtime is explicitly designated UAT.",
      "OBSERRA_FDACS_RUNTIME_ENVIRONMENT must equal uat.",
    ),
    check(
      "owner_uat_authorized",
      enabled("OBSERRA_FDACS_OWNER_UAT_AUTHORIZED"),
      "Owner UAT authorization marker is enabled.",
      "OBSERRA_FDACS_OWNER_UAT_AUTHORIZED must be explicitly enabled.",
    ),
    check(
      "real_identity_authorized",
      enabled("OBSERRA_FDACS_OWNER_UAT_REAL_IDENTITY_AUTHORIZED"),
      "Real-identity UAT authorization marker is enabled.",
      "OBSERRA_FDACS_OWNER_UAT_REAL_IDENTITY_AUTHORIZED must be explicitly enabled.",
    ),
    check(
      "noncredit_acknowledged",
      value("OBSERRA_FDACS_OWNER_UAT_NON_CREDIT").toLowerCase() === "acknowledged",
      "Non-credit test boundary is acknowledged.",
      "OBSERRA_FDACS_OWNER_UAT_NON_CREDIT must equal acknowledged.",
    ),
    check(
      "synthetic_identity_disabled",
      !enabled("OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY"),
      "Synthetic-identity mode is disabled for this distinct real-identity profile.",
      "Synthetic Gate 23 mode and real-identity owner UAT may not be enabled together.",
    ),
    check(
      "production_activation_disabled",
      !enabled("OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED"),
      "Production activation remains disabled.",
      "Owner UAT cannot run while the production-activation marker is enabled.",
    ),
    check(
      "release_binding",
      releaseBindingReady(),
      "Owner UAT is bound to the exact deployed Git commit.",
      "OBSERRA_FDACS_OWNER_UAT_RELEASE_SHA must be a 40-character SHA matching VERCEL_GIT_COMMIT_SHA.",
    ),
    check(
      "authorization_expiry",
      expiry.ready,
      "Owner UAT authorization has a valid short-lived expiry.",
      "OBSERRA_FDACS_OWNER_UAT_EXPIRES_AT must be in the future and no more than 14 days away.",
    ),
    check(
      "authorization_evidence",
      SHA256_HEX.test(value("OBSERRA_FDACS_OWNER_UAT_EVIDENCE_SHA256")),
      "A SHA-256 authorization evidence digest is configured.",
      "OBSERRA_FDACS_OWNER_UAT_EVIDENCE_SHA256 must be a 64-character SHA-256 digest.",
    ),
    check(
      "preview_public_origin",
      Boolean(origin),
      "The Stripe return origin is the current Vercel Preview deployment.",
      "VERCEL_URL must be a valid vercel.app Preview hostname.",
    ),
    check(
      "owner_allowlist",
      ownerAllowlist.ready,
      "Exactly one protected owner learner identity is configured; value suppressed.",
      `OBSERRA_OWNER_EMAIL/OBSERRA_OWNER_EMAILS must resolve to exactly one valid owner learner identity (configured unique count: ${ownerAllowlist.count}).`,
      true,
    ),
    check(
      "identity_runtime_enabled",
      trueFlag("OBSERRA_IDENTITY_RUNTIME_ENABLED"),
      "The fail-closed Clerk runtime is explicitly enabled.",
      "OBSERRA_IDENTITY_RUNTIME_ENABLED must be true for protected UAT routes.",
    ),
    check(
      "clerk_identity",
      value("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY").startsWith("pk_") && value("CLERK_SECRET_KEY").startsWith("sk_"),
      "Clerk client and server credentials are configured; values suppressed.",
      "Clerk client and server credentials are required.",
      true,
    ),
    check(
      "fdacs_database",
      value("OBSERRA_FDACS_SUPABASE_URL") === expectedDatabaseOrigin
        && value("OBSERRA_FDACS_SUPABASE_PROJECT_REF") === REQUIRED_FDACS_SUPABASE_PROJECT_REF
        && Boolean(value("OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY")),
      "The isolated FDACS database and protected credential are exactly bound; values suppressed.",
      "The exact isolated FDACS Supabase URL, project reference, and protected service credential are required.",
      true,
    ),
    check(
      "record_encryption",
      floridaClassDRecordEncryptionConfigured(),
      "The application-envelope key and external key reference for regulated instructor evidence are configured; values suppressed.",
      "A valid 32-byte base64 FDACS record-encryption key and external key reference are required.",
      true,
    ),
    check(
      "stripe_identity_live",
      stripeKey.startsWith("sk_live_") && /^whsec_[A-Za-z0-9_]+$/.test(value("STRIPE_IDENTITY_WEBHOOK_SECRET")),
      "Live Stripe Identity and its signed webhook are configured; values suppressed.",
      "A live Stripe key and dedicated signed Identity webhook are required for a real-ID test.",
      true,
    ),
    check(
      "daily_media",
      value("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER").toLowerCase() === "daily"
        && Boolean(value("OBSERRA_FDACS_DAILY_API_KEY")),
      "Daily is configured as the protected live-media provider; credential suppressed.",
      "Daily and its protected API credential are required.",
      true,
    ),
    check(
      "identity_feature",
      enabled("OBSERRA_FDACS_IDENTITY_VERIFICATION_ENABLED"),
      "Identity verification feature is enabled for owner UAT.",
      "OBSERRA_FDACS_IDENTITY_VERIFICATION_ENABLED must be enabled.",
    ),
    check(
      "media_features",
      enabled("OBSERRA_FDACS_CLASS_D_LIVE_ENABLED") && enabled("OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED"),
      "Live and media feature controls are enabled for owner UAT.",
      "Both live and media feature controls must be enabled.",
    ),
    check(
      "scheduling_feature",
      enabled("OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED"),
      "Controlled cohort scheduling is enabled for the exact-release UAT.",
      "OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED must be enabled so a distinct DI instructor can be assigned before video testing.",
    ),
    check(
      "pre_enrollment_feature",
      value("FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED").toLowerCase() === "true",
      "Controlled pre-enrollment is enabled for the owner-only UAT profile.",
      "FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED must equal true.",
    ),
  ];
}

export function getFloridaClassDOwnerUatReport(): FloridaClassDOwnerUatReport {
  const currentChecks = checks();
  const authorized = currentChecks.every((entry) => entry.ready);
  const release = value("OBSERRA_FDACS_OWNER_UAT_RELEASE_SHA");
  const expiry = expiryState();
  return {
    profile: "owner_uat_real_identity_noncredit",
    generatedAt: new Date().toISOString(),
    authorized,
    releaseCommitSha: SHA40.test(release) ? release.toLowerCase() : null,
    expiresAt: expiry.ready ? new Date(expiry.parsed).toISOString() : null,
    publicOrigin: previewPublicOrigin(),
    blockingKeys: currentChecks.filter((entry) => !entry.ready).map((entry) => entry.key),
    checks: currentChecks,
    productionActivationAuthorized: false,
    trainingCreditEligible: false,
    fdacsApprovalClaimed: false,
    secretsExposed: false,
  };
}

export function floridaClassDOwnerUatExecutionAuthorized() {
  return getFloridaClassDOwnerUatReport().authorized;
}

export function floridaClassDOwnerUatProfileRequested() {
  return enabled("OBSERRA_FDACS_OWNER_UAT_AUTHORIZED")
    || enabled("OBSERRA_FDACS_OWNER_UAT_REAL_IDENTITY_AUTHORIZED");
}

export function floridaClassDOwnerUatEvidenceSha256() {
  const digest = value("OBSERRA_FDACS_OWNER_UAT_EVIDENCE_SHA256").toLowerCase();
  return SHA256_HEX.test(digest) ? digest : null;
}

export function floridaClassDOwnerUatPublicOrigin() {
  if (!floridaClassDOwnerUatExecutionAuthorized()) return null;
  return previewPublicOrigin();
}
