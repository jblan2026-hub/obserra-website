import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("marketplace browser uses bounded search results instead of the retired catalog scene", async () => {
  const [experience, page] = await Promise.all([
    read("app/ai-marketplace/MarketplaceExperience.tsx"),
    read("app/ai-marketplace/page.tsx"),
  ]);
  assert.match(page, /marketplaceV12Search\(\{ cursor, q: query \|\| undefined, limit: 24 \}\)/);
  assert.match(page, /initialCatalog=\{catalog\}/);
  assert.match(page, /initialTotal=\{initial\.total\}/);
  assert.match(page, /familyEntries=\{familyEntries\}/);
  assert.match(experience, /new URLSearchParams\(\{ limit: "24" \}\)/);
  assert.match(experience, /params\.set\("q", query\.trim\(\)\)/);
  assert.match(experience, /params\.set\("family", family\)/);
  assert.match(experience, /params\.set\("cursor", cursor\)/);
  assert.match(experience, /fetch\(`\/api\/ai-marketplace\/search\?\$\{params\}`\)/);
  assert.doesNotMatch(experience, /\/api\/ai-marketplace\/scene/);
  assert.doesNotMatch(experience, /@react-three\/fiber|<Canvas|relationship_product_ids/);
});

test("buyer browser exposes category and outcome search controls with accessible result status", async () => {
  const experience = await read("app/ai-marketplace/MarketplaceExperience.tsx");
  assert.match(experience, /Browse every skill and package\./);
  assert.match(experience, /Choose a category or search by the outcome you need/);
  assert.match(experience, /aria-label="Filter skills by category"/);
  assert.match(experience, /aria-pressed=\{family === item\}/);
  assert.match(experience, /role="search"/);
  assert.match(experience, /Search skills and packages/);
  assert.match(experience, /role="status" aria-live="polite"/);
  assert.match(experience, /aria-busy=\{loading\}/);
  assert.match(experience, /Show more capabilities/);
});

test("buyer cards route products directly and packages to collection-aware pages", async () => {
  const [experience, collectionPage, catalog] = await Promise.all([
    read("app/ai-marketplace/MarketplaceExperience.tsx"),
    read("app/ai-marketplace/collections/[collectionId]/page.tsx"),
    read("lib/marketplace-v12-catalog.ts"),
  ]);
  assert.match(experience, /card\.product_type === "collection" \|\| card\.product_type === "bundle"/);
  assert.match(experience, /`\/ai-marketplace\/collections\/\$\{segment\}`/);
  assert.match(experience, /`\/ai-marketplace\/\$\{segment\}`/);
  assert.match(experience, /className="ai-marketplace__product-card-link" href=\{href\}/);
  assert.match(experience, /\? "Open package"/);
  assert.match(experience, /\? "View skill"/);
  assert.match(experience, /: "View product"/);
  assert.match(catalog, /export function marketplaceV12PublicPath/);
  assert.match(catalog, /export function marketplaceV12CollectionMembers/);
  assert.match(collectionPage, /marketplaceV12CollectionMembers\(collectionId, \{ cursor, limit: 60 \}\)/);
  assert.match(collectionPage, /marketplaceV12PublicPath\(entry\)/);
});

test("browser request races and failed updates preserve a recoverable buyer experience", async () => {
  const experience = await read("app/ai-marketplace/MarketplaceExperience.tsx");
  assert.match(experience, /requestSequence\.current \+ 1/);
  assert.match(experience, /sequence !== requestSequence\.current/);
  assert.match(experience, /window\.setTimeout\(\(\) => void request\(\), 220\)/);
  assert.match(experience, /Marketplace results are temporarily unavailable\. Please try again\./);
  assert.match(experience, /role="alert"/);
  assert.match(experience, />Try again<\/button>/);
  assert.match(experience, /No matching capabilities/);
  assert.match(experience, /Show all capabilities/);
});
