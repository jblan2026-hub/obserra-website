import { NextResponse } from "next/server";
import { courseForId, grantCourseAccess } from "../../../../lib/academy";
import { safeIdentity } from "../../../../lib/identity-runtime";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const courseId = requestUrl.searchParams.get("course") ?? "";
  const sessionId = requestUrl.searchParams.get("session_id") ?? "";
  const course = courseForId(courseId);

  if (!course || !sessionId.startsWith("cs_")) {
    return NextResponse.redirect(new URL("/academy?enrollment=invalid", requestUrl));
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const validPayment =
      session.mode === "payment" &&
      session.status === "complete" &&
      session.payment_status === "paid" &&
      session.metadata?.courseId === courseId;

    if (!validPayment) {
      return NextResponse.redirect(new URL(`/academy/${courseId}?enrollment=verification-failed`, requestUrl));
    }

    const identity = await safeIdentity();
    if (!identity.configured) {
      const pendingUrl = new URL(`/academy/${courseId}`, requestUrl);
      pendingUrl.searchParams.set("enrollment", "paid-pending-account");
      pendingUrl.searchParams.set("session_id", sessionId);
      return NextResponse.redirect(pendingUrl);
    }

    if (!identity.userId) {
      const signInUrl = new URL("/sign-in", requestUrl);
      signInUrl.searchParams.set("redirect_url", requestUrl.toString());
      return NextResponse.redirect(signInUrl);
    }

    const sessionUserId = session.metadata?.clerkUserId;
    const identityMode = session.metadata?.identityMode;
    const claimableGuestPurchase = identityMode === "guest-email" && !sessionUserId;
    const correctLearner = sessionUserId === identity.userId || claimableGuestPurchase;

    if (!correctLearner) {
      return NextResponse.redirect(new URL(`/academy/${courseId}?enrollment=verification-failed`, requestUrl));
    }

    await grantCourseAccess(identity.userId, courseId, session.id);
    return NextResponse.redirect(new URL(`/academy/learn/${courseId}?enrollment=confirmed`, requestUrl));
  } catch (error) {
    console.error("academy enrollment redemption failed", error);
    return NextResponse.redirect(new URL(`/academy/${courseId}?enrollment=verification-unavailable`, requestUrl));
  }
}
