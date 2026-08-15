type IdentityOriginEnvironment = Readonly<Record<string, string | undefined>>;

export type IdentityOriginReason = "clerk_origin_invalid" | "supabase_origin_invalid";

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function clerkOrigin(publishableKey: string | undefined) {
  const match = /^pk_(?:test|live)_([A-Za-z0-9_-]+)$/.exec(publishableKey?.trim() || "");
  if (!match) return null;
  try {
    const normalized = match[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    if (!decoded.endsWith("$")) return null;
    const hostname = decoded.slice(0, -1).toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/.test(hostname)) return null;
    return `https://${hostname}`;
  } catch {
    return null;
  }
}

function supabaseOrigin(urlValue: string | undefined, projectRefValue: string | undefined) {
  const projectRef = projectRefValue?.trim().toLowerCase();
  if (!projectRef || !/^[a-z0-9]{20}$/.test(projectRef)) return null;
  try {
    const url = new URL(urlValue?.trim() || "");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      url.hostname !== `${projectRef}.supabase.co`
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function prepareIdentityOriginContract(
  environment: IdentityOriginEnvironment = process.env,
) {
  const reasonCodes: IdentityOriginReason[] = [];
  const scriptSources = new Set<string>();
  const connectSources = new Set<string>();

  if (enabled(environment.OBSERRA_IDENTITY_RUNTIME_ENABLED)) {
    const origin = clerkOrigin(
      environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || environment.CLERK_PUBLISHABLE_KEY,
    );
    if (!origin) reasonCodes.push("clerk_origin_invalid");
    else {
      scriptSources.add(origin);
      connectSources.add(origin);
    }
  }

  if (enabled(environment.OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED)) {
    const origin = supabaseOrigin(
      environment.NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL,
      environment.OBSERRA_AUTH_SUPABASE_PROJECT_REF,
    );
    if (!origin) reasonCodes.push("supabase_origin_invalid");
    else connectSources.add(origin);
  }

  return {
    ready: reasonCodes.length === 0,
    reasonCodes,
    scriptSources: [...scriptSources],
    connectSources: [...connectSources],
  };
}
