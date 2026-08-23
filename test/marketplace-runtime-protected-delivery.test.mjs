import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const DELIVERY_MODULE = "lib/ai-marketplace-delivery.ts";
const REVISION = "487043cc23975012e83764a9a0f258f9ff705ab656084be558e76fa64f47faf2";
const VERIFIED_AT = "2026-08-23T20:00:00.000Z";
const PRODUCT_COUNT = 11_390;
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
      if (specifier === "./marketplace-v12-catalog") return catalogModule;
      throw new Error(`Unexpected delivery test import: ${specifier}`);
    },
  });
  return deliveryModule.exports;
}

const products = {};
const cards = new Map();
const subjects = [];
for (let index = 0; index < PRODUCT_COUNT; index += 1) {
  const productId = `product-${String(index).padStart(5, "0")}`;
  const artifactFile = `${productId}.zip`;
  const artifactSha256 = crypto.createHash("sha256").update(productId).digest("hex");
  const card = {
    product_id: productId,
    version: "1.0.0",
    artifact: {
      deployment_key: `${productId}/1.0.0/${artifactFile}`,
      filename: artifactFile,
      sha256: artifactSha256,
      bytes: 1024 + index,
      media_type: "application/zip",
    },
    install: { profile: "skill-upload" },
  };
  const releaseRecord = {
    objectKey: card.artifact.deployment_key,
    artifactFile,
    artifactSha256,
    byteLength: card.artifact.bytes,
    mediaType: "application/zip",
    installProfile: "skill-upload",
    version: card.version,
    verifiedAt: VERIFIED_AT,
  };
  cards.set(productId, card);
  subjects.push({ productId, artifactSha256 });
  products[productId] = releaseRecord;
}
const deliveryCatalogSha256 = crypto.createHash("sha256").update(`${JSON.stringify({ revision: REVISION, products })}\n`).digest("hex");
const deliveryReceipt = {
  contract: "obserra-marketplace-v12-runtime-delivery-receipt-v1",
  revision: REVISION,
  requiredProducts: PRODUCT_COUNT,
  deliveryCatalogSha256,
  protectedArtifactSetComplete: true,
  verifiedAt: VERIFIED_AT,
};
const catalogModule = {
  marketplaceV12CommerceSubjects() { return subjects; },
  marketplaceV12Product(productId) { return cards.get(productId) ?? null; },
  marketplaceV12Summary() { return { revision: REVISION }; },
};

function configureDelivery(privateKey) {
  process.env.OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL = "https://downloads.example.com/";
  process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID = "K123456789ABC";
  process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY = privateKey;
  process.env.OBSERRA_AI_MARKETPLACE_DELIVERY_CATALOG_JSON = "{}";
  process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON = JSON.stringify(deliveryReceipt);
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
  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), true);
  assert.equal(delivery.signedAiMarketplaceReleaseUrl(release), null);

  configureDelivery(ed25519PrivateKey);
  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), true);
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
    assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), true, origin);
    assert.equal(delivery.signedAiMarketplaceReleaseUrl(release), null, origin);
  }
});

test("v1.2 readiness rejects incomplete or digest-mismatched delivery receipts", (t) => {
  t.after(clearDeliveryEnvironment);
  clearDeliveryEnvironment();
  configureDelivery(rsaPrivateKey);
  const delivery = loadDelivery();
  const subject = subjects[0];

  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), true);
  assert.equal(delivery.marketplaceV12Release(subject.productId, REVISION, subject.artifactSha256)?.objectKey, products[subject.productId].objectKey);

  process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON = JSON.stringify({ ...deliveryReceipt, requiredProducts: PRODUCT_COUNT - 1 });
  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), false);
  assert.equal(delivery.marketplaceV12Release(subject.productId, REVISION, subject.artifactSha256), null);

  process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON = JSON.stringify({ ...deliveryReceipt, deliveryCatalogSha256: "0".repeat(64) });
  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), false);
});

test("every v1.2 protected delivery and install entry point hydrates governed runtime secrets first", () => {
  for (const route of [
    "app/api/ai-marketplace/download/route.ts",
    "app/api/ai-marketplace/install-grant/route.ts",
    "app/api/ai-marketplace/install-grant/exchange/route.ts",
    "app/api/ai-marketplace/install-grant/receipt/route.ts",
    "app/ai-marketplace/hangar/page.tsx",
  ]) {
    const source = fs.readFileSync(route, "utf8");
    assert.match(source, /ensureMarketplaceV12RuntimeSecrets/);
    const hydrate = source.indexOf("await ensureMarketplaceV12RuntimeSecrets()");
    assert.notEqual(hydrate, -1, route);
    const deliveryRead = Math.min(...[
      source.indexOf("marketplaceV12Release(", hydrate),
      source.indexOf("marketplaceV12ProtectedDeliveryConfigured(", hydrate),
      source.indexOf("marketplaceV12InstallBridgeConfigured(", hydrate),
    ].filter((index) => index >= 0));
    assert.ok(Number.isFinite(deliveryRead) && hydrate < deliveryRead, route);
  }
});
