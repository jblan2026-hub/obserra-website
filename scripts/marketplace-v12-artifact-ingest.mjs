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

const options = parseArguments(process.argv.slice(2), new Set(["--catalog", "--summary", "--archive-manifest", "--artifact-dir", "--delivery-catalog", "--stripe-evidence", "--bucket", "--prefix", "--kms-key-id", "--region", "--activate"]));
for (const key of ["catalog", "summary", "archive-manifest", "artifact-dir", "delivery-catalog", "bucket", "kms-key-id", "region"]) if (!options[key]) throw new Error(`Marketplace v1.2 protected artifact gate: --${key} is required`);

function requireProductionAuthority() {
  if (process.env.OBSERRA_MARKETPLACE_V12_PROTECTED_DELIVERY_APPROVED_REVISION !== EXPECTED_CATALOG_REVISION) throw new Error("Marketplace v1.2 protected artifact gate: exact protected-delivery approval is unavailable");
  const supabaseUrl = process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim() ?? "";
  const supabaseKey = process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const stripeKey = process.env.APPLICATIONS_STRIPE_SECRET_KEY?.trim() ?? "";
  const stripeWebhook = process.env.APPLICATIONS_STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (supabaseUrl !== "https://ykmrlcfitsubqajgfnye.supabase.co" || supabaseKey.length < 32) throw new Error("Marketplace v1.2 protected artifact gate: durable commerce authority is unavailable; values suppressed");
  if (!/^sk_live_[A-Za-z0-9_]+$/.test(stripeKey) || !/^whsec_[A-Za-z0-9_]+$/.test(stripeWebhook)) throw new Error("Marketplace v1.2 protected artifact gate: live Stripe authority is unavailable; values suppressed");
  if (!options["stripe-evidence"]) throw new Error("Marketplace v1.2 protected artifact gate: Stripe evidence is required for activation");
  const evidence = JSON.parse(readFileSync(resolve(options["stripe-evidence"]), "utf8"));
  if (evidence?.contract !== "obserra-marketplace-v12-stripe-evidence-review-v1" || evidence.reviewOnly !== true || evidence.activationChanged !== false || evidence.catalogRevision !== EXPECTED_CATALOG_REVISION || evidence.requiredProductCards !== 11_390 || evidence.verified !== true || evidence.failureCount !== 0 || evidence.stripeAccountChargesEnabled !== true || evidence.verifiedOfferBindings !== evidence.requiredOfferBindings) throw new Error("Marketplace v1.2 protected artifact gate: Stripe evidence is incomplete or failed");
}

function aws(args, { optionalNotFound = false } = {}) {
  try {
    return execFileSync("aws", [...args, "--region", options.region, "--no-cli-pager"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 8 * 1024 * 1024 });
  } catch (error) {
    const stderr = String(error?.stderr ?? "");
    if (optionalNotFound && /(?:Not Found|NotFound|NoSuchKey|404)/i.test(stderr)) return null;
    throw new Error("Marketplace v1.2 protected artifact gate: protected object storage request failed; provider output suppressed");
  }
}

function remoteKey(prefix, objectKey) {
  const normalized = String(prefix ?? "").replace(/^\/+|\/+$/g, "");
  return normalized ? `${normalized}/${objectKey}` : objectKey;
}

function head(bucket, key) {
  const value = aws(["s3api", "head-object", "--bucket", bucket, "--key", key], { optionalNotFound: true });
  if (!value) return null;
  try { return JSON.parse(value); } catch { throw new Error("Marketplace v1.2 protected artifact gate: protected object readback is invalid"); }
}

function exactRemote(value, record, revision) {
  return value?.ContentLength === record.byteLength
    && value?.ServerSideEncryption === "aws:kms"
    && typeof value?.SSEKMSKeyId === "string" && value.SSEKMSKeyId.length > 0
    && value?.Metadata?.["artifact-sha256"] === record.artifactSha256
    && value?.Metadata?.["catalog-revision"] === revision
    && value?.Metadata?.["product-id"] === record.productId;
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
  if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size !== record.byteLength || await sha256File(path) !== record.artifactSha256) throw new Error(`Marketplace v1.2 protected artifact gate: local artifact integrity failed for ${record.productId}`);
}

if (options.activate) requireProductionAuthority();
let reused = 0;
let uploaded = 0;
for (const record of records) {
  const key = remoteKey(options.prefix, record.objectKey);
  const existing = head(options.bucket, key);
  if (exactRemote(existing, record, EXPECTED_CATALOG_REVISION)) { reused += 1; continue; }
  if (!options.activate) continue;
  const path = inside(artifactRoot, record.objectKey, "artifact ingest path");
  aws(["s3api", "put-object", "--bucket", options.bucket, "--key", key, "--body", path, "--content-type", "application/zip", "--cache-control", "private,no-store", "--content-disposition", `attachment; filename=\"${record.artifactFile}\"`, "--server-side-encryption", "aws:kms", "--ssekms-key-id", options["kms-key-id"], "--checksum-algorithm", "SHA256", "--metadata", `artifact-sha256=${record.artifactSha256},catalog-revision=${EXPECTED_CATALOG_REVISION},product-id=${record.productId}`]);
  const verified = head(options.bucket, key);
  if (!exactRemote(verified, record, EXPECTED_CATALOG_REVISION)) throw new Error(`Marketplace v1.2 protected artifact gate: protected readback failed for ${record.productId}`);
  uploaded += 1;
}
const complete = options.activate && reused + uploaded === records.length;
process.stdout.write(`${JSON.stringify({
  contract: "obserra-marketplace-v12-protected-artifact-ingest-v1",
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
