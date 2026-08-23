import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import test from "node:test";

function marketplaceCatalogBytes() {
  const suffixes = ["000", "001", "002", "003", "004"];
  const encoded = suffixes.map((suffix) => readFileSync(new URL(`../data/marketplace/obserra-marketplace-card-catalog.json.gz.b64.part-${suffix}`, import.meta.url), "utf8")).join("");
  return Buffer.from(encoded, "base64");
}

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
  const catalog = JSON.parse(gunzipSync(marketplaceCatalogBytes()).toString("utf8"));
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
  assert.match(detail, /marketplaceV12PublicPath\(catalogProduct\)/);
  assert.match(detail, /permanentRedirect\(marketplaceV12PublicPath\(catalogProduct\)\)/);
  assert.doesNotMatch(page, /href="\/apps" className=".*marketplace/);
});

test("v1.2 product page presents buyer outcomes and fail-closed purchase options", async () => {
  const detail = await readFile(new URL("../app/ai-marketplace/[productId]/page.tsx", import.meta.url), "utf8");
  const hero = await readFile(new URL("../app/ai-marketplace/MarketplaceProductSalesHero.tsx", import.meta.url), "utf8");
  const pedestal = await readFile(new URL("../app/ai-marketplace/MarketplaceDimensionalPedestal.tsx", import.meta.url), "utf8");
  const hangar = await readFile(new URL("../app/ai-marketplace/hangar/page.tsx", import.meta.url), "utf8");
  const access = await readFile(new URL("../app/api/ai-marketplace/access/route.ts", import.meta.url), "utf8");
  const install = await readFile(new URL("../app/api/ai-marketplace/install-grant/route.ts", import.meta.url), "utf8");
  const v12Checkout = await readFile(new URL("../app/ai-marketplace/MarketplaceV12Checkout.tsx", import.meta.url), "utf8");
  assert.match(detail, /<MarketplaceProductSalesHero[\s\S]*<MarketplaceDimensionalPedestal/);
  assert.match(detail, /const salesDetail = buyerDetail\(publicDetail\)/);
  assert.match(hero, /Who it&apos;s for/);
  assert.match(hero, /What&apos;s included/);
  assert.match(hero, /<MarketplaceV12Checkout productId=\{detail\.productId\} options=\{options\} checkoutEnabled=\{checkoutEnabled\}/);
  assert.match(pedestal, /From your starting point to a usable outcome\./);
  assert.match(pedestal, /What you receive/);
  assert.match(pedestal, /Review pricing and purchase/);
  assert.match(pedestal, /\/ai-marketplace\/hangar/);
  assert.match(hangar, /marketplaceV12ProtectedDeliveryConfigured/);
  assert.match(hangar, /dynamic = "force-dynamic"/);
  assert.match(hangar, /runtime = "nodejs"/);
  assert.match(hangar, /marketplaceV12CustomerInventory/);
  assert.match(hangar, /downloadAvailable: Boolean\(release && deliveryConfigured\)/);
  assert.match(hangar, /<MarketplaceHangarInventory records=\{records\}/);
  assert.match(hangar, /auth\(\)/);
  assert.match(access, /Authentication required/);
  assert.match(access, /aiMarketplaceTenantId\(userId, orgId\)/);
  assert.match(access, /marketplaceV12DeliveryEntitlement/);
  assert.doesNotMatch(access, /stripe\.customers\.create/);
  assert.match(install, /sameOrigin/);
  assert.match(install, /createMarketplaceV12InstallGrant/);
  assert.match(install, /marketplaceV12InstallBridgeConfigured/);
  assert.match(install, /obserra:\/\/install\?grant=/);
  assert.match(install, /Install bridge unavailable/);
  assert.match(v12Checkout, /Continue to secure checkout/);
  assert.match(v12Checkout, /Checkout unavailable/);
  assert.match(v12Checkout, /Online checkout is not available for this capability right now\./);
  assert.match(v12Checkout, /Contact sales for purchase options/);
  assert.match(v12Checkout, /disabled=\{!checkoutEnabled\}/);
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
  assert.match(v12Bindings, /requiredOfferBindingCount/);
  assert.match(v12Bindings, /marketplaceV12ProductBindingAuthority/);
  assert.match(v12Bindings, /marketplaceV12BindingEvidenceKeyMatches/);
  assert.doesNotMatch(v12Bindings, /OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON/);
  assert.match(health, /marketplaceV12BindingCoverage/);
  assert.match(health, /activationBlocked: true/);
  assert.match(checkout, /catalog-v12-configuration-required/);
  assert.match(checkout, /await Promise\.all\(\[boundMarketplaceV12Price/);
  assert.match(checkout, /revision: expectedRevision/);
  assert.doesNotMatch(checkout, /form\.get\("catalogRevision"\)/);
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
