import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("editorial marketplace catalog remains catalog-derived and routes packages to their governed members", async () => {
  const page = await readFile(new URL("../app/ai-marketplace/page.tsx", import.meta.url), "utf8");
  const catalog = await readFile(new URL("../app/ai-marketplace/MarketplaceEditorialCatalog.tsx", import.meta.url), "utf8");
  const collection = await readFile(new URL("../app/ai-marketplace/collections/[collectionId]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /MarketplaceEditorialCatalog/);
  assert.match(catalog, /product_type === "collection"/);
  assert.match(catalog, /\/ai-marketplace\/collections\//);
  assert.match(catalog, /Package artifact verified/);
  assert.match(catalog, /individual skill/);
  assert.match(collection, /marketplaceV12CollectionMembers/);
  assert.match(collection, /allMembers\(collection\.product_id\)/);
  assert.match(collection, /Individual products and skills/);
  assert.match(collection, /marketplaceV12PublicPath\(member\)/);
});