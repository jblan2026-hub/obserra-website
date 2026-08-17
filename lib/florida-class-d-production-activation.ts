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

export const EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION = "20260817104500";
export const EXPECTED_FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256 = "bbf692442c2e933892a56d34816dd11c05cdbc6de4092b157f475a6191a032a8";

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
  return value(name) === expected;
}

function sha(name: string) {
  return SHA40.test(value(name));
}

function sha256(name: string) {
  return SHA256_HEX.test(value(name));
}

function yes(name: string) {
  return value(name).toLowerCase() === "true";
}

function ageDays(valueToParse: string) {
  const parsed = Date.parse(valueToParse);
  if (!Number.isFinite(parsed)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (Date.now() - parsed) / 86_400_000);
}

function positiveNumber(name: string) {
  const parsed = Number(value(name));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function present(name: string) {
  return value(name).length > 0;
}

function item(
  key: string,
  label: string,
  ready: boolean,
  detail: string,
  sensitive = false,
): FloridaClassDProductionActivationCheck {
  return { key, label, ready, detail, sensitive };
}

function productionCandidate() {
  const candidate = value("OBSERRA_FDACS_PRODUCTION_RELEASE_CANDIDATE_SHA");
  return SHA40.test(candidate) ? candidate : "";
}

function regulatedFeatureFlagsEnabled() {
  return FLORIDA_CLASS_D_REGULATED_FEATURE_FLAGS.filter((name) => enabled(name));
}

function highAvailabilityItems(): FloridaClassDProductionActivationCheck[] {
  const report = getFloridaClassDHaEvidenceReport();
  const evidenceBound = report.manifestBindingValid;
  const rto = positiveNumber("OBSERRA_FDACS_HA_RTO_MINUTES");
  const rpo = positiveNumber("OBSERRA_FDACS_HA_RPO_MINUTES");
  const failoverDate = value("OBSERRA_FDACS_HA_LAST_FAILOVER_TEST_AT");
  const statusItems = FLORIDA_CLASS_D_HA_STATUS_KEYS.map((name) => item(
    `ha:${name}`,
    `${name} verified`,
    enabled(name),
    enabled(name) ? "Verified." : "Missing or not verified.",
  ));

  return [
    ...statusItems,
    item(
      "ha:evidence_manifest",
      "High-availability evidence manifest cryptographically bound",
      evidenceBound,
      evidenceBound ? "Manifest binding verified." : "HA evidence manifest binding is missing or invalid.",
      true,
    ),
    item(
      "ha:rto",
      "Recovery-time objective is within policy",
      rto !== null && rto <= MAX_HA_RTO_MINUTES,
      rto !== null && rto <= MAX_HA_RTO_MINUTES ? "RTO satisfies policy." : `RTO must be <= ${MAX_HA_RTO_MINUTES} minutes.`,
    ),
    item(
      "ha:rpo",
      "Recovery-point objective is within policy",
      rpo !== null && rpo <= MAX_HA_RPO_MINUTES,
      rpo !== null && rpo <= MAX_HA_RPO_MINUTES ? "RPO satisfies policy." : `RPO must be <= ${MAX_HA_RPO_MINUTES} minutes.`,
    ),
    item(
      "ha:failover_age",
      "Failover exercise evidence is current",
      failoverDate.length > 0 && ageDays(failoverDate) <= MAX_FAILOVER_TEST_AGE_DAYS,
      failoverDate.length > 0 && ageDays(failoverDate) <= MAX_FAILOVER_TEST_AGE_DAYS
        ? "Failover exercise age satisfies policy."
        : `Failover exercise must be <= ${MAX_FAILOVER_TEST_AGE_DAYS} days old.`,
    ),
  ];
}

export function getFloridaClassDProductionActivationReport(): FloridaClassDProductionActivationReport {
  const candidate = productionCandidate();
  const deployedSha = value("VERCEL_GIT_COMMIT_SHA");
  const productionOrigin = value("OBSERRA_FDACS_PRODUCTION_ORIGIN");
  const dbPromotionSourceSha = value("OBSERRA_FDACS_DB_PROMOTION_SOURCE_SHA");
  const appliedMigrationVersion = value("OBSERRA_FDACS_DB_APPLIED_MIGRATION_VERSION");
  const migrationManifestSha256 = value("OBSERRA_FDACS_DB_MIGRATION_MANIFEST_SHA256").toLowerCase();
  const enabledFlags = regulatedFeatureFlagsEnabled();
  const ownerUatRequested = floridaClassDOwnerUatProfileRequested();
  const ownerUatAuthorized = floridaClassDOwnerUatExecutionAuthorized();

  const checks: FloridaClassDProductionActivationCheck[] = [
    item("candidate_sha", "Frozen production release candidate SHA present", candidate.length > 0, candidate ? "Configured." : "Missing or invalid."),
    item(
      "deployment_sha",
      "Deployed Vercel release matches frozen production candidate",
      candidate.length > 0 && SHA40.test(deployedSha) && deployedSha.toLowerCase() === candidate.toLowerCase(),
      candidate.length > 0 && SHA40.test(deployedSha) && deployedSha.toLowerCase() === candidate.toLowerCase()
        ? "Exact deployed release binding verified."
        : "VERCEL_GIT_COMMIT_SHA must exactly match the frozen production candidate.",
    ),
    item("canonical_origin", "Canonical production origin exactly bound", productionOrigin === CANONICAL_PUBLIC_ORIGIN, productionOrigin === CANONICAL_PUBLIC_ORIGIN ? "Exact canonical origin verified." : "Canonical production origin is not exactly bound."),
    item("clerk_public", "Live Clerk publishable credential configured", present("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"), present("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") ? "Configured." : "Missing.", true),
    item("clerk_secret", "Live Clerk server credential configured", present("CLERK_SECRET_KEY"), present("CLERK_SECRET_KEY") ? "Configured." : "Missing.", true),
    item("stripe_identity", "Stripe Identity server credential configured", present("STRIPE_SECRET_KEY") && present("STRIPE_IDENTITY_WEBHOOK_SECRET"), present("STRIPE_SECRET_KEY") && present("STRIPE_IDENTITY_WEBHOOK_SECRET") ? "Configured." : "Missing Stripe Identity configuration.", true),
    item("identity_policy", "Government-ID plus matching-selfie verification policy enabled", exact("OBSERRA_FDACS_IDENTITY_POLICY", "government_id_and_matching_selfie"), exact("OBSERRA_FDACS_IDENTITY_POLICY", "government_id_and_matching_selfie") ? "Configured." : "Required identity policy is not configured."),
    item("instructor_attestation", "Instructor identity attestation required", yes("OBSERRA_FDACS_INSTRUCTOR_IDENTITY_ATTESTATION_REQUIRED"), yes("OBSERRA_FDACS_INSTRUCTOR_IDENTITY_ATTESTATION_REQUIRED") ? "Required." : "Must be required."),
    item("daily_checkin", "Daily instructor identity check-in required", yes("OBSERRA_FDACS_DAILY_INSTRUCTOR_IDENTITY_CHECKIN_REQUIRED"), yes("OBSERRA_FDACS_DAILY_INSTRUCTOR_IDENTITY_CHECKIN_REQUIRED") ? "Required." : "Must be required."),
    item("fdacs_project", "Isolated FDACS production database project exactly bound", exact("OBSERRA_FDACS_SUPABASE_PROJECT_REF", REQUIRED_FDACS_SUPABASE_PROJECT_REF), exact("OBSERRA_FDACS_SUPABASE_PROJECT_REF", REQUIRED_FDACS_SUPABASE_PROJECT_REF) ? "Exact project binding verified." : "FDACS production database project reference mismatch.", true),
    item("fdacs_url", "Isolated FDACS database URL configured", present("OBSERRA_FDACS_SUPABASE_URL"), present("OBSERRA_FDACS_SUPABASE_URL") ? "Configured." : "Missing.", true),
    item("fdacs_service_role", "FDACS service-role credential configured", present("OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY"), present("OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY") ? "Configured." : "Missing.", true),
    item("daily_provider", "Daily selected as regulated live-media provider", exact("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER", "daily"), exact("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER", "daily") ? "Provider verified." : "Daily provider is not configured."),
    item("daily_key", "Daily server credential configured", present("OBSERRA_FDACS_DAILY_API_KEY"), present("OBSERRA_FDACS_DAILY_API_KEY") ? "Configured." : "Missing.", true),
    item("document_bucket", "Private FDACS completion-document bucket exactly bound", exact("OBSERRA_FDACS_DOCUMENTS_BUCKET", REQUIRED_DOCUMENT_BUCKET), exact("OBSERRA_FDACS_DOCUMENTS_BUCKET", REQUIRED_DOCUMENT_BUCKET) ? "Exact private bucket binding verified." : "Completion-document bucket mismatch.", true),
    item("ds_status", "Class DS school license is active", exact("OBSERRA_FDACS_DS_LICENSE_STATUS", "active"), exact("OBSERRA_FDACS_DS_LICENSE_STATUS", "active") ? "Active." : "Class DS school license is not active."),
    item("ds_license", "Class DS school license number configured", present("OBSERRA_FDACS_DS_LICENSE_NUMBER"), present("OBSERRA_FDACS_DS_LICENSE_NUMBER") ? "Configured." : "Missing.", true),
    item("di_license", "Class DI instructor license number configured", present("OBSERRA_FDACS_DI_LICENSE_NUMBER"), present("OBSERRA_FDACS_DI_LICENSE_NUMBER") ? "Configured." : "Missing.", true),
    item("db_promotion_status", "Production database promotion verified", exact("OBSERRA_FDACS_DB_PROMOTION_STATUS", "verified"), exact("OBSERRA_FDACS_DB_PROMOTION_STATUS", "verified") ? "Verified." : "Database promotion not verified."),
    item("db_promotion_sha", "Database promotion is bound to the frozen release candidate", candidate.length > 0 && SHA40.test(dbPromotionSourceSha) && dbPromotionSourceSha.toLowerCase() === candidate.toLowerCase(), candidate.length > 0 && SHA40.test(dbPromotionSourceSha) && dbPromotionSourceSha.toLowerCase() === candidate.toLowerCase() ? "Exact database promotion source binding verified." : "Database promotion source SHA must match the frozen candidate."),
    item("db_migration_version", "Database applied migration version exactly matches source-controlled lineage", appliedMigrationVersion === EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION, appliedMigrationVersion === EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION ? "Exact migration version verified." : `Expected applied migration version ${EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION}.`),
    item("db_manifest", "Database migration manifest digest exactly matches source-controlled lineage", sha256("OBSERRA_FDACS_DB_MIGRATION_MANIFEST_SHA256") && migrationManifestSha256 === EXPECTED_FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256, sha256("OBSERRA_FDACS_DB_MIGRATION_MANIFEST_SHA256") && migrationManifestSha256 === EXPECTED_FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256 ? "Exact migration manifest verified." : "Database migration manifest digest mismatch.", true),
    item("exam_bank", "Division-approved final exam bank authorization recorded", enabled("OBSERRA_FDACS_DIVISION_APPROVED_EXAM_BANK_AUTHORIZED"), enabled("OBSERRA_FDACS_DIVISION_APPROVED_EXAM_BANK_AUTHORIZED") ? "Authorized." : "Division-approved exam bank authorization is not enabled."),
    item("lias_procedure", "LIAS procedure verification recorded", enabled("OBSERRA_FDACS_LIAS_PROCEDURE_VERIFIED"), enabled("OBSERRA_FDACS_LIAS_PROCEDURE_VERIFIED") ? "Verified." : "LIAS procedure verification is incomplete."),
    item("security_acceptance", "Security acceptance complete", enabled("OBSERRA_FDACS_SECURITY_ACCEPTANCE_COMPLETE"), enabled("OBSERRA_FDACS_SECURITY_ACCEPTANCE_COMPLETE") ? "Complete." : "Security acceptance is incomplete."),
    item("rollback", "Rollback verification complete", enabled("OBSERRA_FDACS_ROLLBACK_VERIFIED"), enabled("OBSERRA_FDACS_ROLLBACK_VERIFIED") ? "Verified." : "Rollback verification is incomplete."),
    item("owner_release", "Owner release approval complete", enabled("OBSERRA_FDACS_OWNER_RELEASE_APPROVED"), enabled("OBSERRA_FDACS_OWNER_RELEASE_APPROVED") ? "Approved." : "Owner release approval is incomplete."),
    item("owner_uat_profile", "Owner real-identity UAT profile is not requested in production", !ownerUatRequested, !ownerUatRequested ? "Not requested." : "Owner UAT profile must not be requested in production."),
    item("owner_uat_authorized", "Owner real-identity UAT cannot authorize production", !ownerUatAuthorized, !ownerUatAuthorized ? "Production remains independent from owner UAT." : "Owner UAT authorization must not be active in production."),
    ...highAvailabilityItems(),
  ];

  const unauthorizedEnabledFeatureFlags = enabledFlags.filter((name) => !FLORIDA_CLASS_D_REGULATED_FEATURE_FLAGS.includes(name));
  const blockingKeys = checks.filter((entry) => !entry.ready).map((entry) => entry.key);
  const readyForOwnerActivationDecision = blockingKeys.length === 0 && unauthorizedEnabledFeatureFlags.length === 0;
  const productionActivationAuthorized = readyForOwnerActivationDecision && enabled("OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED");

  return {
    generatedAt: new Date().toISOString(),
    releaseCandidateShaPresent: candidate.length > 0,
    releaseCandidateSha: candidate || null,
    readyForOwnerActivationDecision,
    productionActivationAuthorized,
    regulatedFeatureFlagsEnabled: enabledFlags,
    unauthorizedEnabledFeatureFlags,
    blockingKeys,
    checks,
    secretsExposed: false,
  };
}
