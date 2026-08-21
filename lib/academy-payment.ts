import "server-only";

import { createHash } from "node:crypto";
import type Stripe from "stripe";

export const ACADEMY_PAYMENT_CONTRACT = "academy-payment-v3";
export const ACADEMY_PAYMENT_CURRENCY = "usd";

const SEMVER = /^\d+\.\d+\.\d+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHECKOUT_ATTEMPT_MAX_AGE_SECONDS = 22 * 60 * 60;
export const ACADEMY_CHECKOUT_SESSION_LIFETIME_SECONDS = 23 * 60 * 60;

export function academyCommerceLivemode() {
  const key = process.env.ACADEMY_STRIPE_SECRET_KEY?.trim() ?? "";
  const keyMode = key.startsWith("rk_live_") ? true : key.startsWith("rk_test_") ? false : null;
  if (process.env.VERCEL_ENV === "production") return keyMode === true ? true : null;
  return keyMode === false ? false : null;
}

export function normalizeAcademyStripeWebhookSecret(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return /^whsec_[A-Za-z0-9_]+$/.test(normalized) ? normalized : null;
}

export function academyStripeWebhookSecret() {
  return normalizeAcademyStripeWebhookSecret(process.env.ACADEMY_STRIPE_WEBHOOK_SECRET);
}

export function academyCommerceWebhookConfigured() {
  return academyStripeWebhookSecret() !== null;
}

export function academyCheckoutAttempt(
  attemptId: unknown,
  issuedAtValue: unknown,
  nowSeconds = Math.floor(Date.now() / 1000),
) {
  if (typeof attemptId !== "string" || !UUID.test(attemptId)) return null;
  if (typeof issuedAtValue !== "string" || !/^\d{10}$/.test(issuedAtValue)) return null;
  const issuedAt = Number(issuedAtValue);
  if (
    !Number.isSafeInteger(issuedAt) ||
    issuedAt > nowSeconds + 90 ||
    nowSeconds - issuedAt > CHECKOUT_ATTEMPT_MAX_AGE_SECONDS
  ) return null;
  return {
    id: attemptId.toLowerCase(),
    issuedAt,
    expiresAt: issuedAt + ACADEMY_CHECKOUT_SESSION_LIFETIME_SECONDS,
  };
}

export function academyCheckoutIdempotencyKey(input: {
  courseId: string;
  purchaserReference: string;
  checkoutAttemptId: string;
  entitlementRevision: number;
}) {
  const digest = createHash("sha256")
    .update([
      ACADEMY_PAYMENT_CONTRACT,
      input.courseId,
      input.purchaserReference,
      input.checkoutAttemptId,
      String(input.entitlementRevision),
    ].join("\n"))
    .digest("hex");
  return `academy-checkout-v3-${digest}`;
}

export function academyCheckoutRequestFingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function academyCommerceStorageReady(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const health = value as Record<string, unknown>;
  return health.schemaVersion === "academy-durable-state-v2" &&
    health.operational === true &&
    [
      health.learnerStateRows,
      health.paymentEventRows,
      health.assessmentRecordRows,
      health.auditEventRows,
      health.paymentReversalRows,
      health.checkoutAttemptRows,
    ].every((count) => Number.isSafeInteger(Number(count)) && Number(count) >= 0) &&
    health.reversalGuard === "enabled" &&
    health.checkoutSerialization === "purchaser-course-entitlement-revision-v1";
}

