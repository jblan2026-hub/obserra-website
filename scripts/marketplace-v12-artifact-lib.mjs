import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";

export const EXPECTED_CATALOG_REVISION = "487043cc23975012e83764a9a0f258f9ff705ab656084be558e76fa64f47faf2";
export const EXPECTED_ARCHIVE_MANIFEST_SHA256 = "7cb0746b4712bf5471dea53853c9d58d5c03e6e8aa97a7bb5a1eefc0639e2d30";
export const EXPECTED_PRODUCT_COUNT = 11_390;
export const EXPECTED_ARCHIVE_COUNT = 15;
const SHA256 = /^[a-f0-9]{64}$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const DELIVERY_OBJECT_KEY = /^[A-Za-z0-9][A-Za-z0-9._/-]*\.zip$/;
const DELIVERY_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.zip$/;
const VERSION = /^(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*)){0,3}(?:[-+][A-Za-z0-9.-]+)?$/;
const INSTALL_PROFILES = new Set(["skill-upload", "codex-plugin", "desktop-installer-bundle", "collection"]);

export function fail(message) {
  throw new Error(`Marketplace v1.2 protected artifact gate: ${message}`);
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function sha256File(file) {
  const digest = createHash("sha256");
  for await (const chunk of createReadStream(file)) digest.update(chunk);
  return digest.digest("hex");
}

export function safeRelativePath(value, label, extension = null) {
  if (typeof value !== "string" || !value || value.includes("\0") || value.startsWith("/") || value.startsWith("\\") || /^[A-Za-z]:/.test(value)) fail(`${label} is not a relative path`);
  const parts = value.replaceAll("\\", "/").split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) fail(`${label} contains an unsafe segment`);
  if (extension && !value.toLowerCase().endsWith(extension)) fail(`${label} does not end in ${extension}`);
  return parts.join("/");
}

export function inside(root, relativePath, label) {
  const normalizedRoot = resolve(root);
  const candidate = resolve(normalizedRoot, safeRelativePath(relativePath, label));
  if (candidate !== normalizedRoot && !candidate.startsWith(`${normalizedRoot}${sep}`)) fail(`${label} escapes its root`);
  return candidate;
}

function canonicalCatalogBytes(catalogPath) {
  const raw = existsSync(catalogPath) ? readFileSync(catalogPath) : null;
  const directory = dirname(catalogPath);
  const prefix = `${basename(catalogPath)}.b64.part-`;
  const chunks = existsSync(directory) ? readdirSync(directory).filter((name) => name.startsWith(prefix)).sort() : [];
  const encoded = chunks.length ? chunks.map((name) => readFileSync(join(directory, name), "utf8")).join("") : "";
  if (encoded && (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) || encoded.length % 4 !== 0)) fail("catalog chunks are not canonical base64");
  const decoded = encoded ? Buffer.from(encoded, "base64") : null;
  if (decoded && decoded.toString("base64") !== encoded) fail("catalog chunks do not round-trip canonically");
  return { raw, decoded };
}

export function readCatalog({ catalogPath, summaryPath, enforceExact = true }) {
  const summaryBytes = readFileSync(summaryPath);
  const summary = JSON.parse(summaryBytes.toString("utf8"));
  if (!SHA256.test(summary.catalog_gzip_sha256 ?? "")) fail("catalog summary digest is invalid");
  const candidates = canonicalCatalogBytes(catalogPath);
  const bytes = [candidates.raw, candidates.decoded].find((candidate) => candidate && sha256(candidate) === summary.catalog_gzip_sha256);
  if (!bytes) fail("no catalog source matches the summary digest");
  const uncompressed = gunzipSync(bytes);
  if (bytes.length !== summary.catalog_gzip_bytes || sha256(bytes) !== summary.catalog_gzip_sha256) fail("catalog gzip evidence differs from summary");
  if (uncompressed.length !== summary.catalog_uncompressed_bytes || sha256(uncompressed) !== summary.catalog_uncompressed_sha256) fail("catalog payload evidence differs from summary");
  const catalog = JSON.parse(uncompressed.toString("utf8"));
  if (catalog.catalog_revision !== summary.catalog_revision) fail("catalog revision differs from summary");
  if (enforceExact && catalog.catalog_revision !== EXPECTED_CATALOG_REVISION) fail("catalog revision is not the approved v1.2 revision");
  if (!Array.isArray(catalog.cards) || catalog.cards.length !== summary.counts?.total_cards) fail("catalog card count differs from summary");
  if (!Array.isArray(catalog.source_archives) || catalog.source_archives.length !== summary.counts?.source_archives) fail("catalog archive count differs from summary");
  return { catalog, summary, catalogGzipSha256: sha256(bytes) };
}

