import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Homepage directs visitors to the dedicated AI Skills Marketplace", async () => {
  const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(home, /href="\/ai-marketplace"/);
  assert.match(home, /Shop AI Skills Marketplace/);
});

test("enterprise header exposes a yellow AI Skills Marketplace destination", async () => {
  const header = await readFile(new URL("../app/components/enterprise/EnterpriseChrome.tsx", import.meta.url), "utf8");
  assert.match(header, /href="\/ai-marketplace"/);
  assert.match(header, /AI Skills Marketplace/);
  assert.match(header, /ent-header__marketplace/);
});

test("enterprise header exposes yellow Academy and Florida Training destinations", async () => {
  const header = await readFile(new URL("../app/components/enterprise/EnterpriseChrome.tsx", import.meta.url), "utf8");
  assert.match(header, /ent-header__academy/);
  assert.match(header, /Florida Class D Training/);
  assert.match(header, /href="\/florida-security-training"/);
  assert.doesNotMatch(header, />Florida training</);
  assert.match(header, /ent-header__applications/);
  assert.match(header, /href="\/apps"/);
  assert.match(header, /#ffd978/);
});

test("yellow header destinations are pinned to their actual pages", async () => {
  const header = await readFile(new URL("../app/components/enterprise/EnterpriseChrome.tsx", import.meta.url), "utf8");
  assert.match(header, /\[ACADEMY_BRAND_NAME, "\/academy", "sales"\]/);
  assert.match(header, /href="\/ai-marketplace"/);
  assert.match(header, /href="\/florida-security-training"/);
  assert.match(header, /href="\/apps"/);
});

test("AI Skills Marketplace uses its real product catalog and does not route to Applications", async () => {
  const page = await readFile(new URL("../app/ai-marketplace/page.tsx", import.meta.url), "utf8");
  const catalog = JSON.parse(await readFile(new URL("../app/ai-marketplace/marketplace-products.json", import.meta.url), "utf8"));
  assert.match(page, /marketplace-products\.json/);
  assert.equal(catalog.length, 64);
  assert.ok(catalog.every((product) => product.product_id && product.product_name && product.family));
  assert.doesNotMatch(page, /href="\/apps" className=".*marketplace/);
});

test("skill library route presents the four capability levels and source packages", async () => {
  const page = await readFile(new URL("../app/ai-marketplace/skill-libraries/page.tsx", import.meta.url), "utf8");
  for (const level of ["Beginner", "Intermediate", "Expert", "Advanced"]) assert.match(page, new RegExp(level));
  assert.match(page, /11,320 capability skills/);
  assert.match(page, /Set 4 Advanced/);
});
