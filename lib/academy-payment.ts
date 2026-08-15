import "server-only";

import type Stripe from "stripe";

export const ACADEMY_PAYMENT_CONTRACT = "academy-payment-v2";
export const ACADEMY_PAYMENT_CURRENCY = "usd";

const SEMVER = /^\d+\.\d+\.\d+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function academyCommerceLivemode() {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const keyMode = key.startsWith("sk_live_") ? true : key.startsWith("sk_test_") ? false : null;
  if (process.env.VERCEL_ENV === "production") return keyMode === true ? true : null;
  return keyMode === false ? false : null;
}

export function academyCommerceWebhookConfigured() {
  return /^whsec_[A-Za-z0-9_]+$/.test(process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "");
}

export function academyCourseAmountCents(price: number) {
  const amount = Math.round(price * 100);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
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
  const learnerId = metadata.clerkUserId || undefined;
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