export function readArchiveManifest(path, { enforceExact = true } = {}) {
  const bytes = readFileSync(path);
  const digest = sha256(bytes);
  if (enforceExact && digest !== EXPECTED_ARCHIVE_MANIFEST_SHA256) fail("supplied archive manifest digest is not the approved v1.2 digest");
  const manifest = JSON.parse(bytes.toString("utf8"));
  const legalPublisher = typeof manifest.publisher === "string" ? manifest.publisher : manifest.publisher?.legal_name;
  if (manifest.schema_version !== "1.0" || legalPublisher !== "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" || !Array.isArray(manifest.archives)) fail("supplied archive manifest contract is invalid");
  if (enforceExact && manifest.archives.length !== EXPECTED_ARCHIVE_COUNT) fail("supplied archive manifest does not contain the exact 15 archives");
  const names = new Set();
  for (const archive of manifest.archives) {
    if (!archive || typeof archive !== "object" || basename(archive.filename ?? "") !== archive.filename || !archive.filename.endsWith(".zip") || !Number.isSafeInteger(archive.bytes) || archive.bytes <= 0 || !SHA256.test(archive.sha256 ?? "")) fail("supplied archive manifest contains an invalid archive record");
    if (names.has(archive.filename)) fail("supplied archive manifest contains a duplicate filename");
    names.add(archive.filename);
  }
  return { manifest, digest };
}

export function releaseRecords(catalog, archiveManifest, { enforceExact = true } = {}) {
  const archives = new Map(archiveManifest.archives.map((archive) => [archive.filename, archive]));
  const catalogArchives = new Map(catalog.source_archives.map((archive) => [archive.filename, archive]));
  if (archives.size !== catalogArchives.size) fail("catalog and supplied archive manifest counts differ");
  for (const [filename, archive] of archives) {
    const catalogArchive = catalogArchives.get(filename);
    if (!catalogArchive || catalogArchive.bytes !== archive.bytes || catalogArchive.sha256 !== archive.sha256) fail("catalog archive evidence differs from supplied archive manifest");
  }
  const cards = catalog.cards.filter((card) => card.product_type !== "collection" && card.product_type !== "bundle");
  if (enforceExact && cards.length !== EXPECTED_PRODUCT_COUNT) fail("catalog does not contain the exact 11,390 sellable products");
  const productIds = new Set();
  const objectKeys = new Set();
  return cards.map((card) => {
    const artifact = card.artifact;
    const archive = artifact && archives.get(artifact.source_archive);
    const objectKey = safeRelativePath(artifact?.deployment_key, "artifact deployment key", ".zip");
    const nestedMember = safeRelativePath(artifact?.nested_member, "artifact nested member", ".zip");
    if (!archive || artifact.source_archive_sha256 !== archive.sha256 || !SHA256.test(artifact.sha256 ?? "") || !Number.isSafeInteger(artifact.bytes) || artifact.bytes <= 0 || artifact.media_type !== "application/zip") fail("catalog product has incomplete artifact evidence");
    if (!DELIVERY_OBJECT_KEY.test(objectKey) || !DELIVERY_FILENAME.test(artifact.filename ?? "") || basename(artifact.filename ?? "") !== artifact.filename || basename(objectKey) !== artifact.filename) fail("catalog product artifact filename is inconsistent with the delivery contract");
    if (typeof card.product_id !== "string" || !card.product_id || productIds.has(card.product_id) || objectKeys.has(objectKey)) fail("catalog product or deployment key is invalid or duplicated");
    const profile = card.install?.profile;
    if (!INSTALL_PROFILES.has(profile)) fail("catalog product install profile is unsupported");
    if (typeof card.version !== "string" || !VERSION.test(card.version)) fail("catalog product version is invalid");
    productIds.add(card.product_id);
    objectKeys.add(objectKey);
    return Object.freeze({
      productId: card.product_id,
      objectKey,
      nestedMember,
      artifactFile: artifact.filename,
      artifactSha256: artifact.sha256,
      byteLength: artifact.bytes,
      mediaType: "application/zip",
      installProfile: profile,
      version: card.version,
      sourceArchive: archive.filename,
      sourceArchiveSha256: archive.sha256,
      sourceArchiveBytes: archive.bytes,
    });
  }).sort((left, right) => left.productId.localeCompare(right.productId));
}

export async function verifyArchiveFiles(archiveManifest, archiveDirectory) {
  const verified = new Map();
  for (const archive of archiveManifest.archives) {
    const path = join(resolve(archiveDirectory), archive.filename);
    if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size !== archive.bytes || await sha256File(path) !== archive.sha256) fail(`source archive verification failed for ${archive.filename}`);
    verified.set(archive.filename, path);
  }
  return verified;
}

function writeJsonAtomic(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temp, path);
}

