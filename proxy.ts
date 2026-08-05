import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "www.obserrallc.com";
const PREVIEW_NOINDEX = "noindex, nofollow, noarchive, nosnippet";

const isProtected = createRouteMatcher([
  "/admin(.*)",
]);

const authenticationReady = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

function withPreviewNoIndex(response: NextResponse, request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  const isPreviewHost = Boolean(host && host.endsWith(".vercel.app"));
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction && isPreviewHost) {
    response.headers.set("X-Robots-Tag", PREVIEW_NOINDEX);
  }

  return response;
}

function canonicalRedirect(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];
  if (!host || host === CANONICAL_HOST || host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  const shouldRedirectToCanonical =
    host === "obserrallc.com" ||
    (process.env.VERCEL_ENV === "production" && host.endsWith(".vercel.app"));

  if (!shouldRedirectToCanonical) {
    return null;
  }

  const url = new URL(request.url);
  url.protocol = "https:";
  url.host = CANONICAL_HOST;
  return NextResponse.redirect(url, 308);
}

/**
 * The public Obserra experience must remain available while a deployment is
 * being configured. Clerk otherwise bootstraps on every request and can fail
 * a production site before the organization has installed its production
 * keys. Until both keys are present, auth-dependent routes are redirected to
 * the Academy with a clear configuration state; they are never made public.
 */
function configurationGate(request: NextRequest) {
  const canonical = canonicalRedirect(request);
  if (canonical) {
    return canonical;
  }

  const url = new URL(request.url);
  const requiresAuthentication =
    isProtected(request) ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up");

  if (requiresAuthentication) {
    const academyUrl = new URL("/academy?enrollment=not-ready", url);
    return withPreviewNoIndex(NextResponse.redirect(academyUrl), request);
  }

  return withPreviewNoIndex(NextResponse.next(), request);
}

export default authenticationReady
  ? clerkMiddleware(async (auth, request) => {
      const canonical = canonicalRedirect(request);
      if (canonical) {
        return canonical;
      }

      // Academy route handlers authenticate independently. Keeping checkout
      // outside middleware lets a signed-out learner receive its deliberate
      // sign-in redirect instead of Clerk's API 404 response.
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
