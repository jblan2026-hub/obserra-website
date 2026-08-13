import "server-only";

export type FloridaClassDRuntimeReadinessItem = {
  key: string;
  label: string;
  category: "identity" | "database" | "media" | "licensing" | "documents" | "feature_flag";
  ready: boolean;
  detail: string;
  sensitive: boolean;
};

export type FloridaClassDRuntimeReadinessReport = {
  generatedAt: string;
  readyForControlledActivationReview: boolean;
  secretsExposed: false;
  items: FloridaClassDRuntimeReadinessItem[];
  blockingKeys: string[];
  enabledRegulatedFeatureFlags: string[];
};

const REGULATED_FEATURE_FLAGS = [
  "OBSERRA_FDACS_CLASS_D_LIVE_ENABLED",
  "OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED",
  "OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED",
  "OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED",
  "OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED",
] as const;

function value(name: string) {
  return process.env[name]?.trim() || "";
}

function present(name: string) {
  return value(name).length > 0;
}

function enabled(name: string) {
  return value(name).toLowerCase() === "enabled";
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

export const FLORIDA_CLASS_D_RUNTIME_READINESS_POLICY = {
  reportExposesSecretValues: false,
  explicitProductionSupabaseUrlRequired: true,
  serviceRoleRequired: true,
  clerkServerCredentialRequired: true,
  dailyProviderRequiredForLiveMedia: true,
  dsStatusMustBeActiveBeforeActivation: true,
  dsLicenseNumberMustRemainPrivate: true,
  diLicenseNumberMustRemainPrivate: true,
  privateDocumentBucketRequired: true,
  regulatedFeatureFlagsMustRemainDisabledDuringReadinessReview: true,
} as const;

export function getFloridaClassDRuntimeReadiness(): FloridaClassDRuntimeReadinessReport {
  const explicitSupabaseUrl = value("OBSERRA_SUPABASE_URL");
  const serviceRolePresent = present("OBSERRA_SUPABASE_SERVICE_ROLE_KEY") || present("SUPABASE_SERVICE_ROLE_KEY");
  const mediaProvider = value("OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER").toLowerCase();
  const dsStatus = value("OBSERRA_FDACS_DS_LICENSE_STATUS").toLowerCase();
  const documentBucket = value("OBSERRA_FDACS_DOCUMENTS_BUCKET");
  const enabledFlags = REGULATED_FEATURE_FLAGS.filter((name) => enabled(name));

  const items: FloridaClassDRuntimeReadinessItem[] = [
    item(
      "clerk_publishable",
      "Clerk publishable key configured",
      "identity",
      present("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
      present("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") ? "Configured." : "Missing.",
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
      "supabase_url",
      "Explicit Supabase HTTPS URL configured",
      "database",
      explicitSupabaseUrl.startsWith("https://"),
      explicitSupabaseUrl.startsWith("https://") ? "Configured; hostname suppressed." : "Explicit production URL is missing or not HTTPS.",
      true,
    ),
    item(
      "supabase_service_role",
      "Supabase service-role credential configured",
      "database",
      serviceRolePresent,
      serviceRolePresent ? "Configured; value suppressed." : "Missing.",
      true,
    ),
    item(
      "daily_provider",
      "Daily selected as live-media provider",
      "media",
      mediaProvider === "daily",
      mediaProvider === "daily" ? "Provider configured as Daily." : "OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER must be daily before live-media activation.",
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
    ...REGULATED_FEATURE_FLAGS.map((name) => item(
      `flag:${name}`,
      `${name} remains disabled during readiness review`,
      "feature_flag",
      !enabled(name),
      enabled(name) ? "ENABLED. This is a readiness blocker until controlled activation is authorized." : "Disabled/fail closed.",
    )),
  ];

  const blockingKeys = items.filter((entry) => !entry.ready).map((entry) => entry.key);

  return {
    generatedAt: new Date().toISOString(),
    readyForControlledActivationReview: blockingKeys.length === 0,
    secretsExposed: false,
    items,
    blockingKeys,
    enabledRegulatedFeatureFlags: [...enabledFlags],
  };
}
