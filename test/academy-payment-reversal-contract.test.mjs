import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const read = (path) => fs.readFileSync(path, "utf8");
const paymentPath = "lib/academy-payment.ts";
const paymentSource = read(paymentPath);
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
    throw new Error(`Unexpected payment reversal test import: ${specifier}`);
  },
});

const {
  academyPaymentReversalPolicy,
  validateAcademyProductLineItem,
} = paymentModule.exports;

test("refund and dispute policy never restores access automatically", () => {
  assert.equal(
    JSON.stringify(academyPaymentReversalPolicy("charge.refunded", { amountCaptured: 9900, amountReversed: 9900, fullyRefunded: true })),
    JSON.stringify({ targetAccessStatus: "refunded", disposition: "full-refund" }),
  );
  assert.equal(
    JSON.stringify(academyPaymentReversalPolicy("charge.refunded", { amountCaptured: 9900, amountReversed: 1000, fullyRefunded: false })),
    JSON.stringify({ targetAccessStatus: "revoked", disposition: "partial-refund-review" }),
  );
  for (const eventType of ["charge.dispute.created", "charge.dispute.closed"]) {
    assert.equal(
      JSON.stringify(academyPaymentReversalPolicy(eventType, { amountCaptured: 9900, amountReversed: 9900, fullyRefunded: false })),
      JSON.stringify({ targetAccessStatus: "revoked", disposition: eventType === "charge.dispute.created" ? "dispute-open" : "dispute-closed-review" }),
    );
  }
});

test("product validation binds one item to course, version, amount and currency", () => {
  const valid = {
    quantity: 1,
    amount_subtotal: 9900,
    amount_total: 9900,
    currency: "usd",
    price: {
      active: true,
      type: "one_time",
      unit_amount: 9900,
      currency: "usd",
      product: {
        deleted: false,
        metadata: { obserraCourseId: "foundation", courseVersion: "1.0.0" },
      },
    },
  };
  const expected = { courseId: "foundation", courseVersion: "1.0.0", amountCents: 9900 };
  assert.equal(validateAcademyProductLineItem([valid], expected).valid, true);
  const archivedPrice = structuredClone(valid);
  archivedPrice.price.active = false;
  assert.equal(validateAcademyProductLineItem([archivedPrice], expected).valid, true);
  for (const mutate of [
    (item) => { item.quantity = 2; },
    (item) => { item.amount_total = 1; },
    (item) => { item.currency = "eur"; },
    (item) => { item.price.product.metadata.obserraCourseId = "other"; },
    (item) => { item.price.product.metadata.courseVersion = "2.0.0"; },
  ]) {
    const item = structuredClone(valid);
    mutate(item);
    assert.equal(validateAcademyProductLineItem([item], expected).valid, false);
  }
});

test("signed webhook handles exact reversal events through a durable service-only RPC", () => {
  const webhook = read("app/api/webhook/stripe/route.ts");
  const persistence = read("lib/academy-persistence.ts");
  const migration = read("supabase/migrations/20260815180000_academy_payment_reversal_governance.sql");

  for (const eventType of ["charge.refunded", "charge.dispute.created", "charge.dispute.closed"]) {
    assert.match(webhook, new RegExp(eventType.replaceAll(".", "\\.")));
    assert.match(migration, new RegExp(eventType.replaceAll(".", "\\.")));
  }
  assert.match(webhook, /webhooks\.constructEvent/);
  assert.match(webhook, /retrieveVerifiedAcademyPaidSessionForPaymentIntent/);
  assert.match(webhook, /recordAcademyPaymentReversal/);
  assert.match(persistence, /"academy_record_payment_reversal"/);
  assert.match(migration, /force row level security/);
  assert.match(migration, /from public, anon, authenticated/);
  assert.match(migration, /idempotentReplay/);
  assert.match(migration, /Ambiguous paid checkout mapping/);
  assert.match(migration, /payment_reference = p_checkout_session_id/);
  assert.match(migration, /set access_status = 'refunded'/);
  assert.match(migration, /set access_status = 'revoked'/);
  assert.doesNotMatch(webhook, /checkout\.sessions\.create|refunds\.create|disputes\.update/);
});
