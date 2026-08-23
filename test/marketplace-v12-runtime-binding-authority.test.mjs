import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const MODULE = "lib/marketplace-v12-bindings.ts";
const REVISION = "a".repeat(64);
const ARTIFACT = "b".repeat(64);
const BINDING_SET = "c".repeat(64);
const VERIFIED_AT = "2026-08-23T14:30:00.000Z";
const PRODUCT = {
  product_id: "skill-card-1",
  pricing: { offers: [{ kind: "recurring", cadence: "month", currency: "USD", amount_minor: 2500 }] },
};

function receipt(overrides = {}) {
  return {
    contract: "obserra-marketplace-v12-runtime-binding-receipt-v1",
    revision: REVISION,
    requiredProducts: 1,
    requiredOfferBindings: 1,
    reviewedProductCards: 1,
    liveReviewedOfferBindings: 1,
    bindingSetSha256: BINDING_SET,
    verifiedAt: VERIFIED_AT,
    ...overrides,
  };
}

function productAuthority(overrides = {}) {
  return {
    revision: REVISION,
    bindingSetSha256: BINDING_SET,
    verifiedAt: VERIFIED_AT,
    productId: PRODUCT.product_id,
    bindings: [{
      purchaseOption: "recurring:month",
      artifactSha256: ARTIFACT,
      stripeProductId: "prod_exact123",
      stripePriceId: "price_exact123",
      stripeLivemode: true,
      evidenceKey: "d".repeat(64),
      reviewedAt: VERIFIED_AT,
    }],
    ...overrides,
  };
}

function loadBindings({ authorityReceipt = receipt(), authority = productAuthority(), evidenceKeyValid = true, releaseVerified = true } = {}) {
  const output = ts.transpileModule(fs.readFileSync(MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: MODULE,
  }).outputText;
  const runtimeModule = { exports: {} };
  const calls = { receipt: 0, product: 0 };
  vm.runInNewContext(output, {
    Date,
    Error,
    JSON,
    Math,
    Number,
    Object,
    Promise,
    RegExp,
    Set,
    exports: runtimeModule.exports,
    module: runtimeModule,
    process,
    require(specifier) {
      if (specifier === "server-only") return {};
      if (specifier === "./marketplace-v12-binding-import") return {
        async marketplaceV12BindingAuthorityReceipt() { calls.receipt += 1; return authorityReceipt; },
        marketplaceV12BindingEvidenceKeyMatches() { return evidenceKeyValid; },
        async marketplaceV12ProductBindingAuthority() { calls.product += 1; return authority; },
      };
      if (specifier === "./marketplace-v12-catalog") return {
        marketplaceV12CommerceSubjects() { return [{ productId: PRODUCT.product_id, artifactSha256: ARTIFACT }]; },
        marketplaceV12Product(productId) { return productId === PRODUCT.product_id ? PRODUCT : null; },
        marketplaceV12Summary() { return { revision: REVISION }; },
      };
      if (specifier === "./marketplace-v12-release-evidence") return {
        marketplaceV12ReleaseEvidence() { return { verified: releaseVerified }; },
      };
      throw new Error(`Unexpected runtime test import: ${specifier}`);
    },
  });
  return { bindings: runtimeModule.exports, calls };
}

test("runtime resolves one exact durable Price and accepts matching compact authority", async (t) => {
  t.after(() => { delete process.env.OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON; });
  process.env.OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON = JSON.stringify(receipt());
  const { bindings, calls } = loadBindings();

  assert.equal(await bindings.boundMarketplaceV12Price(PRODUCT, "recurring:month"), "price_exact123");
  const coverage = await bindings.marketplaceV12BindingCoverage();
  assert.equal(coverage.complete, true);
  assert.equal(coverage.requiredProductCards, 1);
  assert.equal(coverage.requiredOfferBindings, 1);
  assert.deepEqual(calls, { receipt: 1, product: 1 });
});

test("runtime fails closed for missing, altered, or unsigned binding authority", async (t) => {
  t.after(() => { delete process.env.OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON; });

  delete process.env.OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON;
  const absent = loadBindings();
  assert.equal(await absent.bindings.boundMarketplaceV12Price(PRODUCT, "recurring:month"), null);
  assert.equal((await absent.bindings.marketplaceV12BindingCoverage()).complete, false);
  assert.deepEqual(absent.calls, { receipt: 0, product: 0 });

  process.env.OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON = JSON.stringify(receipt());
  const altered = loadBindings({ authority: productAuthority({ bindings: [{ ...productAuthority().bindings[0], artifactSha256: "e".repeat(64) }] }) });
  assert.equal(await altered.bindings.boundMarketplaceV12Price(PRODUCT, "recurring:month"), null);

  const unsigned = loadBindings({ evidenceKeyValid: false });
  assert.equal(await unsigned.bindings.boundMarketplaceV12Price(PRODUCT, "recurring:month"), null);

  const mismatchedReceipt = loadBindings({ authorityReceipt: receipt({ bindingSetSha256: "f".repeat(64) }) });
  assert.equal((await mismatchedReceipt.bindings.marketplaceV12BindingCoverage()).complete, false);
});
