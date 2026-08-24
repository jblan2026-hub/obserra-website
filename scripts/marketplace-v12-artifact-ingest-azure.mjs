#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { BlobServiceClient } from "@azure/storage-blob";
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
const STORAGE_SCOPE = "https://storage.azure.com/";
const MAX_CONCURRENCY = 32;
const TOKEN_REFRESH_SKEW_MS = 2 * 60 * 1000;
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
  if (!/^(?:sk|rk)_live_[A-Za-z0-9_]+$/.test(stripeKey) || !/^whsec_[A-Za-z0-9_]+$/.test(stripeWebhook)) {
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

let tokenCache = null;
function tokenExpiry(payload) {
  const epoch = Number(payload?.expires_on);
  if (Number.isFinite(epoch) && epoch > 0) return epoch * 1000;
  const parsed = Date.parse(String(payload?.expiresOn ?? ""));
  return Number.isFinite(parsed) ? parsed : Date.now() + 10 * 60 * 1000;
}

function azureStorageAccessToken() {
  if (tokenCache && tokenCache.expiresOnTimestamp > Date.now() + TOKEN_REFRESH_SKEW_MS) return tokenCache;
  const result = spawnSync("az", [
    "account", "get-access-token",
    "--resource", STORAGE_SCOPE,
    "--output", "json",
    "--only-show-errors",
  ], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error("Marketplace v1.2 Azure protected artifact gate: Azure Storage OAuth token is unavailable; provider output suppressed");
  }
  let payload;
  try {
    payload = JSON.parse(result.stdout);
  } catch {
    throw new Error("Marketplace v1.2 Azure protected artifact gate: Azure Storage OAuth token response is invalid; provider output suppressed");
  }
  const token = typeof payload?.accessToken === "string" ? payload.accessToken.trim() : "";
  const expiresOnTimestamp = tokenExpiry(payload);
  if (token.length < 128 || expiresOnTimestamp <= Date.now() + 60_000) {
    throw new Error("Marketplace v1.2 Azure protected artifact gate: Azure Storage OAuth token response is invalid; provider output suppressed");
  }
  tokenCache = { token, expiresOnTimestamp };
  return tokenCache;
}

const tokenCredential = {
  async getToken() {
    return azureStorageAccessToken();
  },
};

function remoteShape(properties, metadata = properties?.metadata ?? {}) {
  return {
    contentLength: Number(properties?.contentLength),
    serverEncrypted: properties?.serverEncrypted === true || properties?.isServerEncrypted === true,
    contentType: properties?.contentType,
    metadata: metadata ?? {},
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

function safeAttachmentName(value) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.zip$/i.test(value)) {
    throw new Error("Marketplace v1.2 Azure protected artifact gate: artifact filename is unsafe");
  }
  return value;
}

async function inventory(containerClient, expectedNames) {
  const found = new Map();
  try {
    for await (const item of containerClient.listBlobsFlat({ includeMetadata: true })) {
      if (!expectedNames.has(item.name)) continue;
      found.set(item.name, remoteShape(item.properties, item.metadata));
    }
  } catch {
    throw new Error("Marketplace v1.2 Azure protected artifact gate: protected object inventory failed; provider output suppressed");
  }
  return found;
}

async function runBounded(items, worker) {
  let next = 0;
  const workerCount = Math.min(MAX_CONCURRENCY, items.length);
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (true) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      await worker(items[index]);
    }
  }));
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
  safeAttachmentName(record.artifactFile);
}

if (options.activate) requireProductionAuthority();

const service = new BlobServiceClient(
  `https://${EXPECTED_STORAGE_ACCOUNT}.blob.core.windows.net`,
  tokenCredential,
  { retryOptions: { maxTries: 5, retryDelayInMs: 500, maxRetryDelayInMs: 4_000, tryTimeoutInMs: 60_000 } },
);
const containerClient = service.getContainerClient(EXPECTED_RELEASE_CONTAINER);
const expectedNames = new Set(records.map((record) => record.objectKey));
const initialInventory = await inventory(containerClient, expectedNames);
const pending = records.filter((record) => !exactRemote(initialInventory.get(record.objectKey), record, EXPECTED_CATALOG_REVISION));
const reused = records.length - pending.length;
let uploaded = 0;

if (options.activate && pending.length > 0) {
  await runBounded(pending, async (record) => {
    const path = inside(artifactRoot, record.objectKey, "artifact ingest path");
    const blob = containerClient.getBlockBlobClient(record.objectKey);
    try {
      await blob.uploadFile(path, {
        concurrency: 4,
        blobHTTPHeaders: {
          blobContentType: "application/zip",
          blobCacheControl: "private,no-store",
          blobContentDisposition: `attachment; filename=\"${safeAttachmentName(record.artifactFile)}\"`,
        },
        metadata: {
          artifact_sha256: record.artifactSha256,
          catalog_revision: EXPECTED_CATALOG_REVISION,
          product_id: record.productId,
        },
      });
      const properties = await blob.getProperties();
      if (!exactRemote(remoteShape(properties), record, EXPECTED_CATALOG_REVISION)) {
        throw new Error("readback mismatch");
      }
      uploaded += 1;
    } catch {
      throw new Error(`Marketplace v1.2 Azure protected artifact gate: protected readback failed for ${record.productId}; provider output suppressed`);
    }
  });
}

let complete = false;
if (options.activate) {
  const finalInventory = await inventory(containerClient, expectedNames);
  complete = records.every((record) => exactRemote(finalInventory.get(record.objectKey), record, EXPECTED_CATALOG_REVISION));
}

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
