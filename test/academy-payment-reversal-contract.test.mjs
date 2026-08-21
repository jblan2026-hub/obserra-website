import assert from "node:assert/strict";
import * as crypto from "node:crypto";
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
    if (specifier === "node:crypto") return crypto;
    if (specifier === "./runtime-environment") return { isProductionRuntime: () => false };
    throw new Error(`Unexpected payment reversal test import: ${specifier}`);
  },
});

const verificationPath = "lib/academy-stripe-verification.ts";
const verificationSource = read(verificationPath);
const verificationModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(verificationSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: verificationPath,
}).outputText, {
  module: verificationModule,
  exports: verificationModule.exports,
  require(specifier) {
    if (specifier === "server-only") return {};
    if (specifier === "./academy-payment") return paymentModule.exports;
    throw new Error(`Unexpected Stripe verification test import: ${specifier}`);
  },
});

const {
  academyCheckoutAttempt,
  academyCheckoutIdempotencyKey,
  academyCheckoutRequestFingerprint,
  academyCommerceStorageReady,
  academyPaymentReversalPolicy,
  normalizeAcademyStripeWebhookSecret,
  createAcademyCheckoutAfterGovernedPriceValidation,
  validateAcademyGovernedPrice,
  validateAcademyProductLineItem,
} = paymentModule.exports;
const { retrieveVerifiedAcademyPaidSession } = verificationModule.exports;

test("Academy webhook secret normalization is identical for readiness and verification", () => {
  const secret = "whsec_test_normalized_value";
  assert.equal(normalizeAcademyStripeWebhookSecret(`  ${secret}\n`), secret);
  assert.equal(normalizeAcademyStripeWebhookSecret("  invalid-secret  "), null);
  assert.equal(normalizeAcademyStripeWebhookSecret(undefined), null);
});

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

test("checkout retry identity and provider parameters are stable and entitlement-bound", () => {
  const id = "550e8400-e29b-41d4-a716-446655440000";
  const attempt = academyCheckoutAttempt(id, "1786800000", 1786800030);
  assert.deepEqual(
    JSON.parse(JSON.stringify(attempt)),
    { id, issuedAt: 1786800000, expiresAt: 1786882800 },
  );
  const material = {
    courseId: "foundation",
    purchaserReference: "user_123",
    checkoutAttemptId: attempt.id,
    entitlementRevision: 7,
  };
  const firstKey = academyCheckoutIdempotencyKey(material);
  assert.equal(firstKey, academyCheckoutIdempotencyKey(structuredClone(material)));
  assert.notEqual(firstKey, academyCheckoutIdempotencyKey({ ...material, entitlementRevision: 8 }));
  const parameters = { mode: "payment", expires_at: attempt.expiresAt, metadata: { checkoutAttemptId: attempt.id } };
  assert.equal(
    academyCheckoutRequestFingerprint(parameters),
    academyCheckoutRequestFingerprint(structuredClone(parameters)),
  );
  assert.equal(academyCheckoutAttempt(id, "not-an-epoch", 1786800030), null);
  assert.equal(academyCheckoutAttempt(id, "1786700000", 1786800030), null);
});

test("commerce readiness rejects partial Academy schemas and requires exact v2 dependencies", () => {
  const ready = {
    schemaVersion: "academy-durable-state-v2",
    operational: true,
    learnerStateRows: 0,
    paymentEventRows: 0,
    assessmentRecordRows: 0,
    auditEventRows: 0,
    paymentReversalRows: 0,
    checkoutAttemptRows: 0,
    reversalGuard: "enabled",
    checkoutSerialization: "purchaser-course-entitlement-revision-v1",
  };
  assert.equal(academyCommerceStorageReady(ready), true);
  assert.equal(academyCommerceStorageReady({ ...ready, schemaVersion: "academy-durable-state-v1" }), false);
  assert.equal(academyCommerceStorageReady({ ...ready, paymentReversalRows: undefined }), false);
  assert.equal(academyCommerceStorageReady({ ...ready, checkoutSerialization: "missing" }), false);
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
      metadata: { obserraCourseId: "foundation", courseVersion: "1.0.0" },
      product: {
        active: true,
        deleted: false,
        metadata: { obserraCourseId: "foundation", courseVersion: "1.0.0" },
      },
    },
  };
  const expected = { courseId: "foundation", courseVersion: "1.0.0", amountCents: 9900 };
  assert.equal(validateAcademyProductLineItem([valid], expected).valid, true);
  const archivedPrice = structuredClone(valid);
  archivedPrice.price.active = false;
  archivedPrice.price.product.active = false;
  assert.equal(validateAcademyProductLineItem([archivedPrice], expected).valid, true);
  const deletedHistoricalProduct = structuredClone(valid);
  deletedHistoricalProduct.price.product = { deleted: true };
  assert.equal(validateAcademyProductLineItem([deletedHistoricalProduct], expected).valid, true);
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