export function academyCourseAmountCents(price: number) {
  const amount = Math.round(price * 100);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

export type AcademyPaymentReversalEventType =
  | "charge.refunded"
  | "charge.dispute.created"
  | "charge.dispute.closed";

export function academyPaymentReversalPolicy(
  eventType: AcademyPaymentReversalEventType,
  input: { amountCaptured: number; amountReversed: number; fullyRefunded: boolean },
) {
  if (
    !Number.isSafeInteger(input.amountCaptured) ||
    !Number.isSafeInteger(input.amountReversed) ||
    input.amountCaptured <= 0 ||
    input.amountReversed <= 0 ||
    input.amountReversed > input.amountCaptured
  ) return null;

  if (eventType === "charge.refunded") {
    if (input.fullyRefunded !== (input.amountReversed === input.amountCaptured)) return null;
    return input.fullyRefunded
      ? { targetAccessStatus: "refunded" as const, disposition: "full-refund" as const }
      : { targetAccessStatus: "revoked" as const, disposition: "partial-refund-review" as const };
  }
  return eventType === "charge.dispute.created"
    ? { targetAccessStatus: "revoked" as const, disposition: "dispute-open" as const }
    : { targetAccessStatus: "revoked" as const, disposition: "dispute-closed-review" as const };
}

type AcademyProductLineItem = {
  quantity?: number | null;
  amount_subtotal?: number | null;
  amount_total?: number | null;
  currency?: string | null;
  price?: {
    active?: boolean;
    type?: string;
    unit_amount?: number | null;
    currency?: string;
    metadata?: Record<string, string> | null;
    product?: string | {
      deleted?: unknown;
      metadata?: Record<string, string> | null;
    } | null;
  } | null;
};

type AcademyGovernedPrice = {
  active?: boolean;
  type?: string;
  unit_amount?: number | null;
  currency?: string | null;
  product?: string | {
    active?: boolean;
    deleted?: unknown;
    metadata?: Record<string, string> | null;
  } | null;
};

export function validateAcademyGovernedPrice(
  price: AcademyGovernedPrice,
  expected: { courseId: string; courseVersion: string; amountCents: number },
) {
  if (
    !price.active ||
    price.type !== "one_time" ||
    price.currency !== ACADEMY_PAYMENT_CURRENCY ||
    price.unit_amount !== expected.amountCents
  ) return { valid: false as const, reason: "governed-price-contract-mismatch" };
  const product = price.product;
  if (!product || typeof product === "string" || product.deleted === true || product.active !== true) {
    return { valid: false as const, reason: "governed-product-unverified" };
  }
  if (product.metadata?.obserraCourseId !== expected.courseId) {
    return { valid: false as const, reason: "governed-product-course-mismatch" };
  }
  if (product.metadata?.courseVersion && product.metadata.courseVersion !== expected.courseVersion) {
    return { valid: false as const, reason: "governed-product-course-version-mismatch" };
  }
  return { valid: true as const };
}

export async function createAcademyCheckoutAfterGovernedPriceValidation<T>(
  price: AcademyGovernedPrice,
  expected: { courseId: string; courseVersion: string; amountCents: number },
  createCheckout: () => Promise<T>,
) {
  const validation = validateAcademyGovernedPrice(price, expected);
  if (!validation.valid) {
    throw new Error(`Governed Stripe price is unavailable: ${validation.reason}`);
  }
  return createCheckout();
}

export function validateAcademyProductLineItem(
  lineItems: AcademyProductLineItem[],
  expected: { courseId: string; courseVersion: string; amountCents: number },
) {
  if (lineItems.length !== 1) return { valid: false as const, reason: "line-item-count-mismatch" };
  const lineItem = lineItems[0];
  const price = lineItem.price;
  const product = price?.product;
  if (lineItem.quantity !== 1) return { valid: false as const, reason: "line-item-quantity-mismatch" };
  if (lineItem.currency !== ACADEMY_PAYMENT_CURRENCY || price?.currency !== ACADEMY_PAYMENT_CURRENCY) {
    return { valid: false as const, reason: "line-item-currency-mismatch" };
  }
  if (
    lineItem.amount_subtotal !== expected.amountCents ||
    lineItem.amount_total !== expected.amountCents ||
    price?.unit_amount !== expected.amountCents
  ) return { valid: false as const, reason: "line-item-amount-mismatch" };
  if (price.type !== "one_time") {
    return { valid: false as const, reason: "line-item-price-invalid" };
  }
  if (!product || typeof product === "string") {
    return { valid: false as const, reason: "line-item-product-unverified" };
  }
  const productMetadata = product.deleted === true ? price.metadata : product.metadata;
  if (productMetadata?.obserraCourseId !== expected.courseId) {
    return { valid: false as const, reason: "line-item-course-mismatch" };
  }
  if (productMetadata?.courseVersion && productMetadata.courseVersion !== expected.courseVersion) {
    return { valid: false as const, reason: "line-item-course-version-mismatch" };
  }
  return { valid: true as const };
}

export type AcademyPaidSessionValidation =
  | {
      valid: true;
      courseVersion: string;
      identityMode: "authenticated" | "guest-email";
      learnerId?: string;
      paymentIntentId: string;
    }
  | { valid: false; reason: string };

export function validateAcademyPaidSession(
  session: Stripe.Checkout.Session,
  expected: { courseId: string; amountCents: number; livemode: boolean },
): AcademyPaidSessionValidation {
  const metadata = session.metadata ?? {};
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  const identityMode = metadata.identityMode;
  const learnerId = metadata.academyPrincipalId || undefined;
  const purchaserReference = metadata.purchaserReference ?? "";
  if (identityMode !== "authenticated" && identityMode !== "guest-email") {
    return { valid: false, reason: "identity-mode-invalid" };
  }
  const expectedIdentity = identityMode === "authenticated"
    ? Boolean(learnerId && learnerId === purchaserReference && session.client_reference_id === purchaserReference)
    : !learnerId && /^guest_[0-9a-f-]{36}$/i.test(purchaserReference) && session.client_reference_id === purchaserReference;

  if (session.livemode !== expected.livemode) return { valid: false, reason: "provider-mode-mismatch" };
  if (session.mode !== "payment") return { valid: false, reason: "invalid-checkout-mode" };
  if (session.status !== "complete") return { valid: false, reason: session.status === "expired" ? "payment-expired" : "payment-pending" };
  if (session.payment_status !== "paid") return { valid: false, reason: "payment-pending" };
  if (session.currency !== ACADEMY_PAYMENT_CURRENCY) return { valid: false, reason: "currency-mismatch" };
  if (session.amount_total !== expected.amountCents || session.amount_subtotal !== expected.amountCents) {
    return { valid: false, reason: "amount-mismatch" };
  }
  if (metadata.paymentContractVersion !== ACADEMY_PAYMENT_CONTRACT) return { valid: false, reason: "payment-contract-mismatch" };
  if (metadata.courseId !== expected.courseId) return { valid: false, reason: "course-mismatch" };
  if (metadata.expectedCurrency !== ACADEMY_PAYMENT_CURRENCY) return { valid: false, reason: "expected-currency-mismatch" };
  if (metadata.expectedAmountCents !== String(expected.amountCents)) return { valid: false, reason: "expected-amount-mismatch" };
  if (!SEMVER.test(metadata.courseVersion ?? "")) return { valid: false, reason: "course-version-invalid" };
  if (!UUID.test(metadata.checkoutAttemptId ?? "")) return { valid: false, reason: "checkout-attempt-invalid" };
  if (!expectedIdentity) return { valid: false, reason: "purchaser-reference-mismatch" };
  if (!paymentIntentId || !/^pi_[A-Za-z0-9_]+$/.test(paymentIntentId)) return { valid: false, reason: "payment-intent-invalid" };

  return {
    valid: true,
    courseVersion: metadata.courseVersion,
    identityMode,
    learnerId,
    paymentIntentId,
  };
}
