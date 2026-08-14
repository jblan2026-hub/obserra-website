import { NextResponse } from "next/server";
import Stripe from "stripe";
import { courseForId } from "../../../../lib/academy";
import { recordPaidCheckout } from "../../../../lib/academy-persistence";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

async function fulfillPaidSession(
  session: Stripe.Checkout.Session,
  eventId: string,
  eventType: "checkout.session.completed" | "checkout.session.async_payment_succeeded",
) {
  const courseId = session.metadata?.courseId;
  const course = courseId ? courseForId(courseId) : undefined;
  const learnerId = session.metadata?.clerkUserId || undefined;
  const identityMode = session.metadata?.identityMode;

  if (!course) {
    console.error("academy paid session rejected", {
      eventId,
      sessionId: session.id,
      courseId: courseId ?? "missing",
      reason: "unknown-course",
    });
    return { state: "rejected", reason: "unknown-course" } as const;
  }

  if (identityMode !== "authenticated" && identityMode !== "guest-email") {
    console.error("academy paid session rejected", {
      eventId,
      sessionId: session.id,
      courseId: course.id,
      reason: "invalid-identity-mode",
    });
    return { state: "rejected", reason: "invalid-identity-mode" } as const;
  }

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  const courseVersion = /^\d+\.\d+\.\d+$/.test(session.metadata?.courseVersion ?? "")
    ? session.metadata!.courseVersion
    : "1.0.0";
  const result = await recordPaidCheckout({
    eventId,
    eventType,
    checkoutSessionId: session.id,
    paymentIntentId,
    courseId: course.id,
    courseVersion,
    identityMode,
    clerkUserId: learnerId,
    purchaserEmail: learnerId ? undefined : session.customer_details?.email ?? session.customer_email ?? undefined,
  });
  console.info("academy paid session durably recorded", {
    eventId,
    sessionId: session.id,
    courseId: course.id,
    identityMode,
    paymentStatus: session.payment_status,
    fulfillmentState: result.state,
    idempotentReplay: result.idempotentReplay,
  });
  return {
    state: result.state === "paid_pending_claim" ? "paid-pending-account-claim" : "fulfilled",
    courseId: course.id,
  } as const;
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
    if (session.payment_status === "paid") fulfillment = await fulfillPaidSession(session, event.id, event.type);
  }
  if (event.type === "checkout.session.async_payment_succeeded") {
    fulfillment = await fulfillPaidSession(event.data.object as Stripe.Checkout.Session, event.id, event.type);
  }

  return NextResponse.json({
    received: true,
    eventId: event.id,
    eventType: event.type,
    fulfillmentState: fulfillment?.state ?? "not-applicable",
  });
}
