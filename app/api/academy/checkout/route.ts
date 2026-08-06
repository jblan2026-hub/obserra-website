import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";
import {
  studioCertificateMetadata,
  studioCourseForId,
  studioLicenseMetadata,
} from "../../../../lib/academy-studio";
import { safeIdentity } from "../../../../lib/identity-runtime";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

const CLAIM_POLICY = "purchaser-email-match-v1";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const course = courseForId(requestUrl.searchParams.get("course") ?? "");

  if (!course || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.redirect(new URL("/academy?enrollment=not-ready", requestUrl));
  }

  try {
    const identity = await safeIdentity();
    const purchaserReference = identity.userId ?? `guest_${randomUUID()}`;
    const identityMode = identity.userId ? "authenticated" : "guest-email";
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
      clerkUserId: identity.userId ?? "",
      purchaserReference,
      identityMode,
      enrollmentMode: identity.userId ? "authenticated-paid-access" : "paid-pending-account-claim",
      claimPolicy: CLAIM_POLICY,
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
      client_reference_id: purchaserReference,
      metadata,
      payment_intent_data: { metadata },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      billing_address_collection: "auto",
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");

    const response = NextResponse.redirect(session.url, { status: 303 });
    response.headers.set("x-obserra-commerce-mode", identityMode);
    response.headers.set("x-obserra-claim-policy", CLAIM_POLICY);
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  } catch (error) {
    console.error("academy checkout failed", error);
    return NextResponse.redirect(new URL(`/academy/${course.id}?enrollment=checkout-unavailable`, requestUrl));
  }
}
