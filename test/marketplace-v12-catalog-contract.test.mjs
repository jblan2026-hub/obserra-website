import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import test from "node:test";

const root = new URL("..", import.meta.url);
const summary = JSON.parse(readFileSync(new URL("data/marketplace/obserra-marketplace-card-catalog.summary.json", root), "utf8"));
const chunkSuffixes = ["000", "001", "002", "003", "004"];

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function verifiedCatalogBytes() {
  const rawUrl = new URL("data/marketplace/obserra-marketplace-card-catalog.json.gz", root);
  const raw = existsSync(rawUrl) ? readFileSync(rawUrl) : null;
  if (raw?.length === summary.catalog_gzip_bytes && digest(raw) === summary.catalog_gzip_sha256) return raw;
  const encoded = chunkSuffixes.map((suffix) => readFileSync(new URL(`data/marketplace/obserra-marketplace-card-catalog.json.gz.b64.part-${suffix}`, root), "utf8")).join("");
  const reconstructed = Buffer.from(encoded, "base64");
  assert.equal(reconstructed.length, summary.catalog_gzip_bytes);
  assert.equal(digest(reconstructed), summary.catalog_gzip_sha256);
  return reconstructed;
}

const catalog = JSON.parse(gunzipSync(verifiedCatalogBytes()).toString("utf8"));

test("marketplace v1.2 catalog retains its verified document wrapper and exact card count", () => {
  assert.ok(Array.isArray(catalog.cards));
  assert.equal(catalog.cards.length, 11396);
  assert.equal(catalog.counts.total_cards, 11396);
  assert.equal(catalog.catalog_revision, summary.catalog_revision);
});

