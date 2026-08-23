import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const DELIVERY_MODULE = "lib/ai-marketplace-delivery.ts";
const RUNTIME_MODULE = "lib/production-runtime-secrets.ts";
const WORKFLOW = ".github/workflows/marketplace-v12-protected-delivery.yml";
const REVISION = "487043cc23975012e83764a9a0f258f9ff705ab656084be558e76fa64f47faf2";
const VERIFIED_AT = "2026-08-23T20:00:00.000Z";
const PRODUCT_COUNT = 11_390;
const STORAGE_ACCOUNT = "stobserramktv1238d660";
const RELEASE_CONTAINER = "marketplace-v12-release";
const AZURE_AUDIENCE = "api://AzureADTokenExchange";
const VERCEL_ISSUER = "https://oidc.vercel.com/obserra";
const VERCEL_SUBJECT = "owner:obserra:project:obserra-website-live:environment:production";

function deliveryFixture() {
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
    cards.set(productId, card);
    subjects.push({ productId, artifactSha256 });
    products[productId] = {
      objectKey: card.artifact.deployment_key,
      artifactFile,
      artifactSha256,
      byteLength: card.artifact.bytes,
      mediaType: "application/zip",
      installProfile: "skill-upload",
      version: card.version,
      verifiedAt: VERIFIED_AT,
    };
  }
  const deliveryCatalogSha256 = crypto.createHash("sha256").update(`${JSON.stringify({ revision: REVISION, products })}\n`).digest("hex");
  return {
    cards,
    subjects,
    receipt: {
      contract: "obserra-marketplace-v12-runtime-delivery-receipt-v1",
      revision: REVISION,
      requiredProducts: PRODUCT_COUNT,
      deliveryCatalogSha256,
      protectedArtifactSetComplete: true,
      verifiedAt: VERIFIED_AT,
    },
  };
}

function loadDelivery(fixture) {
  const output = ts.transpileModule(fs.readFileSync(DELIVERY_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: DELIVERY_MODULE,
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(output, {
    Date,
    Error,
    JSON,
    Math,
    Number,
    URL,
    encodeURIComponent,
    exports: loaded.exports,
    module: loaded,
    process,
    require(specifier) {
      if (specifier === "server-only") return {};
      if (specifier === "node:crypto") return crypto;
      if (specifier === "./marketplace-v12-catalog") {
        return {
          marketplaceV12CommerceSubjects() { return fixture.subjects; },
          marketplaceV12Product(productId) { return fixture.cards.get(productId) ?? null; },
          marketplaceV12Summary() { return { revision: REVISION }; },
        };
      }
      throw new Error(`Unexpected delivery test import: ${specifier}`);
    },
  });
  return loaded.exports;
}

function encoded(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function oidcAssertion() {
  const now = Math.floor(Date.now() / 1000);
  return [
    encoded({ alg: "RS256", typ: "JWT" }),
    encoded({ aud: AZURE_AUDIENCE, exp: now + 300, iat: now, iss: VERCEL_ISSUER, nbf: now - 1, sub: VERCEL_SUBJECT }),
    "signature-placeholder-that-keeps-the-test-assertion-realistically-sized",
  ].join(".");
}

function loadRuntime({ fetch, oidc }) {
  const output = ts.transpileModule(fs.readFileSync(RUNTIME_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: RUNTIME_MODULE,
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(output, {
    AbortSignal,
    Buffer,
    Date,
    Error,
    JSON,
    Map,
    Number,
    Promise,
    URLSearchParams,
    encodeURIComponent,
    exports: loaded.exports,
    fetch,
    module: loaded,
    process,
    require(specifier) {
      if (specifier === "server-only") return {};
      if (specifier === "node:crypto") return crypto;
      if (specifier === "@vercel/oidc") return { getVercelOidcToken: oidc };
      throw new Error(`Unexpected runtime test import: ${specifier}`);
    },
  });
  return loaded.exports;
}

function tokenResponse(status, payload) {
  return { ok: status >= 200 && status < 300, status, async json() { return payload; } };
}

test("v1.2 protected delivery uses the approved private Azure Blob boundary without CloudFront keys", (t) => {
  const previous = process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON;
  t.after(() => {
    if (previous === undefined) delete process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON;
    else process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON = previous;
  });
  const fixture = deliveryFixture();
  process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON = JSON.stringify(fixture.receipt);
  delete process.env.OBSERRA_AI_MARKETPLACE_RELEASE_CDN_URL;
  delete process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_KEY_PAIR_ID;
  delete process.env.OBSERRA_AI_MARKETPLACE_CLOUDFRONT_PRIVATE_KEY;
  const delivery = loadDelivery(fixture);
  const subject = fixture.subjects[0];
  const release = delivery.marketplaceV12Release(subject.productId, REVISION, subject.artifactSha256);

  assert.equal(delivery.marketplaceV12ProtectedDeliveryConfigured(), true);
  assert.equal(typeof delivery.marketplaceV12AzureBlobUrl, "function");
  assert.equal(
    delivery.marketplaceV12AzureBlobUrl(release),
    `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${RELEASE_CONTAINER}/${release.objectKey.split("/").map(encodeURIComponent).join("/")}`,
  );
});

test("production runtime exchanges Vercel OIDC for Azure Storage scope without persisting the token", async (t) => {
  const previous = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    tenant: process.env.OBSERRA_KEY_VAULT_TENANT_ID,
    client: process.env.OBSERRA_KEY_VAULT_CLIENT_ID,
  };
  t.after(() => {
    for (const key of ["VERCEL_ENV", "OBSERRA_KEY_VAULT_TENANT_ID", "OBSERRA_KEY_VAULT_CLIENT_ID", "OBSERRA_AI_MARKETPLACE_STORAGE_ACCESS_TOKEN"]) delete process.env[key];
    if (previous.VERCEL_ENV !== undefined) process.env.VERCEL_ENV = previous.VERCEL_ENV;
    if (previous.tenant !== undefined) process.env.OBSERRA_KEY_VAULT_TENANT_ID = previous.tenant;
    if (previous.client !== undefined) process.env.OBSERRA_KEY_VAULT_CLIENT_ID = previous.client;
  });
  process.env.VERCEL_ENV = "production";
  process.env.OBSERRA_KEY_VAULT_TENANT_ID = "7d8b7b64-c80c-4c8a-a514-66f6b1cf8607";
  process.env.OBSERRA_KEY_VAULT_CLIENT_ID = "807bc5fa-32ca-4410-ab8d-79e461b64e82";
  const scopes = [];
  const runtime = loadRuntime({
    async oidc() { return oidcAssertion(); },
    async fetch(url, options) {
      assert.match(url, /^https:\/\/login\.microsoftonline\.com\//);
      scopes.push(options.body.get("scope"));
      return tokenResponse(200, { access_token: "azure-storage-access-token", expires_in: 3600 });
    },
  });

  const token = await runtime.azureMarketplaceStorageAccessToken();
  assert.equal(token, "azure-storage-access-token");
  assert.deepEqual(scopes, ["https://storage.azure.com/.default"]);
  assert.equal(process.env.OBSERRA_AI_MARKETPLACE_STORAGE_ACCESS_TOKEN, undefined);
});

test("governed v1.2 ingest is Azure-native and contains no active AWS or CloudFront release dependency", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");
  assert.match(workflow, /marketplace-v12-artifact-ingest-azure\.mjs/);
  assert.match(workflow, /marketplace-v12-release/);
  assert.doesNotMatch(workflow, /ai-marketplace-release-aws-|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|cloudfront|CloudFront/i);
});
