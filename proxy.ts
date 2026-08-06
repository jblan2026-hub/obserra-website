import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "www.obserrallc.com";
const PROJECT_VERCEL_HOST = "obserra-website-live.vercel.app";
const PREVIEW_NOINDEX = "noindex, nofollow, noarchive, nosnippet";

const isProtected = createRouteMatcher(["/admin(.*)", "/portal(.*)"]);

function isValidClerkPublishableKey(value: string | undefined) {
  return Boolean(value && /^(pk_test_|pk_live_)[A-Za-z0-9_-]+$/.test(value.trim()));
}

function isValidClerkSecretKey(value: string | undefined) {
  return Boolean(value && /^(sk_test_|sk_live_)[A-Za-z0-9_-]+$/.test(value.trim()));
}

function clerkEnvironmentsMatch(publishableKey: string | undefined, secretKey: string | undefined) {
  if (!publishableKey || !secretKey) return false;
  return (
    (publishableKey.startsWith("pk_test_") && secretKey.startsWith("sk_test_")) ||
    (publishableKey.startsWith("pk_live_") && secretKey.startsWith("sk_live_"))
  );
}

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim();
const authenticationReady =
  isValidClerkPublishableKey(clerkPublishableKey) &&
  isValidClerkSecretKey(clerkSecretKey) &&
  clerkEnvironmentsMatch(clerkPublishableKey, clerkSecretKey);

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
