import "server-only";

const FDACS_SUPABASE_PROJECT_REF = "ggkxgjhsbgbifiqrhavr";
const FDACS_SUPABASE_ORIGIN = `https://${FDACS_SUPABASE_PROJECT_REF}.supabase.co`;

function legacyJwtIsServiceRole(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as { role?: unknown };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

export function floridaClassDServiceRoleKeyAuthorized(value: string) {
  const key = value.trim();
  return (key.startsWith("sb_secret_") && key.length >= 32) || legacyJwtIsServiceRole(key);
}

export function floridaClassDSupabaseOriginAuthorized(
  input: string,
  configuredProjectRef = process.env.OBSERRA_FDACS_SUPABASE_PROJECT_REF?.trim() ?? "",
) {
  try {
    const url = new URL(input);
    return configuredProjectRef === FDACS_SUPABASE_PROJECT_REF
      && url.origin === FDACS_SUPABASE_ORIGIN
      && url.protocol === "https:"
      && !url.username
      && !url.password
      && !url.search
      && !url.hash
      && (url.pathname === "/" || url.pathname === "");
  } catch {
    return false;
  }
}

export function floridaClassDSupabaseServerConfigAuthorized(url: string, serviceRoleKey: string) {
  return floridaClassDSupabaseOriginAuthorized(url)
    && floridaClassDServiceRoleKeyAuthorized(serviceRoleKey);
}
