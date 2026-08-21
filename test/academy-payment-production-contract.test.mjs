import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const contract = read("lib/academy-payment.ts");
const checkout = read("app/api/academy/checkout/route.ts");
const webhook = read("app/api/webhook/stripe/route.ts");
const verification = read("lib/academy-stripe-verification.ts");
const identityWebhook = read("app/api/webhook/stripe-identity/route.ts");
const redeem = read("app/api/academy/redeem/route.ts");
const success = read("app/academy/success/page.tsx");
const checkoutForm = read("app/academy/AcademyCheckoutForm.tsx");
const checkoutIdentity = read("app/api/academy/checkout-identity/route.ts");
const academy = read("lib/academy.ts");
const academyStripe = read("lib/academy-stripe.ts");
const reservationMigration = read("supabase/migrations/20260815200000_academy_checkout_attempt_reservations.sql");
const ci = read(".github/workflows/website-ci.yml");

test("Academy commerce cannot use live Stripe outside production or test Stripe in production", () => {
  assert.match(contract, /process\.env\.VERCEL_ENV === "production"/);
  assert.match(contract, /return keyMode === true \? true : null/);
  assert.match(contract, /return keyMode === false \? false : null/);
  assert.match(checkout, /academyCommerceLivemode\(\)/);
  assert.match(webhook, /academyCommerceLivemode\(\)/);
  for (const source of [contract, checkout, redeem, webhook, academyStripe]) {
    assert.doesNotMatch(source, /process\.env\.STRIPE_SECRET_KEY|from "\.\.\/\.\.\/\.\.\/\.\.\/lib\/stripe"/);
  }
  assert.match(academyStripe, /ACADEMY_STRIPE_SECRET_KEY/);
  assert.match(academyStripe, /rk_live_/);
  assert.match(academyStripe, /rk_test_/);
  assert.match(webhook, /academyStripeWebhookSecret/);
  assert.match(contract, /ACADEMY_STRIPE_WEBHOOK_SECRET/);
  assert.doesNotMatch(webhook, /process\.env\.STRIPE_WEBHOOK_SECRET/);
});

test("Academy webhook readiness and verification share one normalized secret", () => {
  assert.match(contract, /function normalizeAcademyStripeWebhookSecret/);
  assert.match(contract, /academyCommerceWebhookConfigured\(\)[\s\S]*academyStripeWebhookSecret\(\) !== null/);
  assert.match(webhook, /const webhookSecret = academyStripeWebhookSecret\(\)/);
  assert.match(webhook, /constructEvent\(body, signature, webhookSecret\)/);
  assert.match(checkout, /academyCommerceWebhookConfigured\(\)/);
});

