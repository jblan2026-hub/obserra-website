import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { courseForId } from "../../../../lib/academy";
import { publicAcademyCourse } from "../../../../lib/academy-control";
import {
  studioCertificateMetadata,
  studioCourseForId,
  studioCourseIsApproved,
  studioLicenseMetadata,
} from "../../../../lib/academy-studio";
import { safeIdentity } from "../../../../lib/identity-runtime";
import {
  academyCommerceProvider,
  learnWorldsEnrollmentUrl,
  learnWorldsProductForCourse,
} from "../../../../lib/learnworlds";
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

const CLAIM_POLICY = "purchaser-email-match-v1";
const INITIAL_COURSE_VERSION = "1.0.0";

function unavailableRedirect(requestUrl: URL, reason: string) {
  const response = NextResponse.redirect(new URL(`/academy?enrollment=${reason}`, requestUrl));
  response.headers.set("x-obserra-commerce-status", reason);
  response.headers.set("x-obserra-webhook-verification", "required");
  response.headers.set("cache-control", "private, no-store, max-age=0");
  return response;
}

function learnWorldsRedirect(requestUrl: URL, courseId: string) {
  const product = learnWorldsProductForCourse(courseId);
  const target = learnWorldsEnrollmentUrl(courseId);
  if (!product || !target) {
    const response = unavailableRedirect(requestUrl, "learnworlds-product-unavailable");
    response.headers.set("x-obserra-commerce-provider", "learnworlds");
    response.headers.set("x-obserra-learnworlds-mapping", product ? product.status : "missing");
    return response;
  }

  const response = NextResponse.redirect(target, { status: 303 });
  response.headers.set("x-obserra-commerce-provider", "learnworlds");
  response.headers.set("x-obserra-commerce-mode", "learnworlds-managed");
  response.headers.set("x-obserra-learnworlds-product-id", product.productId);
  response.headers.set("x-obserra-learnworlds-product-status", product.status);
  response.headers.set("x-obserra-existing-entitlements", "legacy-entitlements-preserved");
  response.headers.set("x-obserra-webhook-verification", "learnworlds-managed");
  response.headers.set("cache-control", "private, no-store, max-age=0");
  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const baseCourse = courseForId(requestUrl.searchParams.get("course") ?? "");

  if (!baseCourse) return unavailableRedirect(requestUrl, "course-unavailable");

  const runtimeCourse = await publicAcademyCourse(baseCourse);
  if (
    runtimeCourse.controlPlane !== "operational" ||
    !runtimeCourse.course ||
    !runtimeCourse.control.purchaseEnabled
  ) {
    const reason = runtimeCourse.controlPlane === "operational"
      ? "course-unavailable"
      : "purchase-authorization-unavailable";
    const response = unavailableRedirect(requestUrl, reason);
    response.headers.set("x-obserra-course-lifecycle", runtimeCourse.control.lifecycle);
    response.headers.set("x-obserra-existing-entitlements", "preserved");
    return response;
  }

  const course = runtimeCourse.course;
  if (academyCommerceProvider() === "learnworlds") {
    return learnWorldsRedirect(requestUrl, course.id);
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return unavailableRedirect(requestUrl, "configuration-required");
  }

  try {
    const identity = await safeIdentity();
    const purchaserReference = identity.userId ?? `guest_${randomUUID()}`;
    const identityMode = identity.userId ? "authenticated" : "guest-email";
    const stripe = getStripe();
    const studioCourse = studioCourseIsApproved(course.id) ? studioCourseForId(course.id) : null;
    const license = studioLicenseMetadata(course.id);
    const certificate = studioCertificateMetadata(course.id);
    const courseVersion = studioCourse?.version && /^\d+\.\d+\.\d+$/.test(studioCourse.version)
      ? studioCourse.version
      : INITIAL_COURSE_VERSION;
    const successUrl = new URL("/academy/success", requestUrl);
    successUrl.searchParams.set("course", course.id);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

    const cancelUrl = new URL(`/academy/${course.id}`, requestUrl);
    cancelUrl.searchParams.set("checkout", "cancelled");

    const metadata = {
      courseId: course.id,
      courseTitle: course.title,
      courseVersion,
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
      studioManaged: String(Boolean(studioCourse)),
      catalogParityVerified: String(Boolean(studioCourse)),
      courseLifecycle: runtimeCourse.control.lifecycle,
      courseControlRevision: String(runtimeCourse.control.revision),
      existingEntitlementsPreserved: "true",
    };

    const useGovernedStripePrice = Boolean(
      studioCourse?.commerce.stripePriceId &&
      course.price === baseCourse.price &&
      course.title === baseCourse.title,
    );
    const lineItem = useGovernedStripePrice && studioCourse?.commerce.stripePriceId
      ? { price: studioCourse.commerce.stripePriceId, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(course.price * 100),
            product_data: {
              name: course.title,
              description: course.description,
              metadata: {
                obserraCourseId: course.id,
                courseVersion,
                department: course.department,
                level: course.level,
                entitlementCode: license.entitlementCode,
                credentialType: metadata.credentialType,
                courseControlRevision: metadata.courseControlRevision,
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
      payment_intent_data: {
        metadata,
        description: `${course.title} | Course Version v${courseVersion}`,
      },
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      billing_address_collection: "auto",
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");

    const response = NextResponse.redirect(session.url, { status: 303 });
    response.headers.set("x-obserra-commerce-provider", "website-stripe");
    response.headers.set("x-obserra-commerce-mode", identityMode);
    response.headers.set("x-obserra-claim-policy", CLAIM_POLICY);
    response.headers.set("x-obserra-catalog-parity", studioCourse ? "governed-studio" : "baseline-fallback");
    response.headers.set("x-obserra-course-version", courseVersion);
    response.headers.set("x-obserra-course-lifecycle", runtimeCourse.control.lifecycle);
    response.headers.set("x-obserra-course-control-revision", String(runtimeCourse.control.revision));
    response.headers.set("x-obserra-existing-entitlements", "preserved");
    response.headers.set("x-obserra-webhook-verification", "required");
    response.headers.set("cache-control", "private, no-store, max-age=0");
    return response;
  } catch {
    const response = NextResponse.redirect(
      new URL(`/academy/${course.id}?enrollment=checkout-unavailable`, requestUrl),
    );
    response.headers.set("x-obserra-commerce-status", "checkout-unavailable");
    response.headers.set("x-obserra-existing-entitlements", "preserved");
    response.headers.set("cache-control", "private, no-store, max-age=0");
    return response;
  }
}
