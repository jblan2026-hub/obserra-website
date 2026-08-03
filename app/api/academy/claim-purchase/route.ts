import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { courseForId, grantCourseAccess } from "../../../../lib/academy";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

function normalizedEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase();
}

/**
 * Converts a paid Stripe Checkout session into an Academy entitlement only
 * after the signed-in Academy account proves it owns the checkout email.
 * This keeps the public purchase flow separate from privileged administration.
 */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Academy account required" }, { status: 401 });

  const requestUrl = new URL(request.url);
  const course = courseForId(requestUrl.searchParams.get("course") ?? "");
  const sessionId = requestUrl.searchParams.get("session_id") ?? "";
  if (!course || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid enrollment reference" }, { status: 400 });
  }

  try {
    const [session, user] = await Promise.all([
      getStripe().checkout.sessions.retrieve(sessionId),
      currentUser(),
    ]);
    const accountEmail = normalizedEmail(
      user?.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress,
    );
    const checkoutEmail = normalizedEmail(session.customer_details?.email ?? session.customer_email);
    const paymentValid = session.mode === "payment" && session.status === "complete" && session.payment_status === "paid";
    const courseValid = session.metadata?.courseId === course.id;

    if (!paymentValid || !courseValid) {
      return NextResponse.json({ error: "Payment has not been verified for this course" }, { status: 409 });
    }
    if (!accountEmail || !checkoutEmail || accountEmail !== checkoutEmail) {
      return NextResponse.json({ error: "Use the same verified email address used at checkout" }, { status: 403 });
    }

    await grantCourseAccess(userId, course.id, session.id);
    return NextResponse.json({ enrolled: true, courseId: course.id });
  } catch {
    return NextResponse.json({ error: "Unable to verify this payment right now" }, { status: 503 });
  }
}
