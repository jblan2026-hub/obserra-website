import { NextResponse } from "next/server";
import Stripe from "stripe";
import { courseForId, grantCourseAccess } from "../../../../lib/academy";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

async function fulfillPaidSession(session: Stripe.Checkout.Session, eventId: string) {
  const courseId = session.metadata?.courseId;
  const course = courseId ? courseForId(courseId) : undefined;
  const learnerId = session.metadata?.clerkUserId || undefined;
  const identityMode = session.metadata?.identityMode ?? "unknown";

  if (!course) {
    console.error("academy paid session rejected", {
      eventId,
      sessionId: session.id,
      courseId: courseId ?? "missing",
      reason: "unknown-course",
    });
    return { state: "rejected", reason: "unknown-course" } as const;
  }

  if (!learnerId) {
    console.info("academy paid session pending account claim", {
      eventId,
      sessionId: session.id,
      courseId: course.id,
      identityMode,
      paymentStatus: session.payment_status,
      purchaserReference: session.metadata?.purchaserReference ?? session.client_reference_id ?? "missing",
    });
    return { state: "paid-pending-account-claim", courseId: course.id } as const;
  }

  await grantCourseAccess(learnerId, course.id, session.id);
  console.info("academy paid session fulfilled", {
    eventId,
    sessionId: session.id,
    courseId: course.id,
    identityMode,
    paymentStatus: session.payment_status,
  });
  return { state: "fulfilled", courseId: course.id } as const;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let fulfillment: Awaited<ReturnType<typeof fulfillPaidSession>> | undefined;
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") fulfillment = await fulfillPaidSession(session, event.id);
  }
  if (event.type === "checkout.session.async_payment_succeeded") {
    fulfillment = await fulfillPaidSession(event.data.object as Stripe.Checkout.Session, event.id);
  }

  return NextResponse.json({
    received: true,
    eventId: event.id,
    eventType: event.type,
    fulfillmentState: fulfillment?.state ?? "not-applicable",
  });
}
