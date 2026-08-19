export type SupabaseAuthRuntimeReason =
  | "runtime_disabled"
  | "url_missing"
  | "url_invalid"
  | "project_ref_missing"
  | "project_ref_invalid"
  | "url_project_mismatch"
  | "publishable_key_missing"
  | "publishable_key_invalid";

export type SupabaseAuthRuntimeStatus = {
  ready: boolean;
  runtimeEnabled: boolean;
  url: string | null;
  projectRef: string | null;
  publishableKey: string | null;
  reasonCodes: SupabaseAuthRuntimeReason[];
  normalizationApplied: boolean;
};

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export const CANONICAL_PUBLIC_VERCEL_PROJECT_ID = "prj_FfAnssVJU8pcJydGNJHmCliP6Yme";
export const CONTROLLED_OWNER_VALIDATION_PREVIEW_REF = "hotfix/owner-lms-test-access-20260817";

const CANONICAL_IDENTITY_PROJECT_REF = "ftkjhmtfyfkartfsnkjb";
const CANONICAL_IDENTITY_URL = `https://${CANONICAL_IDENTITY_PROJECT_REF}.supabase.co`;
const CANONICAL_IDENTITY_PUBLISHABLE_KEY = "sb_publishable_mRE63bML7dsVY_YqaervqA_TUEWsxVB";
const PROJECT_REF_PATTERN = /^[a-z0-9]{20}$/;
const PUBLISHABLE_KEY_PATTERN = /^sb_publishable_[A-Za-z0-9_-]{20,}$/;

function normalized(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function canonicalIdentityBootstrap(environment: RuntimeEnvironment) {
  const vercelEnvironment = normalized(environment.VERCEL_ENV)?.toLowerCase();
  const canonicalProject = normalized(environment.VERCEL_PROJECT_ID) === CANONICAL_PUBLIC_VERCEL_PROJECT_ID;
  if (!canonicalProject) return false;
  if (vercelEnvironment === "production") return true;
  return vercelEnvironment === "preview"
    && normalized(environment.VERCEL_GIT_COMMIT_REF) === CONTROLLED_OWNER_VALIDATION_PREVIEW_REF;
}

function exactSupabaseOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function prepareSupabaseAuthRuntime(
  environment: RuntimeEnvironment = process.env,
): SupabaseAuthRuntimeStatus {
  const runtimeFlag = environment.OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED;
  const canonicalBootstrap = canonicalIdentityBootstrap(environment);
  const explicitRuntimeFlag = normalized(runtimeFlag);
  const runtimeEnabled = explicitRuntimeFlag === undefined
    ? canonicalBootstrap
    : explicitRuntimeFlag.toLowerCase() === "true";

  const rawUrl =
    environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL ??
    (canonicalBootstrap ? CANONICAL_IDENTITY_URL : undefined);
  const rawPublishableKey =
    environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY ??
    (canonicalBootstrap ? CANONICAL_IDENTITY_PUBLISHABLE_KEY : undefined);
  const rawProjectRef =
    environment.OBSERRA_AUTH_SUPABASE_PROJECT_REF ??
    (canonicalBootstrap ? CANONICAL_IDENTITY_PROJECT_REF : undefined);

  const configuredUrl = normalized(rawUrl);
  const publishableKey = normalized(rawPublishableKey);
  const projectRef = normalized(rawProjectRef)?.toLowerCase();
  const url = exactSupabaseOrigin(configuredUrl);
  const reasonCodes: SupabaseAuthRuntimeReason[] = [];

  if (!runtimeEnabled) reasonCodes.push("runtime_disabled");

  if (!configuredUrl) reasonCodes.push("url_missing");
  else if (!url) reasonCodes.push("url_invalid");

  if (!projectRef) reasonCodes.push("project_ref_missing");
  else if (!PROJECT_REF_PATTERN.test(projectRef)) reasonCodes.push("project_ref_invalid");

  if (!publishableKey) reasonCodes.push("publishable_key_missing");
  else if (!PUBLISHABLE_KEY_PATTERN.test(publishableKey)) reasonCodes.push("publishable_key_invalid");

  if (url && projectRef && PROJECT_REF_PATTERN.test(projectRef)) {
    if (new URL(url).hostname !== `${projectRef}.supabase.co`) {
      reasonCodes.push("url_project_mismatch");
    }
  }

  const normalizationApplied = Boolean(
    (environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL &&
      environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL !== configuredUrl) ||
      (environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY &&
        environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY !== publishableKey) ||
      (environment.OBSERRA_AUTH_SUPABASE_PROJECT_REF &&
        environment.OBSERRA_AUTH_SUPABASE_PROJECT_REF !== projectRef) ||
      (runtimeFlag && runtimeFlag !== explicitRuntimeFlag),
  );
  const ready = runtimeEnabled && reasonCodes.length === 0;

  return {
    ready,
    runtimeEnabled,
    url: ready ? url : null,
    projectRef: projectRef && PROJECT_REF_PATTERN.test(projectRef) ? projectRef : null,
    publishableKey: ready ? publishableKey ?? null : null,
    reasonCodes,
    normalizationApplied,
  };
}
