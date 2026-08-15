import "server-only";

import {
  floridaClassDServiceRoleKeyAuthorized,
  floridaClassDSupabaseOriginAuthorized,
} from "./florida-class-d-supabase-config";

const SHA40 = /^[0-9a-f]{40}$/i;
const SHA256_HEX = /^[0-9a-f]{64}$/i;
const MAX_OWNER_PREVIEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const REQUIRED_OBSERRA_IDENTITY_PROJECT_REF = "ftkjhmtfyfkartfsnkjb";
const REQUIRED_OBSERRA_IDENTITY_ORIGIN = `https://${REQUIRED_OBSERRA_IDENTITY_PROJECT_REF}.supabase.co`;
const REQUIRED_FDACS_SUPABASE_PROJECT_REF = "ggkxgjhsbgbifiqrhavr";

export const FLORIDA_CLASS_D_OWNER_PREVIEW_WATERMARK = "INTERNAL OWNER UAT — REAL DATA — READ-ONLY — NON-CREDIT";
export const FLORIDA_CLASS_D_PRODUCTION_OWNER_REVIEW_WATERMARK = "INTERNAL OWNER REVIEW — REAL DATA — READ-ONLY — NON-CREDIT";

export type FloridaClassDOwnerReviewMode = "preview_uat" | "production_owner_review";

const OWNER_REVIEW_ENVIRONMENT_VARIABLES = {
  preview_uat: {
    enabled: "OBSERRA_FDACS_OWNER_PREVIEW_ENABLED",
    nonCredit: "OBSERRA_FDACS_OWNER_PREVIEW_NON_CREDIT",
    releaseSha: "OBSERRA_FDACS_OWNER_PREVIEW_RELEASE_SHA",
    expiresAt: "OBSERRA_FDACS_OWNER_PREVIEW_EXPIRES_AT",
    evidenceSha256: "OBSERRA_FDACS_OWNER_PREVIEW_EVIDENCE_SHA256",
  },
  production_owner_review: {
    enabled: "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_AUTHORIZED",
    nonCredit: "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_NON_CREDIT",
    releaseSha: "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_RELEASE_SHA",
    expiresAt: "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_EXPIRES_AT",
    evidenceSha256: "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_EVIDENCE_SHA256",
  },
} as const;

const FORBIDDEN_OWNER_PREVIEW_FLAGS = [
  "OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED",
  "OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED",
  "OBSERRA_FDACS_NONPROD_EXECUTION_AUTHORIZED",
  "OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY",
  "OBSERRA_FDACS_OWNER_UAT_AUTHORIZED",
  "OBSERRA_FDACS_OWNER_UAT_REAL_IDENTITY_AUTHORIZED",
  "OBSERRA_FDACS_IDENTITY_VERIFICATION_ENABLED",
  "OBSERRA_FDACS_CLASS_D_LIVE_ENABLED",
  "OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED",
  "OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED",
  "OBSERRA_FDACS_CLASS_D_MAKEUP_ENABLED",
  "OBSERRA_FDACS_CLASS_D_RECORDED_MAKEUP_ENABLED",
  "OBSERRA_FDACS_CLASS_D_EXAM_ENABLED",
  "OBSERRA_FDACS_CLASS_D_EXAM_ADMIN_ENABLED",
  "OBSERRA_FDACS_CLASS_D_COMPLETION_REVIEW_ENABLED",
  "OBSERRA_FDACS_CLASS_D_LIAS_WORKFLOW_ENABLED",
  "OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED",
  "OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED",
] as const;

export type FloridaClassDOwnerPreviewCheck = {
  key: string;
  ready: boolean;
  detail: string;
  sensitive: boolean;
};

export type FloridaClassDOwnerPreviewReport = {
  profile: "internal_owner_preview_real_readonly_noncredit" | "internal_owner_production_review_real_readonly_noncredit";
  mode: FloridaClassDOwnerReviewMode;
  watermark: typeof FLORIDA_CLASS_D_OWNER_PREVIEW_WATERMARK | typeof FLORIDA_CLASS_D_PRODUCTION_OWNER_REVIEW_WATERMARK;
  generatedAt: string;
  authorized: boolean;
  releaseCommitSha: string | null;
  expiresAt: string | null;
  blockingKeys: string[];
  checks: FloridaClassDOwnerPreviewCheck[];
  productionRuntimeAuthorized: false;
  enrollmentCreationAuthorized: false;
  paymentAuthorized: false;
  trainingDeliveryAuthorized: false;
  trainingCreditEligible: false;
  completionAuthorized: false;
  certificateAuthorized: false;
  liasAuthorized: false;
  realDatabaseReadOnly: true;
  secretsExposed: false;
};

