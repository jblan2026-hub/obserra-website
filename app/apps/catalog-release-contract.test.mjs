import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const appsRoot = dirname(fileURLToPath(import.meta.url));
const thisTest = fileURLToPath(import.meta.url);

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    if (absolute === thisTest) return [];
    if (![".ts", ".tsx", ".json"].includes(extname(entry.name))) return [];
    return [absolute];
  }));
  return files.flat();
}

async function allReleaseSources() {
  const files = await sourceFiles(appsRoot);
  return Promise.all(files.map(async (file) => ({ file, content: await readFile(file, "utf8") })));
}

test("the reviewed catalog contains the seven canonical Obserra products", async () => {
  const data = await readFile(join(appsRoot, "appsData.ts"), "utf8");
  const productBlock = data.slice(data.indexOf("export const marketplaceApps"), data.indexOf("export const roadmapConcepts"));
  const expected = [
    "Obserra Crisis Commander",
    "Obserra Control Intelligence",
    "Obserra EU CRA Governance",
    "Obserra EIOS",
    "Obserra Offboarding Orchestrator",
    "Obserra Agentic AI Security",
    "Obserra Academy Production Studio",
  ];

  for (const name of expected) assert.match(productBlock, new RegExp(`name: "${name}"`));
  assert.equal((productBlock.match(/reviewedProduct\(\{/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/status: "Coming Soon"/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/features: \[[^\]]+\]/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/integrations: \[[^\]]+\]/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/deployment: \["On-Premises"\]/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/Demo: state\(/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/Live: state\(/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/mode\("Local \/ on-prem"/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/mode\("SaaS"/g) ?? []).length, expected.length);
  assert.equal((productBlock.match(/mode\("Outbound tenant agent"/g) ?? []).length, expected.length);

  const marketPattern = /slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"[\s\S]*?features:\s*\[([^\]]*)\][\s\S]*?integrations:\s*\[([^\]]*)\][\s\S]*?deployment:\s*\[([^\]]*)\]/g;
  const marketRecords = [...productBlock.matchAll(marketPattern)];
  assert.equal(marketRecords.length, expected.length);
  assert.deepEqual(marketRecords.map((record) => record[2]), expected);
  assert.equal(marketRecords.find((record) => record[1] === "obserra-academy-production-studio")?.[4], "Operations");
  for (const record of marketRecords) {
    assert.equal(record[3], "Coming Soon");
    assert.match(record[5], /"[^"]+"/);
    assert.match(record[6], /"[^"]+"/);
    assert.equal(record[7].trim(), '"On-Premises"');
  }
});

test("roadmap concepts cannot be mistaken for released products", async () => {
  const data = await readFile(join(appsRoot, "appsData.ts"), "utf8");
  const productBlock = data.slice(data.indexOf("export const marketplaceApps"), data.indexOf("export const roadmapConcepts"));
  const roadmapStart = data.indexOf("export const roadmapConcepts");
  const roadmapBlock = data.slice(roadmapStart, data.indexOf("\n];", roadmapStart) + 3);

  for (const concept of ["Asset Intelligence", "Cyber Risk Register"]) {
    assert.doesNotMatch(productBlock, new RegExp(`name: "${concept}"`));
    assert.match(roadmapBlock, new RegExp(`name: "${concept}"`));
  }
  assert.equal((roadmapBlock.match(/name:/g) ?? []).length, 14);
  assert.doesNotMatch(roadmapBlock, /slug:|actions:|href:/);
});

test("customer availability remains fail-closed without exact release evidence", async () => {
  const data = await readFile(join(appsRoot, "appsData.ts"), "utf8");
  const storefront = await readFile(join(appsRoot, "storefront.ts"), "utf8");
  const commerce = await readFile(join(appsRoot, "commerce.ts"), "utf8");
  const storeCatalog = JSON.parse(await readFile(join(appsRoot, "store-catalog.json"), "utf8"));
  const marketingCatalog = JSON.parse(await readFile(join(appsRoot, "marketing-catalog.json"), "utf8"));

  assert.match(data, /status: "Coming Soon"/);
  assert.match(data, /actions: \[\]/);
  assert.match(data, /deployment: \[\]/);
  const adapter = data.slice(data.indexOf("function reviewedProduct"), data.indexOf("const optionalEios"));
  for (const runtimeOverride of ["features: product.focusAreas", "integrations: product.integrationReview", "deployment: []"]) {
    assert.ok(adapter.indexOf("...product") < adapter.indexOf(runtimeOverride));
  }
  assert.match(commerce, /app\.actions\.some\(\(action\) => action\.kind === "Subscribe"\)/);
  assert.doesNotMatch(storefront, /rawStoreCatalog|generatedApps|entry\.deployment|entry\.status/);
  assert.deepEqual(storeCatalog.applications, []);
  assert.deepEqual(marketingCatalog.campaigns, []);
});

test("product-specific evidence does not overstate operating verification", async () => {
  const data = await readFile(join(appsRoot, "appsData.ts"), "utf8");
  const client = await readFile(join(appsRoot, "AppsMarketplaceClient.tsx"), "utf8");
  const listing = await readFile(join(appsRoot, "page.tsx"), "utf8");
  const detail = await readFile(join(appsRoot, "[slug]", "page.tsx"), "utf8");
  const offboardingStart = data.indexOf('slug: "obserra-offboarding-orchestrator"');
  const offboardingEnd = data.indexOf("reviewedProduct({", offboardingStart);
  const offboarding = data.slice(offboardingStart, offboardingEnd);

  assert.match(data, /Obserra--Crisis-commander-app@85556468f598a4340e59a3d3609fd016c503bcfd/);
  assert.match(data, /Obserra-EU-CRA-governace-app@6fbbc06bd450946c0af5fad51e62153deb44bdf7 · CI run 31894696092/);
  assert.match(offboarding, /Demo: state\(\s*"Verified"/);
  assert.match(offboarding, /mode\("Local \/ on-prem", "Not verified"/);
  assert.match(offboarding, /mode\("Outbound tenant agent", "Not verified"/);
  assert.doesNotMatch(offboarding, /mode\("(?:Local \/ on-prem|Outbound tenant agent)", "Verified"/);
  assert.match(client, /entry\.actions\.length > 0/);
  assert.match(client, /entry\.actions\.map\(\(action\)/);
  assert.doesNotMatch(`${listing}\n${detail}`, /obserra-eios-intelligence-hero/);
});

test("temporary hosts, unbound delivery routes, inherited deployment claims, and maturity overclaims stay out", async () => {
  const sources = await allReleaseSources();
  const renderedOrCatalog = sources.filter(({ file }) => /(?:\.tsx|appsData\.ts|storefront\.ts)$/.test(file));
  const joined = sources.map(({ content }) => content).join("\n");
  const customerFacing = renderedOrCatalog.map(({ content }) => content).join("\n");

  assert.doesNotMatch(joined, /https?:\/\/[^"'\s]+\.(?:vercel\.app|netlify\.app|pages\.dev|workers\.dev|github\.io)/i);
  assert.doesNotMatch(joined, /\/api\/apps\/(?:access|download|checkout|billing-portal)/i);
  assert.doesNotMatch(joined, /liveApplicationUrls|rawStoreCatalog|generatedApps/);
  assert.doesNotMatch(customerFacing, /production[- ]ready/i);
  assert.doesNotMatch(customerFacing, /private cloud|hybrid/i);
  assert.doesNotMatch(customerFacing, /deployment:\s*\[(?:[^\]]*,[^\]]*)\]/i);
});

test("legacy builder traces remain removed from the Applications tree", async () => {
  const sources = await allReleaseSources();
  const joined = sources.map(({ file, content }) => `${file}\n${content}`).join("\n");
  const prohibited = ["axionis", "emergent", "builder", "lovable", "base44"];

  for (const trace of prohibited) assert.doesNotMatch(joined, new RegExp(trace, "i"));
});
