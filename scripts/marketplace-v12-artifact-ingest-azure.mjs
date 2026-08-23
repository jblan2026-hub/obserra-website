#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import {
  EXPECTED_CATALOG_REVISION,
  inside,
  parseArguments,
  readArchiveManifest,
  readCatalog,
  releaseRecords,
  sha256,
  sha256File,
  validateDeliveryCatalog,
} from "./marketplace-v12-artifact-lib.mjs";

const EXPECTED_STORAGE_ACCOUNT = "stobserramktv1238d660";
const EXPECTED_RELEASE_CONTAINER = "marketplace-v12-release";
const options = parseArguments(process.argv.slice(2), new Set([
  "--catalog",
  "--summary",
  "--archive-manifest",
  "--artifact-dir",
  "--delivery-catalog",
  "--stripe-evidence",
  "--account-name",
  "--container",
  "--activate",
]));
for (const key of ["catalog", "summary", "archive-manifest", "artifact-dir", "delivery-catalog", "account-name", "container"]) {
  if (!options[key]) throw new Error(`Marketplace v1.2 Azure protected artifact gate: --${key} is required`);
}
if (options["account-name"] !== EXPECTED_STORAGE_ACCOUNT || options.container !== EXPECTED_RELEASE_CONTAINER) {
  throw new Error("Marketplace v1.2 Azure protected artifact gate: release storage authority differs from the approved production boundary");
}

function requireProductionAuthority() {
  if (process.env.OBSERRA_MARKETPLACE_V12_PROTECTED_DELIVERY_APPROVED_REVISION !== EXPECTED_CATALOG_REVISION) {
    throw new Error("Marketplace v1.2 Azure protected artifact gate: exact protected-delivery approval is unavailable");
  }
  const supabaseUrl = process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim() ?? "";
  const supabaseKey = process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const stripeKey = process.env.APPLICATIONS_STRIPE_SECRET_KEY?.trim() ?? "";
  const stripeWebhook = process.env.APPLICATIONS_STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (supabaseUrl !== "https://ykmrlcfitsubqajgfnye.supabase.co" || supabaseKey.length < 32) {
    throw new Error("Marketplace v1.2 Azure protected artifact gate: durable commerce authority is unavailable; values suppressed");
  }
  if (!/^sk_live_[A-Za-z0-9_]+$/.test(stripeKey) || !/^whsec_[A-Za-z0-9_]+$/.test(stripeWebhook)) {
    throw new Error("Marketplace v1.2 Azure protected artifact gate: live Stripe authority is unavailable; values suppressed");
  }
  if (!options["stripe-evidence"]) throw new Error("Marketplace v1.2 Azure protected artifact gate: Stripe evidence is required for activation");
  const evidence = JSON.parse(readFileSync(resolve(options["stripe-evidence"]), "utf8"));
  if (
    evidence?.contract !== "obserra-marketplace-v12-stripe-evidence-review-v1"
    || evidence.reviewOnly !== true
    || evidence.activationChanged !== false
    || evidence.catalogRevision !== EXPECTED_CATALOG_REVISION
    || evidence.requiredProductCards !== 11_390
    || evidence.verified !== true
    || evidence.failureCount !== 0
    || evidence.stripeAccountChargesEnabled !== true
    || evidence.verifiedOfferBindings !== evidence.requiredOfferBindings
  ) throw new Error("Marketplace v1.2 Azure protected artifact gate: Stripe evidence is incomplete or failed");
}