export const FLORIDA_CLASS_D_OWNER_PREVIEW_POLICY = {
  policyVersion: "2026-08-15-owner-review-v2",
  authorizedEnvironments: ["preview", "production_owner_review"],
  ownerAllowlistRequired: true,
  internalOwnerRoleRequired: true,
  aal2Required: true,
  maximumSecondFactorAgeMinutes: 60,
  exactReleaseBindingRequired: true,
  maximumAuthorizationDays: 14,
  realDatabaseReadOnly: true,
  realDailyDiagnosticPermitted: true,
  realEnrollmentProhibited: true,
  regulatedDatabaseWritesProhibited: true,
  paymentProhibited: true,
  trainingDeliveryProhibited: true,
  trainingCreditEligible: false,
  completionCertificateAndLiasProhibited: true,
  productionRuntimeAuthorized: false,
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
): FloridaClassDOwnerPreviewCheck {
  return { key, ready, detail: ready ? readyDetail : blockedDetail, sensitive };
}

function productionOwnerReviewRequested() {
  return enabled("OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_AUTHORIZED");
}

function ownerReviewMode(): FloridaClassDOwnerReviewMode {
  return productionOwnerReviewRequested() ? "production_owner_review" : "preview_uat";
}

function releaseBindingReady(mode: FloridaClassDOwnerReviewMode) {
  const configured = value(OWNER_REVIEW_ENVIRONMENT_VARIABLES[mode].releaseSha);
  const deployed = value("VERCEL_GIT_COMMIT_SHA");
  return SHA40.test(configured) && SHA40.test(deployed) && configured.toLowerCase() === deployed.toLowerCase();
}

function expiryState(mode: FloridaClassDOwnerReviewMode, nowMs: number) {
  const raw = value(OWNER_REVIEW_ENVIRONMENT_VARIABLES[mode].expiresAt);
  const parsed = Date.parse(raw);
  const ready = Number.isFinite(parsed) && parsed > nowMs && parsed - nowMs <= MAX_OWNER_PREVIEW_WINDOW_MS;
  return { raw, parsed, ready };
}

