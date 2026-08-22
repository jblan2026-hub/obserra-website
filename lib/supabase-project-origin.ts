import "server-only";

const PROJECT_REF_PATTERN = /^[a-z0-9]{20}$/;
const SUPABASE_PROJECT_HOST_SUFFIX = ".supabase.co";

export type SupabaseProjectOrigin = {
  origin: string;
  projectRef: string;
};

export function requireSupabaseProjectOrigin(rawUrl: string, rawProjectRef: string): SupabaseProjectOrigin {
  const projectRef = rawProjectRef.trim().toLowerCase();
  if (!PROJECT_REF_PATTERN.test(projectRef)) {
    throw new Error("invalid-supabase-project-ref");
  }

  const url = new URL(rawUrl.trim());
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "") ||
    url.hostname !== `${projectRef}${SUPABASE_PROJECT_HOST_SUFFIX}`
  ) {
    throw new Error("invalid-supabase-project-origin");
  }

  return { origin: url.origin, projectRef };
}
