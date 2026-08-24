#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  EXPECTED_CATALOG_REVISION,
  materializeArtifacts,
  parseArguments,
  readCatalog,
  releaseRecords,
  sha256,
  validateDeliveryCatalog,
  verifyArchiveFiles,
} from "./marketplace-v12-artifact-lib.mjs";

const EXPECTED_PRODUCT_COUNT = 11_390;
const EXPECTED_SELLABLE_SOURCE_COUNT = 6;
const EXPECTED_MANIFEST_SHA256 = "a666dc2a150a55958bdafef4187c9e277068dacd1586799d42edef3f4944a766";
const SHA256 = /^[a-f0-9]{64}$/;

function fail(message) {
  throw new Error(`Marketplace v1.2 six-source gate: ${message}`);
}

function readSellableManifest(path) {
  const bytes = readFileSync(path);
  const digest = sha256(bytes);
  if (digest !== EXPECTED_MANIFEST_SHA256) fail("sellable source manifest digest differs from the approved release manifest");
  const manifest = JSON.parse(bytes.toString("utf8"));
  if (manifest?.schema_version !== "1.0" || manifest?.publisher !== "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" || !Array.isArray(manifest.archives)) {
    fail("sellable source manifest contract is invalid");
  }
  if (manifest.archives.length !== EXPECTED_SELLABLE_SOURCE_COUNT) fail("sellable source manifest must contain exactly six archives");
  const names = new Set();
  for (const archive of manifest.archives) {
    if (!archive || typeof archive.filename !== "string" || !archive.filename.endsWith(".zip") || archive.filename.includes("/") || archive.filename.includes("\\")) fail("sellable source manifest contains an invalid filename");
    if (!Number.isSafeInteger(archive.bytes) || archive.bytes <= 0 || !SHA256.test(archive.sha256 ?? "")) fail("sellable source manifest contains invalid archive evidence");
    if (names.has(archive.filename)) fail("sellable source manifest contains a duplicate filename");
    names.add(archive.filename);
  }
  return { manifest, digest };
}

function reduceCatalogToSellableSources(catalog, manifest) {
  const cards = catalog.cards.filter((card) => card.product_type !== "collection" && card.product_type !== "bundle");
  if (cards.length !== EXPECTED_PRODUCT_COUNT) fail("catalog does not contain exactly 11,390 sellable products");

  const requiredNames = new Set(cards.map((card) => card?.artifact?.source_archive));
  if (requiredNames.has(undefined) || requiredNames.has(null) || requiredNames.has("")) fail("a sellable product is missing source archive evidence");
  if (requiredNames.size !== EXPECTED_SELLABLE_SOURCE_COUNT) fail("sellable products do not resolve to exactly six source archives");

  const manifestNames = new Set(manifest.archives.map((archive) => archive.filename));
  if (manifestNames.size !== requiredNames.size || [...requiredNames].some((name) => !manifestNames.has(name))) {
    fail("sellable source manifest does not exactly match archives referenced by sellable products");
  }

  const catalogArchives = new Map(catalog.source_archives.map((archive) => [archive.filename, archive]));
  for (const archive of manifest.archives) {
    const catalogArchive = catalogArchives.get(archive.filename);
    if (!catalogArchive || catalogArchive.bytes !== archive.bytes || catalogArchive.sha256 !== archive.sha256) {
      fail(`catalog archive evidence differs for ${archive.filename}`);
    }
  }

  return { ...catalog, source_archives: manifest.archives.map((archive) => ({ ...archive })) };
}

const options = parseArguments(process.argv.slice(2), new Set([
  "--catalog",
  "--summary",
  "--source-manifest",
  "--archive-dir",
  "--output-dir",
  "--work-dir",
  "--checkpoint",
  "--delivery-catalog",
  "--verified-at",
  "--validate-sources-only",
]));

for (const key of ["catalog", "summary", "source-manifest"]) {
  if (!options[key]) fail(`--${key.replaceAll("_", "-")} is required`);
}

const { catalog, summary, catalogGzipSha256 } = readCatalog({
  catalogPath: resolve(options.catalog),
  summaryPath: resolve(options.summary),
});
const { manifest, digest: archiveManifestSha256 } = readSellableManifest(resolve(options["source-manifest"]));
const reducedCatalog = reduceCatalogToSellableSources(catalog, manifest);
const records = releaseRecords(reducedCatalog, manifest);

if (options["validate-sources-only"]) {
  process.stdout.write(`${JSON.stringify({
    contract: "obserra-marketplace-v12-six-source-validation-v1",
    activationChanged: false,
    revision: summary.catalog_revision,
    catalogGzipSha256,
    archiveManifestSha256,
    catalogHistoricalSourceArchives: catalog.source_archives.length,
    requiredArchives: manifest.archives.length,
    requiredProducts: records.length,
    complete: records.length === EXPECTED_PRODUCT_COUNT && manifest.archives.length === EXPECTED_SELLABLE_SOURCE_COUNT,
  })}\n`);
  process.exit(0);
}

for (const key of ["archive-dir", "output-dir", "work-dir", "checkpoint", "delivery-catalog"]) {
  if (!options[key]) fail(`--${key} is required`);
}
const verifiedAt = options["verified-at"] ?? new Date().toISOString();
const archives = await verifyArchiveFiles(manifest, resolve(options["archive-dir"]));
const result = await materializeArtifacts({
  records,
  archives,
  outputDirectory: resolve(options["output-dir"]),
  workDirectory: resolve(options["work-dir"]),
  checkpointPath: resolve(options.checkpoint),
  revision: EXPECTED_CATALOG_REVISION,
  verifiedAt,
});
validateDeliveryCatalog(result.deliveryCatalog, records, EXPECTED_CATALOG_REVISION);

const deliveryPath = resolve(options["delivery-catalog"]);
mkdirSync(dirname(deliveryPath), { recursive: true });
const deliveryBytes = Buffer.from(`${JSON.stringify(result.deliveryCatalog)}\n`);
const temporary = `${deliveryPath}.${process.pid}.tmp`;
writeFileSync(temporary, deliveryBytes, { mode: 0o600 });
await import("node:fs").then(({ renameSync }) => renameSync(temporary, deliveryPath));

process.stdout.write(`${JSON.stringify({
  contract: "obserra-marketplace-v12-six-source-materialization-v1",
  activationChanged: false,
  revision: summary.catalog_revision,
  catalogGzipSha256,
  archiveManifestSha256,
  catalogHistoricalSourceArchives: catalog.source_archives.length,
  requiredArchives: manifest.archives.length,
  requiredProducts: records.length,
  reusedProducts: result.reused,
  materializedProducts: result.written,
  deliveryCatalogSha256: sha256(deliveryBytes),
  complete: result.reused + result.written === records.length,
})}\n`);
