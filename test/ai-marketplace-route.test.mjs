import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Homepage directs visitors to the dedicated AI Skills Marketplace", async () => {
  const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(home, /href="\/ai-marketplace"/);
  assert.match(home, /Shop AI Skills Marketplace/);
});

test("AI Skills Marketplace uses its real product catalog and does not route to Applications", async () => {
  const page = await readFile(new URL("../app/ai-marketplace/page.tsx", import.meta.url), "utf8");
  const catalog = JSON.parse(await readFile(new URL("../app/ai-marketplace/marketplace-products.json", import.meta.url), "utf8"));
  assert.match(page, /marketplace-products\.json/);
  assert.equal(catalog.length, 64);
  assert.ok(catalog.every((product) => product.product_id && product.product_name && product.family));
  assert.doesNotMatch(page, /href="\/apps" className=".*marketplace/);
});
