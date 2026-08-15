export type IdentityProvider = "clerk" | "supabase" | "public";
export type IdentityAccessPolicy =
  | "applications_clerk"
  | "standard_authenticated"
  | "standard_public"
  | "internal_owner_read_only"
  | "public";
export type IdentityMutationClass =
  | "read"
  | "enrollment"
  | "payment"
  | "training_operation"
  | "completion_certificate_lias";

export type IdentityRouteOwnership = {
  provider: IdentityProvider;
  requiresAuthentication: boolean;
  accessPolicy: IdentityAccessPolicy;
  mutationAllowed: boolean;
  mutationClass: IdentityMutationClass;
};

type IdentityProviderRequest = {
  pathname: string;
  redirectTarget?: string | null;
  method?: string | null;
};

const CLERK_PUBLIC_PREFIXES = ["/__clerk", "/apps", "/api/apps", "/owner-access"] as const;
const CLERK_PROTECTED_PREFIXES = [
  "/command-center",
  "/api/owner",
  "/portal/applications",
  "/portal/enterprise",
  "/portal/licenses",
  "/portal/orders",
  "/portal/success",
] as const;
const SUPABASE_PROTECTED_PREFIXES = [
  "/admin",
  "/portal",
  "/academy/admin",
  "/academy/learn",
  "/academy/certificate",
  "/auth/mfa",
] as const;
const SUPABASE_PUBLIC_PREFIXES = ["/auth/callback", "/sign-out", "/sign-up"] as const;
const FDACS_HEALTH_PREFIXES = [
  "/api/florida-class-d/health/live",
  "/api/florida-class-d/health/ready",
] as const;
const FDACS_OWNER_PROVIDER_ACTIONS = new Map<string, ReadonlySet<string>>([
  ["/api/florida-class-d/owner-preview/daily", new Set(["POST", "DELETE"])],
  ["/api/florida-class-d/owner-preview/activation-request", new Set(["POST"])],
]);

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function normalizedPathname(pathname: string) {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return null;

  try {
    const segments = pathname.split("/").map((segment) => decodeURIComponent(segment));
    if (segments.some((segment) => /[\\/\u0000-\u001f\u007f]/.test(segment))) return null;
    return segments.join("/") || "/";
  } catch {
    return null;
  }
}

function mutationClass(pathname: string, method: string | null | undefined): IdentityMutationClass {
  const normalizedMethod = method?.trim().toUpperCase() || "GET";
  if (normalizedMethod === "GET" || normalizedMethod === "HEAD") return "read";
  if (/\/(?:enrollment|enrollments)(?:\/|$)/.test(pathname)) return "enrollment";
  if (/\/(?:payment|payments|checkout)(?:\/|$)/.test(pathname)) return "payment";
  if (/\/(?:completion|completion-documents|completion-packet|certificate|lias)(?:\/|$)/.test(pathname)) {
    return "completion_certificate_lias";
  }
  return "training_operation";
}

function readMethod(method: string | null | undefined) {
  const normalizedMethod = method?.trim().toUpperCase() || "GET";
  return normalizedMethod === "GET" || normalizedMethod === "HEAD";
}

function route(
  provider: IdentityProvider,
  requiresAuthentication: boolean,
  accessPolicy: IdentityAccessPolicy,
  mutationClass: IdentityMutationClass = "read",
  mutationAllowed = true,
): IdentityRouteOwnership {
  return { provider, requiresAuthentication, accessPolicy, mutationAllowed, mutationClass };
}

function ownedRoute(
  pathname: string,
  method?: string | null,
): IdentityRouteOwnership {
  if (CLERK_PROTECTED_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))) {
    return route("clerk", true, "applications_clerk");
  }
  if (CLERK_PUBLIC_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))) {
    return route("clerk", false, "applications_clerk");
  }
  if (FDACS_HEALTH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))) {
    return route("public", false, "public");
  }
  if (
    (pathname === "/florida-security-training" || pathname === "/florida-security-training/")
    && readMethod(method)
  ) {
    return route("public", false, "public");
  }
  if (
    pathMatchesPrefix(pathname, "/florida-security-training") ||
    pathMatchesPrefix(pathname, "/api/florida-class-d")
  ) {
    const normalizedMethod = method?.trim().toUpperCase() || "GET";
    const ownerActionAllowed = FDACS_OWNER_PROVIDER_ACTIONS.get(pathname)?.has(normalizedMethod) === true;
    return route(
      "supabase",
      true,
      "internal_owner_read_only",
      mutationClass(pathname, method),
      ownerActionAllowed,
    );
  }
  if (SUPABASE_PROTECTED_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))) {
    return route("supabase", true, "standard_authenticated");
  }
  if (SUPABASE_PUBLIC_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))) {
    return route("supabase", false, "standard_public");
  }
  return route("public", false, "public");
}

function safeRedirectPath(redirectTarget: string | null | undefined) {
  if (!redirectTarget || !redirectTarget.startsWith("/") || redirectTarget.startsWith("//")) {
    return null;
  }
  const queryIndex = redirectTarget.indexOf("?");
  return normalizedPathname(queryIndex === -1 ? redirectTarget : redirectTarget.slice(0, queryIndex));
}

export function identityProviderForRequest(
  request: IdentityProviderRequest,
): IdentityRouteOwnership {
  const pathname = normalizedPathname(request.pathname);
  if (!pathname) return route("supabase", true, "standard_authenticated", "training_operation", false);

  if (pathMatchesPrefix(pathname, "/sign-in") || pathMatchesPrefix(pathname, "/sign-up")) {
    const returnPath = safeRedirectPath(request.redirectTarget);
    if (returnPath && ownedRoute(returnPath).provider === "clerk") {
      return route("clerk", false, "applications_clerk");
    }
    return route("supabase", false, "standard_public");
  }

  return ownedRoute(pathname, request.method);
}
