import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const catalogRelativePath = "data/marketplace/obserra-marketplace-card-catalog.json.gz";
const encodedCatalogRelativePath = `${catalogRelativePath}.b64`;
const catalogChunkSuffixes = ["000", "001", "002", "003", "004"];
const encodedCatalogChunkRelativePaths = catalogChunkSuffixes.map((suffix) => `${encodedCatalogRelativePath}.part-${suffix}`);
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

function decodeCanonicalBase64(paths) {
  const encoded = paths.map((path) => readFileSync(path, "utf8")).join("");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) || encoded.length % 4 !== 0) fail("encoded catalog is not canonical base64");
  const decoded = Buffer.from(encoded, "base64");
  if (decoded.toString("base64") !== encoded) fail("encoded catalog does not round-trip canonically");
  return decoded;
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

if (!existsSync(summaryPath)) fail("the catalog summary is missing");
const summaryBytes = readFileSync(summaryPath);
const summary = JSON.parse(summaryBytes.toString("utf8"));
const rawCatalogBytes = existsSync(catalogPath) ? readFileSync(catalogPath) : null;
const encodedCatalogBytes = encodedCatalogChunkRelativePaths.every((path) => existsSync(join(root, path))) ? decodeCanonicalBase64(encodedCatalogChunkRelativePaths.map((path) => join(root, path))) : null;
const rawMatches = Boolean(rawCatalogBytes && sha256(rawCatalogBytes) === summary.catalog_gzip_sha256);
const encodedMatches = Boolean(encodedCatalogBytes && sha256(encodedCatalogBytes) === summary.catalog_gzip_sha256);
if (!rawMatches && !encodedMatches) fail("no raw or encoded catalog source matches the verified summary");
const catalogBytes = rawMatches ? rawCatalogBytes : encodedCatalogBytes;
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
if (!encodedCatalogChunkRelativePaths.every((path) => tracked.includes(path)) || !tracked.includes(summaryRelativePath)) fail("encoded catalog chunks and summary must be tracked");
const duplicatePaths = tracked.filter((path) => {
  const candidate = join(root, path);
  return path !== catalogRelativePath && !encodedCatalogChunkRelativePaths.includes(path) && existsSync(candidate) && statSync(candidate).isFile() && statSync(candidate).size === catalogBytes.length && sha256(readFileSync(candidate)) === summary.catalog_gzip_sha256;
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

console.log(`[Marketplace Catalog] Verified ${summary.catalog_gzip_bytes} byte gzip, revision ${summary.catalog_revision.slice(0, 12)}, ${summary.counts.total_cards} cards, and raw-or-chunked canonical source${buildOutput ? " plus traced production metadata" : ""}.`);
