import "server-only";

import {
  floridaClassDServiceRoleKeyAuthorized,
  floridaClassDSupabaseOriginAuthorized,
} from "./florida-class-d-supabase-config";

export type FloridaClassDRuntimeReadinessItem = {
  key: string;
  label: string;
  category: "environment" | "identity" | "database" | "media" | "licensing" | "documents" | "feature_flag";
  ready: boolean;
  detail: string;
  sensitive: boolean;
};

export type FloridaClassDRuntimeProfile = "production" | "nonproduction_acceptance";

export type FloridaClassDRuntimeReadinessReport = {
  profile: FloridaClassDRuntimeProfile;
  generatedAt: string;
  readyForControlledActivationReview: boolean;
  readyExceptForClassDSLicense: boolean;
  technicalReadinessComplete: boolean;
  secretsExposed: false;
  items: FloridaClassDRuntimeReadinessItem[];
  blockingKeys: string[];
  nonLicenseBlockingKeys: string[];
  classDSLicenseBlockingKeys: string[];
  enabledRegulatedFeatureFlags: string[];
};

const REGULATED_FEATURE_FLAGS = [
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

const NONPRODUCTION_ENVIRONMENTS = new Set(["development", "sandbox", "staging", "uat"]);
const CLASS_DS_LICENSE_KEYS = new Set(["ds_status", "ds_license_number"]);

function value(name: string) {
  return process.env[name]?.trim() || "";
}

function present(name: string) {
  return value(name).length > 0;
}

function enabled(name: string) {
  return value(name).toLowerCase() === "enabled";
}

function trueFlag(name: string) {
  return value(name).toLowerCase() === "true";
}

function item(
  key: string,
  label: string,
  category: FloridaClassDRuntimeReadinessItem["category"],
  ready: boolean,
  detail: string,
  sensitive = false,
): FloridaClassDRuntimeReadinessItem {
  return { key, label, category, ready, detail, sensitive };
}

function commonProtectedRuntimeItems(): FloridaClassDRuntimeReadinessItem[] {
  const explicitSupabaseUrl = value("OBSERRA_FDACS_SUPABASE_URL");
  const serviceRoleKey = value("OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY");
  const serviceRoleReady = floridaClassDServiceRoleKeyAuthorized(serviceRoleKey);
  const mediaProvider = value("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER").toLowerCase();
  const documentBucket = value("OBSERRA_FDACS_DOCUMENTS_BUCKET");
  const explicitProjectRef = value("OBSERRA_FDACS_SUPABASE_PROJECT_REF");
  const fdacsDatabaseExactlyBound = floridaClassDSupabaseOriginAuthorized(explicitSupabaseUrl, explicitProjectRef);
  const stripeKey = value("STRIPE_SECRET_KEY");
  const stripeIdentityWebhook = value("STRIPE_IDENTITY_WEBHOOK_SECRET");

  return [
    item(
      "clerk_publishable",
      "Clerk publishable key configured",
      "identity",
      present("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
      present("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") ? "Configured." : "Missing.",
      true,
    ),
    item(
      "fdacs_database_boundary",
      "Dedicated FDACS student-record project exactly bound",
      "database",
      fdacsDatabaseExactlyBound,
      fdacsDatabaseExactlyBound
        ? "Dedicated isolated project binding verified; credential and hostname suppressed from report consumers."
        : "OBSERRA_FDACS_SUPABASE_URL and OBSERRA_FDACS_SUPABASE_PROJECT_REF must exactly identify the isolated FDACS student-record project.",
      true,
    ),
    item(
      "clerk_secret",
      "Clerk server credential configured",
      "identity",
      present("CLERK_SECRET_KEY"),
      present("CLERK_SECRET_KEY") ? "Configured; value suppressed." : "Missing.",
      true,
    ),
    item(
      "stripe_identity_key",
      "Stripe Identity server credential configured",
      "identity",
      /^sk_(live|test)_[A-Za-z0-9_]+$/.test(stripeKey),
      /^sk_(live|test)_[A-Za-z0-9_]+$/.test(stripeKey) ? "Configured; value and mode suppressed." : "Missing or invalid Stripe server credential.",
      true,
    ),
    item(
      "stripe_identity_webhook",
      "Dedicated Stripe Identity webhook secret configured",
      "identity",
      /^whsec_[A-Za-z0-9_]+$/.test(stripeIdentityWebhook),
      /^whsec_[A-Za-z0-9_]+$/.test(stripeIdentityWebhook) ? "Configured; value suppressed." : "STRIPE_IDENTITY_WEBHOOK_SECRET is missing or invalid.",
      true,
    ),
    item(
      "supabase_url",
      "Explicit Supabase HTTPS URL configured",
      "database",
      fdacsDatabaseExactlyBound,
      fdacsDatabaseExactlyBound ? "Exact isolated project origin configured; hostname suppressed." : "Explicit protected runtime URL does not match the isolated FDACS project.",
      true,
    ),
    item(
      "supabase_service_role",
      "Supabase service-role credential configured",
      "database",
      serviceRoleReady,
      serviceRoleReady ? "Privileged server credential class verified; value suppressed." : "Missing or not a service-role credential.",
      true,
    ),
    item(
      "daily_provider",
      "Daily selected as live-media provider",
      "media",
      mediaProvider === "daily",
      mediaProvider === "daily" ? "Provider configured as Daily." : "OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER must be daily before controlled live-media use.",
    ),
    item(
      "daily_api_key",
      "Daily API credential configured",
      "media",
      present("OBSERRA_FDACS_DAILY_API_KEY"),
      present("OBSERRA_FDACS_DAILY_API_KEY") ? "Configured; value suppressed." : "Missing.",
      true,
    ),
    item(
      "di_license_number",
      "Class DI instructor license number configured privately",
      "licensing",
      present("OBSERRA_FDACS_DI_LICENSE_NUMBER"),
      present("OBSERRA_FDACS_DI_LICENSE_NUMBER") ? "Configured; value suppressed." : "Missing.",
      true,
    ),
    item(
      "documents_bucket",
      "Private completion-document bucket configured",
      "documents",
      documentBucket.length >= 3,
      documentBucket.length >= 3 ? "Configured; bucket name suppressed." : "OBSERRA_FDACS_DOCUMENTS_BUCKET is missing.",
      true,
    ),
  ];
}

function featureFlagItems(): FloridaClassDRuntimeReadinessItem[] {
  const namedItems = REGULATED_FEATURE_FLAGS.map((name) => item(
    `flag:${name}`,
    `${name} remains disabled during readiness review`,
    "feature_flag",
    !enabled(name),
    enabled(name) ? "ENABLED. This is a readiness blocker until controlled activation is authorized." : "Disabled/fail closed.",
  ));

  return [
    ...namedItems,
    item(
      "flag:FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED",
      "FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED remains false during readiness review",
      "feature_flag",
      !trueFlag("FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED"),
      trueFlag("FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED")
        ? "TRUE. Pre-enrollment must remain fail closed until controlled activation is authorized."
        : "False/fail closed.",
    ),
    item(
      "flag:OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED",
      "Gate 26 production activation authorization remains disabled during readiness review",
      "feature_flag",
      !enabled("OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED"),
      enabled("OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED")
        ? "ENABLED. Activation authorization must remain disabled until the final controlled release decision."
        : "Disabled/fail closed.",
    ),
  ];
}

function enabledFeatureFlags() {
  return [
    ...REGULATED_FEATURE_FLAGS.filter((name) => enabled(name)),
    ...(trueFlag("FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED") ? ["FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED"] : []),
    ...(enabled("OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED") ? ["OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED"] : []),
  ];
}

function buildReport(
  profile: FloridaClassDRuntimeProfile,
  items: FloridaClassDRuntimeReadinessItem[],
): FloridaClassDRuntimeReadinessReport {
  const blockingKeys = items.filter((entry) => !entry.ready).map((entry) => entry.key);
  const classDSLicenseBlockingKeys = profile === "production"
    ? blockingKeys.filter((key) => CLASS_DS_LICENSE_KEYS.has(key))
    : [];
  const nonLicenseBlockingKeys = blockingKeys.filter((key) => !CLASS_DS_LICENSE_KEYS.has(key));
  const enabledFlags = enabledFeatureFlags();
  const technicalReadinessComplete = nonLicenseBlockingKeys.length === 0;
  const readyExceptForClassDSLicense = profile === "production"
    && technicalReadinessComplete
    && classDSLicenseBlockingKeys.length > 0
    && classDSLicenseBlockingKeys.every((key) => CLASS_DS_LICENSE_KEYS.has(key));

  return {
    profile,
    generatedAt: new Date().toISOString(),
    readyForControlledActivationReview: blockingKeys.length === 0,
    readyExceptForClassDSLicense,
    technicalReadinessComplete,
    secretsExposed: false,
    items,
    blockingKeys,
    nonLicenseBlockingKeys,
    classDSLicenseBlockingKeys,
    enabledRegulatedFeatureFlags: enabledFlags,
  };
}

export const FLORIDA_CLASS_D_RUNTIME_READINESS_POLICY = {
  reportExposesSecretValues: false,
  explicitProductionSupabaseUrlRequired: true,
  serviceRoleRequired: true,
  clerkServerCredentialRequired: true,
  dedicatedFdacsDatabaseBoundaryRequired: true,
  stripeDocumentAndMatchingSelfieRequired: true,
  stripeIdentityWebhookSignatureRequired: true,
  dailyProviderRequiredForLiveMedia: true,
  dsStatusMustBeActiveBeforeActivation: true,
  dsLicenseNumberMustRemainPrivate: true,
  diLicenseNumberMustRemainPrivate: true,
  privateDocumentBucketRequired: true,
  regulatedFeatureFlagsMustRemainDisabledDuringReadinessReview: true,
  allKnownRegulatedFeatureFlagsInventoried: true,
  gate26AuthorizationMustRemainDisabledDuringReadinessReview: true,
  nonProductionEnvironmentMustBeExplicit: true,
  nonProductionAcceptanceAuthorizationMustBeExplicit: true,
  nonProductionSyntheticIdentityOnlyMustBeExplicit: true,
  nonProductionReadinessMustNotRequireClassDSLicense: true,
} as const;

export function getFloridaClassDProductionRuntimeReadiness(): FloridaClassDRuntimeReadinessReport {
  const dsStatus = value("OBSERRA_FDACS_DS_LICENSE_STATUS").toLowerCase();

  return buildReport("production", [
    ...commonProtectedRuntimeItems(),
    item(
      "ds_status",
      "Class DS school license status active",
      "licensing",
      dsStatus === "active",
      dsStatus === "active" ? "Configured as active." : "Must remain non-active until the Class DS school license is actually issued and authorized for production use.",
    ),
    item(
      "ds_license_number",
      "Class DS school license number configured privately",
      "licensing",
      present("OBSERRA_FDACS_DS_LICENSE_NUMBER"),
      present("OBSERRA_FDACS_DS_LICENSE_NUMBER") ? "Configured; value suppressed." : "Missing. Do not populate until an actual Class DS license number exists.",
      true,
    ),
    ...featureFlagItems(),
  ]);
}

export function getFloridaClassDNonProductionAcceptanceReadiness(): FloridaClassDRuntimeReadinessReport {
  const runtimeEnvironment = value("OBSERRA_FDACS_RUNTIME_ENVIRONMENT").toLowerCase();
  const environmentAllowed = NONPRODUCTION_ENVIRONMENTS.has(runtimeEnvironment);
  const acceptanceAuthorized = enabled("OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED");
  const syntheticIdentityOnly = enabled("OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY");

  return buildReport("nonproduction_acceptance", [
    item(
      "nonprod_environment",
      "Explicit non-production runtime designation",
      "environment",
      environmentAllowed,
      environmentAllowed ? "Explicitly designated as an approved non-production runtime." : "Set OBSERRA_FDACS_RUNTIME_ENVIRONMENT to development, sandbox, staging, or uat. Production is never accepted here.",
    ),
    item(
      "nonprod_acceptance_authorized",
      "Non-production acceptance explicitly authorized",
      "environment",
      acceptanceAuthorized,
      acceptanceAuthorized ? "Explicit authorization marker is enabled." : "OBSERRA_FDACS_NONPROD_ACCEPTANCE_AUTHORIZED must be explicitly enabled for controlled acceptance.",
    ),
    item(
      "synthetic_identity_only",
      "Synthetic-identity-only mode explicitly enabled",
      "identity",
      syntheticIdentityOnly,
      syntheticIdentityOnly ? "Synthetic-identity-only mode is enabled." : "OBSERRA_FDACS_SYNTHETIC_IDENTITY_ONLY must be explicitly enabled. Real learner acceptance is prohibited.",
    ),
    ...commonProtectedRuntimeItems(),
    ...featureFlagItems(),
  ]);
}

export function getFloridaClassDRuntimeReadiness(): FloridaClassDRuntimeReadinessReport {
  return getFloridaClassDProductionRuntimeReadiness();
}
