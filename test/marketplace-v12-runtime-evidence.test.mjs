import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash, createHmac, generateKeyPairSync } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const REVISION = "487043cc23975012e83764a9a0f258f9ff705ab656084be558e76fa64f47faf2";
const PRODUCT_COUNT = 11_390;
const VERIFIED_AT = "2026-08-23T20:00:00.000Z";

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}

function fixture(root) {
  const deliveryProducts = {};
  for (let index = 0; index < PRODUCT_COUNT; index += 1) {
    const productId = `product-${String(index).padStart(5, "0")}`;
    deliveryProducts[productId] = { verifiedAt: VERIFIED_AT };
  }
  const delivery = `${JSON.stringify({ revision: REVISION, products: deliveryProducts })}\n`;
  const bindingReceipt = {
    contract: "obserra-marketplace-v12-runtime-binding-receipt-v1",
    revision: REVISION,
    requiredProducts: PRODUCT_COUNT,
    requiredOfferBindings: PRODUCT_COUNT,
    reviewedProductCards: PRODUCT_COUNT,
    liveReviewedOfferBindings: PRODUCT_COUNT,
    bindingSetSha256: digest("exact live binding set\n"),
    verifiedAt: VERIFIED_AT,
  };
  const bindingReceiptPath = join(root, "binding-receipt.json");
  const deliveryPath = join(root, "delivery.json");
  const stripePath = join(root, "stripe.json");
  const ingestPath = join(root, "ingest.json");
  const ledgerPath = join(root, "ledger.json");
  const cdnPath = join(root, "cdn");
  const keyPairPath = join(root, "key-pair");
  const privateKeyPath = join(root, "private-key");
  const hmacPath = join(root, "hmac");
  const receiptPath = join(root, "receipt.json");
  const evidencePath = join(root, "evidence.json");
  const signaturePath = join(root, "signature");
  writeFileSync(bindingReceiptPath, JSON.stringify(bindingReceipt));
  writeFileSync(deliveryPath, delivery);
  writeFileSync(stripePath, JSON.stringify({ contract: "obserra-marketplace-v12-stripe-evidence-review-v1", reviewOnly: true, activationChanged: false, bindingAuthority: "durable-supabase-review-v1", catalogRevision: REVISION, requiredProductCards: PRODUCT_COUNT, requiredOfferBindings: PRODUCT_COUNT, reviewedProductCards: PRODUCT_COUNT, stripeAccountId: "acct_1234567890", stripeAccountChargesEnabled: true, verifiedOfferBindings: PRODUCT_COUNT, failureCount: 0, bindingReceipt, verified: true }));
  writeFileSync(ingestPath, JSON.stringify({ contract: "obserra-marketplace-v12-protected-artifact-ingest-v1", revision: REVISION, requiredProducts: PRODUCT_COUNT, deliveryCatalogSha256: digest(delivery), protectedArtifactSetComplete: true }));
  writeFileSync(ledgerPath, JSON.stringify({ contract: "obserra-marketplace-v12-ledger-evidence-v1", durableLedgerVerified: true, entitlementAuthority: "ai-marketplace-commerce-ledger-v1" }));
  writeFileSync(cdnPath, "https://downloads.example.com\n");
  writeFileSync(keyPairPath, "K123456789ABC\n");
  writeFileSync(privateKeyPath, generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ format: "pem", type: "pkcs8" }));
  writeFileSync(hmacPath, "a-runtime-evidence-hmac-key-that-is-long-enough");
  return { bindingReceiptPath, deliveryPath, stripePath, ingestPath, ledgerPath, cdnPath, keyPairPath, privateKeyPath, hmacPath, receiptPath, evidencePath, signaturePath };
}

function argumentsFor(paths) {
  const verifiedAt = new Date(Date.now() - 60_000).toISOString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return [
    "scripts/marketplace-v12-runtime-evidence.mjs",
    "--binding-receipt", paths.bindingReceiptPath,
    "--delivery-catalog", paths.deliveryPath,
    "--stripe-evidence", paths.stripePath,
    "--ingest-evidence", paths.ingestPath,
    "--ledger-evidence", paths.ledgerPath,
    "--cdn-url-file", paths.cdnPath,
    "--cloudfront-key-pair-id-file", paths.keyPairPath,
    "--cloudfront-private-key-file", paths.privateKeyPath,
    "--hmac-key-file", paths.hmacPath,
    "--receipt-output", paths.receiptPath,
    "--evidence-output", paths.evidencePath,
    "--signature-output", paths.signaturePath,
    "--verified-at", verifiedAt,
    "--expires-at", expiresAt,
  ];
}

