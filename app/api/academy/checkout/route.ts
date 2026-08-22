import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { BASELINE_COURSE_VERSION, publicationForCourse } from "../../../academy/coursePublication";
import { courseForId } from "../../../../lib/academy";
import { publicAcademyCourse } from "../../../../lib/academy-control";
import { safeAcademyIdentity } from "../../../../lib/academy-identity";
import { academyLicensedSalesEnabled } from "../../../../lib/academy-licensing";
import {
  academyPurchaserHashConfigured,
  academyStorageHealth,
  bindAcademyCheckoutAttempt,
  durableAcademyState,
  recordAcademyCheckoutSession,
  reserveAcademyCheckoutAttempt,
} from "../../../../lib/academy-persistence";
import {
  studioCertificateMetadata,
  studioCourseForId,
  studioCourseIsApproved,
  studioLicenseMetadata,
} from "../../../../lib/academy-studio";
import {
  ACADEMY_PAYMENT_CONTRACT,
  ACADEMY_PAYMENT_CURRENCY,
  academyCommerceLivemode,
  academyCommerceWebhookConfigured,
  academyCheckoutAttempt,
  academyCheckoutIdempotencyKey,
  academyCheckoutRequestFingerprint,
  academyCourseAmountCents,
  createAcademyCheckoutAfterGovernedPriceValidation,
} from "../../../../lib/academy-payment";
import { getAcademyStripe } from "../../../../lib/academy-stripe";
import { ensureAcademyRuntimeSecrets } from "../../../../lib/production-runtime-secrets";

export const runtime = "nodejs";
export const maxDuration = 60;

