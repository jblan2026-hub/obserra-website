#!/usr/bin/env node

import { createHash, createHmac } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  EXPECTED_CATALOG_REVISION,
  EXPECTED_PRODUCT_COUNT,
  parseArguments,
} from "./marketplace-v12-artifact-lib.mjs";

const ACCOUNT = /^acct_[A-Za-z0-9]+$/;
const SHA256 = /^[a-f0-9]{64}$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function fail(message) {
  throw new Error(`Marketplace v1.2 runtime evidence: ${message}`);
}

function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    const items = value.map(canonical);
    if (items.some((item) => item === null)) return null;
    return `[${items.join(",")}]`;
  }
  if (!value || typeof value !== "object") return null;
  const entries = Object.keys(value).sort().map((key) => {
    const item = canonical(value[key]);
    return item === null ? null : `${JSON.stringify(key)}:${item}`;
  });
  if (entries.some((entry) => entry === null)) return null;
  return `{${entries.join(",")}}`;
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(resolve(path), "utf8"));
  } catch {
    fail(`${label} is invalid`);
  }
}

function writeProtectedJson(path, value) {
  const target = resolve(path);
  mkdirSync(dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value)}\n`, { mode: 0o600 });
  renameSync(temporary, target);
}

function writeProtectedText(path, value) {
  const target = resolve(path);
  mkdirSync(dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, `${value}\n`, { mode: 0o600 });
  renameSync(temporary, target);
}

const allowed = new Set([
  "--binding-receipt",
  "--delivery-catalog",
  "--stripe-evidence",
  "--ingest-evidence",
  "--ledger-evidence",
  "--azure-storage-account",
  "--azure-release-container",
  "--hmac-key-file",
  "--receipt-output",
  "--evidence-output",
  "--signature-output",
  "--verified-at",
  "--expires-at",
]);
const options = parseArguments(process.argv.slice(2), allowed);
for (const key of [
  "binding-receipt",
  "delivery-catalog",
  "stripe-evidence",
  "ingest-evidence",
  "ledger-evidence",
  "azure-storage-account",
  "azure-release-container",
  "hmac-key-file",
  "receipt-output",
  "evidence-output",
  "signature-output",
]) if (!options[key]) fail(`--${key} is required`);

const deliveryBytes = readFileSync(resolve(options["delivery-catalog"]));
const bindingReceipt = readJson(options["binding-receipt"], "binding receipt");
const deliveryCatalog = readJson(options["delivery-catalog"], "delivery catalog");
const stripeEvidence = readJson(options["stripe-evidence"], "Stripe evidence");
const ingestEvidence = readJson(options["ingest-evidence"], "ingest evidence");
const ledgerEvidence = readJson(options["ledger-evidence"], "ledger evidence");

const bindingPayload = canonical(bindingReceipt);
const bindingKeys = bindingReceipt && typeof bindingReceipt === "object" && !Array.isArray(bindingReceipt) ? Object.keys(bindingReceipt).sort() : [];
const expectedBindingKeys = ["bindingSetSha256", "contract", "liveReviewedOfferBindings", "requiredOfferBindings", "requiredProducts", "reviewedProductCards", "revision", "verifiedAt"].sort();
if (
  !bindingPayload
  || JSON.stringify(bindingKeys) !== JSON.stringify(expectedBindingKeys)
  || bindingReceipt.contract !== "obserra-marketplace-v12-runtime-binding-receipt-v1"
  || bindingReceipt.revision !== EXPECTED_CATALOG_REVISION
  || bindingReceipt.requiredProducts !== EXPECTED_PRODUCT_COUNT
  || bindingReceipt.reviewedProductCards !== EXPECTED_PRODUCT_COUNT
  || !Number.isSafeInteger(bindingReceipt.requiredOfferBindings)
  || bindingReceipt.requiredOfferBindings < EXPECTED_PRODUCT_COUNT
  || bindingReceipt.liveReviewedOfferBindings !== bindingReceipt.requiredOfferBindings
  || !SHA256.test(bindingReceipt.bindingSetSha256 ?? "")
  || !ISO_INSTANT.test(bindingReceipt.verifiedAt ?? "")
) fail("binding receipt does not cover the exact live-reviewed catalog");
const bindingReceiptSha256 = digest(bindingPayload);

if (deliveryCatalog?.revision !== EXPECTED_CATALOG_REVISION || !deliveryCatalog.products || Array.isArray(deliveryCatalog.products) || Object.keys(deliveryCatalog.products).length !== EXPECTED_PRODUCT_COUNT) fail("delivery catalog does not cover the exact catalog");
const verifiedTimes = new Set(Object.values(deliveryCatalog.products).map((release) => release?.verifiedAt));
if (verifiedTimes.size !== 1 || !ISO_INSTANT.test([...verifiedTimes][0] ?? "")) fail("delivery catalog verification time is inconsistent");
const deliveryCatalogSha256 = digest(deliveryBytes);

if (
  stripeEvidence?.contract !== "obserra-marketplace-v12-stripe-evidence-review-v1"
  || stripeEvidence.reviewOnly !== true
  || stripeEvidence.activationChanged !== false
  || stripeEvidence.bindingAuthority !== "durable-supabase-review-v1"
  || stripeEvidence.catalogRevision !== EXPECTED_CATALOG_REVISION
  || stripeEvidence.requiredProductCards !== EXPECTED_PRODUCT_COUNT
  || stripeEvidence.reviewedProductCards !== EXPECTED_PRODUCT_COUNT
  || !ACCOUNT.test(stripeEvidence.stripeAccountId ?? "")
  || stripeEvidence.stripeAccountChargesEnabled !== true
  || stripeEvidence.failureCount !== 0
  || stripeEvidence.verifiedOfferBindings !== stripeEvidence.requiredOfferBindings
  || stripeEvidence.requiredOfferBindings !== bindingReceipt.requiredOfferBindings
  || canonical(stripeEvidence.bindingReceipt) !== bindingPayload
  || stripeEvidence.verified !== true
) fail("Stripe evidence is incomplete or mismatched");

if (
  ingestEvidence?.contract !== "obserra-marketplace-v12-protected-artifact-ingest-v1"
  || ingestEvidence.revision !== EXPECTED_CATALOG_REVISION
  || ingestEvidence.requiredProducts !== EXPECTED_PRODUCT_COUNT
  || ingestEvidence.deliveryCatalogSha256 !== deliveryCatalogSha256
  || ingestEvidence.protectedArtifactSetComplete !== true
  || ingestEvidence.provider !== "azure-blob-oauth"
  || ingestEvidence.storageAccount !== "stobserramktv1238d660"
  || ingestEvidence.releaseContainer !== "marketplace-v12-release"
) fail("protected artifact ingest evidence is incomplete or mismatched");

if (
  ledgerEvidence?.contract !== "obserra-marketplace-v12-ledger-evidence-v1"
  || ledgerEvidence.durableLedgerVerified !== true
  || ledgerEvidence.entitlementAuthority !== "ai-marketplace-commerce-ledger-v1"
) fail("durable ledger evidence is incomplete");

const storageAccount = options["azure-storage-account"]?.trim() ?? "";
const releaseContainer = options["azure-release-container"]?.trim() ?? "";
const hmacKey = readFileSync(resolve(options["hmac-key-file"]), "utf8").trim();
if (storageAccount !== "stobserramktv1238d660" || releaseContainer !== "marketplace-v12-release") fail("Azure protected delivery configuration is invalid; values suppressed");
if (hmacKey.length < 32) fail("release evidence signing authority is unavailable; value suppressed");

const now = new Date();
const verifiedAt = options["verified-at"] ?? now.toISOString();
const expiresAt = options["expires-at"] ?? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const verifiedTime = Date.parse(verifiedAt);
const expiresTime = Date.parse(expiresAt);
if (!ISO_INSTANT.test(verifiedAt) || !ISO_INSTANT.test(expiresAt) || !Number.isFinite(verifiedTime) || !Number.isFinite(expiresTime) || verifiedTime > Date.now() + 60_000 || expiresTime <= verifiedTime || expiresTime - verifiedTime > 7 * 24 * 60 * 60 * 1000) fail("release evidence validity window is invalid");

const receipt = {
  contract: "obserra-marketplace-v12-runtime-delivery-receipt-v1",
  revision: EXPECTED_CATALOG_REVISION,
  requiredProducts: EXPECTED_PRODUCT_COUNT,
  deliveryCatalogSha256,
  protectedArtifactSetComplete: true,
  verifiedAt: [...verifiedTimes][0],
};
const receiptPayload = canonical(receipt);
if (!receiptPayload) fail("runtime delivery receipt is not canonicalizable");

const evidence = {
  catalog_revision: EXPECTED_CATALOG_REVISION,
  binding_receipt_sha256: bindingReceiptSha256,
  delivery_manifest_sha256: digest(receiptPayload),
  stripe_account_id: stripeEvidence.stripeAccountId,
  subject_count: EXPECTED_PRODUCT_COUNT,
  verified_at: verifiedAt,
  expires_at: expiresAt,
  controls: {
    charges_enabled: true,
    protected_delivery_verified: true,
    durable_ledger_verified: true,
    delivery_provider: "azure-blob-oauth",
  },
};
const evidencePayload = canonical(evidence);
if (!evidencePayload) fail("runtime release evidence is not canonicalizable");
const signature = createHmac("sha256", hmacKey).update(evidencePayload).digest("hex");
if (!SHA256.test(signature)) fail("runtime release evidence signature is invalid");

writeProtectedJson(options["receipt-output"], receipt);
writeProtectedJson(options["evidence-output"], evidence);
writeProtectedText(options["signature-output"], signature);
process.stdout.write(`${JSON.stringify({
  contract: "obserra-marketplace-v12-runtime-evidence-build-v1",
  activationChanged: false,
  revision: EXPECTED_CATALOG_REVISION,
  requiredProducts: EXPECTED_PRODUCT_COUNT,
  bindingReceiptSha256,
  deliveryCatalogSha256,
  stripeAccountId: stripeEvidence.stripeAccountId,
  durableLedgerVerified: true,
  protectedDeliveryVerified: true,
  expiresAt,
  complete: true,
})}\n`);
