import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultReleaseRoot = "C:\\Users\\jblan\\OneDrive\\Desktop\\Final Production Release Apps";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const releaseRootArgument = args.find((argument) => !argument.startsWith("--"));
const releaseRoot = path.resolve(releaseRootArgument || defaultReleaseRoot);
const catalogPath = path.join(repoRoot, "app", "apps", "store-catalog.json");
const marketingCatalogPath = path.join(repoRoot, "app", "apps", "marketing-catalog.json");
const appsDataPath = path.join(repoRoot, "app", "apps", "appsData.ts");
const bucket = process.env.OBSERRA_RELEASE_BUCKET;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.obserrallc.com").replace(/\/$/, "");
const generatedStart = "  // OBSERRA GENERATED STORE APPS START";
const generatedEnd = "  // OBSERRA GENERATED STORE APPS END";
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

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

function resolveInside(directory, relativePath, label) {
  const resolvedDirectory = path.resolve(directory);
  const resolved = path.resolve(resolvedDirectory, relativePath);
  const relation = path.relative(resolvedDirectory, resolved);
  if (!relation || relation.startsWith("..") || path.isAbsolute(relation)) {
    fail(`${label} must resolve to a file inside ${resolvedDirectory}`);
  }
  return resolved;
}

function findArtifact(finalDir, manifest) {
  const configured = manifest?.release?.artifactFile;
  if (configured) {
    const configuredPath = resolveInside(finalDir, String(configured), "release.artifactFile");
    if (!fs.existsSync(configuredPath) || !fs.statSync(configuredPath).isFile()) {
      fail(`Artifact ${configured} is missing from ${finalDir}`);
    }
    return configuredPath;
  }

  const candidates = fs.readdirSync(finalDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !name.endsWith(".md") && ![
      "release-manifest.json",
      "checksums.json",
      "sbom.json",
    ].includes(name));

  if (candidates.length !== 1) {
    fail(`${finalDir} must contain exactly one distributable artifact or define release.artifactFile`);
  }
  return path.join(finalDir, candidates[0]);
}

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  const descriptor = fs.openSync(filePath, "r");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    while (true) {
      const bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      hash.update(buffer.subarray(0, bytesRead));
    }
  } finally {
    fs.closeSync(descriptor);
  }
  return hash.digest("hex");
}

function normalizedSha256(value, label) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!SHA256_PATTERN.test(normalized)) fail(`${label} must be a 64-character SHA-256 digest`);
  return normalized;
}

function checksumEntries(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["files", "artifacts", "entries", "checksums"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      return Object.entries(value).map(([file, digest]) => ({ file, sha256: digest }));
    }
  }
  return Object.entries(payload).map(([file, digest]) => ({ file, sha256: digest }));
}

function expectedArtifactSha256(finalDir, manifest, artifactFile) {
  const manifestDigest = manifest?.release?.artifactSha256 || manifest?.release?.sha256 || null;
  const checksumPath = path.join(finalDir, "checksums.json");
  let checksumDigest = null;

  if (fs.existsSync(checksumPath)) {
    const entries = checksumEntries(readJson(checksumPath));
    const entry = entries.find((item) => {
      const file = item && typeof item === "object"
        ? item.file || item.path || item.name || item.artifactFile
        : null;
      return file && path.basename(String(file)) === artifactFile;
    });
    if (!entry) fail(`checksums.json does not contain an entry for ${artifactFile}`);
    checksumDigest = entry.sha256 || entry.sha256sum || entry.hash || entry.digest;
  }

  if (!manifestDigest && !checksumDigest) {
    fail(`${artifactFile} requires release.artifactSha256 or a checksums.json SHA-256 entry before publication`);
  }

  const normalizedManifestDigest = manifestDigest
    ? normalizedSha256(manifestDigest, "release.artifactSha256")
    : null;
  const normalizedChecksumDigest = checksumDigest
    ? normalizedSha256(checksumDigest, `checksums.json entry for ${artifactFile}`)
    : null;

  if (
    normalizedManifestDigest
    && normalizedChecksumDigest
    && normalizedManifestDigest !== normalizedChecksumDigest
  ) {
    fail(`Manifest and checksums.json disagree for ${artifactFile}`);
  }

  return normalizedManifestDigest || normalizedChecksumDigest;
}

