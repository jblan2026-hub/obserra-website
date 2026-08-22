import { NextResponse } from "next/server";
import { claimCourseAccess, courseForId } from "../../../../lib/academy";
import { safeAcademyIdentity } from "../../../../lib/academy-identity";
import { academyCommerceLivemode } from "../../../../lib/academy-payment";
import { getAcademyStripe } from "../../../../lib/academy-stripe";
import { retrieveVerifiedAcademyPaidSession } from "../../../../lib/academy-stripe-verification";
import { ensureAcademyRuntimeSecrets } from "../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";

const NO_STORE = "private, no-store, max-age=0";

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function response(status: number, error: string) {
  return NextResponse.json({ error }, {
    status,
    headers: { "cache-control": NO_STORE, "x-content-type-options": "nosniff" },
  });
}

function isSameOrigin(request: Request, requestUrl: URL) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

function authenticatedUserOwnsVerifiedPurchaserEmail(
  identity: Awaited<ReturnType<typeof safeAcademyIdentity>>,
  purchaserEmail: string,
) {
  const expected = normalizeEmail(purchaserEmail);
  return identity.emailVerified && expected.length > 0 && normalizeEmail(identity.email) === expected;
}

function retryUrl(requestUrl: URL, courseId: string, sessionId: string, enrollment: string) {
  const target = new URL(`/academy/${courseId}`, requestUrl);
  target.searchParams.set("enrollment", enrollment);
  target.searchParams.set("session_id", sessionId);
  return target;
}

export async function GET() {
  const result = response(405, "Method not allowed");
  result.headers.set("allow", "POST");
  return result;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  if (!isSameOrigin(request, requestUrl)) return response(403, "Forbidden");

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/x-www-form-urlencoded") && !contentType.startsWith("multipart/form-data")) {
    return response(415, "Unsupported media type");
  }

  const formData = await request.formData().catch(() => null);
  const courseId = formData?.get("course");
  const sessionId = formData?.get("session_id");
  const course = courseForId(typeof courseId === "string" ? courseId : "");
  if (!course || typeof sessionId !== "string" || !/^cs_(?:live|test)_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.redirect(new URL("/academy?enrollment=invalid", requestUrl), 303);
  }

  const identity = await safeAcademyIdentity();
  const returnUrl = new URL("/academy/success", requestUrl);
  returnUrl.searchParams.set("course", course.id);
  returnUrl.searchParams.set("session_id", sessionId);
  if (!identity.configured || identity.status === "claims_unavailable") {
    return NextResponse.redirect(retryUrl(requestUrl, course.id, sessionId, "identity-configuration-required"), 303);
  }
  if (!identity.principalId) {
    const signInUrl = new URL("/sign-in", requestUrl);
    signInUrl.searchParams.set("redirect_url", returnUrl.toString());
    return NextResponse.redirect(signInUrl, 303);
  }

  try {
    await ensureAcademyRuntimeSecrets();
  } catch {
    return NextResponse.redirect(retryUrl(requestUrl, course.id, sessionId, "verification-unavailable"), 303);
  }

  const livemode = academyCommerceLivemode();
  if (livemode === null) {
    return NextResponse.redirect(retryUrl(requestUrl, course.id, sessionId, "verification-unavailable"), 303);
  }

  try {
    const verified = await retrieveVerifiedAcademyPaidSession(
      getAcademyStripe(),
      sessionId,
      { courseId: course.id, livemode },
    );
    const { session, validation } = verified;

    let authorizedClaim = validation.learnerId === identity.principalId;
    const purchaserEmail = session.customer_details?.email ?? session.customer_email ?? undefined;
    if (!authorizedClaim && validation.identityMode === "guest-email" && !validation.learnerId) {
      authorizedClaim = authenticatedUserOwnsVerifiedPurchaserEmail(identity, purchaserEmail ?? "");
    }
    if (!authorizedClaim) {
      console.warn("academy deferred claim rejected", {
        courseId: course.id,
        sessionId: session.id,
        identityMode: validation.identityMode,
        reason: "verified-authenticated-account-does-not-match-purchaser",
      });
      return NextResponse.redirect(retryUrl(requestUrl, course.id, session.id, "claim-email-mismatch"), 303);
    }

    await claimCourseAccess({
      principalId: identity.principalId,
      courseId: course.id,
      courseVersion: validation.courseVersion,
      checkoutSessionId: session.id,
      purchaserEmail: validation.learnerId ? undefined : purchaserEmail,
    });
    console.info("academy paid enrollment confirmed", {
      courseId: course.id,
      sessionId: session.id,
      identityMode: validation.identityMode,
      fulfillmentMode: validation.learnerId ? "authenticated-checkout" : "verified-email-claim",
    });
    return NextResponse.redirect(new URL(`/academy/learn/${course.id}?enrollment=confirmed`, requestUrl), 303);
  } catch (error) {
    console.error("academy enrollment recovery deferred", {
      courseId: course.id,
      error: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.redirect(retryUrl(requestUrl, course.id, sessionId, "payment-processing"), 303);
  }
}
