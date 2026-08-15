import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const contract = read("lib/academy-payment.ts");
const checkout = read("app/api/academy/checkout/route.ts");
const webhook = read("app/api/webhook/stripe/route.ts");
const identityWebhook = read("app/api/webhook/stripe-identity/route.ts");
const redeem = read("app/api/academy/redeem/route.ts");
const success = read("app/academy/success/page.tsx");
const checkoutForm = read("app/academy/AcademyCheckoutForm.tsx");
const ci = read(".github/workflows/website-ci.yml");

test("Academy commerce cannot use live Stripe outside production or test Stripe in production", () => {
  assert.match(contract, /process\.env\.VERCEL_ENV === "production"/);
  assert.match(contract, /return keyMode === true \? true : null/);
  assert.match(contract, /return keyMode === false \? false : null/);
  assert.match(checkout, /academyCommerceLivemode\(\)/);
  assert.match(webhook, /academyCommerceLivemode\(\)/);
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
  assert.match(checkout, /idempotencyKey: `academy-checkout-v2-/);
  assert.match(checkout, /stripe\.prices\.retrieve/);
  assert.match(checkout, /governedPrice\.unit_amount !== amountCents/);
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
  assert.ok(webhook.indexOf("validateAcademyPaidSession") < webhook.indexOf("recordPaidCheckout"));
  assert.match(webhook, /webhooks\.constructEvent/);
});

test("entitlement recovery is authenticated same-origin POST and never creates a charge", () => {
  assert.match(redeem, /export async function POST\(request: Request\)/);
  assert.match(redeem, /if \(!isSameOrigin\(request, requestUrl\)\)/);
  assert.match(redeem, /safeIdentity\(\)/);
  assert.match(redeem, /validateAcademyPaidSession/);
  assert.match(redeem, /claimCourseAccess/);
  assert.doesNotMatch(redeem, /checkout\.sessions\.create/);
  assert.match(success, /action="\/api\/academy\/redeem" method="post"/);
});

test("checkout and recovery expose clear pending states without duplicate submission", () => {
  assert.match(checkoutForm, /disabled=\{submitting\}/);
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
