import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultReleaseRoot = "C:\\Users\\jblan\\OneDrive\\Desktop\\Final Production Release Apps";
const releaseRoot = path.resolve(process.argv[2] || defaultReleaseRoot);
const outputPath = path.join(repoRoot, "app", "apps", "commerce-catalog.json");

function fail(message) {
  console.error(`[Obserra Commerce Enricher] ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function normalizeMissionIds(manifest) {
  const explicit = manifest?.marketplace?.missions;
  if (Array.isArray(explicit) && explicit.length) return [...new Set(explicit.map(String))];

  const category = String(manifest?.product?.category || "").toLowerCase();
  const text = [
    manifest?.product?.name,
    manifest?.product?.description,
    ...(manifest?.product?.features || []),
  ].join(" ").toLowerCase();

  const missions = [];
  if (/risk|control|compliance|governance|evidence/.test(text) || category === "grc") missions.push("enterprise-risk");
  if (/decision|intelligence|executive|dashboard/.test(text) || category === "intelligence") missions.push("decision-intelligence");
  if (/\bai\b|model|prompt|algorithm/.test(text) || category === "ai governance") missions.push("secure-ai");
  if (/identity|access|certification|workforce/.test(text) || category === "identity") missions.push("identity");
  if (/cyber|security|vulnerability|incident|resilience/.test(text) || category === "cybersecurity") missions.push("cyber-resilience");
  if (/executive protection|travel risk|protective|threat/.test(text) || category === "executive protection") missions.push("executive-protection");
  return [...new Set(missions.length ? missions : ["enterprise-risk"])];
}

if (!fs.existsSync(releaseRoot)) fail(`Release root not found: ${releaseRoot}`);

const products = [];
for (const entry of fs.readdirSync(releaseRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const manifestPath = path.join(releaseRoot, entry.name, "FINAL", "release-manifest.json");
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = readJson(manifestPath);
  const slug = manifest?.product?.slug;
  const name = manifest?.product?.name;
  const version = manifest?.release?.version;
  if (!slug || !name || !version) fail(`${manifestPath} must define product.slug, product.name, and release.version`);

  const paymentLink = manifest?.commerce?.paymentLink || null;
  const stripePriceId = manifest?.commerce?.stripePriceId || null;
  const launchUrl = manifest?.delivery?.launchUrl || null;
  const purchaseMode = paymentLink ? "payment-link" : stripePriceId ? "stripe-checkout" : "contact-sales";

  products.push({
    slug,
    name,
    version,
    status: manifest?.product?.status || "Available",
    paymentLink,
    stripePriceId,
    launchUrl,
    purchaseMode,
    subscriptionRequired: manifest?.commerce?.subscriptionRequired !== false,
    missions: normalizeMissionIds(manifest),
    featured: manifest?.marketplace?.featured === true,
    collectionIds: manifest?.marketplace?.collections || [],
    updatedAt: new Date().toISOString(),
  });
}

products.sort((a, b) => a.name.localeCompare(b.name));
if (!products.length) fail(`No publishable FINAL releases found under ${releaseRoot}`);

fs.writeFileSync(outputPath, `${JSON.stringify({ schemaVersion: "1.0", generatedAt: new Date().toISOString(), products }, null, 2)}\n`);
console.log(`[Obserra Commerce Enricher] Generated commerce metadata for ${products.length} applications`);
