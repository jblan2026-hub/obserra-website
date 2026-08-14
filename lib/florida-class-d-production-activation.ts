import "server-only";

const SHA40 = /^[0-9a-f]{40}$/i;
const CANONICAL_PUBLIC_ORIGIN = "https://www.obserrallc.com";
const REQUIRED_DOCUMENT_BUCKET = "fdacs-class-d-completion-documents";

export const FLORIDA_CLASS_D_REGULATED_FEATURE_FLAGS = [
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
  policyVersion: "2026-08-13-gate-26-v1",
  canonicalPublicOrigin: CANONICAL_PUBLIC_ORIGIN,
  exactReleaseBindingRequired: true,
  exactUatReleaseBindingRequired: true,
  exactDeploymentReleaseBindingRequired: true,
  liveClerkCredentialsRequired: true,
  protectedDatabaseConfigurationRequired: true,
  dailyMediaConfigurationRequired: true,
  activeClassDSLicenseRequired: true,
  privateClassDILicenseRequired: true,
  databasePromotionVerificationRequired: true,
  divisionApprovedExamBankAuthorizationRequired: true,
  liasProcedureVerificationRequired: true,
  securityAcceptanceRequired: true,
  rollbackVerificationRequired: true,
  explicitOwnerReleaseApprovalRequired: true,
  explicitProductionActivationAuthorizationRequired: true,
  perFeatureFlagsRemainIndependentlyRequired: true,
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

function coreChecks(): FloridaClassDProductionActivationCheck[] {
  const candidate = value("OBSERRA_FDACS_RELEASE_CANDIDATE_SHA");
  const accepted = value("OBSERRA_FDACS_UAT_ACCEPTED_RELEASE_SHA");
  const deployed = value("VERCEL_GIT_COMMIT_SHA");
  const publicOrigin = value("OBSERRA_FDACS_PUBLIC_ORIGIN");
  const supabaseUrl = value("OBSERRA_SUPABASE_URL");
  const serviceRolePresent = present("OBSERRA_SUPABASE_SERVICE_ROLE_KEY") || present("SUPABASE_SERVICE_ROLE_KEY");
  const mediaProvider = value("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER").toLowerCase();
  const documentsBucket = value("OBSERRA_FDACS_DOCUMENTS_BUCKET");

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
      "Protected Supabase HTTPS runtime configured",
      supabaseUrl.startsWith("https://"),
      "Protected HTTPS database origin configured; hostname suppressed.",
      "OBSERRA_SUPABASE_URL must be configured as HTTPS.",
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
