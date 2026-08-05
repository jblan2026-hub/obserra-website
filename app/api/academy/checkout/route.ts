import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { courseForId } from "../../../../lib/academy";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const course = courseForId(requestUrl.searchParams.get("course") ?? "");
  const paymentEnrollmentReady = Boolean(process.env.STRIPE_SECRET_KEY);

  if (!course || !paymentEnrollmentReady) {
    return NextResponse.redirect(new URL("/academy?enrollment=not-ready", requestUrl));
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("academy checkout running without STRIPE_WEBHOOK_SECRET; webhook-based enrollment sync is disabled");
  }

  try {
    let userId: string | undefined;
    try {
      const authState = await auth();
      userId = authState.userId ?? undefined;
    } catch {
      userId = undefined;
    }
    const stripe = getStripe();

    const successUrl = new URL("/academy/success", requestUrl);
    successUrl.searchParams.set("course", course.id);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    const cancelUrl = new URL("/academy", requestUrl);
    cancelUrl.searchParams.set("course", course.id);
    cancelUrl.searchParams.set("checkout", "cancelled");

    const metadata: Record<string, string> = {
      courseId: course.id,
      enrollmentMode: "passwordless-paid-access",
    };
    if (userId) metadata.clerkUserId = userId;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(course.price * 100),
          product_data: {
            name: course.title,
            description: course.description,
            metadata: { obserraCourseId: course.id, department: course.department, level: course.level },
          },
        },
      }],
      customer_creation: "always",
      metadata,
      payment_intent_data: { metadata },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    console.error("academy checkout failed", error);
    return NextResponse.redirect(new URL("/academy?enrollment=checkout-unavailable", requestUrl));
  }
}
