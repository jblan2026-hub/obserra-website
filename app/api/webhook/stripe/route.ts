import { NextResponse } from "next/server";
import Stripe from "stripe";
import { courseForId, grantCourseAccess } from "../../../../lib/academy";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

async function resolveLearnerId(session: Stripe.Checkout.Session) {
  const metadataUserId = session.metadata?.clerkUserId;
  return metadataUserId || undefined;
}

async function fulfillPaidSession(session: Stripe.Checkout.Session) {
  const courseId = session.metadata?.courseId;
  const course = courseId ? courseForId(courseId) : undefined;
  if (!course) return;
  const learnerId = await resolveLearnerId(session);
  if (!learnerId) return;
  await grantCourseAccess(learnerId, course.id, session.id);
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") await fulfillPaidSession(session);
  }
  if (event.type === "checkout.session.async_payment_succeeded") {
    await fulfillPaidSession(event.data.object as Stripe.Checkout.Session);
  }

  return NextResponse.json({ received: true });
}
