import { NextResponse } from "next/server";
import Stripe from "stripe";
import { courseForId } from "../../../../lib/academy";
import {
  academyPaymentReversalPolicy,
  academyCommerceLivemode,
  academyCourseAmountCents,
  validateAcademyPaidSession,
} from "../../../../lib/academy-payment";
import { recordAcademyPaymentReversal, recordPaidCheckout } from "../../../../lib/academy-persistence";
import {
  AcademyStripeVerificationError,
  retrieveVerifiedAcademyPaidSession,
  retrieveVerifiedAcademyPaidSessionForPaymentIntent,
  stripeObjectId,
} from "../../../../lib/academy-stripe-verification";
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
  if (amountCents === null) return { state: "rejected", reason: "course-price-invalid" } as const;
  const validation = validateAcademyPaidSession(session, {
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

  const stripe = getStripe();
  const verified = await retrieveVerifiedAcademyPaidSession(
    stripe,
    session.id,
    { courseId: course.id, amountCents, livemode: expectedLivemode },
  );
  if (
    stripeObjectId(session.payment_intent) !== verified.paymentIntent.id ||
    (stripeObjectId(session.customer) && stripeObjectId(session.customer) !== verified.customerId)
  ) {
    throw new AcademyStripeVerificationError("signed-session-canonical-link-mismatch");
  }

  const result = await recordPaidCheckout({
    eventId,
    eventType,
    checkoutSessionId: verified.session.id,
    paymentIntentId: verified.validation.paymentIntentId,
    courseId: course.id,
    courseVersion: verified.validation.courseVersion,
    identityMode: verified.validation.identityMode,
    clerkUserId: verified.validation.learnerId,
    purchaserEmail: verified.validation.learnerId
      ? undefined
      : verified.session.customer_details?.email ?? verified.session.customer_email ?? undefined,
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

function reversalMismatch(reason: string): never {
  throw new AcademyStripeVerificationError(reason);
}

async function recordSignedPaymentReversal(
  event: Stripe.Event,
  expectedLivemode: boolean,
) {
  if (
    event.type !== "charge.refunded" &&
    event.type !== "charge.dispute.created" &&
    event.type !== "charge.dispute.closed"
  ) reversalMismatch("reversal-event-type-invalid");
  const eventType = event.type;
  const stripe = getStripe();
  let charge: Stripe.Charge;
  let providerObjectId: string;
  let amountReversed: number;

  if (eventType === "charge.refunded") {
    charge = event.data.object as Stripe.Charge;
    providerObjectId = charge.id;
    amountReversed = charge.amount_refunded;
  } else {
    const dispute = event.data.object as Stripe.Dispute;
    if (dispute.livemode !== event.livemode) reversalMismatch("dispute-event-mode-mismatch");
    if (eventType === "charge.dispute.created" && ["won", "lost", "warning_closed", "prevented"].includes(dispute.status)) {
      reversalMismatch("dispute-created-status-invalid");
    }
    if (eventType === "charge.dispute.closed" && !["won", "lost", "warning_closed"].includes(dispute.status)) {
      reversalMismatch("dispute-closed-status-invalid");
    }
    const chargeId = stripeObjectId(dispute.charge);
    const disputePaymentIntentId = stripeObjectId(dispute.payment_intent);
    if (!chargeId || !disputePaymentIntentId) reversalMismatch("dispute-payment-link-missing");
    charge = await stripe.charges.retrieve(chargeId);
    if (stripeObjectId(charge.payment_intent) !== disputePaymentIntentId) {
      reversalMismatch("dispute-payment-intent-mismatch");
    }
    if (dispute.currency !== charge.currency || dispute.amount <= 0 || dispute.amount > charge.amount_captured) {
      reversalMismatch("dispute-amount-currency-mismatch");
    }
    providerObjectId = dispute.id;
    amountReversed = dispute.amount;
  }

  const paymentIntentId = stripeObjectId(charge.payment_intent);
  const chargeCustomerId = stripeObjectId(charge.customer);
  if (!paymentIntentId || !chargeCustomerId) reversalMismatch("charge-payment-link-missing");
  if (charge.livemode !== expectedLivemode || charge.livemode !== event.livemode) {
    reversalMismatch("charge-mode-mismatch");
  }
  if (!charge.paid || charge.status !== "succeeded") reversalMismatch("charge-not-succeeded");

  const verified = await retrieveVerifiedAcademyPaidSessionForPaymentIntent(
    stripe,
    paymentIntentId,
    expectedLivemode,
  );
  if (
    verified.customerId !== chargeCustomerId ||
    stripeObjectId(verified.paymentIntent.latest_charge) !== charge.id ||
    charge.currency !== verified.session.currency ||
    charge.amount_captured !== verified.session.amount_total
  ) reversalMismatch("charge-session-customer-link-mismatch");

  const policy = academyPaymentReversalPolicy(eventType, {
    amountCaptured: charge.amount_captured,
    amountReversed,
    fullyRefunded: eventType === "charge.refunded" ? charge.refunded : false,
  });
  if (!policy) reversalMismatch("reversal-policy-invalid");
  const result = await recordAcademyPaymentReversal({
    eventId: event.id,
    eventType,
    providerObjectId,
    chargeId: charge.id,
    paymentIntentId,
    checkoutSessionId: verified.session.id,
    customerId: verified.customerId,
    courseId: verified.session.metadata?.courseId ?? "",
    courseVersion: verified.validation.courseVersion,
    amountCaptured: charge.amount_captured,
    amountReversed,
    currency: "usd",
    livemode: expectedLivemode,
    disposition: policy.disposition,
    targetAccessStatus: policy.targetAccessStatus,
  });
  console.info("academy payment reversal durably recorded", {
    eventId: event.id,
    eventType,
    chargeId: charge.id,
    checkoutSessionId: verified.session.id,
    courseId: verified.session.metadata?.courseId,
    disposition: policy.disposition,
    processingState: result.state,
    accessStatus: result.accessStatus,
    idempotentReplay: result.idempotentReplay,
  });
  return result;
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

  if (
    event.type === "charge.refunded" ||
    event.type === "charge.dispute.created" ||
    event.type === "charge.dispute.closed"
  ) {
    try {
      const reversal = await recordSignedPaymentReversal(event, expectedLivemode);
      return NextResponse.json({
        received: true,
        eventId: event.id,
        eventType: event.type,
        reversalState: reversal.state,
        accessStatus: reversal.accessStatus,
        idempotentReplay: reversal.idempotentReplay,
      });
    } catch (error) {
      if (error instanceof AcademyStripeVerificationError) {
        console.warn("academy payment reversal rejected", { eventId: event.id, reason: error.reason });
        return NextResponse.json({ error: "Payment reversal verification failed" }, { status: 409 });
      }
      throw error;
    }
  }

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