test("checkout binds the published amount, currency, course, purchaser, and attempt", () => {
  for (const marker of [
    "paymentContractVersion",
    "expectedAmountCents",
    "expectedCurrency",
    "checkoutAttemptId",
    "purchaserReference",
  ]) assert.match(checkout, new RegExp(marker));
  assert.match(checkout, /payment_method_types: \["card"\]/);
  assert.match(checkout, /expires_at:/);
  assert.match(checkout, /academyCheckoutIdempotencyKey/);
  assert.match(checkout, /academyCheckoutRequestFingerprint/);
  assert.match(checkout, /reserveAcademyCheckoutAttempt/);
  assert.match(checkout, /const canonicalAttempt =/);
  assert.match(checkout, /reservation\.stripeSessionId/);
  assert.match(checkout, /recordAcademyCheckoutSession/);
  assert.doesNotMatch(checkout, /expires_at: Math\.floor\(Date\.now/);
  assert.match(checkout, /stripe\.prices\.retrieve/);
  assert.match(checkout, /expand: \["product"\]/);
  assert.match(checkout, /createAcademyCheckoutAfterGovernedPriceValidation/);
  assert.match(checkout, /createAcademyCheckoutAfterGovernedPriceValidation\([\s\S]*?createCheckoutSession/);
});

test("signed fulfillment validates every material payment field before persistence", () => {
  for (const marker of [
    "provider-mode-mismatch",
    "invalid-checkout-mode",
    "payment-pending",
    "currency-mismatch",
    "amount-mismatch",
    "payment-contract-mismatch",
    "course-mismatch",
    "expected-currency-mismatch",
    "expected-amount-mismatch",
    "course-version-invalid",
    "checkout-attempt-invalid",
    "purchaser-reference-mismatch",
    "payment-intent-invalid",
  ]) assert.match(contract, new RegExp(marker));
  const fulfillmentBody = webhook.match(/async function fulfillPaidSession[\s\S]*?function reversalMismatch/)?.[0] ?? "";
  assert.ok(fulfillmentBody.indexOf("await retrieveVerifiedAcademyPaidSession") < fulfillmentBody.indexOf("await recordPaidCheckout"));
  assert.match(webhook, /webhooks\.constructEvent/);
  assert.match(webhook, /throw new AcademyStripeVerificationError\("paid-session-course-unavailable"\)/);
  assert.doesNotMatch(webhook, /state: "rejected", reason: "unknown-course"/);
});

test("entitlement recovery is authenticated same-origin POST and never creates a charge", () => {
  assert.match(redeem, /export async function POST\(request: Request\)/);
  assert.match(redeem, /if \(!isSameOrigin\(request, requestUrl\)\)/);
  assert.match(redeem, /safeAcademyIdentity\(\)/);
  assert.match(redeem, /retrieveVerifiedAcademyPaidSession/);
  assert.doesNotMatch(redeem, /academyCourseAmountCents|amountCents: academyCourseAmountCents/);
  assert.doesNotMatch(webhook, /academyCourseAmountCents|course-price-invalid/);
  assert.match(verification, /immutableExpectedAmountCents/);
  assert.match(verification, /const verificationContract = \{ \.\.\.expected, amountCents \}/);
  assert.match(redeem, /claimCourseAccess/);
  assert.match(redeem, /courseVersion: validation\.courseVersion/);
  assert.match(academy, /courseVersion: input\.courseVersion/);
  assert.doesNotMatch(redeem, /checkout\.sessions\.create/);
  assert.match(success, /action="\/api\/academy\/redeem" method="post"/);
});

test("checkout uses browser and durable server coordination before provider creation", () => {
  assert.match(checkoutForm, /localStorage/);
  assert.match(checkoutForm, /navigator\.locks\.request/);
  assert.match(checkoutForm, /mode: "exclusive"/);
  assert.match(checkoutForm, /\/api\/academy\/checkout-identity/);
  assert.match(checkoutForm, /method: "POST"/);
  assert.match(checkoutForm, /disabled=\{submitting \|\| !attempt \|\| !browserIdentityReady\}/);
  assert.match(checkoutIdentity, /httpOnly: true/);
  assert.match(checkoutIdentity, /sameSite: "strict"/);
  assert.match(checkoutIdentity, /new URL\(origin\)\.origin === requestUrl\.origin/);
  assert.match(checkout, /existingState\?\.access_status === "active"/);
  assert.ok(checkout.indexOf("existingState?.access_status") < checkout.indexOf("getAcademyStripe()"));
  assert.match(reservationMigration, /pg_advisory_xact_lock/);
  assert.match(reservationMigration, /purchaser_reference = p_purchaser_reference/);
  assert.match(reservationMigration, /request_fingerprint/);
  assert.match(reservationMigration, /stripe_session_id/);
  assert.match(checkoutForm, /Opening secure checkout/);
  assert.match(checkoutForm, /Do not refresh or submit again/);
  assert.match(success, /never creates another charge/);
});

test("Stripe webhook bodies are bounded and routine CI has no payment secrets", () => {
  assert.match(webhook, /readStripeWebhookBody/);
  assert.match(identityWebhook, /readStripeWebhookBody/);
  assert.doesNotMatch(ci, /secrets\.STRIPE_SECRET_KEY/);
  assert.doesNotMatch(ci, /secrets\.STRIPE_WEBHOOK_SECRET/);
});
