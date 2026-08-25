import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("enterprise catalog copy and purchase controls follow the Academy licensing gate", () => {
  const catalog = read("app/catalog/page.tsx");

  assert.match(catalog, /academyLicensedSalesEnabled/);
  assert.match(catalog, /licensedSalesEnabled \? \(/);
  assert.match(catalog, /Academy LMS is live; new enrollment is not yet open/);
  assert.match(catalog, /New enrollment and payment stay disabled until the required licensing is complete/);
  assert.match(catalog, /title: "Enterprise Product Catalog"/);
  assert.doesNotMatch(catalog, /title: `Enterprise Product Catalog \| \$\{LEGAL_ENTITY_NAME\}`/);
});

test("commercial discovery routes are explicitly present in the sitemap", () => {
  const sitemap = read("app/sitemap.ts");

  assert.match(sitemap, /\$\{siteUrl\}\/apps/);
  assert.match(sitemap, /\$\{siteUrl\}\/ai-marketplace/);
  assert.match(sitemap, /siteRevisionDate/);
  assert.doesNotMatch(sitemap, /const lastModified = new Date\(\);/);
});

test("AI Marketplace owns its canonical social metadata", () => {
  const marketplace = read("app/ai-marketplace/page.tsx");

  assert.match(marketplace, /const marketplaceTitle = "Obserra EPI AI Marketplace \| Buy AI Skills & Agent Packs"/);
  assert.match(marketplace, /title: \{ absolute: marketplaceTitle \}/);
  assert.match(marketplace, /openGraph:/);
  assert.match(marketplace, /url: marketplaceUrl/);
  assert.match(marketplace, /twitter:/);
  assert.match(marketplace, /Obserra EPI AI Marketplace/);
});
