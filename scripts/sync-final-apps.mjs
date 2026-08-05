import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultReleaseRoot = "C:\\Users\\jblan\\OneDrive\\Desktop\\Final Production Release Apps";
const releaseRoot = path.resolve(process.argv[2] || defaultReleaseRoot);
const catalogPath = path.join(repoRoot, "app", "apps", "store-catalog.json");
const bucket = process.env.OBSERRA_RELEASE_BUCKET;
const dryRun = process.argv.includes("--dry-run");

function fail(message) {
  console.error(`[Obserra Publisher] ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function findArtifact(finalDir, manifest) {
  const configured = manifest?.release?.artifactFile;
  if (configured) {
    const configuredPath = path.join(finalDir, configured);
    if (!fs.existsSync(configuredPath)) fail(`Artifact ${configured} is missing from ${finalDir}`);
    return configuredPath;
  }

  const candidates = fs.readdirSync(finalDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !name.endsWith(".md") && name !== "release-manifest.json" && name !== "checksums.json" && name !== "sbom.json");

  if (candidates.length !== 1) {
    fail(`${finalDir} must contain exactly one distributable artifact or define release.artifactFile in release-manifest.json`);
  }
  return path.join(finalDir, candidates[0]);
}

if (!fs.existsSync(releaseRoot)) fail(`Release root not found: ${releaseRoot}`);

const applications = [];
for (const entry of fs.readdirSync(releaseRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const finalDir = path.join(releaseRoot, entry.name, "FINAL");
  const manifestPath = path.join(finalDir, "release-manifest.json");
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = readJson(manifestPath);
  const slug = manifest?.product?.slug;
  const name = manifest?.product?.name;
  const version = manifest?.release?.version;
  const status = manifest?.product?.status || "Available";
  const category = manifest?.product?.category || "Intelligence";
  if (!slug || !name || !version) fail(`${manifestPath} must define product.slug, product.name, and release.version`);

  const artifactPath = findArtifact(finalDir, manifest);
  const artifactFile = path.basename(artifactPath);
  const objectKey = `${slug}/${version}/${artifactFile}`;

  if (!dryRun) {
    if (!bucket) fail("OBSERRA_RELEASE_BUCKET is required for publishing");
    execFileSync("aws", ["s3", "cp", artifactPath, `s3://${bucket}/${objectKey}`, "--only-show-errors"], { stdio: "inherit" });
  }

  applications.push({
    slug,
    name,
    status,
    category,
    version,
    artifactFile,
    objectKey,
    deployment: manifest?.delivery?.deploymentModels || [],
    pricing: manifest?.commerce?.pricing || "Subscription pricing",
    description: manifest?.product?.description || `${name} commercial application`,
    subscriptionRequired: manifest?.commerce?.subscriptionRequired !== false,
    publishedAt: new Date().toISOString(),
  });
}

applications.sort((a, b) => a.name.localeCompare(b.name));
if (!applications.length) fail(`No publishable FINAL releases found under ${releaseRoot}`);

const catalog = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  releaseRoot,
  applications,
};
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`[Obserra Publisher] Synced ${applications.length} applications to ${catalogPath}`);

if (!dryRun && process.env.OBSERRA_AUTO_GIT_PUSH === "true") {
  execFileSync("git", ["add", "app/apps/store-catalog.json"], { cwd: repoRoot, stdio: "inherit" });
  const status = execFileSync("git", ["status", "--porcelain", "app/apps/store-catalog.json"], { cwd: repoRoot, encoding: "utf8" }).trim();
  if (status) {
    execFileSync("git", ["commit", "-m", `Publish application store catalog (${applications.length} apps)`], { cwd: repoRoot, stdio: "inherit" });
    execFileSync("git", ["push", "origin", "main"], { cwd: repoRoot, stdio: "inherit" });
  }
}
