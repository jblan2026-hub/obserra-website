import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const stagingRoot = path.resolve(process.argv[2] || path.join(repoRoot, "release", "application-production"));
const catalogPath = path.join(stagingRoot, "release-catalog.json");
const forbiddenArtifactExtensions = new Set([
  ".exe",
  ".msi",
  ".dmg",
  ".pkg",
  ".appx",
  ".msix",
  ".deb",
  ".rpm",
  ".zip",
  ".tar",
  ".gz",
  ".tgz",
  ".jar",
  ".war",
  ".whl",
]);

function fail(message) {
  throw new Error(`[Application Staging] ${message}`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function contained(root, candidate) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

if (!fs.existsSync(catalogPath)) fail(`Missing release catalog: ${catalogPath}`);
const catalog = readJson(catalogPath);
if (!Array.isArray(catalog.applications) || catalog.applications.length === 0) {
  fail("The staging catalog must contain at least one application.");
}

const seenSlugs = new Set();
const seenNames = new Set();
for (const application of catalog.applications) {
  const slug = application?.product?.slug;
  const name = application?.product?.name;
  const version = application?.release?.version;
  const artifactStatus = application?.release?.artifactStatus;
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail("Every application requires a canonical lowercase slug.");
  }
  if (typeof name !== "string" || !name.trim()) fail(`${slug}: product name is required.`);
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    fail(`${slug}: release version must be semantic.`);
  }
  if (artifactStatus !== "awaiting-signed-artifact") {
    fail(`${slug}: staging must remain awaiting-signed-artifact.`);
  }
  if (seenSlugs.has(slug) || seenNames.has(name)) fail(`${slug}: duplicate application identity.`);
  seenSlugs.add(slug);
  seenNames.add(name);

  const finalDir = path.join(stagingRoot, name, "FINAL");
  if (!contained(stagingRoot, finalDir) || !fs.existsSync(finalDir)) {
    fail(`${slug}: controlled FINAL directory is missing.`);
  }
  const manifestPath = path.join(finalDir, "release-manifest.json");
  if (!fs.existsSync(manifestPath)) fail(`${slug}: release-manifest.json is missing.`);
  const manifest = readJson(manifestPath);
  if (manifest?.product?.slug !== slug || manifest?.product?.name !== name) {
    fail(`${slug}: catalog and manifest identities do not match.`);
  }
  if (manifest?.release?.version !== version || manifest?.release?.artifactStatus !== artifactStatus) {
    fail(`${slug}: catalog and manifest release boundaries do not match.`);
  }

  const requiredGovernanceFiles = [
    "README.md",
    "RELEASE-CHECKLIST.md",
    "SUBSCRIPTION-POLICY.md",
    "DEPLOYMENT-PROFILE.md",
  ];
  for (const required of requiredGovernanceFiles) {
    if (!fs.existsSync(path.join(finalDir, required))) {
      fail(`${slug}: required staging governance file is missing: ${required}.`);
    }
  }

  for (const entry of fs.readdirSync(finalDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (forbiddenArtifactExtensions.has(extension)) {
      fail(`${slug}: unsigned or unapproved distributable artifact found in staging: ${entry.name}.`);
    }
  }
}

const marketplaceSource = fs.readFileSync(path.join(repoRoot, "app", "apps", "appsData.ts"), "utf8");
for (const slug of seenSlugs) {
  if (!marketplaceSource.includes(`slug: "${slug}"`)) {
    fail(`${slug}: staging application is absent from the governed marketplace catalog.`);
  }
}

console.log(
  `[Application Staging] Validated ${catalog.applications.length} governed staging application records with no distributable artifacts or false production claims.`,
);