function currentChecks(nowMs: number): FloridaClassDOwnerPreviewCheck[] {
  const mode = ownerReviewMode();
  const production = mode === "production_owner_review";
  const expiry = expiryState(mode, nowMs);
  const enabledForbiddenFlags = FORBIDDEN_OWNER_PREVIEW_FLAGS.filter((name) => enabled(name));
  const previewRequested = enabled("OBSERRA_FDACS_OWNER_PREVIEW_ENABLED");
  const productionRequested = productionOwnerReviewRequested();
  const modeVariables = OWNER_REVIEW_ENVIRONMENT_VARIABLES[mode];

  return [
    check(
      "owner_review_mode_exclusive",
      previewRequested !== productionRequested,
      "Exactly one internal owner-review mode is selected.",
      "Exactly one of OBSERRA_FDACS_OWNER_PREVIEW_ENABLED or OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_AUTHORIZED must be enabled.",
    ),
    check(
      production ? "production_owner_review_environment" : "preview_environment",
      value("VERCEL_ENV").toLowerCase() === (production ? "production" : "preview"),
      production ? "Canonical Vercel production owner-review environment confirmed." : "Vercel Preview environment confirmed.",
      production ? "Production owner review requires VERCEL_ENV=production." : "Internal owner preview is available only in Vercel Preview.",
    ),
    check(
      production ? "production_owner_review_authorized" : "uat_runtime",
      production ? productionRequested : value("OBSERRA_FDACS_RUNTIME_ENVIRONMENT").toLowerCase() === "uat",
      production ? "Distinct production owner-review authorization is enabled." : "Runtime is explicitly designated UAT.",
      production ? "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_AUTHORIZED must be explicitly enabled." : "OBSERRA_FDACS_RUNTIME_ENVIRONMENT must equal uat.",
    ),
    check(
      "noncredit_acknowledged",
      value(modeVariables.nonCredit).toLowerCase() === "acknowledged",
      "Non-credit owner inspection boundary is acknowledged.",
      `${modeVariables.nonCredit} must equal acknowledged.`,
    ),
    check(
      "release_binding",
      releaseBindingReady(mode),
      "Owner-review authorization is bound to the exact deployed Git commit.",
      `${modeVariables.releaseSha} must be a 40-character SHA matching VERCEL_GIT_COMMIT_SHA.`,
    ),
    check(
      "authorization_expiry",
      expiry.ready,
      "Owner-review authorization has a valid short-lived expiry.",
      `${modeVariables.expiresAt} must be in the future and no more than fourteen days away.`,
    ),
    check(
      "authorization_evidence",
      SHA256_HEX.test(value(modeVariables.evidenceSha256)),
      "A SHA-256 authorization evidence digest is configured.",
      `${modeVariables.evidenceSha256} must be a 64-character SHA-256 digest.`,
    ),
    check(
      "supabase_identity_runtime",
      trueFlag("OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED"),
      "Protected legal-entity identity runtime is enabled.",
      "OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED must be true.",
    ),
    check(
      "supabase_identity_project",
      value("NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL") === REQUIRED_OBSERRA_IDENTITY_ORIGIN
        && value("OBSERRA_AUTH_SUPABASE_PROJECT_REF") === REQUIRED_OBSERRA_IDENTITY_PROJECT_REF
        && value("NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY").startsWith("sb_publishable_"),
      "The dedicated legal-entity identity project and public client credential are exactly bound; value suppressed.",
      "The exact dedicated identity origin, project reference, and public client credential are required.",
      true,
    ),
    check(
      "daily_provider",
      value("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER").toLowerCase() === "daily"
        && Boolean(value("OBSERRA_FDACS_DAILY_API_KEY")),
      "Daily is configured for the isolated owner diagnostic; credential suppressed.",
      "OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER must equal daily and the protected Daily key must be configured.",
      true,
    ),
    check(
      "fdacs_database_readonly",
      floridaClassDSupabaseOriginAuthorized(
        value("OBSERRA_FDACS_SUPABASE_URL"),
        value("OBSERRA_FDACS_SUPABASE_PROJECT_REF"),
      ) && floridaClassDServiceRoleKeyAuthorized(value("OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY"))
        && value("OBSERRA_FDACS_SUPABASE_PROJECT_REF") === REQUIRED_FDACS_SUPABASE_PROJECT_REF,
      "The exact isolated FDACS database and read credential are configured; values suppressed.",
      "The exact isolated FDACS Supabase origin, project reference, and protected service credential are required for real read-only state.",
      true,
    ),
    check(
      "regulated_flags_disabled",
      enabledForbiddenFlags.length === 0,
      "Production and regulated execution flags remain disabled.",
      `Owner preview cannot run while regulated execution flags are enabled (${enabledForbiddenFlags.join(", ") || "none"}).`,
    ),
    check(
      "pre_enrollment_disabled",
      !trueFlag("FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED"),
      "Enrollment creation remains disabled.",
      "FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED must remain false.",
    ),
  ];
}

export function getFloridaClassDOwnerPreviewReport(nowMs = Date.now()): FloridaClassDOwnerPreviewReport {
  const mode = ownerReviewMode();
  const checks = currentChecks(nowMs);
  const expiry = expiryState(mode, nowMs);
  const release = value(OWNER_REVIEW_ENVIRONMENT_VARIABLES[mode].releaseSha);
  return {
    profile: mode === "production_owner_review"
      ? "internal_owner_production_review_real_readonly_noncredit"
      : "internal_owner_preview_real_readonly_noncredit",
    mode,
    watermark: mode === "production_owner_review"
      ? FLORIDA_CLASS_D_PRODUCTION_OWNER_REVIEW_WATERMARK
      : FLORIDA_CLASS_D_OWNER_PREVIEW_WATERMARK,
    generatedAt: new Date(nowMs).toISOString(),
    authorized: checks.every((entry) => entry.ready),
    releaseCommitSha: SHA40.test(release) ? release.toLowerCase() : null,
    expiresAt: expiry.ready ? new Date(expiry.parsed).toISOString() : null,
    blockingKeys: checks.filter((entry) => !entry.ready).map((entry) => entry.key),
    checks,
    productionRuntimeAuthorized: false,
    enrollmentCreationAuthorized: false,
    paymentAuthorized: false,
    trainingDeliveryAuthorized: false,
    trainingCreditEligible: false,
    completionAuthorized: false,
    certificateAuthorized: false,
    liasAuthorized: false,
    realDatabaseReadOnly: true,
    secretsExposed: false,
  };
}

export function floridaClassDOwnerPreviewExecutionAuthorized() {
  return getFloridaClassDOwnerPreviewReport().authorized;
}

export function floridaClassDOwnerPreviewProfileRequested() {
  return enabled("OBSERRA_FDACS_OWNER_PREVIEW_ENABLED") || productionOwnerReviewRequested();
}

export function floridaClassDProductionOwnerReviewExecutionAuthorized() {
  const report = getFloridaClassDOwnerPreviewReport();
  return report.mode === "production_owner_review" && report.authorized;
}
