import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextMiddleware, type NextRequest } from "next/server";
import { identityFromVerifiedClaims } from "./lib/auth/claims";
import { getInternalOwnerAuthorityFromProxyContext } from "./lib/auth/authority-repository";
import { evaluateInternalOwnerAuthorization } from "./lib/auth/identity-governance";
import { identityProviderForRequest } from "./lib/auth/provider-routing";
import { prepareSupabaseAuthRuntime } from "./lib/auth/runtime-config";
import { prepareClerkRuntime } from "./lib/clerk-runtime-config";
import {
  evaluateFloridaClassDMutationBoundary,
  floridaClassDMutationOriginAuthorized,
} from "./lib/florida-class-d-mutation-boundary";
import { floridaClassDProductionOwnerReviewExecutionAuthorized } from "./lib/florida-class-d-owner-preview";
import { updateSupabaseAuthSession } from "./lib/supabase/proxy";

const CANONICAL_HOST = "www.obserrallc.com";
const DEFAULT_OWNER_ORIGIN = "https://owner.obserrallc.com";
const PREVIEW_NOINDEX = "noindex, nofollow, noarchive, nosnippet";
const PRIVATE_NOINDEX = "noindex, nofollow, noarchive, nosnippet, noimageindex";
const OWNER_PATH_PREFIXES = [
  "/command-center",
  "/owner-access",
  "/api/owner",
] as const;
const PROTECTED_PATH_PREFIXES = [
  "/admin",
  "/portal",
  "/academy/admin",
  "/academy/learn",
  "/academy/certificate",
  "/command-center",
  "/florida-security-training/admin",
  "/florida-security-training/access",
  "/florida-security-training/enroll",
  "/florida-security-training/identity",
  "/florida-security-training/live",
  "/florida-security-training/exam",
  "/florida-security-training/makeup",
  "/florida-security-training/completion",
  "/florida-security-training/owner-preview",
  "/api/florida-class-d/admin",
  "/api/florida-class-d/owner-preview",
] as const;

let configuredClerkHandler: NextMiddleware | null = null;

function authenticationReady() {
  return prepareClerkRuntime().ready;
}

