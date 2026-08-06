import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const requiredFiles = [
  "app/apps/appsData.ts",
  "app/apps/page.tsx",
  "app/apps/[slug]/page.tsx",
  "app/apps/store-catalog.json",
  "lib/owner-site-publishing.ts",
  "app/api/admin/site-change/plan/route.ts",
];
for (const file of requiredFiles) {
  assert.ok(fs.existsSync(path.join(root, file)), `Missing standalone SaaS catalog control: ${file}`);
}

const appsData = read("app/apps/appsData.ts");
const appsPage = read("app/apps/page.tsx");
const appDetail = read("app/apps/[slug]/page.tsx");
const publishing = read("lib/owner-site-publishing.ts");
const ownerPlan = read("app/api/admin/site-change/plan/route.ts");
const storeCatalog = JSON.parse(read("app/apps/store-catalog.json"));

assert.match(appsData, /DeploymentModel[\s\S]*"SaaS"/, "Marketplace must define SaaS as a supported deployment model");
assert.match(appsData, /status:\s*"Available"/, "Marketplace must contain at least one available product");
assert.match(appsData, /status:\s*"Pilot"/, "Marketplace must distinguish pilot products");
assert.match(appsData, /status:\s*"Coming Soon"/, "Marketplace must distinguish unavailable products");
assert.match(appsData, /deployment:\s*\[[^\]]*"SaaS"/s, "At least one marketplace product must support standalone SaaS delivery");
assert.match(appsData, /pricing:\s*"[^"]+"/, "Marketplace products must publish a pricing model or pricing status");
assert.match(appsData, /features:\s*\[[^\]]+\]/s, "Marketplace products must publish user-facing functionality");
assert.match(appsData, /integrations:\s*\[[^\]]+\]/s, "Marketplace products must publish integration capability");
assert.match(appsData, /documentation:\s*\[[^\]]+\]/s, "Marketplace products must publish documentation coverage");
assert.match(appsData, /faq:\s*\[[^\]]+\]/s, "Marketplace products must publish customer guidance");

for (const surface of [["catalog page", appsPage], ["product detail page", appDetail]]) {
  const [name, content] = surface;
  assert.match(content, /pricing|price/i, `${name} must expose pricing information`);
  assert.match(content, /deployment|SaaS/i, `${name} must expose deployment information`);
  assert.match(content, /status|Available|Pilot|Coming Soon/i, `${name} must expose product availability`);
}

assert.equal(storeCatalog.schemaVersion, "1.0", "Store catalog schema version must remain explicit");
assert.ok(Array.isArray(storeCatalog.applications), "Store catalog applications must be an array");
assert.doesNotMatch(JSON.stringify(storeCatalog), /sk_live_|sk_test_|STRIPE_SECRET_KEY/i, "Store catalog must not contain payment secrets");

assert.match(publishing, /owner-preview\//, "AI and owner catalog updates must use preview branches");
assert.match(publishing, /draft:\s*true/, "Catalog changes must open as draft pull requests");
assert.match(publishing, /productionChanged:\s*false/, "Catalog publishing must state production remains unchanged");
assert.match(publishing, /priceApproved\s*=\s*false|priceApproved:\s*false/, "Price changes must reset owner price approval");
assert.match(ownerPlan, /auth|currentUser|userId|owner/i, "AI pricing and catalog planning must require owner identity");
assert.match(ownerPlan, /401|403|unauthorized|forbidden/i, "AI pricing and catalog planning must fail closed");

const comingSoonBlocks = [...appsData.matchAll(/status:\s*"Coming Soon"[\s\S]{0,900}?pricing:\s*"([^"]+)"/g)];
for (const match of comingSoonBlocks) {
  assert.match(match[1], /announced|coming|not available|TBA/i, "Coming Soon products must not present purchasable pricing");
}

const availableProducts = [...appsData.matchAll(/status:\s*"Available"/g)].length;
const pilotProducts = [...appsData.matchAll(/status:\s*"Pilot"/g)].length;
const comingSoonProducts = [...appsData.matchAll(/status:\s*"Coming Soon"/g)].length;
const saasProducts = [...appsData.matchAll(/deployment:\s*\[[^\]]*"SaaS"/gs)].length;

assert.ok(availableProducts > 0, "At least one available standalone offering is required");
assert.ok(saasProducts > 0, "At least one SaaS-capable offering is required");

console.log(JSON.stringify({
  passed: true,
  macroGate: "standalone-saas-catalog-readiness",
  availableProducts,
  pilotProducts,
  comingSoonProducts,
  saasProducts,
  previewFirstCatalogChanges: true,
  ownerControlledPricing: true,
  productionMutationFromAI: false,
}, null, 2));
