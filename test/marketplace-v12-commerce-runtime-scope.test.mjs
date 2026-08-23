import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const SUPABASE_URL = "https://ykmrlcfitsubqajgfnye.supabase.co";
const REVISION = "a".repeat(64);
const ARTIFACT = "b".repeat(64);
const ATTEMPT = "11111111-1111-4111-8111-111111111111";

function response(payload) {
  return { ok: true, status: 200, async json() { return payload; } };
}

function load(path, dependencies) {
  const output = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: path,
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    AbortSignal, Buffer, Date, Error, JSON, Math, Number, Promise, URL,
    crypto, fetch: dependencies.fetch, module, process, exports: module.exports,
    require(specifier) {
      if (specifier === "server-only") return {};
      if (specifier === "node:crypto") return crypto;
      if (specifier === "./production-runtime-secrets") return dependencies.runtime;
      throw new Error(`Unexpected import: ${specifier}`);
    },
  });
  return module.exports;
}

function marketplaceEnvironment(t) {
  const keys = [
    "OBSERRA_APPLICATIONS_SUPABASE_URL",
    "OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY",
    "OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET",
  ];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  process.env.OBSERRA_APPLICATIONS_SUPABASE_URL = SUPABASE_URL;
  process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  process.env.OBSERRA_APPLICATIONS_COMMERCE_HASH_SECRET = "x".repeat(32);
}

test("v1.2 binding authority, ledger, and reservation never hydrate legacy Applications scope", async (t) => {
  marketplaceEnvironment(t);
  const calls = { applications: 0, marketplace: 0 };
  const runtime = {
    async ensureApplicationsRuntimeSecrets() { calls.applications += 1; },
    async ensureMarketplaceV12RuntimeSecrets() { calls.marketplace += 1; },
  };
  const binding = load("lib/marketplace-v12-binding-import.ts", {
    runtime,
    async fetch(url) {
      assert.match(String(url), /obserra_ai_marketplace_v12_binding_authority_receipt/);
      return response({
        contract: "obserra-marketplace-v12-runtime-binding-receipt-v1",
        revision: REVISION,
        requiredProducts: 11390,
        requiredOfferBindings: 11390,
        reviewedProductCards: 11390,
        liveReviewedOfferBindings: 11390,
        bindingSetSha256: "c".repeat(64),
        verifiedAt: "2026-08-23T20:00:00.000Z",
      });
    },
  });
  const commerce = load("lib/ai-marketplace-commerce.ts", {
    runtime,
    async fetch(url) {
      if (String(url).includes("obserra_ai_marketplace_commerce_health")) {
        return response({ operational: true, entitlementAuthority: "ai-marketplace-commerce-ledger-v1" });
      }
      assert.match(String(url), /obserra_ai_marketplace_reserve_v12_checkout/);
      return response({ attemptId: ATTEMPT, stripeCustomerId: null, stripeSessionId: null, expiresAt: Math.floor(Date.now() / 1000) + 2100 });
    },
  });

  const authority = await binding.marketplaceV12BindingAuthorityReceipt(REVISION);
  const ledger = await commerce.aiMarketplaceLedgerHealth("marketplace-v12");
  const reservation = await commerce.reserveMarketplaceV12Checkout({
    subjectId: "user_abcdefgh", tenantId: "subject:user_abcdefgh", productId: "skill-001",
    option: "recurring:month", revision: REVISION, artifactSha256: ARTIFACT,
  });

  assert.equal(authority.revision, REVISION);
  assert.equal(ledger.entitlementAuthority, "ai-marketplace-commerce-ledger-v1");
  assert.equal(reservation.attemptId, ATTEMPT);
  assert.equal(calls.applications, 0);
  assert.equal(calls.marketplace, 3);
});

test("each v1.2 Price authority validates a multi-offer key on Stripe Price, never Stripe Product", () => {
  const sources = [
    [readFileSync("scripts/verify-marketplace-v12-stripe-evidence.mjs", "utf8"), /price\.metadata\.bindingKey === binding\.bindingKey/],
    [readFileSync("app/api/ai-marketplace/checkout/route.ts", "utf8"), /price\.metadata\.bindingKey === input\.bindingKey/],
    [readFileSync("app/api/webhook/stripe-ai-marketplace/route.ts", "utf8"), /price\.metadata\.bindingKey === bindingKey/],
  ];
  for (const [source, exactPriceBinding] of sources) {
    assert.match(source, exactPriceBinding);
    assert.doesNotMatch(source, /product\.metadata\.bindingKey/);
  }
  assert.match(sources[0][0], /A Product can legitimately carry multiple governed Price bindings/);
});
