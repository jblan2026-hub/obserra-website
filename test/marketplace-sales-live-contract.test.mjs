import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Marketplace saleability hydrates production bindings before exact protected-release evaluation", async () => {
  const runtime = await read("lib/marketplace-v12-runtime.ts");
  const productCommerce = runtime.indexOf("export async function marketplaceV12ProductCommerce");
  const hydration = runtime.indexOf("await ensureMarketplaceV12RuntimeSecrets()", productCommerce);
  const release = runtime.indexOf("marketplaceV12Release(product.product_id, marketplaceV12Summary().revision, subject.artifactSha256)", productCommerce);
  assert.ok(productCommerce >= 0);
  assert.ok(hydration > productCommerce);
  assert.ok(release > hydration);
  assert.match(runtime, /return marketplaceV12RuntimeCommerce\(\)/);
  assert.doesNotMatch(runtime, /product\.publication_state !== "available"/);
});

test("Marketplace landing exposes an obvious purchase-now path and full-card product click targets", async () => {
  const page = await read("app/ai-marketplace/page.tsx");
  assert.match(page, /AI products available to purchase now/);
  assert.match(page, /Secure Stripe checkout\. Verified entitlement\. Protected delivery after payment\./);
  assert.match(page, /marketplace-simple__product-card-link/);
  assert.match(page, /aria-label=\{`\$\{forSale \? "Buy" : "View"\} \$\{card\.name\}`\}/);
  assert.match(page, /Shop products/);
  assert.match(page, /Buy now/);
});

test("Marketplace restores the approved site font and forces orbit cards to remain clickable", async () => {
  const css = await read("app/ai-marketplace/MarketplaceCommerceFix.css");
  const layout = await read("app/ai-marketplace/layout.tsx");
  assert.match(layout, /MarketplaceCommerceFix\.css/);
  assert.match(css, /font-family: var\(--obs-font-sans/);
  assert.match(css, /font-family: inherit !important/);
  assert.match(css, /pointer-events: none/);
  assert.match(css, /pointer-events: auto/);
  assert.match(css, /cursor: pointer/);
  assert.doesNotMatch(css, /font-family:\s*Arial/);
});

test("Home page advertises purchasable Marketplace inventory before the executive hero", async () => {
  const home = await read("app/page.tsx");
  const promo = home.indexOf("home-marketplace-promo");
  const hero = home.indexOf("saas-hero saas-hero--executive");
  assert.ok(promo >= 0 && hero >= 0 && promo < hero);
  assert.match(home, /AI TOOLS FOR ENTERPRISE TEAMS/);
  assert.match(home, /Buy online and receive secure access after payment is confirmed/);
  assert.match(home, /Shop AI Marketplace/);
  assert.match(home, /marketplaceV12Summary/);
  assert.match(home, /marketplaceProductCount\.toLocaleString\(\)/);
});

test("Marketplace SEO exposes a canonical commercial landing page and verified product offers", async () => {
  const marketplace = await read("app/ai-marketplace/page.tsx");
  const product = await read("app/ai-marketplace/[productId]/page.tsx");
  const sitemap = await read("app/ai-marketplace/sitemap.ts");
  assert.match(marketplace, /Obserra EPI AI Marketplace \| Buy AI Skills & Agent Packs/);
  assert.match(marketplace, /"@type": "CollectionPage"/);
  assert.match(marketplace, /"@type": "ItemList"/);
  assert.match(marketplace, /robots: \{/);
  assert.match(product, /"@type": "Offer"/);
  assert.match(product, /priceCurrency: "USD"/);
  assert.match(product, /availability: "https:\/\/schema\.org\/InStock"/);
  assert.match(product, /commerce\.checkoutEnabled \? purchaseOptions\.map/);
  assert.match(product, /title: \{ absolute: catalogProduct\.name \+ " \| Obserra EPI AI Marketplace" \}/);
  assert.match(sitemap, /lastModified: marketplaceRevisionDate/);
  assert.match(sitemap, /changeFrequency: "weekly"/);
});
