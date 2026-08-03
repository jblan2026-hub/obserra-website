import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isProtected = createRouteMatcher([
  "/academy/learn(.*)",
  "/academy/certificate(.*)",
  "/academy/success(.*)",
  "/admin(.*)",
  "/api/academy(.*)",
]);

const authenticationReady = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

function configurationGate(request: NextRequest) {
  const url = new URL(request.url);
  const requiresAuthentication =
    isProtected(request) ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up");

  if (requiresAuthentication) {
    return NextResponse.redirect(new URL("/academy?enrollment=not-ready", url));
  }

  return NextResponse.next();
}

export default authenticationReady
  ? clerkMiddleware(async (auth, request) => {
      if (isProtected(request)) await auth.protect();
    }, { frontendApiProxy: { enabled: true } })
  : configurationGate;

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
