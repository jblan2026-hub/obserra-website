import { NextResponse } from "next/server";
import Stripe from "stripe";
import { courseForId } from "../../../../lib/academy";
import {
  academyCommerceLivemode,
  academyCourseAmountCents,
  validateAcademyPaidSession,
} from "../../../../lib/academy-payment";
import { recordPaidCheckout } from "../../../../lib/academy-persistence";
import { getStripe } from "../../../../lib/stripe";
import { readStripeWebhookBody, StripeWebhookBodyError } from "../../../../lib/stripe-webhook-body";

export const runtime = "nodejs";

function modeMismatchResponse(event: Stripe.Event, session?: Stripe.Checkout.Session) {
  console.warn("academy Stripe webhook mode mismatch rejected", {
    eventId: event.id,
    eventLivemode: event.livemode,
    sessionLivemode: session?.livemode ?? null,
  });
  return NextResponse.json(
    { error: "Webhook mode mismatch" },
    { status: 409 },
  );
}

async function fulfillPaidSession(
  session: Stripe.Checkout.Session,
  eventId: string,
  eventType: "checkout.session.completed" | "checkout.session.async_payment_succeeded",
  expectedLivemode: boolean,
) {
  const courseId = session.metadata?.courseId;
  const course = courseId ? courseForId(courseId) : undefined;
  if (!course) {
    console.error("academy paid session rejected", {
      eventId,
      sessionId: session.id,
      courseId: courseId ?? "missing",
      reason: "unknown-course",
    });
    return { state: "rejected", reason: "unknown-course" } as const;
  }

  const amountCents = academyCourseAmountCents(course.price);
  const validation = amountCents === null
    ? { valid: false as const, reason: "course-price-invalid" }
    : validateAcademyPaidSession(session, {
        courseId: course.id,
        amountCents,
        livemode: expectedLivemode,
      });
  if (!validation.valid) {
    console.error("academy paid session rejected", {
      eventId,
      sessionId: session.id,
      courseId: course.id,
      reason: validation.reason,
    });
    return { state: "rejected", reason: validation.reason } as const;
  }

  const result = await recordPaidCheckout({
    eventId,
    eventType,
    checkoutSessionId: session.id,
    paymentIntentId: validation.paymentIntentId,
    courseId: course.id,
    courseVersion: validation.courseVersion,
    identityMode: validation.identityMode,
    clerkUserId: validation.learnerId,
    purchaserEmail: validation.learnerId ? undefined : session.customer_details?.email ?? session.customer_email ?? undefined,
  });
  console.info("academy paid session durably recorded", {
    eventId,
    sessionId: session.id,
    courseId: course.id,
    identityMode: validation.identityMode,
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
    const body = await readStripeWebhookBody(request);
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    if (error instanceof StripeWebhookBodyError) {
      return NextResponse.json({ error: "Webhook payload too large" }, { status: error.status });
    }
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const expectedLivemode = academyCommerceLivemode();
  if (expectedLivemode === null) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (event.livemode !== expectedLivemode) return modeMismatchResponse(event);

  let fulfillment: Awaited<ReturnType<typeof fulfillPaidSession>> | undefined;
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.livemode !== event.livemode) return modeMismatchResponse(event, session);
    if (session.payment_status === "paid") fulfillment = await fulfillPaidSession(session, event.id, event.type, expectedLivemode);
  }
  if (event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.livemode !== event.livemode) return modeMismatchResponse(event, session);
    fulfillment = await fulfillPaidSession(session, event.id, event.type, expectedLivemode);
  }

  return NextResponse.json({
    received: true,
    eventId: event.id,
    eventType: event.type,
    fulfillmentState: fulfillment?.state ?? "not-applicable",
  });
}
