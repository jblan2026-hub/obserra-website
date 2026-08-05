import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { courseForId, grantCourseAccess } from "../../../../lib/academy";
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

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", requestUrl);
    signInUrl.searchParams.set("redirect_url", requestUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const validPayment =
      session.mode === "payment" &&
      session.status === "complete" &&
      session.payment_status === "paid" &&
      session.metadata?.courseId === courseId;
    const correctLearner = session.metadata?.clerkUserId === userId;

    if (!validPayment || !correctLearner) {
      return NextResponse.redirect(new URL(`/academy/${courseId}?enrollment=verification-failed`, requestUrl));
    }

    await grantCourseAccess(userId, courseId, session.id);
    return NextResponse.redirect(new URL(`/academy/learn/${courseId}?enrollment=confirmed`, requestUrl));
  } catch (error) {
    console.error("academy enrollment redemption failed", error);
    return NextResponse.redirect(new URL(`/academy/${courseId}?enrollment=verification-unavailable`, requestUrl));
  }
}
