import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { courses } from "../../../academy/courseData";
import { grantCourseAccess } from "../../../../lib/academy";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }
  if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });
  const session = event.data.object as Stripe.Checkout.Session;
  const course = courses.find((item) => item.stripePaymentLinkId === session.payment_link);
  const email = session.customer_details?.email?.toLowerCase();
  if (!course || !email || session.payment_status !== "paid") return NextResponse.json({ received: true });
  const client = await clerkClient();
  const users = await client.users.getUserList({ emailAddress: [email], limit: 2 });
  if (users.data.length !== 1) return NextResponse.json({ received: true });
  await grantCourseAccess(users.data[0].id, course.id, session.id);
  return NextResponse.json({ received: true });
}