test("runtime evidence binds exact catalog, Stripe, ledger, artifact, and delivery-signing proof", (t) => {
  const root = mkdtempSync(join(tmpdir(), "marketplace-v12-runtime-evidence-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const paths = fixture(root);
  const output = JSON.parse(execFileSync(process.execPath, argumentsFor(paths), { encoding: "utf8" }));
  const receipt = JSON.parse(readFileSync(paths.receiptPath, "utf8"));
  const evidence = JSON.parse(readFileSync(paths.evidencePath, "utf8"));
  const signature = readFileSync(paths.signaturePath, "utf8").trim();

  assert.equal(output.complete, true);
  assert.equal(output.requiredProducts, PRODUCT_COUNT);
  assert.deepEqual(receipt, {
    contract: "obserra-marketplace-v12-runtime-delivery-receipt-v1",
    revision: REVISION,
    requiredProducts: PRODUCT_COUNT,
    deliveryCatalogSha256: digest(readFileSync(paths.deliveryPath)),
    protectedArtifactSetComplete: true,
    verifiedAt: VERIFIED_AT,
  });
  assert.equal(evidence.catalog_revision, REVISION);
  assert.equal(evidence.subject_count, PRODUCT_COUNT);
  assert.deepEqual(evidence.controls, { charges_enabled: true, protected_delivery_verified: true, durable_ledger_verified: true });
  assert.equal(evidence.binding_receipt_sha256, digest(canonical(JSON.parse(readFileSync(paths.bindingReceiptPath, "utf8")))));
  assert.equal(evidence.delivery_manifest_sha256, digest(canonical(receipt)));
  assert.equal(signature, createHmac("sha256", readFileSync(paths.hmacPath, "utf8").trim()).update(canonical(evidence)).digest("hex"));
});

test("runtime evidence remains fail-closed when protected ingest digest differs", (t) => {
  const root = mkdtempSync(join(tmpdir(), "marketplace-v12-runtime-evidence-invalid-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const paths = fixture(root);
  const ingest = JSON.parse(readFileSync(paths.ingestPath, "utf8"));
  writeFileSync(paths.ingestPath, JSON.stringify({ ...ingest, deliveryCatalogSha256: "0".repeat(64) }));

  const result = spawnSync(process.execPath, argumentsFor(paths), { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /protected artifact ingest evidence is incomplete or mismatched/);
  assert.doesNotMatch(result.stderr, /a-runtime-evidence-hmac-key/);
});

test("protected delivery workflow writes only compact runtime evidence after all direct checks pass", () => {
  const workflow = readFileSync(".github/workflows/marketplace-v12-protected-delivery.yml", "utf8");
  const ledger = readFileSync("scripts/verify-marketplace-v12-ledger-evidence.mjs", "utf8");
  const stripe = readFileSync("scripts/verify-marketplace-v12-stripe-evidence.mjs", "utf8");

  assert.match(workflow, /verify-marketplace-v12-ledger-evidence\.mjs/);
  assert.match(workflow, /marketplace-v12-runtime-evidence\.mjs/);
  assert.match(workflow, /ai-marketplace-v12-binding-receipt-json/);
  assert.match(workflow, /ai-marketplace-v12-delivery-catalog-json/);
  assert.match(workflow, /ai-marketplace-v12-release-evidence-json/);
  assert.match(workflow, /ai-marketplace-v12-release-evidence-signature/);
  assert.match(workflow, /ai-marketplace-v12-activation-approved-revision/);
  assert.match(workflow, /Approval is written last/);
  assert.doesNotMatch(workflow, /set_secret_value ai-marketplace-v12-verified-binding-count/);
  assert.doesNotMatch(workflow, /set_secret_file ai-marketplace-v12-delivery-catalog-json "\$\{evidence_dir\}\/delivery-catalog\.json"/);
  assert.match(ledger, /obserra_ai_marketplace_commerce_health/);
  assert.match(ledger, /ai-marketplace-commerce-ledger-v1/);
  assert.doesNotMatch(ledger, /console\.log\(serviceRoleKey\)|JSON\.stringify\([^)]*serviceRoleKey/);
  assert.match(stripe, /readCatalog/);
  assert.doesNotMatch(stripe, /gunzipSync\(readFileSync\("data\/marketplace/);
  assert.match(stripe, /obserra_ai_marketplace_v12_binding_review_page/);
  assert.match(stripe, /obserra_ai_marketplace_finalize_v12_binding_authority/);
  assert.doesNotMatch(workflow, /ai-marketplace-v12-bindings-json|OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON/);
});