function inspectZip(archivePath) {
  const output = execFileSync("unzip", ["-Z1", archivePath], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  for (const member of output.split(/\r?\n/).filter(Boolean)) {
    const normalized = member.endsWith("/") ? member.slice(0, -1) : member;
    if (normalized) safeRelativePath(normalized, "source ZIP member");
  }
}

export async function materializeArtifacts({ records, archives, outputDirectory, workDirectory, checkpointPath, revision, verifiedAt }) {
  if (revision !== EXPECTED_CATALOG_REVISION) fail("materialization revision is not approved");
  if (!ISO_INSTANT.test(verifiedAt) || !Number.isFinite(Date.parse(verifiedAt))) fail("materialization verifiedAt is invalid");
  const output = resolve(outputDirectory);
  const work = resolve(workDirectory);
  mkdirSync(output, { recursive: true });
  mkdirSync(work, { recursive: true });
  const products = {};
  let reused = 0;
  let written = 0;
  for (const archiveName of [...new Set(records.map((record) => record.sourceArchive))].sort()) {
    const archiveRecords = records.filter((record) => record.sourceArchive === archiveName);
    const archivePath = archives.get(archiveName);
    if (!archivePath) fail(`verified archive is unavailable for ${archiveName}`);
    const pending = [];
    for (const record of archiveRecords) {
      const target = inside(output, record.objectKey, "artifact output path");
      if (existsSync(target) && statSync(target).size === record.byteLength && await sha256File(target) === record.artifactSha256) reused += 1;
      else pending.push(record);
    }
    let extractedRoot = null;
    if (pending.length) {
      extractedRoot = join(work, recordSafeDirectory(archiveRecords[0].sourceArchiveSha256));
      const marker = join(extractedRoot, ".verified-archive.json");
      let markerValid = false;
      try { const value = JSON.parse(readFileSync(marker, "utf8")); markerValid = value.sha256 === archiveRecords[0].sourceArchiveSha256 && value.bytes === archiveRecords[0].sourceArchiveBytes; } catch {}
      if (!markerValid) {
        rmSync(extractedRoot, { recursive: true, force: true });
        mkdirSync(extractedRoot, { recursive: true });
        inspectZip(archivePath);
        execFileSync("unzip", ["-qq", "-o", archivePath, "-d", extractedRoot], { stdio: ["ignore", "ignore", "pipe"], maxBuffer: 64 * 1024 * 1024 });
        writeJsonAtomic(marker, { sha256: archiveRecords[0].sourceArchiveSha256, bytes: archiveRecords[0].sourceArchiveBytes });
      }
      for (const record of pending) {
        const source = inside(extractedRoot, record.nestedMember, "artifact source member");
        if (!existsSync(source) || !statSync(source).isFile() || statSync(source).size !== record.byteLength || await sha256File(source) !== record.artifactSha256) fail(`materialized bytes failed integrity for ${record.productId}`);
        const target = inside(output, record.objectKey, "artifact output path");
        mkdirSync(dirname(target), { recursive: true });
        const temporary = `${target}.${process.pid}.tmp`;
        copyFileSync(source, temporary);
        if (statSync(temporary).size !== record.byteLength || await sha256File(temporary) !== record.artifactSha256) fail(`copied bytes failed integrity for ${record.productId}`);
        renameSync(temporary, target);
        written += 1;
      }
    }
    writeJsonAtomic(checkpointPath, { contract: "obserra-marketplace-v12-artifact-checkpoint-v1", revision, completedProducts: written + reused, requiredProducts: records.length, lastArchiveSha256: archiveRecords[0].sourceArchiveSha256 });
  }
  for (const record of records) products[record.productId] = { objectKey: record.objectKey, artifactFile: record.artifactFile, artifactSha256: record.artifactSha256, byteLength: record.byteLength, mediaType: record.mediaType, installProfile: record.installProfile, version: record.version, verifiedAt };
  return { deliveryCatalog: { revision, products }, reused, written };
}

function recordSafeDirectory(sha) {
  if (!SHA256.test(sha)) fail("archive cache identity is invalid");
  return `archive-${sha}`;
}

export function validateDeliveryCatalog(deliveryCatalog, records, revision) {
  if (deliveryCatalog?.revision !== revision || !deliveryCatalog.products || Array.isArray(deliveryCatalog.products) || Object.keys(deliveryCatalog.products).length !== records.length) fail("delivery catalog identity or product count is invalid");
  for (const record of records) {
    const release = deliveryCatalog.products[record.productId];
    if (!release || release.objectKey !== record.objectKey || release.artifactFile !== record.artifactFile || release.artifactSha256 !== record.artifactSha256 || release.byteLength !== record.byteLength || release.mediaType !== record.mediaType || release.installProfile !== record.installProfile || release.version !== record.version || !ISO_INSTANT.test(release.verifiedAt ?? "")) fail(`delivery catalog differs from artifact evidence for ${record.productId}`);
  }
  return true;
}

export function parseArguments(argv, allowed) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--") || !allowed.has(key)) fail(`unknown argument ${key}`);
    if (key === "--activate") { values.activate = true; continue; }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) fail(`${key} requires a value`);
    values[key.slice(2)] = value;
    index += 1;
  }
  return values;
}
