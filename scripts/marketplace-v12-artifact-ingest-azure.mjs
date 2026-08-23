#!/usr/bin/env node
import { AzureCliCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
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
const MAX_CONCURRENCY = 16;
const PER_BLOB_CONCURRENCY = 2;
const BLOCK_SIZE = 4 * 1024 * 1024;
const MAX_SINGLE_SHOT_SIZE = 8 * 1024 * 1024;
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

function fail(message) {
  throw new Error(`Marketplace v1.2 Azure protected artifact gate: ${message}`);
}

function requireProductionAuthority() {
  if (process.env.OBSERRA_MARKETPLACE_V12_PROTECTED_DELIVERY_APPROVED_REVISION !== EXPECTED_CATALOG_REVISION) {
    fail("exact protected-delivery approval is unavailable");
  }
  const supabaseUrl = process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim() ?? "";
  const supabaseKey = process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const stripeKey = process.env.APPLICATIONS_STRIPE_SECRET_KEY?.trim() ?? "";
  const stripeWebhook = process.env.APPLICATIONS_STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (supabaseUrl !== "https://ykmrlcfitsubqajgfnye.supabase.co" || supabaseKey.length < 32) {
    fail("durable commerce authority is unavailable; values suppressed");
  }
  if (!/^sk_live_[A-Za-z0-9_]+$/.test(stripeKey) || !/^whsec_[A-Za-z0-9_]+$/.test(stripeWebhook)) {
    fail("live Stripe authority is unavailable; values suppressed");
  }
  if (!options["stripe-evidence"]) fail("Stripe evidence is required for activation");
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
  ) fail("Stripe evidence is incomplete or failed");
}

function remoteSnapshot(value) {
  const properties = value?.properties ?? value ?? {};
  return {
    contentLength: properties.contentLength,
    contentType: properties.contentType,
    serverEncrypted: properties.serverEncrypted ?? properties.isServerEncrypted,
    metadata: value?.metadata ?? properties.metadata ?? {},
  };
}

function exactRemote(value, record, revision) {
  return value?.contentLength === record.byteLength
    && value?.serverEncrypted === true
    && value?.contentType === "application/zip"
    && value?.metadata?.artifact_sha256 === record.artifactSha256
    && value?.metadata?.catalog_revision === revision
    && value?.metadata?.product_id === record.productId;
}

async function runBounded(items, concurrency, worker) {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 64) fail("bounded concurrency is invalid");
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, Math.max(1, items.length)) }, async () => {
    for (;;) {
      const index = cursor++;
      if (index >= items.length) return;
      await worker(items[index], index);
    }
  });
  await Promise.all(workers);
}

async function inventoryRelease(containerClient) {
  const inventory = new Map();
  try {
    for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
      if (blob.deleted === true || typeof blob.name !== "string" || !blob.name) continue;
      inventory.set(blob.name, remoteSnapshot(blob));
    }
  } catch {
    fail("protected object inventory failed; provider output suppressed");
  }
  return inventory;
}

async function verifiedProperties(blockBlobClient, record) {
  let properties;
  try {
    properties = await blockBlobClient.getProperties();
  } catch {
    fail(`protected readback failed for ${record.productId}; provider output suppressed`);
  }
  const snapshot = remoteSnapshot(properties);
  if (!exactRemote(snapshot, record, EXPECTED_CATALOG_REVISION)) {
    fail(`protected readback failed for ${record.productId}`);
  }
  return snapshot;
}

const { catalog } = readCatalog({ catalogPath: resolve(options.catalog), summaryPath: resolve(options.summary) });
const { manifest } = readArchiveManifest(resolve(options["archive-manifest"]));
const records = releaseRecords(catalog, manifest);
const deliveryBytes = readFileSync(resolve(options["delivery-catalog"]));
const deliveryCatalog = JSON.parse(deliveryBytes.toString("utf8"));
validateDeliveryCatalog(deliveryCatalog, records, EXPECTED_CATALOG_REVISION);
const artifactRoot = resolve(options["artifact-dir"]);

await runBounded(records, MAX_CONCURRENCY, async (record) => {
  const path = inside(artifactRoot, record.objectKey, "artifact ingest path");
  if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size !== record.byteLength || await sha256File(path) !== record.artifactSha256) {
    fail(`local artifact integrity failed for ${record.productId}`);
  }
});

if (options.activate) requireProductionAuthority();
const credential = new AzureCliCredential({ tenantId: process.env.AZURE_TENANT_ID?.trim() || undefined });
const service = new BlobServiceClient(
  `https://${options["account-name"]}.blob.core.windows.net`,
  credential,
  { retryOptions: { maxTries: 5, tryTimeoutInMs: 30_000, retryDelayInMs: 500, maxRetryDelayInMs: 5_000 } },
);
const containerClient = service.getContainerClient(options.container);
const inventory = await inventoryRelease(containerClient);
const pending = records.filter((record) => !exactRemote(inventory.get(record.objectKey), record, EXPECTED_CATALOG_REVISION));
const reused = records.length - pending.length;
let uploaded = 0;

if (options.activate) {
  await runBounded(pending, MAX_CONCURRENCY, async (record) => {
    const path = inside(artifactRoot, record.objectKey, "artifact ingest path");
    const blockBlobClient = containerClient.getBlockBlobClient(record.objectKey);
    try {
      await blockBlobClient.uploadFile(path, {
        blockSize: BLOCK_SIZE,
        concurrency: PER_BLOB_CONCURRENCY,
        maxSingleShotSize: MAX_SINGLE_SHOT_SIZE,
        blobHTTPHeaders: {
          blobContentType: "application/zip",
          blobCacheControl: "private,no-store",
          blobContentDisposition: `attachment; filename=\"${record.artifactFile}\"`,
        },
        metadata: {
          artifact_sha256: record.artifactSha256,
          catalog_revision: EXPECTED_CATALOG_REVISION,
          product_id: record.productId,
        },
      });
    } catch {
      fail(`protected upload failed for ${record.productId}; provider output suppressed`);
    }
    await verifiedProperties(blockBlobClient, record);
    uploaded += 1;
  });
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