const CLAIM_POLICY = "purchaser-email-match-v1";
const NO_STORE = "private, no-store, max-age=0";
const CHECKOUT_BROWSER_COOKIE = "obserra_academy_checkout_browser";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function checkoutBrowserId(request: Request) {
  for (const item of (request.headers.get("cookie") ?? "").split(";")) {
    const [name, ...value] = item.trim().split("=");
    if (name !== CHECKOUT_BROWSER_COOKIE) continue;
    const candidate = decodeURIComponent(value.join("="));
    return UUID.test(candidate) ? candidate.toLowerCase() : null;
  }
  return null;
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
  const checkoutAttempt = academyCheckoutAttempt(
    formData.get("checkoutAttemptId"),
    formData.get("checkoutAttemptIssuedAt"),
  );

  if (!checkoutAttempt) return rejectedRequest(400, "Invalid checkout attempt");

  if (!academyLicensedSalesEnabled()) {
    const response = unavailableRedirect(requestUrl, "licensing-pending");
    response.headers.set("x-obserra-sales-license", "pending");
    response.headers.set("x-obserra-existing-entitlements", "preserved");
    return response;
  }

  try {
    await ensureAcademyRuntimeSecrets();
  } catch {
    return unavailableRedirect(requestUrl, "configuration-required");
  }

  const commerceLivemode = academyCommerceLivemode();
  if (!baseCourse || commerceLivemode === null || !academyCommerceWebhookConfigured()) {
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
  const identity = await safeAcademyIdentity();
  if (!identity.configured) {
    return unavailableRedirect(requestUrl, "identity-configuration-required");
  }
  if (identity.status === "claims_unavailable") {
    return unavailableRedirect(requestUrl, "identity-verification-unavailable");
  }

  const principalId = identity.principalId;
  let existingState: Awaited<ReturnType<typeof durableAcademyState>> = null;
  try {
    await academyStorageHealth();
    existingState = principalId ? await durableAcademyState(principalId, course.id) : null;
  } catch {
    return unavailableRedirect(requestUrl, "durable-storage-unavailable");
  }
  if (existingState?.access_status === "active") {
    return unavailableRedirect(requestUrl, "already-enrolled");
  }
  if (!principalId && !academyPurchaserHashConfigured()) {
    return unavailableRedirect(requestUrl, "purchaser-identity-storage-unavailable");
  }
  const browserId = principalId ? null : checkoutBrowserId(request);
  if (!principalId && !browserId) {
    return unavailableRedirect(requestUrl, "purchaser-identity-storage-unavailable");
  }

  try {
    const purchaserReference = principalId ?? `guest_${browserId}`;
    const identityMode = principalId ? "authenticated" : "guest-email";
    const stripe = getAcademyStripe();
    const studioCourse = studioCourseIsApproved(course.id) ? studioCourseForId(course.id) : null;
    const publication = publicationForCourse(course.id);
    const license = studioLicenseMetadata(course.id);
    const certificate = studioCertificateMetadata(course.id);
    const courseVersion = publication.version && /^\d+\.\d+\.\d+$/.test(publication.version)
      ? publication.version
      : BASELINE_COURSE_VERSION;
    const courseReleaseStatus = publication.releaseStatus ?? "published";
    const amountCents = academyCourseAmountCents(course.price);
    if (amountCents === null) throw new Error("Invalid Academy course price");
    const entitlementRevision = existingState?.record_version ?? 0;
    const reservation = await reserveAcademyCheckoutAttempt({
      attemptId: checkoutAttempt.id,
      purchaserReference,
      courseId: course.id,
      entitlementRevision,
      issuedAt: checkoutAttempt.issuedAt,
      expiresAt: checkoutAttempt.expiresAt,
    });
    const canonicalAttempt = {
      id: reservation.attemptId,
      issuedAt: reservation.issuedAt,
      expiresAt: reservation.expiresAt,
    };

    if (reservation.stripeSessionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(reservation.stripeSessionId);
      if (
        existingSession.mode !== "payment" ||
        existingSession.client_reference_id !== purchaserReference ||
        existingSession.metadata?.courseId !== course.id ||
        existingSession.metadata?.checkoutAttemptId !== canonicalAttempt.id ||
        !existingSession.url
      ) throw new Error("Reserved Academy Checkout Session identity mismatch");
      const response = NextResponse.redirect(existingSession.url, { status: 303 });
      response.headers.set("x-obserra-commerce-mode", identityMode);
      response.headers.set("x-obserra-payment-contract", ACADEMY_PAYMENT_CONTRACT);
      response.headers.set("x-obserra-checkout-replay", "durable-session");
      response.headers.set("cache-control", NO_STORE);
      return response;
    }
    const successUrl = new URL("/academy/success", requestUrl);
    successUrl.searchParams.set("course", course.id);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

    const cancelUrl = new URL(`/academy/${course.id}`, requestUrl);
    cancelUrl.searchParams.set("checkout", "cancelled");

    const metadata = {
      courseId: course.id,
      courseTitle: course.title,
      courseVersion,
      courseReleaseStatus,
      academyPrincipalId: principalId ?? "",
      purchaserReference,
      identityMode,
      enrollmentMode: principalId ? "authenticated-paid-access" : "paid-pending-account-claim",
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
      paymentContractVersion: ACADEMY_PAYMENT_CONTRACT,
      expectedAmountCents: String(amountCents),
      expectedCurrency: ACADEMY_PAYMENT_CURRENCY,
      checkoutAttemptId: canonicalAttempt.id,
      checkoutAttemptIssuedAt: String(canonicalAttempt.issuedAt),
    };

    const useGovernedStripePrice = Boolean(
      studioCourse?.commerce.stripePriceId &&
      course.price === baseCourse.price &&
      course.title === baseCourse.title,
    );
    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;
    let governedPrice: Stripe.Price | null = null;
    if (useGovernedStripePrice && studioCourse?.commerce.stripePriceId) {
      governedPrice = await stripe.prices.retrieve(
        studioCourse.commerce.stripePriceId,
        { expand: ["product"] },
      );
      lineItem = { price: governedPrice.id, quantity: 1 };
    } else {
      lineItem = {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: course.title,
            description: course.description,
            metadata: {
              obserraCourseId: course.id,
              courseVersion,
              courseReleaseStatus,
              department: course.department,
              level: course.level,
              entitlementCode: license.entitlementCode,
              credentialType: metadata.credentialType,
              courseControlRevision: metadata.courseControlRevision,
            },
          },
        },
      };
    }

    const checkoutParameters: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
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
      expires_at: canonicalAttempt.expiresAt,
    };
    const requestFingerprint = academyCheckoutRequestFingerprint(checkoutParameters);
    await bindAcademyCheckoutAttempt(canonicalAttempt.id, requestFingerprint);
    const createCheckoutSession = () => stripe.checkout.sessions.create(checkoutParameters, {
      idempotencyKey: academyCheckoutIdempotencyKey({
        courseId: course.id,
        purchaserReference,
        checkoutAttemptId: canonicalAttempt.id,
        entitlementRevision,
      }),
    });
    const session = governedPrice
      ? await createAcademyCheckoutAfterGovernedPriceValidation(
          governedPrice,
          { courseId: course.id, courseVersion, amountCents },
          createCheckoutSession,
        )
      : await createCheckoutSession();

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    await recordAcademyCheckoutSession(canonicalAttempt.id, session.id);

    const response = NextResponse.redirect(session.url, { status: 303 });
    response.headers.set("x-obserra-commerce-mode", identityMode);
    response.headers.set("x-obserra-claim-policy", CLAIM_POLICY);
    response.headers.set("x-obserra-catalog-parity", studioCourse ? "governed-studio" : "baseline-fallback");
    response.headers.set("x-obserra-course-version", courseVersion);
    response.headers.set("x-obserra-course-release-status", courseReleaseStatus);
    response.headers.set("x-obserra-course-lifecycle", runtimeCourse.control.lifecycle);
    response.headers.set("x-obserra-course-control-revision", String(runtimeCourse.control.revision));
    response.headers.set("x-obserra-existing-entitlements", "preserved");
    response.headers.set("x-obserra-webhook-verification", "required");
    response.headers.set("x-obserra-payment-contract", ACADEMY_PAYMENT_CONTRACT);
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
