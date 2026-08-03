import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";
import { academyAccessCookieName, accessCookieOptions, newAcademyState, parseAcademyAccess, serializeAcademyAccess } from "../../../../lib/academyAccess";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const courseId = requestUrl.searchParams.get("course") ?? "";
  const sessionId = requestUrl.searchParams.get("session_id") ?? "";
  const course = courseForId(courseId);
  if (!course || !sessionId.startsWith("cs_")) return NextResponse.redirect(new URL("/academy?enrollment=invalid", requestUrl));

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.mode !== "payment" || session.status !== "complete" || session.payment_status !== "paid" || session.metadata?.courseId !== courseId) {
      return NextResponse.redirect(new URL("/academy?enrollment=pending", requestUrl));
    }
    const cookieStore = await cookies();
    const state = parseAcademyAccess(cookieStore.get(academyAccessCookieName)?.value) ?? newAcademyState();
    state.courses[courseId] ??= { paymentReference: session.id, enrolledAt: new Date().toISOString() };
    state.learnerName = session.customer_details?.name?.trim() || session.customer_details?.email?.trim() || state.learnerName;
    const response = NextResponse.redirect(new URL(`/academy/learn/${courseId}`, requestUrl));
    response.cookies.set(academyAccessCookieName, serializeAcademyAccess(state), accessCookieOptions());
    return response;
  } catch {
    return NextResponse.redirect(new URL("/academy?enrollment=verification-unavailable", requestUrl));
  }
}
