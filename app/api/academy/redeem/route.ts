import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { courseForId, grantCourseAccess } from "../../../../lib/academy";
import { safeIdentity } from "../../../../lib/identity-runtime";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

async function authenticatedUserOwnsVerifiedPurchaserEmail(userId: string, purchaserEmail: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const expected = normalizeEmail(purchaserEmail);
  return expected.length > 0 && user.emailAddresses.some((item) => (
    item.verification?.status === "verified" &&
    normalizeEmail(item.emailAddress) === expected
  ));
}

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
    let authorizedClaim = sessionUserId === identity.userId;

    if (!authorizedClaim && identityMode === "guest-email" && !sessionUserId) {
      const purchaserEmail = session.customer_details?.email ?? session.customer_email;
      authorizedClaim = await authenticatedUserOwnsVerifiedPurchaserEmail(
        identity.userId,
        purchaserEmail ?? "",
      );
    }

    if (!authorizedClaim) {
      console.warn("academy deferred claim rejected", {
        courseId,
        sessionId: session.id,
        identityMode,
        reason: "verified-authenticated-account-does-not-match-purchaser",
      });
      return NextResponse.redirect(new URL(`/academy/${courseId}?enrollment=claim-email-mismatch`, requestUrl));
    }

    await grantCourseAccess(identity.userId, courseId, session.id);
    console.info("academy paid enrollment confirmed", {
      courseId,
      sessionId: session.id,
      identityMode,
      fulfillmentMode: sessionUserId ? "authenticated-checkout" : "verified-email-claim",
    });
    return NextResponse.redirect(new URL(`/academy/learn/${courseId}?enrollment=confirmed`, requestUrl));
  } catch (error) {
    console.error("academy enrollment redemption failed", error);
    return NextResponse.redirect(new URL(`/academy/${courseId}?enrollment=verification-unavailable`, requestUrl));
  }
}
