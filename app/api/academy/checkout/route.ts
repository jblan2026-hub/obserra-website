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
import { getStripe } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

const CLAIM_POLICY = "purchaser-email-match-v1";
const INITIAL_COURSE_VERSION = "1.0.0";
const NO_STORE = "private, no-store, max-age=0";

function unavailableRedirect(requestUrl: URL, reason: string) {
  const response = NextResponse.redirect(new URL(`/academy?enrollment=${reason}`, requestUrl));
  response.headers.set("x-obserra-commerce-status", reason);
  response.headers.set("x-obserra-webhook-verification", "required");
  response.headers.set("cache-control", NO_STORE);
  return response;
}

function rejectedRequest(status: number, error: string) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        "cache-control": NO_STORE,
        "x-content-type-options": "nosniff",
      },
    },
  );
}

function isSameOrigin(request: Request, requestUrl: URL) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

function isSupportedFormContentType(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  return contentType.startsWith("application/x-www-form-urlencoded") ||
    contentType.startsWith("multipart/form-data");
}

export async function GET() {
  const response = rejectedRequest(405, "Method not allowed");
  response.headers.set("allow", "POST");
  return response;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);

  if (!isSameOrigin(request, requestUrl)) {
    return rejectedRequest(403, "Forbidden");
  }
  if (!isSupportedFormContentType(request)) {
    return rejectedRequest(415, "Unsupported media type");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return rejectedRequest(400, "Invalid request body");
  }

  const courseValue = formData.get("course");
  const baseCourse = courseForId(typeof courseValue === "string" ? courseValue : "");

  if (!baseCourse || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return unavailableRedirect(requestUrl, "configuration-required");
  }

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
    response.headers.set("x-obserra-commerce-mode", identityMode);
    response.headers.set("x-obserra-claim-policy", CLAIM_POLICY);
    response.headers.set("x-obserra-catalog-parity", studioCourse ? "governed-studio" : "baseline-fallback");
    response.headers.set("x-obserra-course-version", courseVersion);
    response.headers.set("x-obserra-course-lifecycle", runtimeCourse.control.lifecycle);
    response.headers.set("x-obserra-course-control-revision", String(runtimeCourse.control.revision));
    response.headers.set("x-obserra-existing-entitlements", "preserved");
    response.headers.set("x-obserra-webhook-verification", "required");
    response.headers.set("cache-control", NO_STORE);
    return response;
  } catch {
    const response = NextResponse.redirect(
      new URL(`/academy/${course.id}?enrollment=checkout-unavailable`, requestUrl),
    );
    response.headers.set("x-obserra-commerce-status", "checkout-unavailable");
    response.headers.set("x-obserra-existing-entitlements", "preserved");
    response.headers.set("cache-control", NO_STORE);
    return response;
  }
}
