import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const DELIVERY_MODULE = "lib/ai-marketplace-delivery.ts";
const DELIVERY_ENVIRONMENT_KEYS = [
  "OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL",
  "OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID",
  "OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY",
  "OBSERRA_AI_MARKETPLACE_DELIVERY_CATALOG_JSON",
  "OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON",
];

function clearDeliveryEnvironment() {
  for (const key of DELIVERY_ENVIRONMENT_KEYS) delete process.env[key];
}

function loadDelivery() {
  const output = ts.transpileModule(fs.readFileSync(DELIVERY_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: DELIVERY_MODULE,
  }).outputText;
  const deliveryModule = { exports: {} };
  vm.runInNewContext(output, {
    Date,
    Error,
    JSON,
    Math,
    Number,
    URL,
    encodeURIComponent,
    exports: deliveryModule.exports,
    module: deliveryModule,
    process,
    require(specifier) {
      if (specifier === "server-only") return {};
      if (specifier === "node:crypto") return crypto;
      throw new Error(`Unexpected delivery test import: ${specifier}`);
    },
  });
  return deliveryModule.exports;
}

function configureDelivery(privateKey) {
  process.env.OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL = "https://downloads.example.com/";
  process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID = "K123456789ABC";
  process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY = privateKey;
  process.env.OBSERRA_AI_MARKETPLACE_DELIVERY_CATALOG_JSON = "{}";
  process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON = "{}";
}

const rsaPrivateKey = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ format: "pem", type: "pkcs8" }).toString();
const ed25519PrivateKey = crypto.generateKeyPairSync("ed25519").privateKey.export({ format: "pem", type: "pkcs8" }).toString();
const release = { objectKey: "marketplace-v12/release/example.zip" };

test("protected delivery readiness requires a usable RSA signing configuration", (t) => {
  t.after(clearDeliveryEnvironment);
  clearDeliveryEnvironment();
  configureDelivery(rsaPrivateKey);
  const delivery = loadDelivery();

  assert.equal(delivery.aiMarketplaceProtectedDeliveryConfigured(), true);
  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), true);
  const signed = delivery.signedAiMarketplaceReleaseUrl(release, 300);
  assert.equal(typeof signed, "string");
  const url = new URL(signed);
  assert.equal(url.origin, "https://downloads.example.com");
  assert.equal(url.pathname, "/marketplace-v12/release/example.zip");
  assert.equal(url.searchParams.get("Key-Pair-Id"), "K123456789ABC");
  assert.match(url.searchParams.get("Signature"), /^[A-Za-z0-9_~-]+$/);
});

test("malformed or non-RSA private keys keep delivery and checkout activation fail-closed", (t) => {
  t.after(clearDeliveryEnvironment);
  clearDeliveryEnvironment();
  const delivery = loadDelivery();

  configureDelivery("not-a-private-key");
  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), false);
  assert.equal(delivery.signedAiMarketplaceReleaseUrl(release), null);

  configureDelivery(ed25519PrivateKey);
  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), false);
  assert.equal(delivery.signedAiMarketplaceReleaseUrl(release), null);
});

test("deceptive or non-origin CDN URLs cannot satisfy protected delivery readiness", (t) => {
  t.after(clearDeliveryEnvironment);
  clearDeliveryEnvironment();
  const delivery = loadDelivery();

  configureDelivery(rsaPrivateKey);
  for (const origin of [
    "https://trusted.example@evil.example",
    "https://downloads.example.com/releases",
    "https://localhost",
    "http://downloads.example.com",
  ]) {
    process.env.OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL = origin;
    assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), false, origin);
    assert.equal(delivery.signedAiMarketplaceReleaseUrl(release), null, origin);
  }
});
