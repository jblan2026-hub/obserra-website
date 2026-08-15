import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const webhook = fs.readFileSync("app/api/webhook/stripe/route.ts", "utf8");
const paymentPath = "lib/academy-payment.ts";
const paymentSource = fs.readFileSync(paymentPath, "utf8");
const paymentModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(paymentSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: paymentPath,
}).outputText, {
  module: paymentModule,
  exports: paymentModule.exports,
  process: { env: {} },
  require(specifier) {
    if (specifier === "server-only") return {};
    if (specifier === "node:crypto") return crypto;
    throw new Error(`Unexpected payment test import: ${specifier}`);
  },
});

const { validateAcademyPaidSession } = paymentModule.exports;

function validSession() {
  return {
    livemode: true,
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    currency: "usd",
    amount_total: 9900,
    amount_subtotal: 9900,
    client_reference_id: "user_123",
    payment_intent: "pi_paid_123",
    metadata: {
      paymentContractVersion: "academy-payment-v2",
      courseId: "foundation",
      courseVersion: "1.0.0",
      expectedCurrency: "usd",
      expectedAmountCents: "9900",
      checkoutAttemptId: "550e8400-e29b-41d4-a716-446655440000",
      identityMode: "authenticated",
      clerkUserId: "user_123",
      purchaserReference: "user_123",
    },
  };
}

test("Academy signed webhooks fail closed on Stripe environment mismatch", () => {
  assert.match(webhook, /academyCommerceLivemode\(\)/);
  assert.match(webhook, /if \(expectedLivemode === null\)/);
  assert.match(webhook, /if \(event\.livemode !== expectedLivemode\) return modeMismatchResponse\(event\)/);
});

test("Academy checkout fulfillment rejects event and session mode disagreement", () => {
  assert.equal(
    webhook.match(/if \(session\.livemode !== event\.livemode\) return modeMismatchResponse\(event, session\);/g)?.length,
    2,
  );
  assert.match(webhook, /status: 409/);
  assert.ok(
    webhook.indexOf("session.livemode !== event.livemode") < webhook.indexOf("fulfillPaidSession(session, event.id, event.type, expectedLivemode)"),
    "mode validation must occur before durable fulfillment",
  );
});

test("Academy paid-session contract accepts only the exact amount, currency, purchaser and payment intent", () => {
  const expected = { courseId: "foundation", amountCents: 9900, livemode: true };
  assert.equal(validateAcademyPaidSession(validSession(), expected).valid, true);

  for (const mutate of [
    (session) => { session.amount_total = 1; },
    (session) => { session.currency = "eur"; },
    (session) => { session.metadata.paymentContractVersion = "legacy"; },
    (session) => { session.metadata.checkoutAttemptId = "invalid"; },
    (session) => { session.client_reference_id = "user_other"; },
    (session) => { session.payment_intent = null; },
  ]) {
    const session = validSession();
    mutate(session);
    assert.equal(validateAcademyPaidSession(session, expected).valid, false);
  }
});

test("Academy webhook uses the full paid-session contract before durable fulfillment", () => {
  assert.match(webhook, /retrieveVerifiedAcademyPaidSession\(/);
  assert.ok(
    webhook.indexOf("retrieveVerifiedAcademyPaidSession(") < webhook.indexOf("recordPaidCheckout({"),
    "canonical full payment verification must precede durable fulfillment",
  );
});