test("new checkout validates the expanded governed product before collecting payment", async () => {
  const expected = { courseId: "foundation", courseVersion: "1.0.0", amountCents: 9900 };
  const valid = {
    active: true,
    type: "one_time",
    unit_amount: 9900,
    currency: "usd",
    product: {
      active: true,
      deleted: false,
      metadata: { obserraCourseId: "foundation", courseVersion: "1.0.0" },
    },
  };
  assert.equal(validateAcademyGovernedPrice(valid, expected).valid, true);
  for (const mutate of [
    (price) => { price.active = false; },
    (price) => { price.type = "recurring"; },
    (price) => { price.unit_amount = 1; },
    (price) => { price.currency = "eur"; },
    (price) => { price.product = "prod_unexpanded"; },
    (price) => { price.product.active = false; },
    (price) => { price.product.deleted = true; },
    (price) => { price.product.metadata.obserraCourseId = "other"; },
    (price) => { price.product.metadata.courseVersion = "2.0.0"; },
  ]) {
    const price = structuredClone(valid);
    mutate(price);
    assert.equal(validateAcademyGovernedPrice(price, expected).valid, false);
    let checkoutCreationCount = 0;
    await assert.rejects(
      createAcademyCheckoutAfterGovernedPriceValidation(price, expected, async () => {
        checkoutCreationCount += 1;
        return { id: "cs_should_not_exist" };
      }),
      /Governed Stripe price is unavailable/,
    );
    assert.equal(checkoutCreationCount, 0);
  }
});

test("fulfillment and redemption preserve a paid historical price after catalog repricing", async () => {
  const paidAmountCents = 9900;
  const currentCatalogAmountCents = 14900;
  const purchaserReference = "guest_11111111-1111-4111-8111-111111111111";
  const metadata = {
    paymentContractVersion: "academy-payment-v3",
    courseId: "foundation",
    courseVersion: "1.0.0",
    expectedCurrency: "usd",
    expectedAmountCents: String(paidAmountCents),
    checkoutAttemptId: "22222222-2222-4222-8222-222222222222",
    identityMode: "guest-email",
    academyPrincipalId: "",
    purchaserReference,
  };
  const paymentIntent = {
    id: "pi_historical_payment",
    livemode: false,
    status: "succeeded",
    currency: "usd",
    amount_received: paidAmountCents,
    customer: "cus_historical_payment",
    metadata,
  };
  const session = {
    id: "cs_test_historical_payment",
    livemode: false,
    mode: "payment",
    status: "complete",
    payment_status: "paid",
    currency: "usd",
    amount_subtotal: paidAmountCents,
    amount_total: paidAmountCents,
    client_reference_id: purchaserReference,
    customer: "cus_historical_payment",
    payment_intent: paymentIntent,
    metadata,
    line_items: {
      data: [{
        quantity: 1,
        amount_subtotal: paidAmountCents,
        amount_total: paidAmountCents,
        currency: "usd",
        price: {
          active: false,
          type: "one_time",
          unit_amount: paidAmountCents,
          currency: "usd",
          metadata: { obserraCourseId: "foundation", courseVersion: "1.0.0" },
          product: {
            active: false,
            deleted: false,
            metadata: { obserraCourseId: "foundation", courseVersion: "1.0.0" },
          },
        },
      }],
    },
  };
  let retrievalCount = 0;
  const stripe = {
    checkout: {
      sessions: {
        retrieve: async (sessionId, options) => {
          retrievalCount += 1;
          assert.equal(sessionId, session.id);
          assert.equal(JSON.stringify(options.expand), JSON.stringify(["line_items.data.price.product", "payment_intent"]));
          return session;
        },
      },
    },
    paymentIntents: {
      retrieve: async () => { throw new Error("expanded payment intent must be used"); },
    },
  };

  assert.notEqual(paidAmountCents, currentCatalogAmountCents);
  for (const consumer of ["signed webhook fulfillment", "same-origin deferred redemption"]) {
    const verified = await retrieveVerifiedAcademyPaidSession(
      stripe,
      session.id,
      { courseId: "foundation", livemode: false },
    );
    assert.equal(verified.amountCents, paidAmountCents, consumer);
    assert.equal(verified.validation.courseVersion, "1.0.0", consumer);
  }
  assert.equal(retrievalCount, 2);
});

test("signed webhook handles exact reversal events through a durable service-only RPC", () => {
  const webhook = read("app/api/webhook/stripe/route.ts");
  const persistence = read("lib/academy-persistence.ts");
  const migration = read("supabase/migrations/20260815180000_academy_payment_reversal_governance.sql");
  const repurchaseMigration = read("supabase/migrations/20260815190000_academy_payment_repurchase_reactivation.sql");

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
  assert.match(migration, /revoke all on public\.academy_payment_reversal_events from service_role/);
  assert.match(migration, /grant select, insert, update on public\.academy_payment_reversal_events to service_role/);
  assert.match(migration, /idempotentReplay/);
  assert.match(migration, /Ambiguous paid checkout mapping/);
  assert.match(migration, /payment_reference = p_checkout_session_id/);
  assert.match(migration, /set access_status = 'refunded'/);
  assert.match(migration, /set access_status = 'revoked'/);
  assert.match(repurchaseMigration, /create or replace function public\.academy_record_paid_checkout/);
  assert.match(repurchaseMigration, /create or replace function public\.academy_claim_paid_checkout/);
  assert.match(repurchaseMigration, /on conflict \(clerk_user_id, course_slug\) do update/g);
  assert.match(repurchaseMigration, /access_status in \('refunded', 'revoked'\)/g);
  assert.match(repurchaseMigration, /payment_reference is distinct from excluded\.payment_reference/g);
  assert.match(repurchaseMigration, /academy_payment_reversal_events/g);
  assert.match(repurchaseMigration, /returning \* into v_state/g);
  assert.match(repurchaseMigration, /Verified payment did not activate exact Academy access/g);
  assert.doesNotMatch(webhook, /checkout\.sessions\.create|refunds\.create|disputes\.update/);
});
