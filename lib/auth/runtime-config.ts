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

const PROJECT_REF_PATTERN = /^[a-z0-9]{20}$/;
const PUBLISHABLE_KEY_PATTERN = /^sb_publishable_[A-Za-z0-9_-]{20,}$/;

function normalized(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
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
  const rawUrl = environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL;
  const rawPublishableKey = environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY;
  const rawProjectRef = environment.OBSERRA_AUTH_SUPABASE_PROJECT_REF;
  const runtimeEnabled = normalized(runtimeFlag)?.toLowerCase() === "true";
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
    (rawUrl && rawUrl !== configuredUrl) ||
      (rawPublishableKey && rawPublishableKey !== publishableKey) ||
      (rawProjectRef && rawProjectRef !== projectRef) ||
      (runtimeFlag && runtimeFlag !== normalized(runtimeFlag)),
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
