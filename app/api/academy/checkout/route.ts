import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";
import {
  safeStudioPaymentLink,
  studioCertificateMetadata,
  studioCourseForId,
  studioLicenseMetadata,
} from "../../../../lib/academy-studio";
import { safeIdentity } from "../../../../lib/identity-runtime";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const course = courseForId(requestUrl.searchParams.get("course") ?? "");

  if (!course || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(new URL("/academy?enrollment=not-ready", requestUrl));
  }

  const identity = await safeIdentity();
  if (!identity.configured) {
    const unavailableUrl = new URL("/academy", requestUrl);
    unavailableUrl.searchParams.set("enrollment", "identity-configuration-required");
    return NextResponse.redirect(unavailableUrl, { status: 307 });
  }

  if (!identity.userId) {
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
      clerkUserId: identity.userId,
      enrollmentMode: "authenticated-paid-access",
      entitlementType: license.entitlementType,
      entitlementCode: license.entitlementCode,
      accessPolicy: license.accessPolicy,
      seatScope: license.seatScope,
      transferable: String(license.transferable),
      credentialType: studioCourse?.completion.credentialType ?? "certificate-of-course-completion-only",
      certificateIssuer: certificate.issuer,
      isProfessionalCertification: String(certificate.isProfessionalCertification),
      isComplianceEvidence: String(certificate.isComplianceEvidence),
      courseVersion: studioCourse?.version ?? "website-catalog",
      studioManaged: String(Boolean(studioCourse)),
    };

    const approvedPaymentLink = safeStudioPaymentLink(studioCourse?.commerce.paymentLink);
    if (approvedPaymentLink) {
      approvedPaymentLink.searchParams.set("client_reference_id", identity.userId);
      return NextResponse.redirect(approvedPaymentLink, { status: 303 });
    }

    const lineItem = studioCourse?.commerce.stripePriceId
      ? { price: studioCourse.commerce.stripePriceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: (studioCourse?.commerce.currency ?? "USD").toLowerCase(),
            unit_amount: Math.round((studioCourse?.commerce.price ?? course.price) * 100),
            product_data: {
              name: studioCourse?.title ?? course.title,
              description: studioCourse?.description ?? course.description,
              metadata: {
                obserraCourseId: course.id,
                department: course.department,
                level: course.level,
                entitlementCode: license.entitlementCode,
                credentialType: metadata.credentialType,
              },
            },
          },
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      customer_creation: "always",
      client_reference_id: identity.userId,
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