test("v1.2 delivery gate pins the signed catalog and rejects duplicate tracked copies", () => {
  const output = execFileSync(process.execPath, ["scripts/marketplace-catalog-delivery-gate.mjs"], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
  assert.match(output, /Verified 2527985 byte gzip/);
  assert.match(output, /raw-or-chunked canonical source/);
});

test("transport-safe base64 catalog chunks reconstruct the exact verified gzip", () => {
  const chunks = chunkSuffixes.map((suffix) => readFileSync(new URL(`data/marketplace/obserra-marketplace-card-catalog.json.gz.b64.part-${suffix}`, root), "utf8"));
  assert.equal(chunks.length, 5);
  for (const chunk of chunks.slice(0, -1)) assert.equal(chunk.length, 800000);
  const encoded = chunks.join("");
  const reconstructed = Buffer.from(encoded, "base64");
  assert.match(encoded, /^[A-Za-z0-9+/]+={0,2}$/);
  assert.equal(reconstructed.length, summary.catalog_gzip_bytes);
  assert.equal(digest(reconstructed), summary.catalog_gzip_sha256);
  const loader = readFileSync(new URL("lib/marketplace-v12-catalog.ts", root), "utf8");
  assert.match(loader, /catalogChunkSuffixes/);
  assert.match(loader, /encodedCatalogBytes/);
  assert.match(loader, /bytes\.toString\("base64"\)!==value/);
  assert.match(loader, /catalog source does not match its verified digest/);
  assert.match(loader, /catalog uncompressed digest mismatch/);
});

test("v1.2 server loader indexes wrapped cards and exposes bounded discovery endpoints", () => {
  const loader = readFileSync(new URL("lib/marketplace-v12-catalog.ts", root), "utf8");
  const searchRoute = readFileSync(new URL("app/api/ai-marketplace/search/route.ts", root), "utf8");
  assert.match(loader, /Array\.isArray\(parsed\.cards\)/);
  assert.match(loader, /Math\.min\(60/);
  assert.match(loader, /marketplaceV12Facets/);
  assert.match(loader, /marketplaceV12CollectionMembers/);
  assert.match(loader, /marketplaceV12PublicPath/);
  assert.match(searchRoute, /catalog-unavailable/);
});

test("every v1.2 catalog offer kind has an explicit fail-closed purchase option", () => {
  const bindings = readFileSync(new URL("lib/marketplace-v12-bindings.ts", root), "utf8");
  const checkout = readFileSync(new URL("app/api/ai-marketplace/checkout/route.ts", root), "utf8");
  const kinds = new Set(catalog.cards.filter((card) => !["collection", "bundle"].includes(card.product_type)).flatMap((card) => card.pricing.offers.map((offer) => offer.kind)));
  assert.deepEqual([...kinds].sort(), ["activation", "one_time", "recurring", "team_license"]);
  for (const option of ["recurring:month", "recurring:year", "one_time:once", "team_license:once", "activation:once"]) assert.match(bindings, new RegExp(option.replace(":", "\\:")));
  assert.match(bindings, /options\.length !== product\.pricing\.offers\.length/);
  assert.match(checkout, /purchaseOption/);
  assert.match(checkout, /catalog-v12-configuration-required/);
});

test("v1.2 delivery requires a durable entitlement bound to the exact artifact hash", () => {
  const delivery = readFileSync(new URL("lib/ai-marketplace-delivery.ts", root), "utf8");
  const commerce = readFileSync(new URL("lib/ai-marketplace-commerce.ts", root), "utf8");
  const download = readFileSync(new URL("app/api/ai-marketplace/download/route.ts", root), "utf8");
  const migration = readFileSync(new URL("supabase/release-authority/migrations/20260823120000_ai_marketplace_v12_protected_delivery.sql", root), "utf8");
  assert.match(delivery, /OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON/);
  assert.match(delivery, /release\?\.artifactSha256\s*===\s*artifactSha256/);
  assert.match(download, /marketplaceV12DeliveryEntitlement/);
  assert.match(download, /marketplaceV12Release/);
  assert.match(download, /Protected delivery unavailable/);
  assert.match(download, /referrer-policy/);
  assert.match(delivery, /part\s*!==\s*"\."\s*&&\s*part\s*!==\s*"\.\."/);
  assert.match(commerce, /obserra_ai_marketplace_v12_delivery_entitlement/);
  assert.match(migration, /v12_artifact_entitlements/);
  assert.match(migration, /p_catalog_revision/);
  assert.match(migration, /p_artifact_sha256/);
  assert.match(migration, /access_status='active'/);
});

test("Stripe evidence review is explicit, non-production, aggregate-only, and cannot activate commerce", () => {
  const script = readFileSync(new URL("scripts/verify-marketplace-v12-stripe-evidence.mjs", root), "utf8");
  assert.match(script, /OBSERRA_MARKETPLACE_V12_EVIDENCE_RUN/);
  assert.match(script, /VERCEL_ENV === "production"/);
  assert.match(script, /OBSERRA_ALLOW_LIVE_STRIPE_OUTSIDE_PRODUCTION/);
  assert.match(script, /requiredProductCards: subjects\.length/);
  assert.match(script, /requiredOfferBindings: bindings\.length/);
  assert.match(script, /activationChanged: false/);
  assert.match(script, /process\.argv\.length !== 2/);
  assert.doesNotMatch(script, /checkout\.sessions\.create/);
  assert.doesNotMatch(script, /process\.env\.[A-Z_]+\s*=(?!=)/);
});

test("buyer catalog is category-filtered, searchable, accessible, and collection-aware", () => {
  const experience = readFileSync(new URL("app/ai-marketplace/MarketplaceExperience.tsx", root), "utf8");
  assert.match(experience, /\/api\/ai-marketplace\/search/);
  assert.match(experience, /params\.set\("family", family\)/);
  assert.match(experience, /role="search"/);
  assert.match(experience, /aria-label="Filter skills by category"/);
  assert.match(experience, /role="status" aria-live="polite"/);
  assert.match(experience, /card\.product_type === "collection" \|\| card\.product_type === "bundle"/);
  assert.match(experience, /`\/ai-marketplace\/collections\/\$\{segment\}`/);
  assert.match(experience, /className="ai-marketplace__product-card-link" href=\{href\}/);
  assert.match(experience, /\? "Open package"/);
  assert.match(experience, /\? "View skill"/);
  assert.match(experience, /: "View product"/);
  assert.doesNotMatch(experience, /\/api\/ai-marketplace\/scene|relationship_product_ids|StaticCapabilityMap/);
});

test("catalog discovery uses bounded storefront pages and sharded product sitemaps", () => {
  const catalog = readFileSync(new URL("app/ai-marketplace/page.tsx", root), "utf8");
  const sitemap = readFileSync(new URL("app/ai-marketplace/sitemap.ts", root), "utf8");
  const robots = readFileSync(new URL("app/robots.ts", root), "utf8");
  const loader = readFileSync(new URL("lib/marketplace-v12-catalog.ts", root), "utf8");
  assert.match(catalog, /searchParams/);
  assert.match(catalog, /limit: 48/);
  assert.match(catalog, /limit: 60/);
  assert.match(catalog, /More products/);
  assert.match(catalog, /export const metadata/);
  assert.match(sitemap, /generateSitemaps/);
  assert.match(sitemap, /pageSize = 500/);
  assert.match(sitemap, /marketplaceV12SitemapPage/);
  assert.match(robots, /ai-marketplace\/sitemap\.xml/);
  assert.match(loader, /marketplaceV12SitemapPage/);
});

test("offering rail lets buyers choose a category before opening a governed product", () => {
  const page = readFileSync(new URL("app/ai-marketplace/page.tsx", root), "utf8");
  for (const slug of ["skills", "agent-packs", "workflow-packs", "connectors", "trust-controls", "industry-editions", "collections"]) {
    assert.match(page, new RegExp(`slug: "${slug}"`));
  }
  assert.match(page, /aria-haspopup="dialog"/);
  assert.match(page, /role="dialog" aria-modal="true"/);
  assert.match(page, /const card = product as MarketplaceV12Card/);
  assert.match(page, /resultHref\(card\)/);
  assert.match(page, /#purchase-options/);
  assert.match(page, /Buy now/);
  assert.match(page, /marketplaceV12PublicPath\(card\)/);
});

test("marketplace retains verified results and exposes semantic recovery when interactive or route rendering fails", () => {
  const experience = readFileSync(new URL("app/ai-marketplace/MarketplaceExperience.tsx", root), "utf8");
  const boundary = readFileSync(new URL("app/ai-marketplace/error.tsx", root), "utf8");
  assert.match(experience, /Marketplace results are temporarily unavailable\. Please try again\./);
  assert.match(experience, />Try again<\/button>/);
  assert.match(experience, /requestSequence/);
  assert.doesNotMatch(experience, /cache: "no-store"/);
  assert.match(boundary, /role="alert"/);
  assert.match(boundary, /This page error did not submit a new purchase/);
  assert.match(boundary, />Try again<\/button>/);
  assert.match(boundary, /Return to marketplace/);
});

test("v1.2 activation is evidence-derived and remains fail-closed for insufficient evidence", () => {
  const gate = readFileSync(new URL("lib/marketplace-v12-activation.ts", root), "utf8");
  const bindings = readFileSync(new URL("lib/marketplace-v12-bindings.ts", root), "utf8");
  const health = readFileSync(new URL("app/api/ai-marketplace/commerce-health/route.ts", root), "utf8");
  assert.match(gate, /facts\.coverage\.structurallyComplete/);
  assert.match(gate, /facts\.approvedRevision === facts\.coverage\.revision/);
  assert.match(gate, /facts\.chargesEnabled/);
  assert.match(gate, /facts\.pricesVerified/);
  assert.match(gate, /facts\.durableLedger === "ai-marketplace-commerce-ledger-v1"/);
  assert.match(gate, /facts\.protectedDeliveryConfigured/);
  assert.match(bindings, /marketplaceV12BindingAuthorityReceipt/);
  assert.match(bindings, /marketplaceV12ProductBindingAuthority/);
  assert.match(bindings, /binding\.artifactSha256 !== subject\.artifactSha256/);
  assert.match(bindings, /catalogRevision: receipt\.revision/);
  assert.match(health, /OBSERRA_AI_MARKETPLACE_V12_ACTIVATION_APPROVED_REVISION/);
  assert.match(health, /controlled verifier signature/);
  assert.doesNotMatch(health, /const operational = false/);
});

test("v1.2 Stripe evidence is signed, digest-bound, account-bound, and expiring", () => {
  const evidence = readFileSync(new URL("lib/marketplace-v12-release-evidence.ts", root), "utf8");
  const bindings = readFileSync(new URL("lib/marketplace-v12-bindings.ts", root), "utf8");
  assert.match(evidence, /createHmac\("sha256"/);
  assert.match(evidence, /timingSafeEqual/);
  assert.match(evidence, /binding_receipt_sha256/);
  assert.match(evidence, /OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON/);
  assert.match(evidence, /delivery_manifest_sha256/);
  assert.match(evidence, /stripe_account_id/);
  assert.match(evidence, /expires_at/);
  assert.match(evidence, /expiresAt - verifiedAt <= 7/);
  assert.match(bindings, /marketplaceV12ReleaseEvidence/);
  assert.match(bindings, /stripeVerified: structurallyComplete && releaseEvidence\.verified/);
});