function az(args, { optionalNotFound = false } = {}) {
  try {
    return execFileSync("az", [...args, "--only-show-errors"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch (error) {
    const stderr = String(error?.stderr ?? "");
    if (optionalNotFound && /(?:BlobNotFound|ResourceNotFound|not found|404)/i.test(stderr)) return null;
    throw new Error("Marketplace v1.2 Azure protected artifact gate: protected object storage request failed; provider output suppressed");
  }
}

function head(name) {
  const value = az([
    "storage", "blob", "show",
    "--auth-mode", "login",
    "--account-name", options["account-name"],
    "--container-name", options.container,
    "--name", name,
    "--query", "{contentLength:properties.contentLength,serverEncrypted:properties.serverEncrypted,contentType:properties.contentSettings.contentType,metadata:metadata}",
    "-o", "json",
  ], { optionalNotFound: true });
  if (!value) return null;
  try { return JSON.parse(value); } catch { throw new Error("Marketplace v1.2 Azure protected artifact gate: protected object readback is invalid"); }
}

function exactRemote(value, record, revision) {
  return value?.contentLength === record.byteLength
    && value?.serverEncrypted === true
    && value?.contentType === "application/zip"
    && value?.metadata?.artifact_sha256 === record.artifactSha256
    && value?.metadata?.catalog_revision === revision
    && value?.metadata?.product_id === record.productId;
}

const { catalog } = readCatalog({ catalogPath: resolve(options.catalog), summaryPath: resolve(options.summary) });
const { manifest } = readArchiveManifest(resolve(options["archive-manifest"]));
const records = releaseRecords(catalog, manifest);
const deliveryBytes = readFileSync(resolve(options["delivery-catalog"]));
const deliveryCatalog = JSON.parse(deliveryBytes.toString("utf8"));
validateDeliveryCatalog(deliveryCatalog, records, EXPECTED_CATALOG_REVISION);
const artifactRoot = resolve(options["artifact-dir"]);
for (const record of records) {
  const path = inside(artifactRoot, record.objectKey, "artifact ingest path");
  if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size !== record.byteLength || await sha256File(path) !== record.artifactSha256) {
    throw new Error(`Marketplace v1.2 Azure protected artifact gate: local artifact integrity failed for ${record.productId}`);
  }
}

if (options.activate) requireProductionAuthority();
let reused = 0;
let uploaded = 0;
for (const record of records) {
  const existing = head(record.objectKey);
  if (exactRemote(existing, record, EXPECTED_CATALOG_REVISION)) {
    reused += 1;
    continue;
  }
  if (!options.activate) continue;
  const path = inside(artifactRoot, record.objectKey, "artifact ingest path");
  az([
    "storage", "blob", "upload",
    "--auth-mode", "login",
    "--account-name", options["account-name"],
    "--container-name", options.container,
    "--name", record.objectKey,
    "--file", path,
    "--overwrite", "true",
    "--content-type", "application/zip",
    "--content-cache-control", "private,no-store",
    "--content-disposition", `attachment; filename=\"${record.artifactFile}\"`,
    "--metadata",
    `artifact_sha256=${record.artifactSha256}`,
    `catalog_revision=${EXPECTED_CATALOG_REVISION}`,
    `product_id=${record.productId}`,
    "--output", "none",
  ]);
  const verified = head(record.objectKey);
  if (!exactRemote(verified, record, EXPECTED_CATALOG_REVISION)) {
    throw new Error(`Marketplace v1.2 Azure protected artifact gate: protected readback failed for ${record.productId}`);
  }
  uploaded += 1;
}

const complete = options.activate && reused + uploaded === records.length;
process.stdout.write(`${JSON.stringify({
  contract: "obserra-marketplace-v12-protected-artifact-ingest-v1",
  provider: "azure-blob-oauth",
  storageAccount: EXPECTED_STORAGE_ACCOUNT,
  releaseContainer: EXPECTED_RELEASE_CONTAINER,
  revision: EXPECTED_CATALOG_REVISION,
  activationRequested: options.activate === true,
  activationChanged: uploaded > 0,
  requiredProducts: records.length,
  alreadyVerifiedProducts: reused,
  uploadedProducts: uploaded,
  deliveryCatalogSha256: sha256(deliveryBytes),
  protectedArtifactSetComplete: complete,
})}\n`);
if (options.activate && !complete) process.exitCode = 2;