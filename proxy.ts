import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

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
  "/api/florida-class-d/admin",
] as const;

type ClerkEnvironment = "test" | "live";

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function clerkPublishableEnvironment(value: string | undefined): ClerkEnvironment | null {
  if (!value || value !== value.trim()) return null;
  const match = /^pk_(test|live)_([A-Za-z0-9_-]+)$/.exec(value);
  if (!match) return null;

  try {
    const decoded = decodeBase64Url(match[2]);
    if (!decoded.endsWith("$")) return null;
    const frontendApi = decoded.slice(0, -1);
    if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(frontendApi)) return null;
    return match[1] as ClerkEnvironment;
  } catch {
    return null;
  }
}

function clerkSecretEnvironment(value: string | undefined): ClerkEnvironment | null {
  if (!value || value !== value.trim()) return null;
  const match = /^sk_(test|live)_([A-Za-z0-9_-]{20,})$/.exec(value);
  return match ? (match[1] as ClerkEnvironment) : null;
}

function authenticationReady() {
  const publishableEnvironment = clerkPublishableEnvironment(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const secretEnvironment = clerkSecretEnvironment(process.env.CLERK_SECRET_KEY);
  return Boolean(publishableEnvironment && secretEnvironment && publishableEnvironment === secretEnvironment);
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
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    response.headers.set("X-Obserra-Owner-Site", "private");
  }

  return response;
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

function applyPreAuthRouting(request: NextRequest) {
  const ownerRoute = redirectToOwnerSite(request);
  if (ownerRoute) return ownerRoute;

  const ownerHostRoute = redirectOwnerHostToCorrectSurface(request);
  if (ownerHostRoute) return ownerHostRoute;

  return canonicalRedirect(request);
}

const authenticatedProxy = clerkMiddleware(async (auth, request) => {
  const preAuthRoute = applyPreAuthRouting(request);
  if (preAuthRoute) return preAuthRoute;

  if (requiresAuthentication(request)) {
    const { userId } = await auth();
    if (!userId) {
      return pathMatchesPrefix(new URL(request.url).pathname, "/command-center")
        ? redirectToIdentityGateway(request)
        : redirectToSignIn(request);
    }
  }

  return applyRouteSecurityHeaders(NextResponse.next(), request);
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const preAuthRoute = applyPreAuthRouting(request);
  if (preAuthRoute) return preAuthRoute;

  if (!authenticationReady()) {
    return identityConfigurationResponse(request);
  }

  return authenticatedProxy(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
