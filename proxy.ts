import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const CANONICAL_HOST = "www.obserrallc.com";
const PREVIEW_NOINDEX = "noindex, nofollow, noarchive, nosnippet";
const PRIVATE_NOINDEX = "noindex, nofollow, noarchive, nosnippet, noimageindex";
const PROTECTED_PATH_PREFIXES = [
  "/admin",
  "/portal",
  "/command-center",
  "/academy/admin",
  "/academy/learn",
  "/academy/certificate",
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

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function requiresAuthentication(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

function isLocalHost(host: string | undefined) {
  return !host || host === "localhost" || host === "127.0.0.1";
}

function canonicalRedirect(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  if (isLocalHost(host) || host === CANONICAL_HOST) return null;
  if (process.env.VERCEL_ENV !== "production") return null;

  const url = new URL(request.url);
  url.protocol = "https:";
  url.host = CANONICAL_HOST;
  return NextResponse.redirect(url, 308);
}

function applyRouteSecurityHeaders(response: NextResponse, request: NextRequest) {
  const url = new URL(request.url);
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  const isPreviewHost = Boolean(host && host.endsWith(".vercel.app"));

  if (process.env.VERCEL_ENV !== "production" && isPreviewHost) {
    response.headers.set("X-Robots-Tag", PREVIEW_NOINDEX);
  }

  if (
    pathMatchesPrefix(url.pathname, "/command-center") ||
    pathMatchesPrefix(url.pathname, "/owner-access")
  ) {
    response.headers.set("X-Robots-Tag", PRIVATE_NOINDEX);
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  return response;
}

function redirectToIdentityGateway(request: NextRequest) {
  const requestedUrl = new URL(request.url);
  const returnTo = `${requestedUrl.pathname}${requestedUrl.search}`;
  const commandCenterRequest = pathMatchesPrefix(requestedUrl.pathname, "/command-center");
  const gatewayUrl = new URL(commandCenterRequest ? "/owner-access" : "/sign-in", requestedUrl);
  gatewayUrl.searchParams.set("redirect_url", returnTo);
  return applyRouteSecurityHeaders(NextResponse.redirect(gatewayUrl), request);
}

function identityConfigurationResponse(request: NextRequest) {
  const url = new URL(request.url);
  const protectedOrIdentityRoute =
    requiresAuthentication(request) ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up") ||
    url.pathname.startsWith("/owner-access");

  if (protectedOrIdentityRoute) {
    const destination =
      pathMatchesPrefix(url.pathname, "/command-center") || pathMatchesPrefix(url.pathname, "/owner-access")
        ? new URL("/?owner=identity-configuration-required", url)
        : new URL("/academy?identity=configuration-required", url);
    return applyRouteSecurityHeaders(NextResponse.redirect(destination), request);
  }

  const response = applyRouteSecurityHeaders(NextResponse.next(), request);
  response.headers.set("X-Obserra-Identity-Status", "configuration-required");
  return response;
}

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const canonical = canonicalRedirect(request);
  if (canonical) return canonical;

  if (!authenticationReady()) {
    return identityConfigurationResponse(request);
  }

  const handler = clerkMiddleware(async (auth, clerkRequest) => {
    if (requiresAuthentication(clerkRequest)) {
      const { userId } = await auth();
      if (!userId) return redirectToIdentityGateway(clerkRequest);
    }
    return applyRouteSecurityHeaders(NextResponse.next(), clerkRequest);
  });

  return handler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
