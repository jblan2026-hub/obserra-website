import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";
import { getStripe, paymentLinkForCourse } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const course = courseForId(requestUrl.searchParams.get("course") ?? "");
  const paymentEnrollmentReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

  if (!course || !paymentEnrollmentReady) {
    return NextResponse.redirect(new URL("/academy?enrollment=not-ready", requestUrl));
  }

  try {
    const stripe = getStripe();
    const paymentLink = await paymentLinkForCourse(course.id);
    if (!paymentLink) throw new Error("No active secure checkout is configured for this course");
    const paymentLinkItems = await stripe.paymentLinks.listLineItems(paymentLink.id, { limit: 100 });
    const lineItems = paymentLinkItems.data.flatMap((item) => {
      const priceId = typeof item.price === "string" ? item.price : item.price?.id;
      return priceId ? [{ price: priceId, quantity: item.quantity ?? 1 }] : [];
    });

    if (!lineItems.length) throw new Error("No sellable price is attached to this course");

    const successUrl = new URL("/academy/success", requestUrl);
    successUrl.searchParams.set("course", course.id);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    const cancelUrl = new URL("/academy", requestUrl);
    cancelUrl.searchParams.set("course", course.id);
    cancelUrl.searchParams.set("checkout", "cancelled");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_creation: "always",
      metadata: { courseId: course.id, enrollmentMode: "passwordless-paid-access" },
      payment_intent_data: { metadata: { courseId: course.id, enrollmentMode: "passwordless-paid-access" } },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return NextResponse.redirect(session.url, { status: 303 });
  } catch {
    return NextResponse.redirect(new URL("/academy?enrollment=checkout-unavailable", requestUrl));
  }
}
