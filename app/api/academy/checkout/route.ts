import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { courseForId } from "../../../../lib/academy";
import { studioCourseForId, studioLicenseMetadata, studioCertificateMetadata } from "../../../../lib/academy-studio";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const course = courseForId(requestUrl.searchParams.get("course") ?? "");

  if (!course || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(new URL("/academy?enrollment=not-ready", requestUrl));
  }

  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", requestUrl);
    signInUrl.searchParams.set("redirect_url", requestUrl.toString());
    return NextResponse.redirect(signInUrl);
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("academy checkout running without STRIPE_WEBHOOK_SECRET; success redemption remains enabled");
  }

  try {
    const stripe = getStripe();
    const studioCourse = studioCourseForId(course.id);
    const license = studioLicenseMetadata(course.id);
    const certificate = studioCertificateMetadata(course.id);
    const successUrl = new URL("/academy/success", requestUrl);
    successUrl.searchParams.set("course", course.id);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

    const cancelUrl = new URL(`/academy/${course.id}`, requestUrl);
    cancelUrl.searchParams.set("checkout", "cancelled");

    const metadata = {
      courseId: course.id,
      clerkUserId: userId,
      enrollmentMode: "authenticated-paid-access",
      licenseType: license.type,
      purchaseModel: license.purchaseModel,
      accessPolicy: license.accessPolicy,
      transferable: String(license.transferable),
      certificateIssuer: certificate.issuer,
      certificateVerification: certificate.verificationMode,
      courseVersion: studioCourse?.version ?? "website-catalog",
      studioManaged: String(Boolean(studioCourse)),
    };

    if (studioCourse?.paymentLink) {
      const paymentLink = new URL(studioCourse.paymentLink);
      paymentLink.searchParams.set("client_reference_id", userId);
      return NextResponse.redirect(paymentLink, { status: 303 });
    }

    const lineItem = studioCourse?.stripePriceId
      ? { price: studioCourse.stripePriceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: (studioCourse?.currency ?? "USD").toLowerCase(),
            unit_amount: Math.round((studioCourse?.price ?? course.price) * 100),
            product_data: {
              name: course.title,
              description: studioCourse?.description ?? course.description,
              metadata: {
                obserraCourseId: course.id,
                department: course.department,
                level: course.level,
                licenseType: license.type,
              },
            },
          },
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      customer_creation: "always",
      client_reference_id: userId,
      metadata,
      payment_intent_data: { metadata },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    console.error("academy checkout failed", error);
    return NextResponse.redirect(new URL(`/academy/${course.id}?enrollment=checkout-unavailable`, requestUrl));
  }
}
