import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const CANONICAL_HOST = "www.obserrallc.com";
const PRIVATE_NOINDEX = "noindex, nofollow, noarchive, nosnippet";

const isProtected = createRouteMatcher([
  "/admin(.*)",
  "/portal(.*)",
  "/command-center(.*)",
  "/api/command-center(.*)",
  "/academy/admin(.*)",
  "/academy/learn(.*)",
  "/academy/certificate(.*)",
]);

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

function isOwnerPath(pathname: string) {
  return pathname.startsWith("/command-center") || pathname.startsWith("/api/command-center") || pathname.startsWith("/owner-access");
}

function withPrivateHeaders(response: NextResponse, request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  const isPreviewHost = Boolean(host && host.endsWith(".vercel.app"));
  if (process.env.VERCEL_ENV !== "production" && isPreviewHost) {
    response.headers.set("X-Robots-Tag", PRIVATE_NOINDEX);
  }
  if (isOwnerPath(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Robots-Tag", PRIVATE_NOINDEX);
  }
  return response;
}

function identityConfigurationResponse(request: NextRequest) {
  const url = new URL(request.url);
  const ownerApi = url.pathname.startsWith("/api/command-center");
  const ownerPage = url.pathname.startsWith("/command-center");

  if (ownerApi) {
    return withPrivateHeaders(
      NextResponse.json(
        { error: "Owner identity service is not configured", code: "OWNER_IDENTITY_CONFIGURATION_REQUIRED" },
        { status: 503 },
      ),
      request,
    );
  }

  if (ownerPage) {
    const destination = new URL("/owner-access", url);
    destination.searchParams.set("redirect_url", `${url.pathname}${url.search}`);
    destination.searchParams.set("status", "identity-configuration-required");
    return withPrivateHeaders(NextResponse.redirect(destination), request);
  }

  const requiresAuthentication =
    isProtected(request) || url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up");

  if (requiresAuthentication) {
    const destination = new URL("/academy?identity=configuration-required", url);
    return withPrivateHeaders(NextResponse.redirect(destination), request);
  }

  const response = withPrivateHeaders(NextResponse.next(), request);
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
    if (isProtected(clerkRequest)) await auth.protect();
    return withPrivateHeaders(NextResponse.next(), clerkRequest);
  });

  return handler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
