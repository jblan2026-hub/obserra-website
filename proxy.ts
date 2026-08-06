import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "www.obserrallc.com";
const PROJECT_VERCEL_HOST = "obserra-website-live.vercel.app";
const PREVIEW_NOINDEX = "noindex, nofollow, noarchive, nosnippet";

const isProtected = createRouteMatcher(["/admin(.*)", "/portal(.*)"]);

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

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const publishableEnvironment = clerkPublishableEnvironment(clerkPublishableKey);
const secretEnvironment = clerkSecretEnvironment(clerkSecretKey);
const authenticationReady = Boolean(
  publishableEnvironment && secretEnvironment && publishableEnvironment === secretEnvironment,
);

function withPreviewNoIndex(response: NextResponse, request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  const isPreviewHost = Boolean(host && host.endsWith(".vercel.app"));
  const isProduction = process.env.VERCEL_ENV === "production";
  if (!isProduction && isPreviewHost) response.headers.set("X-Robots-Tag", PREVIEW_NOINDEX);
  return response;
}

function canonicalRedirect(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  if (!host || host === CANONICAL_HOST || host === "localhost" || host === "127.0.0.1") return null;
  const shouldRedirectToCanonical =
    host === "obserrallc.com" ||
    host === PROJECT_VERCEL_HOST ||
    (process.env.VERCEL_ENV === "production" && host.endsWith(".vercel.app"));
  if (!shouldRedirectToCanonical) return null;
  const url = new URL(request.url);
  url.protocol = "https:";
  url.host = CANONICAL_HOST;
  return NextResponse.redirect(url, 308);
}

function configurationGate(request: NextRequest) {
  const canonical = canonicalRedirect(request);
  if (canonical) return canonical;
  const url = new URL(request.url);
  const requiresAuthentication =
    isProtected(request) || url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up");
  if (requiresAuthentication) {
    const academyUrl = new URL("/academy?enrollment=not-ready", url);
    return withPreviewNoIndex(NextResponse.redirect(academyUrl), request);
  }
  const response = withPreviewNoIndex(NextResponse.next(), request);
  response.headers.set("X-Obserra-Identity-Status", "configuration-required");
  return response;
}

export default authenticationReady
  ? clerkMiddleware(async (auth, request) => {
      const canonical = canonicalRedirect(request);
      if (canonical) return canonical;
      if (isProtected(request)) await auth.protect();
      return withPreviewNoIndex(NextResponse.next(), request);
    })
  : configurationGate;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
