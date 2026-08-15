import "server-only";

import type Stripe from "stripe";
import {
  ACADEMY_PAYMENT_CURRENCY,
  validateAcademyPaidSession,
  validateAcademyProductLineItem,
} from "./academy-payment";

const MATERIAL_METADATA_KEYS = [
  "paymentContractVersion",
  "courseId",
  "courseVersion",
  "expectedCurrency",
  "expectedAmountCents",
  "checkoutAttemptId",
  "identityMode",
  "clerkUserId",
  "purchaserReference",
] as const;

export class AcademyStripeVerificationError extends Error {
  constructor(readonly reason: string) {
    super(`Academy Stripe verification failed: ${reason}`);
    this.name = "AcademyStripeVerificationError";
  }
}

export function stripeObjectId(value: { id: string } | string | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

function fail(reason: string): never {
  throw new AcademyStripeVerificationError(reason);
}

export async function retrieveVerifiedAcademyPaidSession(
  stripe: Stripe,
  sessionId: string,
  expected: { courseId: string; amountCents: number; livemode: boolean },
) {
  if (!/^cs_(?:live|test)_[A-Za-z0-9_]+$/.test(sessionId)) fail("checkout-session-invalid");
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "payment_intent"],
  });
  const validation = validateAcademyPaidSession(session, expected);
  if (!validation.valid) fail(validation.reason);

  const productValidation = validateAcademyProductLineItem(
    session.line_items?.data ?? [],
    {
      courseId: expected.courseId,
      courseVersion: validation.courseVersion,
      amountCents: expected.amountCents,
    },
  );
  if (!productValidation.valid) fail(productValidation.reason);

  const paymentIntent = typeof session.payment_intent === "object" && session.payment_intent
    ? session.payment_intent
    : await stripe.paymentIntents.retrieve(validation.paymentIntentId);
  const sessionCustomerId = stripeObjectId(session.customer);
  const paymentCustomerId = stripeObjectId(paymentIntent.customer);
  if (!sessionCustomerId || !/^cus_[A-Za-z0-9_]+$/.test(sessionCustomerId)) fail("session-customer-invalid");
  if (paymentIntent.id !== validation.paymentIntentId) fail("payment-intent-link-mismatch");
  if (paymentIntent.livemode !== expected.livemode) fail("payment-intent-mode-mismatch");
  if (paymentIntent.status !== "succeeded") fail("payment-intent-not-succeeded");
  if (paymentIntent.currency !== ACADEMY_PAYMENT_CURRENCY) fail("payment-intent-currency-mismatch");
  if (paymentIntent.amount_received !== expected.amountCents) fail("payment-intent-amount-mismatch");
  if (paymentCustomerId !== sessionCustomerId) fail("payment-customer-mismatch");
  for (const key of MATERIAL_METADATA_KEYS) {
    if ((paymentIntent.metadata?.[key] ?? "") !== (session.metadata?.[key] ?? "")) {
      fail(`payment-intent-metadata-${key}-mismatch`);
    }
  }

  return { session, paymentIntent, validation, customerId: sessionCustomerId };
}

export async function retrieveVerifiedAcademyPaidSessionForPaymentIntent(
  stripe: Stripe,
  paymentIntentId: string,
  expectedLivemode: boolean,
) {
  if (!/^pi_[A-Za-z0-9_]+$/.test(paymentIntentId)) fail("payment-intent-invalid");
  const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 2 });
  if (sessions.has_more || sessions.data.length !== 1) fail("checkout-session-mapping-ambiguous");
  const session = sessions.data[0];
  const courseId = session.metadata?.courseId ?? "";
  const amountCents = Number(session.metadata?.expectedAmountCents ?? "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(courseId)) fail("course-invalid");
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) fail("expected-amount-invalid");
  const verified = await retrieveVerifiedAcademyPaidSession(
    stripe,
    session.id,
    { courseId, amountCents, livemode: expectedLivemode },
  );
  if (verified.paymentIntent.id !== paymentIntentId) fail("payment-intent-session-mismatch");
  return verified;
}
