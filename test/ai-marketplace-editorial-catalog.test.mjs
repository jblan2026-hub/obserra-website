import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("storefront remains catalog-derived and routes packages to their governed members", async () => {
  const page = await readFile(new URL("../app/ai-marketplace/page.tsx", import.meta.url), "utf8");
  const collection = await readFile(new URL("../app/ai-marketplace/collections/[collectionId]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /marketplaceV12Summary\(\)/);
  assert.match(page, /marketplaceV12Search/);
  assert.match(page, /marketplaceV12PublicPath\(card\)/);
  assert.match(page, /types: \["collection", "bundle"\]/);
  assert.match(page, /#purchase-options/);
  assert.match(collection, /marketplaceV12CollectionMembers/);
  assert.match(collection, /allMembers\(collection\.product_id\)/);
  assert.match(collection, /Individual products and skills/);
  assert.match(collection, /marketplaceV12PublicPath\(member\)/);
});