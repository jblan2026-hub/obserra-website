import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
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

test("AI Skills Marketplace is backed by the verified v1.2 catalog, bounded server search, and stable detail routes", async () => {
  const page = await readFile(new URL("../app/ai-marketplace/page.tsx", import.meta.url), "utf8");
  const loader = await readFile(new URL("../lib/marketplace-v12-catalog.ts", import.meta.url), "utf8");
  const search = await readFile(new URL("../app/api/ai-marketplace/search/route.ts", import.meta.url), "utf8");
  const detail = await readFile(new URL("../app/ai-marketplace/[productId]/page.tsx", import.meta.url), "utf8");
  const catalog = JSON.parse(gunzipSync(readFileSync(new URL("../data/marketplace/obserra-marketplace-card-catalog.json.gz", import.meta.url))).toString("utf8"));
  assert.equal(catalog.cards.length, 11396);
  assert.equal(catalog.counts.total_cards, 11396);
  assert.match(page, /marketplaceV12Summary/);
  assert.match(page, /marketplaceV12Search/);
  assert.doesNotMatch(page, /marketplace-products\.json/);
  assert.match(loader, /Array\.isArray\(parsed\.cards\)/);
  assert.match(loader, /Math\.min\(60/);
  assert.match(search, /marketplaceV12Search/);
  assert.match(search, /cursor/);
  assert.match(detail, /marketplaceV12Product/);
  assert.match(detail, /\/ai-marketplace\/\$\{catalogProduct\.slug\}/);
  assert.doesNotMatch(page, /href="\/apps" className=".*marketplace/);
});

test("v1.2 product pedestal and customer hangar present catalog guidance without implying fulfillment", async () => {
  const detail = await readFile(new URL("../app/ai-marketplace/[productId]/page.tsx", import.meta.url), "utf8");
  const pedestal = await readFile(new URL("../app/ai-marketplace/MarketplacePedestal.tsx", import.meta.url), "utf8");
  const hangar = await readFile(new URL("../app/ai-marketplace/hangar/page.tsx", import.meta.url), "utf8");
  const access = await readFile(new URL("../app/api/ai-marketplace/access/route.ts", import.meta.url), "utf8");
  const install = await readFile(new URL("../app/api/ai-marketplace/install-grant/route.ts", import.meta.url), "utf8");
  assert.match(detail, /MarketplacePedestal/);
  assert.match(pedestal, /Catalog-supplied offer comparison/);
  assert.match(pedestal, /does not create a checkout, entitlement, installation, or reservation/);
  assert.match(pedestal, /Protected delivery unavailable until entitlement and release controls are verified/);
  assert.match(pedestal, /\/ai-marketplace\/hangar/);
  assert.match(hangar, /marketplaceV12ProtectedDeliveryConfigured/);
  assert.match(hangar, /dynamic = "force-dynamic"/);
  assert.match(hangar, /runtime = "nodejs"/);
  assert.match(hangar, /entitlement validation is still required/);
  assert.match(hangar, /Installation bridge/);
  assert.match(hangar, /auth\(\)/);
  assert.match(access, /Authentication required/);
  assert.match(access, /aiMarketplaceTenantId\(userId, orgId\)/);
  assert.match(access, /marketplaceV12DeliveryEntitlement/);
  assert.doesNotMatch(access, /stripe\.customers\.create/);
  assert.match(install, /sameOrigin/);
  assert.match(install, /marketplaceV12DeliveryEntitlement/);
  assert.match(install, /Install bridge unavailable/);
});

test("every marketplace offering requires an exact governed payment binding", async () => {
  const bindings = await readFile(new URL("../lib/ai-marketplace-payment-bindings.ts", import.meta.url), "utf8");
  const v12Bindings = await readFile(new URL("../lib/marketplace-v12-bindings.ts", import.meta.url), "utf8");
  const health = await readFile(new URL("../app/api/ai-marketplace/commerce-health/route.ts", import.meta.url), "utf8");
  const checkout = await readFile(new URL("../app/api/ai-marketplace/checkout/route.ts", import.meta.url), "utf8");
  const webhook = await readFile(new URL("../app/api/webhook/stripe-ai-marketplace/route.ts", import.meta.url), "utf8");
  assert.match(bindings, /requiredBillingIntervals/);
  assert.match(bindings, /boundAiMarketplacePrice/);
  assert.match(bindings, /boundProducts\.length === products\.length/);
  assert.match(health, /ai-marketplace-commerce-health-v1/);
  assert.match(v12Bindings, /marketplaceV12CommerceSubjects/);
  assert.match(v12Bindings, /artifactSha256 !== subject\.artifactSha256/);
  assert.match(v12Bindings, /requiredProductCards/);
  assert.match(v12Bindings, /expectedOfferKeys/);
  assert.match(health, /marketplaceV12BindingCoverage/);
  assert.match(health, /activationBlocked: true/);
  assert.match(checkout, /catalog-v12-configuration-required/);
  assert.match(checkout, /catalogRevision!==expected/);
  assert.match(webhook, /obserra-ai-marketplace-v12/);
  assert.match(webhook, /v12 binding evidence unavailable/);
  assert.match(webhook, /session\.payment_status !== "paid"/);
  assert.match(webhook, /price\.livemode !== live/);
  assert.match(webhook, /product\.metadata\.artifactSha256 === artifactSha256/);
  assert.match(webhook, /product\.metadata\.bindingKey === bindingKey/);
});

test("skill library route presents the four capability levels and source packages", async () => {
  const page = await readFile(new URL("../app/ai-marketplace/skill-libraries/page.tsx", import.meta.url), "utf8");
  for (const level of ["Beginner", "Intermediate", "Expert", "Advanced"]) assert.match(page, new RegExp(level));
  assert.match(page, /11,320 capability skills/);
  assert.match(page, /Set 4 Advanced/);
});
