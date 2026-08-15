import "server-only";

import { getFloridaClassDHaEvidenceReport } from "./florida-class-d-ha-evidence";
import {
  floridaClassDOwnerUatExecutionAuthorized,
  floridaClassDOwnerUatProfileRequested,
} from "./florida-class-d-owner-uat";

const SHA40 = /^[0-9a-f]{40}$/i;
const SHA256_HEX = /^[0-9a-f]{64}$/i;
const CANONICAL_PUBLIC_ORIGIN = "https://www.obserrallc.com";
const REQUIRED_DOCUMENT_BUCKET = "fdacs-class-d-completion-documents";
const REQUIRED_FDACS_SUPABASE_PROJECT_REF = "ggkxgjhsbgbifiqrhavr";
const NONPRODUCTION_ENVIRONMENTS = new Set(["development", "sandbox", "staging", "uat"]);
const MAX_HA_RTO_MINUTES = 60;
const MAX_HA_RPO_MINUTES = 15;
const MAX_FAILOVER_TEST_AGE_DAYS = 90;

export const EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION = "20260815170000";
export const EXPECTED_FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256 = "2fae1d73554e3455d765b55b8df4aec25a40f29420497308a5443156cab01487";

export const FLORIDA_CLASS_D_REGULATED_FEATURE_FLAGS = [
  "OBSERRA_FDACS_PUBLIC_LEARNER_CONTROLS_ENABLED",
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

export const FLORIDA_CLASS_D_HA_STATUS_KEYS = [
  "OBSERRA_FDACS_HA_EDGE_DNS_STATUS",
  "OBSERRA_FDACS_HA_APPLICATION_STATUS",
  "OBSERRA_FDACS_HA_IDENTITY_STATUS",
  "OBSERRA_FDACS_HA_DATABASE_STATUS",
  "OBSERRA_FDACS_HA_MEDIA_STATUS",
  "OBSERRA_FDACS_HA_DOCUMENT_STORAGE_STATUS",
  "OBSERRA_FDACS_HA_COMMERCE_STATUS",
  "OBSERRA_FDACS_HA_OBSERVABILITY_STATUS",
  "OBSERRA_FDACS_HA_BACKUP_RESTORE_STATUS",
  "OBSERRA_FDACS_HA_FAILOVER_EXERCISE_STATUS",
] as const;

export type FloridaClassDProductionActivationCheck = {
  key: string;
  label: string;
  ready: boolean;
  detail: string;
  sensitive: boolean;
};

export type FloridaClassDProductionActivationReport = {
  generatedAt: string;
  releaseCandidateShaPresent: boolean;
  releaseCandidateSha: string | null;
  readyForOwnerActivationDecision: boolean;
  productionActivationAuthorized: boolean;
  regulatedFeatureFlagsEnabled: string[];
  unauthorizedEnabledFeatureFlags: string[];
  blockingKeys: string[];
  checks: FloridaClassDProductionActivationCheck[];
  secretsExposed: false;
};

export const FLORIDA_CLASS_D_PRODUCTION_ACTIVATION_POLICY = {
  policyVersion: "2026-08-13-gate-31-v1",
  canonicalPublicOrigin: CANONICAL_PUBLIC_ORIGIN,
  exactReleaseBindingRequired: true,
  exactUatReleaseBindingRequired: true,
  exactDeploymentReleaseBindingRequired: true,
  liveClerkCredentialsRequired: true,
  liveStripeIdentityCredentialsRequired: true,
  automatedGovernmentIdAndMatchingSelfieRequired: true,
  instructorIdentityAttestationRequired: true,
  dailyInstructorIdentityCheckinRequired: true,
  protectedDatabaseConfigurationRequired: true,
  dailyMediaConfigurationRequired: true,
  activeClassDSLicenseRequired: true,
  privateClassDILicenseRequired: true,
  databasePromotionVerificationRequired: true,
  migrationManifestRequired: true,
  databasePromotionSourceMustMatchCandidate: true,
  databaseAppliedMigrationVersionRequired: true,
  divisionApprovedExamBankAuthorizationRequired: true,
  liasProcedureVerificationRequired: true,
  securityAcceptanceRequired: true,
  rollbackVerificationRequired: true,
  explicitOwnerReleaseApprovalRequired: true,
  explicitProductionActivationAuthorizationRequired: true,
  perFeatureFlagsRemainIndependentlyRequired: true,
  explicitNonProductionExecutionAuthorizationRequired: true,
  syntheticIdentityOnlyRequiredForNonProductionExecution: true,
  distinctOwnerRealIdentityUatRequired: true,
  ownerRealIdentityUatIsPreviewOnly: true,
  ownerRealIdentityUatIsNoncredit: true,
  ownerRealIdentityUatCannotAuthorizeProduction: true,
  highAvailabilityRequiredForAllProductionSubsystems: true,
  cryptographicHaEvidenceRequired: true,
  maxRtoMinutes: MAX_HA_RTO_MINUTES,
  maxRpoMinutes: MAX_HA_RPO_MINUTES,
  maxFailoverTestAgeDays: MAX_FAILOVER_TEST_AGE_DAYS,
  reportExposesSecretValues: false,
} as const;

function value(name: string) {
  return process.env[name]?.trim() || "";
}

function enabled(name: string) {
  return value(name).toLowerCase() === "enabled";
}

function exact(name: string, expected: string) {
  return value(name).toLowerCase() === expected.toLowerCase();
}

function present(name: string) {
  return value(name).length > 0;
}

function validSha(input: string) {
  return SHA40.test(input);
}

function validSha256(input: string) {
  return SHA256_HEX.test(input);
}

function integerValue(name: string) {
  const raw = value(name);
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function recentTimestamp(name: string, maxAgeDays: number) {
  const raw = value(name);
  if (!raw) return false;
  const timestamp = Date.parse(raw);
  if (!Number.isFinite(timestamp)) return false;
  const ageMs = Date.now() - timestamp;
  return ageMs >= 0 && ageMs <= maxAgeDays * 24 * 60 * 60 * 1000;
}

function check(
  key: string,
  label: string,
  ready: boolean,
  readyDetail: string,
  blockedDetail: string,
  sensitive = false,
): FloridaClassDProductionActivationCheck {
  return {
    key,
    label,
    ready,
    detail: ready ? readyDetail : blockedDetail,
    sensitive,
  };
}

function highAvailabilityChecks(): FloridaClassDProductionActivationCheck[] {
  const statusChecks = FLORIDA_CLASS_D_HA_STATUS_KEYS.map((name) => check(
    `ha:${name}`,
    `${name} verified`,
    exact(name, "verified"),
    "Verified HA evidence is recorded.",
    `${name} must be verified with authentic production-readiness evidence before activation.`,
  ));
  const rto = integerValue("OBSERRA_FDACS_HA_RTO_MINUTES");
  const rpo = integerValue("OBSERRA_FDACS_HA_RPO_MINUTES");
  const evidence = getFloridaClassDHaEvidenceReport(value("OBSERRA_FDACS_RELEASE_CANDIDATE_SHA"));

  return [
    ...statusChecks,
    check(
      "ha:evidence_manifest",
      "Candidate-bound HA evidence manifest is cryptographically verified",
      evidence.ready,
      "HA evidence manifest, per-evidence digests, release binding, subsystem coverage, recovery objectives, and evidence recency are verified.",
      "A valid candidate-bound HA evidence manifest and matching SHA-256 are required. Status markers alone cannot authorize production activation.",
      true,
    ),
    check(
      "ha:rto",
      `Recovery time objective is ${MAX_HA_RTO_MINUTES} minutes or less`,
      rto !== null && rto > 0 && rto <= MAX_HA_RTO_MINUTES,
      "RTO target is within the controlled HA threshold.",
      `OBSERRA_FDACS_HA_RTO_MINUTES must be a positive integer no greater than ${MAX_HA_RTO_MINUTES}.`,
    ),
    check(
      "ha:rpo",
      `Recovery point objective is ${MAX_HA_RPO_MINUTES} minutes or less`,
      rpo !== null && rpo >= 0 && rpo <= MAX_HA_RPO_MINUTES,
      "RPO target is within the controlled HA threshold.",
      `OBSERRA_FDACS_HA_RPO_MINUTES must be an integer from 0 through ${MAX_HA_RPO_MINUTES}.`,
    ),
    check(
      "ha:recent_failover_test",
      `End-to-end failover exercise completed within ${MAX_FAILOVER_TEST_AGE_DAYS} days`,
      recentTimestamp("OBSERRA_FDACS_HA_LAST_FAILOVER_TEST_AT", MAX_FAILOVER_TEST_AGE_DAYS),
      "Recent end-to-end failover exercise is recorded.",
      `OBSERRA_FDACS_HA_LAST_FAILOVER_TEST_AT must contain a valid timestamp no older than ${MAX_FAILOVER_TEST_AGE_DAYS} days.`,
    ),
  ];
}

function coreChecks(): FloridaClassDProductionActivationCheck[] {
  const candidate = value("OBSERRA_FDACS_RELEASE_CANDIDATE_SHA");
  const accepted = value("OBSERRA_FDACS_UAT_ACCEPTED_RELEASE_SHA");
  const deployed = value("VERCEL_GIT_COMMIT_SHA");
  const publicOrigin = value("OBSERRA_FDACS_PUBLIC_ORIGIN");
  const supabaseUrl = value("OBSERRA_FDACS_SUPABASE_URL");
  const serviceRolePresent = present("OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY");
  const mediaProvider = value("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER").toLowerCase();
  const documentsBucket = value("OBSERRA_FDACS_DOCUMENTS_BUCKET");
  const dbPromotionSourceSha = value("OBSERRA_FDACS_DB_PROMOTION_SOURCE_SHA");
  const appliedMigrationVersion = value("OBSERRA_FDACS_DB_APPLIED_MIGRATION_VERSION");
  const migrationManifestSha256 = value("OBSERRA_FDACS_DB_MIGRATION_MANIFEST_SHA256").toLowerCase();
  const expectedSupabaseOrigin = `https://${REQUIRED_FDACS_SUPABASE_PROJECT_REF}.supabase.co`;

  return [
    check(
      "release_candidate_sha",
      "Exact release candidate SHA configured",
      validSha(candidate),
      "Configured as a 40-character Git commit SHA.",
      "OBSERRA_FDACS_RELEASE_CANDIDATE_SHA must identify the exact frozen production candidate.",
    ),
    check(
      "uat_release_binding",
      "Candidate-bound Gate 23 UAT accepted",
      validSha(candidate) && validSha(accepted) && accepted.toLowerCase() === candidate.toLowerCase(),
      "Accepted UAT SHA matches the release candidate.",
      "OBSERRA_FDACS_UAT_ACCEPTED_RELEASE_SHA must be a 40-character SHA exactly matching the frozen release candidate.",
    ),
    check(
      "deployed_release_binding",
      "Production deployment SHA matches candidate",
      validSha(candidate) && validSha(deployed) && deployed.toLowerCase() === candidate.toLowerCase(),
      "Vercel production deployment SHA matches the frozen release candidate.",
      "VERCEL_GIT_COMMIT_SHA must exactly match the frozen release candidate before activation.",
    ),
    check(
      "production_environment",
      "Runtime is the production deployment environment",
      value("VERCEL_ENV").toLowerCase() === "production",
      "Production environment confirmed.",
      "VERCEL_ENV must be production.",
    ),
    check(
      "owner_uat_profile_disabled",
      "Owner UAT profile is disabled for production activation",
      !floridaClassDOwnerUatProfileRequested(),
      "Owner UAT profile is disabled.",
      "Owner UAT authorization markers must be removed before any production activation decision.",
    ),
    check(
      "canonical_public_origin",
      "Canonical regulated public origin configured",
      publicOrigin === CANONICAL_PUBLIC_ORIGIN,
      "Canonical origin matches www.obserrallc.com.",
      "OBSERRA_FDACS_PUBLIC_ORIGIN must exactly equal https://www.obserrallc.com.",
    ),
    check(
      "clerk_live_publishable",
      "Production Clerk publishable key configured",
      value("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY").startsWith("pk_live_"),
      "Live Clerk publishable configuration detected; value suppressed.",
      "A live Clerk publishable key is required.",
      true,
    ),
    check(
      "clerk_live_secret",
      "Production Clerk server credential configured",
      value("CLERK_SECRET_KEY").startsWith("sk_live_"),
      "Live Clerk server configuration detected; value suppressed.",
      "A live Clerk server credential is required.",
      true,
    ),
    check(
      "supabase_url",
      "Dedicated FDACS Supabase project exactly bound",
      supabaseUrl === expectedSupabaseOrigin && value("OBSERRA_FDACS_SUPABASE_PROJECT_REF") === REQUIRED_FDACS_SUPABASE_PROJECT_REF,
      "Dedicated FDACS student-record database binding verified; hostname suppressed.",
      "OBSERRA_FDACS_SUPABASE_URL and OBSERRA_FDACS_SUPABASE_PROJECT_REF must exactly identify the isolated FDACS project.",
      true,
    ),
    check(
      "supabase_service_role",
      "Protected database service credential configured",
      serviceRolePresent,
      "Protected database credential configured; value suppressed.",
      "A protected Supabase service-role credential is required.",
      true,
    ),
    check(
      "stripe_identity_live",
      "Live Stripe Identity document and matching-selfie service configured",
      value("STRIPE_SECRET_KEY").startsWith("sk_live_") && /^whsec_[A-Za-z0-9_]+$/.test(value("STRIPE_IDENTITY_WEBHOOK_SECRET")),
      "Live Stripe Identity key and dedicated signed-webhook secret detected; values suppressed.",
      "A live Stripe key and dedicated STRIPE_IDENTITY_WEBHOOK_SECRET are required for automated identity verification.",
      true,
    ),
    check(
      "daily_provider",
      "Daily production media provider configured",
      mediaProvider === "daily" && present("OBSERRA_FDACS_DAILY_API_KEY"),
      "Daily provider and protected credential configured.",
      "Daily must be selected and its protected API credential configured.",
      true,
    ),
    check(
      "ds_license",
      "Class DS school license is active and configured privately",
      exact("OBSERRA_FDACS_DS_LICENSE_STATUS", "active") && present("OBSERRA_FDACS_DS_LICENSE_NUMBER"),
      "Active Class DS licensing state configured; license value suppressed.",
      "Class DS status must be active and the actual issued license number configured privately.",
      true,
    ),
    check(
      "di_license",
      "Class DI instructor license configured privately",
      present("OBSERRA_FDACS_DI_LICENSE_NUMBER"),
      "Class DI configuration present; value suppressed.",
      "The authorized Class DI instructor license number must be configured privately.",
      true,
    ),
    check(
      "documents_bucket",
      "Regulated completion-document bucket exactly bound",
      documentsBucket === REQUIRED_DOCUMENT_BUCKET,
      "Private completion-document bucket binding verified; name suppressed from report consumers.",
      "OBSERRA_FDACS_DOCUMENTS_BUCKET must equal the controlled completion-document bucket.",
      true,
    ),
    check(
      "database_promotion",
      "Production database promotion and post-migration verification complete",
      exact("OBSERRA_FDACS_DB_PROMOTION_STATUS", "verified"),
      "Database promotion status is verified.",
      "OBSERRA_FDACS_DB_PROMOTION_STATUS must be verified after controlled production migration and post-migration checks.",
    ),
    check(
      "database_promotion_source_sha",
      "Production database promotion source matches frozen candidate",
      validSha(candidate) && validSha(dbPromotionSourceSha) && dbPromotionSourceSha.toLowerCase() === candidate.toLowerCase(),
      "Database promotion source SHA matches the frozen release candidate.",
      "OBSERRA_FDACS_DB_PROMOTION_SOURCE_SHA must be a 40-character SHA exactly matching the frozen release candidate.",
    ),
    check(
      "database_applied_migration_version",
      "Production database latest applied regulated migration exactly matches source",
      appliedMigrationVersion === EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION,
      "Applied regulated migration version matches the controlled source lineage.",
      `OBSERRA_FDACS_DB_APPLIED_MIGRATION_VERSION must equal ${EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION}.`,
    ),
    check(
      "database_migration_manifest_sha256",
      "Production database promotion manifest matches controlled migration lineage",
      validSha256(migrationManifestSha256) && migrationManifestSha256 === EXPECTED_FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256,
      "Database promotion manifest SHA-256 matches the controlled regulated migration manifest.",
      "OBSERRA_FDACS_DB_MIGRATION_MANIFEST_SHA256 must exactly match the source-controlled regulated migration manifest digest.",
    ),
    check(
      "exam_bank_authorization",
      "Division-approved examination-bank boundary authorized",
      exact("OBSERRA_FDACS_EXAM_BANK_STATUS", "authorized"),
      "Examination-bank authorization state is recorded.",
      "OBSERRA_FDACS_EXAM_BANK_STATUS must be authorized before production examination activation.",
    ),
    check(
      "lias_procedure",
      "LIAS operating procedure verified",
      exact("OBSERRA_FDACS_LIAS_PROCEDURE_STATUS", "verified"),
      "LIAS operating procedure is verified.",
      "OBSERRA_FDACS_LIAS_PROCEDURE_STATUS must be verified.",
    ),
    check(
      "security_acceptance",
      "Production security acceptance approved",
      exact("OBSERRA_FDACS_SECURITY_ACCEPTANCE_STATUS", "approved"),
      "Security acceptance approved.",
      "OBSERRA_FDACS_SECURITY_ACCEPTANCE_STATUS must be approved.",
    ),
    check(
      "rollback_verification",
      "Production rollback verification complete",
      exact("OBSERRA_FDACS_ROLLBACK_STATUS", "verified"),
      "Rollback verification recorded.",
      "OBSERRA_FDACS_ROLLBACK_STATUS must be verified.",
    ),
    ...highAvailabilityChecks(),
    check(
      "owner_release_approval",
      "Owner release approval recorded",
      exact("OBSERRA_FDACS_OWNER_RELEASE_APPROVAL", "approved"),
      "Owner release approval recorded.",
      "OBSERRA_FDACS_OWNER_RELEASE_APPROVAL must be approved for the exact release candidate.",
    ),
  ];
}

function activationAuthorizationMarkerReady() {
  return enabled("OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED");
}

function baseProductionConditionsReady() {
  return coreChecks().every((entry) => entry.ready);
}

export function floridaClassDProductionActivationAuthorized() {
  return baseProductionConditionsReady() && activationAuthorizationMarkerReady();
}

export function floridaClassDPublicLearnerControlsEnabled() {
  return (
    floridaClassDProductionActivationAuthorized()
    && enabled("OBSERRA_FDACS_PUBLIC_LEARNER_CONTROLS_ENABLED")
  );
}

export function floridaClassDNonProductionExecutionAuthorized() {
  const runtimeEnvironment = value("OBSERRA_FDACS_RUNTIME_ENVIRONMENT").toLowerCase();
  return (
    value("VERCEL_ENV").toLowerCase() !== "production" &&
    !floridaClassDOwnerUatProfileRequested() &&
    NONPRODUCTION_ENVIRONMENTS.has(runtimeEnvironment) &&
    enabled("OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED") &&
    enabled("OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY") &&
    enabled("OBSERRA_FDACS_NONPROD_EXECUTION_AUTHORIZED")
  );
}

export function floridaClassDRegulatedExecutionAuthorized() {
  return (
    floridaClassDProductionActivationAuthorized()
    || floridaClassDNonProductionExecutionAuthorized()
    || floridaClassDOwnerUatExecutionAuthorized()
  );
}

export function getFloridaClassDProductionActivationReport(): FloridaClassDProductionActivationReport {
  const candidate = value("OBSERRA_FDACS_RELEASE_CANDIDATE_SHA");
  const checks = coreChecks();
  const baseReady = checks.every((entry) => entry.ready);
  const activationAuthorized = baseReady && activationAuthorizationMarkerReady();
  const enabledFlags = FLORIDA_CLASS_D_REGULATED_FEATURE_FLAGS.filter((name) => enabled(name));
  const preEnrollmentEnabled = value("FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED").toLowerCase() === "true";
  const regulatedFeatureFlagsEnabled = [
    ...enabledFlags,
    ...(preEnrollmentEnabled ? ["FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED"] : []),
  ];
  const unauthorizedEnabledFeatureFlags = activationAuthorized ? [] : regulatedFeatureFlagsEnabled;
  const blockingKeys = [
    ...checks.filter((entry) => !entry.ready).map((entry) => entry.key),
    ...(!activationAuthorizationMarkerReady() ? ["production_activation_authorized"] : []),
    ...(unauthorizedEnabledFeatureFlags.length > 0 ? ["unauthorized_feature_flags"] : []),
  ];

  return {
    generatedAt: new Date().toISOString(),
    releaseCandidateShaPresent: validSha(candidate),
    releaseCandidateSha: validSha(candidate) ? candidate.toLowerCase() : null,
    readyForOwnerActivationDecision: baseReady && !activationAuthorizationMarkerReady() && regulatedFeatureFlagsEnabled.length === 0,
    productionActivationAuthorized: activationAuthorized,
    regulatedFeatureFlagsEnabled,
    unauthorizedEnabledFeatureFlags,
    blockingKeys,
    checks: [
      ...checks,
      check(
        "production_activation_authorized",
        "Explicit production activation authorization",
        activationAuthorizationMarkerReady(),
        "Explicit activation authorization marker is enabled.",
        "OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED remains disabled until the final owner-controlled activation decision.",
      ),
    ],
    secretsExposed: false,
  };
}
