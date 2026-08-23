#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  EXPECTED_CATALOG_REVISION,
  materializeArtifacts,
  parseArguments,
  readArchiveManifest,
  readCatalog,
  releaseRecords,
  sha256,
  validateDeliveryCatalog,
  verifyArchiveFiles,
} from "./marketplace-v12-artifact-lib.mjs";

const options = parseArguments(process.argv.slice(2), new Set(["--catalog", "--summary", "--archive-manifest", "--archive-dir", "--output-dir", "--work-dir", "--checkpoint", "--delivery-catalog", "--verified-at"]));
const required = ["catalog", "summary", "archive-manifest", "archive-dir", "output-dir", "work-dir", "checkpoint", "delivery-catalog"];
for (const key of required) if (!options[key]) throw new Error(`Marketplace v1.2 protected artifact gate: --${key.replaceAll("_", "-")} is required`);
const verifiedAt = options["verified-at"] ?? new Date().toISOString();
const { catalog, summary, catalogGzipSha256 } = readCatalog({ catalogPath: resolve(options.catalog), summaryPath: resolve(options.summary) });
const { manifest, digest: archiveManifestSha256 } = readArchiveManifest(resolve(options["archive-manifest"]));
const records = releaseRecords(catalog, manifest);
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
  contract: "obserra-marketplace-v12-artifact-materialization-v1",
  activationChanged: false,
  revision: summary.catalog_revision,
  catalogGzipSha256,
  archiveManifestSha256,
  requiredArchives: manifest.archives.length,
  requiredProducts: records.length,
  reusedProducts: result.reused,
  materializedProducts: result.written,
  deliveryCatalogSha256: sha256(deliveryBytes),
  complete: result.reused + result.written === records.length,
})}\n`);
