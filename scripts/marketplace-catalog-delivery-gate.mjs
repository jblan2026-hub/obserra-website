import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const catalogRelativePath = "data/marketplace/obserra-marketplace-card-catalog.json.gz";
const summaryRelativePath = "data/marketplace/obserra-marketplace-card-catalog.summary.json";
const catalogPath = join(root, catalogRelativePath);
const summaryPath = join(root, summaryRelativePath);
const buildOutputIndex = process.argv.indexOf("--build-output");
const buildOutput = buildOutputIndex === -1 ? null : resolve(root, process.argv[buildOutputIndex + 1] ?? "");

function fail(message) {
  throw new Error(`Marketplace catalog delivery gate failed: ${message}`);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "buffer" })
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

function filesWithin(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...filesWithin(path));
    else if (entry.isFile()) found.push(path);
  }
  return found;
}

if (!existsSync(catalogPath) || !existsSync(summaryPath)) fail("the canonical catalog or its summary is missing");
const catalogBytes = readFileSync(catalogPath);
const summaryBytes = readFileSync(summaryPath);
const summary = JSON.parse(summaryBytes.toString("utf8"));
const document = JSON.parse(gunzipSync(catalogBytes).toString("utf8"));

if (summary.output_filename !== "obserra-marketplace-card-catalog.json.gz") fail("summary output filename is not canonical");
if (summary.catalog_gzip_bytes !== catalogBytes.length) fail("catalog gzip byte count differs from the verified summary");
if (summary.catalog_gzip_sha256 !== sha256(catalogBytes)) fail("catalog gzip SHA-256 differs from the verified summary");
if (summary.catalog_uncompressed_bytes !== gunzipSync(catalogBytes).length) fail("catalog uncompressed byte count differs from the verified summary");
if (summary.catalog_uncompressed_sha256 !== sha256(gunzipSync(catalogBytes))) fail("catalog uncompressed SHA-256 differs from the verified summary");
if (document.catalog_revision !== summary.catalog_revision) fail("catalog revision differs from the verified summary");
if (!Array.isArray(document.cards) || document.cards.length !== summary.counts?.total_cards) fail("catalog card count differs from the verified summary");
if (document.publication_state !== summary.publication_state) fail("catalog publication state differs from the verified summary");

const tracked = trackedFiles();
if (!tracked.includes(catalogRelativePath) || !tracked.includes(summaryRelativePath)) fail("canonical catalog files must be tracked");
const duplicatePaths = tracked.filter((path) => {
  const candidate = join(root, path);
  return path !== catalogRelativePath && existsSync(candidate) && statSync(candidate).isFile() && statSync(candidate).size === catalogBytes.length && sha256(readFileSync(candidate)) === summary.catalog_gzip_sha256;
});
if (duplicatePaths.length) fail(`verified catalog has duplicate tracked copies: ${duplicatePaths.join(", ")}`);

if (buildOutput) {
  if (!existsSync(buildOutput)) fail(`build output does not exist: ${relative(root, buildOutput)}`);
  // Turbopack records traced runtime files in route .nft metadata and Vercel
  // materializes them once during deployment; .next itself need not duplicate
  // a 2.5 MiB source file. Verify a canonical trace reference instead of
  // requiring an implementation-specific physical copy in .next.
  const traceReferences = filesWithin(buildOutput)
    .filter((path) => path.endsWith(".nft.json"))
    .filter((path) => {
      try {
        const trace = JSON.parse(readFileSync(path, "utf8"));
        return Array.isArray(trace.files) && trace.files.some((file) => resolve(join(path, ".."), file) === catalogPath);
      } catch { return false; }
    });
  if (!traceReferences.length) fail("production build does not trace the canonical catalog into any runtime bundle");
}

console.log(`[Marketplace Catalog] Verified ${summary.catalog_gzip_bytes} byte gzip, revision ${summary.catalog_revision.slice(0, 12)}, ${summary.counts.total_cards} cards, and one canonical tracked source${buildOutput ? " plus traced production metadata" : ""}.`);