function ownerOrigin() {
  const configured = process.env.OBSERRA_OWNER_SITE_URL?.trim() || DEFAULT_OWNER_ORIGIN;
  try {
    const url = new URL(configured);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "/" && url.pathname !== "")
    ) {
      return DEFAULT_OWNER_ORIGIN;
    }
    return url.origin;
  } catch {
    return DEFAULT_OWNER_ORIGIN;
  }
}

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isOwnerPath(pathname: string) {
  return OWNER_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

function requiresAuthentication(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

function requestHost(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  return (forwarded || request.headers.get("host") || "").toLowerCase().split(":")[0];
}

function isLocalHost(host: string | undefined) {
  return !host || host === "localhost" || host === "127.0.0.1";
}

function ownerHost() {
  return new URL(ownerOrigin()).hostname.toLowerCase();
}

function applyRouteSecurityHeaders(response: NextResponse, request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const host = requestHost(request);
  const isPreviewHost = Boolean(host && host.endsWith(".vercel.app"));

  if (process.env.VERCEL_ENV !== "production" && isPreviewHost) {
    response.headers.set("X-Robots-Tag", PREVIEW_NOINDEX);
  }

  if (isOwnerPath(pathname)) {
    response.headers.set("X-Robots-Tag", PRIVATE_NOINDEX);
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    const isRestrictedOwnerClassroom = pathMatchesPrefix(pathname, "/florida-security-training/owner-preview");
    response.headers.set(
      "Permissions-Policy",
      isRestrictedOwnerClassroom
        ? 'camera=(self "https://*.daily.co"), microphone=(self "https://*.daily.co"), display-capture=(self "https://*.daily.co"), fullscreen=(self "https://*.daily.co"), geolocation=(), payment=(), usb=()'
        : "camera=(), microphone=(), display-capture=(), fullscreen=(self), geolocation=(), payment=(), usb=()",
    );
    response.headers.set("X-Obserra-Owner-Site", "private");
  }

  return response;
}

function regulatedMutationBoundary(request: NextRequest) {
  const url = new URL(request.url);
  const decision = evaluateFloridaClassDMutationBoundary(url.pathname, request.method);
  if (!decision.regulatedMutation) return null;

  if (decision.authorized && floridaClassDMutationOriginAuthorized(request.url, request.headers.get("origin"))) {
    return null;
  }

  const originRejected = decision.authorized;

  return applyRouteSecurityHeaders(
    NextResponse.json(
      {
        error: originRejected
          ? "Florida Class D regulated mutations require an exact same-origin request."
          : decision.policy === "synthetic_nonproduction_only"
          ? "Gate 23 acceptance mutation is available only during explicitly authorized synthetic non-production execution."
          : decision.policy === "owner_preview_provider_diagnostic"
          ? "The isolated owner-review Daily diagnostic is not authorized for this exact release."
          : decision.policy === "owner_preview_courseware"
          ? "The isolated owner-review courseware workspace is not authorized for this exact release."
          : decision.policy === "owner_preview_activation_request"
          ? "The governed owner activation request is not authorized for this exact release."
          : "Florida Class D regulated mutation execution is not authorized.",
        code: originRejected
          ? "FDACS_REGULATED_ORIGIN_REJECTED"
          : decision.policy === "synthetic_nonproduction_only"
          ? "FDACS_ACCEPTANCE_EXECUTION_NOT_AUTHORIZED"
          : decision.policy === "owner_preview_provider_diagnostic"
          ? "FDACS_OWNER_PREVIEW_DAILY_NOT_AUTHORIZED"
          : decision.policy === "owner_preview_courseware"
          ? "FDACS_OWNER_PREVIEW_COURSEWARE_NOT_AUTHORIZED"
          : decision.policy === "owner_preview_activation_request"
          ? "FDACS_OWNER_PREVIEW_ACTIVATION_REQUEST_NOT_AUTHORIZED"
          : "FDACS_REGULATED_EXECUTION_NOT_AUTHORIZED",
      },
      {
        status: originRejected ? 403 : 503,
        headers: {
          "cache-control": "private, no-store, max-age=0, must-revalidate",
          "x-content-type-options": "nosniff",
          "x-frame-options": "DENY",
          "referrer-policy": "no-referrer",
        },
      },
    ),
    request,
  );
}

function redirectToOwnerSite(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return null;
  const source = new URL(request.url);
  if (!isOwnerPath(source.pathname)) return null;
  const host = requestHost(request);
  if (isLocalHost(host) || host === ownerHost()) return null;

  const destination = new URL(`${source.pathname}${source.search}`, ownerOrigin());
  return applyRouteSecurityHeaders(NextResponse.redirect(destination, 308), request);
}

function redirectOwnerHostToCorrectSurface(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return null;
  const host = requestHost(request);
  if (host !== ownerHost()) return null;
  const source = new URL(request.url);
  if (isOwnerPath(source.pathname)) return null;

  if (source.pathname === "/") {
    return applyRouteSecurityHeaders(
      NextResponse.redirect(new URL("/command-center", ownerOrigin()), 308),
      request,
    );
  }

  const destination = new URL(source.pathname + source.search, `https://${CANONICAL_HOST}`);
  return NextResponse.redirect(destination, 308);
}

function canonicalRedirect(request: NextRequest) {
  const host = requestHost(request);
  if (isLocalHost(host) || host === CANONICAL_HOST || host === ownerHost()) return null;
  if (process.env.VERCEL_ENV !== "production") return null;

  const source = new URL(request.url);
  const destination = new URL(source.pathname + source.search, `https://${CANONICAL_HOST}`);
  return NextResponse.redirect(destination, 308);
}

function safeOwnerReturnTo(request: NextRequest) {
  const requestedUrl = new URL(request.url);
  const candidate = `${requestedUrl.pathname}${requestedUrl.search}`;
  return candidate.startsWith("/command-center") && !candidate.startsWith("//")
    ? candidate.slice(0, 2_000)
    : "/command-center";
}

function redirectToIdentityGateway(request: NextRequest, status?: string) {
  const gatewayBase = process.env.VERCEL_ENV === "production"
    ? new URL("/owner-access", ownerOrigin())
    : new URL("/owner-access", request.url);
  gatewayBase.searchParams.set("redirect_url", safeOwnerReturnTo(request));
  if (status) gatewayBase.searchParams.set("status", status);
  return applyRouteSecurityHeaders(NextResponse.redirect(gatewayBase), request);
}

function redirectToSignIn(request: NextRequest) {
  const requestedUrl = new URL(request.url);
  const returnTo = `${requestedUrl.pathname}${requestedUrl.search}`;
  const signInUrl = new URL("/sign-in", requestedUrl);
  signInUrl.searchParams.set("redirect_url", returnTo);
  return applyRouteSecurityHeaders(NextResponse.redirect(signInUrl), request);
}

function identityConfigurationResponse(request: NextRequest) {
  const url = new URL(request.url);
  if (pathMatchesPrefix(url.pathname, "/owner-access")) {
    const response = applyRouteSecurityHeaders(NextResponse.next(), request);
    response.headers.set("X-Obserra-Identity-Status", "configuration-required");
    return response;
  }
  if (pathMatchesPrefix(url.pathname, "/command-center") || pathMatchesPrefix(url.pathname, "/api/owner")) {
    return redirectToIdentityGateway(request, "identity-configuration-required");
  }

  const protectedOrIdentityRoute =
    requiresAuthentication(request) ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up");

  if (protectedOrIdentityRoute) {
    return applyRouteSecurityHeaders(
      NextResponse.redirect(new URL("/academy?identity=configuration-required", url)),
      request,
    );
  }

  const response = applyRouteSecurityHeaders(NextResponse.next(), request);
  response.headers.set("X-Obserra-Identity-Status", "configuration-required");
  return response;
}

function supabaseIdentityUnavailableResponse(request: NextRequest) {
  const response = applyRouteSecurityHeaders(
    NextResponse.json(
      {
        error: "Identity verification is temporarily unavailable.",
        code: "IDENTITY_VERIFICATION_UNAVAILABLE",
      },
      {
        status: 503,
        headers: {
          "cache-control": "private, no-store, max-age=0, must-revalidate",
          pragma: "no-cache",
          expires: "0",
        },
      },
    ),
    request,
  );
  response.headers.set("X-Obserra-Identity-Status", "unavailable");
  response.headers.set("X-Obserra-Identity-Provider", "supabase");
  return response;
}

function internalOwnerAccessResponse(request: NextRequest, status: 403 | 503) {
  const response = applyRouteSecurityHeaders(
    NextResponse.json(
      {
        error: status === 403
          ? "Internal owner access is required."
          : "Internal owner authorization is not ready.",
        code: status === 403
          ? "INTERNAL_OWNER_ACCESS_DENIED"
          : "INTERNAL_OWNER_AUTHORIZATION_UNAVAILABLE",
      },
      {
        status,
        headers: {
          "cache-control": "private, no-store, max-age=0, must-revalidate",
          pragma: "no-cache",
          expires: "0",
        },
      },
    ),
    request,
  );
  response.headers.set("X-Obserra-Identity-Status", status === 403 ? "denied" : "unavailable");
  response.headers.set("X-Obserra-Identity-Provider", "supabase");
  return response;
}

function internalOwnerMutationLockedResponse(request: NextRequest) {
  const response = applyRouteSecurityHeaders(
    NextResponse.json(
      {
        error: "The internal owner shell is read-only.",
        code: "FDACS_INTERNAL_OWNER_WRITE_LOCKED",
      },
      {
        status: 503,
        headers: {
          "cache-control": "private, no-store, max-age=0, must-revalidate",
          pragma: "no-cache",
          expires: "0",
        },
      },
    ),
    request,
  );
  response.headers.set("X-Obserra-Identity-Status", "ready");
  response.headers.set("X-Obserra-Identity-Provider", "supabase");
  response.headers.set("X-Obserra-FDACS-Access", "internal-owner-read-only");
  return response;
}

async function handleSupabaseRequest(
  request: NextRequest,
  ownership: ReturnType<typeof identityProviderForRequest>,
) {
  const result = await updateSupabaseAuthSession(request);
  if (!result.configured) return identityConfigurationResponse(request);
  if (result.claimsUnavailable) return supabaseIdentityUnavailableResponse(request);

  const identity = identityFromVerifiedClaims(result.claims);
  if (ownership.requiresAuthentication && !identity) {
    const response = redirectToSignIn(request);
    response.headers.set("X-Obserra-Identity-Status", "ready");
    response.headers.set("X-Obserra-Identity-Provider", "supabase");
    return response;
  }

  if (ownership.accessPolicy === "internal_owner_read_only" && identity) {
    if (!result.queryCurrentAuthority) return supabaseIdentityUnavailableResponse(request);
    const authority = await getInternalOwnerAuthorityFromProxyContext({
      identity,
      jwtKeyId: result.jwtKeyId,
      jwtAlgorithm: result.jwtAlgorithm,
      queryCurrentAuthority: result.queryCurrentAuthority,
    });
    const decision = evaluateInternalOwnerAuthorization({
      roles: identity.roles,
      emailVerified: authority.emailVerified,
      internalIdentityAuthorized: authority.internalIdentityAuthorized,
      assuranceLevel: identity.assuranceLevel,
      protectedAuthorityReady: authority.protectedReadiness.ready,
      previewEnvironment: process.env.VERCEL_ENV === "preview",
      productionOwnerReviewAuthorized:
        (pathMatchesPrefix(new URL(request.url).pathname, "/florida-security-training/owner-preview")
          || pathMatchesPrefix(new URL(request.url).pathname, "/api/florida-class-d/owner-preview"))
        && floridaClassDProductionOwnerReviewExecutionAuthorized(),
      productionAuthEnabled:
        process.env.OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED?.trim().toLowerCase() === "enabled",
    });
    if (!decision.authorized) {
      const identityDenied = [
        "owner_role_required",
        "verified_email_required",
        "aal2_required",
      ].includes(decision.reason);
      return internalOwnerAccessResponse(request, identityDenied ? 403 : 503);
    }
    if (ownership.mutationClass !== "read" && !ownership.mutationAllowed) {
      return internalOwnerMutationLockedResponse(request);
    }
  }

  const response = applyRouteSecurityHeaders(result.response, request);
  response.headers.set("X-Obserra-Identity-Status", "ready");
  response.headers.set("X-Obserra-Identity-Provider", "supabase");
  return response;
}

function preIdentityBoundary(request: NextRequest) {
  const ownerRoute = redirectToOwnerSite(request);
  if (ownerRoute) return ownerRoute;

  const ownerHostRoute = redirectOwnerHostToCorrectSurface(request);
  if (ownerHostRoute) return ownerHostRoute;

  const canonical = canonicalRedirect(request);
  if (canonical) return canonical;

  return regulatedMutationBoundary(request);
}

function getConfiguredClerkHandler(): NextMiddleware {
  if (configuredClerkHandler) return configuredClerkHandler;

  configuredClerkHandler = clerkMiddleware(async (auth, request) => {
    if (requiresAuthentication(request)) {
      const { userId } = await auth();
      if (!userId) {
        const response = pathMatchesPrefix(new URL(request.url).pathname, "/command-center")
          ? redirectToIdentityGateway(request)
          : redirectToSignIn(request);
        response.headers.set("X-Obserra-Identity-Status", "ready");
        response.headers.set("X-Obserra-Identity-Environment", prepareClerkRuntime().environment ?? "unavailable");
        return response;
      }
    }

    const response = applyRouteSecurityHeaders(NextResponse.next(), request);
    response.headers.set("X-Obserra-Identity-Status", "ready");
    response.headers.set("X-Obserra-Identity-Environment", prepareClerkRuntime().environment ?? "unavailable");
    return response;
  });

  return configuredClerkHandler;
}

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const preIdentityResponse = preIdentityBoundary(request);
  if (preIdentityResponse) return preIdentityResponse;

  const url = new URL(request.url);
  const ownership = identityProviderForRequest({
    pathname: url.pathname,
    redirectTarget: url.searchParams.get("redirect_url"),
    method: request.method,
  });
  const supabaseRuntime = prepareSupabaseAuthRuntime();
  if (ownership.provider === "supabase" && supabaseRuntime.runtimeEnabled) {
    if (!supabaseRuntime.ready) return identityConfigurationResponse(request);
    try {
      return await handleSupabaseRequest(request, ownership);
    } catch {
      return supabaseIdentityUnavailableResponse(request);
    }
  }

  if (!authenticationReady()) {
    return identityConfigurationResponse(request);
  }

  try {
    return await getConfiguredClerkHandler()(request, event);
  } catch {
    return identityConfigurationResponse(request);
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
