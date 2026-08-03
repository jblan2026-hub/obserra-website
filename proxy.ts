import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtected = createRouteMatcher([
  "/admin(.*)",
]);

const authenticationReady = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

/**
 * The public Obserra experience must remain available while a deployment is
 * being configured. Clerk otherwise bootstraps on every request and can fail
 * a production site before the organization has installed its production
 * keys. Until both keys are present, auth-dependent routes are redirected to
 * the Academy with a clear configuration state; they are never made public.
 */
function configurationGate(request: NextRequest) {
  const url = new URL(request.url);
  const requiresAuthentication =
    isProtected(request) ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up");

  if (requiresAuthentication) {
    const academyUrl = new URL("/academy?enrollment=not-ready", url);
    return NextResponse.redirect(academyUrl);
  }

  return NextResponse.next();
}

export default authenticationReady
  ? clerkMiddleware(async (auth, request) => {
      // Academy route handlers authenticate independently. Keeping checkout
      // outside middleware lets a signed-out learner receive its deliberate
      // sign-in redirect instead of Clerk's API 404 response.
      if (isProtected(request)) await auth.protect();
    })
  : configurationGate;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
