import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);
  const course = courseForId(url.searchParams.get("course") ?? "");
  const paymentEnrollmentReady = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET,
  );
  if (!userId || !course?.checkoutUrl) return NextResponse.redirect(new URL("/academy", url));
  if (!paymentEnrollmentReady) {
    return NextResponse.redirect(new URL("/academy?enrollment=not-ready", url));
  }
  const user = await currentUser();
  const email = user?.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress;
  const checkout = new URL(course.checkoutUrl);
  if (email) checkout.searchParams.set("prefilled_email", email);
  return NextResponse.redirect(checkout);
}
