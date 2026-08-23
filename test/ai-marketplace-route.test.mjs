import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Homepage directs visitors to the dedicated AI Skills Marketplace", async () => {
  const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(home, /href="\/ai-marketplace"/);
  assert.match(home, /Shop AI Skills Marketplace/);
  assert.match(home, /Florida Class D Training/);
});

test("enterprise header exposes a yellow AI Skills Marketplace destination", async () => {
  const header = await readFile(new URL("../app/components/enterprise/EnterpriseChrome.tsx", import.meta.url), "utf8");
  assert.match(header, /href="\/ai-marketplace"/);
  assert.match(header, /AI Skills Marketplace/);
  assert.match(header, /ent-header__marketplace/);
});

test("enterprise header keeps Academy and Florida Training destinations without redundant utility navigation", async () => {
  const header = await readFile(new URL("../app/components/enterprise/EnterpriseChrome.tsx", import.meta.url), "utf8");
  assert.match(header, /data-navigation=\{prominence === "sales" \? "academy" : undefined\}/);
  assert.match(header, /Florida Class D Training/);
  assert.match(header, /href="\/florida-security-training"/);
  assert.doesNotMatch(header, />Florida training</);
  assert.match(header, /ent-header__applications/);
  assert.match(header, /href="\/apps"/);
  assert.doesNotMatch(header, /ent-header__utility/);
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
  assert.equal(catalog.length, 70);
  assert.ok(catalog.every((product) => product.product_id && product.product_name && product.family));
  assert.doesNotMatch(page, /href="\/apps" className=".*marketplace/);
});

test("every marketplace offering requires an exact governed payment binding", async () => {
  const bindings = await readFile(new URL("../lib/ai-marketplace-payment-bindings.ts", import.meta.url), "utf8");
  const health = await readFile(new URL("../app/api/ai-marketplace/commerce-health/route.ts", import.meta.url), "utf8");
  assert.match(bindings, /requiredBillingIntervals/);
  assert.match(bindings, /boundAiMarketplacePrice/);
  assert.match(bindings, /boundProducts\.length === products\.length/);
  assert.match(health, /ai-marketplace-commerce-health-v1/);
  assert.match(health, /coverage\.complete/);
});

test("skill library route presents the four capability levels and source packages", async () => {
  const page = await readFile(new URL("../app/ai-marketplace/skill-libraries/page.tsx", import.meta.url), "utf8");
  for (const level of ["Beginner", "Intermediate", "Expert", "Advanced"]) assert.match(page, new RegExp(level));
  assert.match(page, /11,320 capability skills/);
  assert.match(page, /Set 4 Advanced/);
});