function verifyArtifactIntegrity(finalDir, manifest, artifactPath) {
  const artifactFile = path.basename(artifactPath);
  const expected = expectedArtifactSha256(finalDir, manifest, artifactFile);
  const actual = sha256File(artifactPath);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  if (
    expectedBuffer.length !== actualBuffer.length
    || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    fail(`SHA-256 verification failed for ${artifactFile}: expected ${expected}, received ${actual}`);
  }
  return actual;
}

function quote(value) {
  return JSON.stringify(String(value));
}

function array(values) {
  return `[${(values || []).map(quote).join(", ")}]`;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function trackedUrl(slug, channel, campaign) {
  const url = new URL(`/apps/${slug}`, siteUrl);
  url.searchParams.set("utm_source", channel);
  url.searchParams.set("utm_medium", "paid-social");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", slug);
  return url.toString();
}

function buildMarketingRecord(application, manifest) {
  const marketing = manifest?.marketing || {};
  const campaign = slugify(marketing.campaign || `${application.slug}-${application.version}-launch`);
  const audiences = marketing.audiences || ["Enterprise executives", "CIO and CISO leaders", "Risk and compliance teams"];
  const headline = marketing.headline || `${application.name}: enterprise intelligence built for decisive action`;
  const shortDescription = marketing.shortDescription || application.description;
  const callToAction = marketing.callToAction || "Request a demonstration";
  const keywords = marketing.keywords || [application.name, application.category, "enterprise SaaS", "executive intelligence"];
  const channels = marketing.channels || ["linkedin", "google", "microsoft", "x", "email"];

  return {
    slug: application.slug,
    productName: application.name,
    version: application.version,
    campaign,
    status: marketing.status || "ready-for-review",
    headline,
    shortDescription,
    longDescription: marketing.longDescription || application.description,
    callToAction,
    audiences,
    keywords,
    channels,
    creativeAssets: marketing.creativeAssets || [],
    landingPage: `${siteUrl}/apps/${application.slug}`,
    trackingLinks: Object.fromEntries(channels.map((channel) => [channel, trackedUrl(application.slug, channel, campaign)])),
    adCopy: {
      linkedin: marketing.adCopy?.linkedin || `${headline}. ${shortDescription} ${callToAction}.`,
      search: marketing.adCopy?.search || `${application.name} | ${shortDescription}`,
      social: marketing.adCopy?.social || `${headline} ${callToAction}.`,
      emailSubject: marketing.adCopy?.emailSubject || `Introducing ${application.name}`,
      emailPreview: marketing.adCopy?.emailPreview || shortDescription,
    },
    governance: {
      approvalRequired: marketing.approvalRequired !== false,
      approvedBy: marketing.approvedBy || null,
      approvedAt: marketing.approvedAt || null,
      claimsReviewed: marketing.claimsReviewed === true,
    },
  };
}

function updateMarketplaceData(applications) {
  let source = fs.readFileSync(appsDataPath, "utf8");
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blockPattern = new RegExp(`\\n${escape(generatedStart)}[\\s\\S]*?${escape(generatedEnd)}\\n`, "g");
  source = source.replace(blockPattern, "\n");

  const existingSlugs = new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]));
  const additions = applications.filter((app) => !existingSlugs.has(app.slug));
  if (!additions.length) {
    fs.writeFileSync(appsDataPath, source);
    return;
  }

  const records = additions.map((app) => `  {\n    slug: ${quote(app.slug)},\n    name: ${quote(app.name)},\n    status: ${quote(app.status)},\n    category: ${quote(app.category)},\n    value: ${quote(app.description)},\n    features: ${array(app.features || ["Subscription-controlled access", "Secure release delivery", `Published release ${app.version}`])},\n    integrations: ${array(app.integrations || [])},\n    deployment: ${array(app.deployment)},\n    pricing: ${quote(app.pricing)},\n    documentation: ${array(app.documentation || ["Release notes", "Deployment guide", "Customer support"])},\n    faq: [{ q: "How is access provided?", a: "Purchase through the Obserra store. Active subscriptions receive portal access, a subscription-bound key, and authorized downloads." }],\n  }`).join(",\n");

  const insertion = `\n${generatedStart}\n${records},\n${generatedEnd}\n`;
  const anchor = "\n];\n\nexport const appCategories";
  if (!source.includes(anchor)) fail("Could not locate marketplaceApps closing anchor in appsData.ts");
  source = source.replace(anchor, `${insertion}];\n\nexport const appCategories`);
  fs.writeFileSync(appsDataPath, source);
}

if (!fs.existsSync(releaseRoot)) fail(`Release root not found: ${releaseRoot}`);

const applications = [];
const marketingCampaigns = [];
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
  const artifactSha256 = verifyArtifactIntegrity(finalDir, manifest, artifactPath);
  const objectKey = `${slug}/${version}/${artifactFile}`;

  if (!dryRun) {
    if (!bucket) fail("OBSERRA_RELEASE_BUCKET is required for publishing");
    execFileSync("aws", ["s3", "cp", artifactPath, `s3://${bucket}/${objectKey}`, "--only-show-errors"], { stdio: "inherit" });
  }

  const application = {
    slug,
    name,
    status,
    category,
    version,
    artifactFile,
    artifactSha256,
    objectKey,
    deployment: manifest?.delivery?.deploymentModels || ["SaaS"],
    pricing: manifest?.commerce?.pricing || "Subscription pricing",
    description: manifest?.product?.description || `${name} commercial application`,
    features: manifest?.product?.features || [],
    integrations: manifest?.product?.integrations || [],
    documentation: manifest?.product?.documentation || [],
    subscriptionRequired: manifest?.commerce?.subscriptionRequired !== false,
    publishedAt: new Date().toISOString(),
  };

  applications.push(application);
  marketingCampaigns.push(buildMarketingRecord(application, manifest));
}

applications.sort((a, b) => a.name.localeCompare(b.name));
marketingCampaigns.sort((a, b) => a.productName.localeCompare(b.productName));
if (!applications.length) fail(`No publishable FINAL releases found under ${releaseRoot}`);

const generatedAt = new Date().toISOString();
fs.writeFileSync(catalogPath, `${JSON.stringify({ schemaVersion: "1.2", generatedAt, releaseRoot, applications }, null, 2)}\n`);
fs.writeFileSync(marketingCatalogPath, `${JSON.stringify({ schemaVersion: "1.0", generatedAt, campaigns: marketingCampaigns }, null, 2)}\n`);
updateMarketplaceData(applications);
console.log(`[Obserra Publisher] Synced ${applications.length} integrity-verified applications and ${marketingCampaigns.length} governed marketing campaign packs${dryRun ? " in dry-run mode" : ""}`);

if (!dryRun && process.env.OBSERRA_MARKETING_WEBHOOK_URL) {
  const response = await fetch(process.env.OBSERRA_MARKETING_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.OBSERRA_MARKETING_WEBHOOK_TOKEN ? { authorization: `Bearer ${process.env.OBSERRA_MARKETING_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({ generatedAt, campaigns: marketingCampaigns.filter((campaign) => campaign.governance.approvedAt) }),
  });
  if (!response.ok) fail(`Marketing webhook failed with status ${response.status}`);
}

if (!dryRun && process.env.OBSERRA_AUTO_GIT_PUSH === "true") {
  const generatedFiles = ["app/apps/store-catalog.json", "app/apps/marketing-catalog.json", "app/apps/appsData.ts"];
  execFileSync("git", ["add", ...generatedFiles], { cwd: repoRoot, stdio: "inherit" });
  const gitStatus = execFileSync("git", ["status", "--porcelain", ...generatedFiles], { cwd: repoRoot, encoding: "utf8" }).trim();
  if (gitStatus) {
    execFileSync("git", ["commit", "-m", `Publish integrity-verified SaaS catalog and campaign packs (${applications.length} apps)`], { cwd: repoRoot, stdio: "inherit" });
    execFileSync("git", ["push", "origin", "main"], { cwd: repoRoot, stdio: "inherit" });
  }
}
