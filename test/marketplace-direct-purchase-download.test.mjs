import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("v1.2 purchase action activates only from live commerce health and never grants access client-side", () => {
  const action = read("app/ai-marketplace/MarketplaceV12Checkout.tsx");
  for (const marker of [
    "/api/ai-marketplace/commerce-health",
    "/api/ai-marketplace/access?product=",
    "deliveryAuthorized",
    "healthValue.operational === true",
    "Buy & download",
    "Subscribe & download",
    "Download now",
    "/api/ai-marketplace/download?product=",
  ]) assert.match(action, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(action, /action="\/api\/ai-marketplace\/checkout" method="post"/);
  assert.doesNotMatch(action, /stripe\.com|blob\.core\.windows\.net|entitlement\s*=\s*true/i);
});

test("post-checkout auto-download waits for server entitlement before navigation", () => {
  const action = read("app/ai-marketplace/MarketplaceV12Checkout.tsx");
  assert.match(action, /purchase"\) === "pending-fulfillment"/);
  assert.match(action, /access !== "owned"/);
  assert.match(action, /access === "owned"/);
  assert.match(action, /window\.location\.assign\(downloadUrl\)/);
  assert.match(action, /attempt\.current < 24/);
});

test("package pages expose the same real checkout action for sellable members", () => {
  const page = read("app/ai-marketplace/collections/[collectionId]/page.tsx");
  for (const marker of ["MarketplaceV12Checkout", "marketplaceV12PurchaseOptions", "memberPurchaseOptions", "checkoutEnabled={null}", "compact", "Buy here or inspect full details"]) assert.match(page, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(page, /product_type === "collection"[^\n]*MarketplaceV12Checkout/);
});

test("server checkout prevents duplicate purchase by redirecting active entitlement to protected download", () => {
  const checkout = read("app/api/ai-marketplace/checkout/route.ts");
  assert.match(checkout, /marketplaceV12DeliveryEntitlement/);
  assert.match(checkout, /if \(existingEntitlement\.allowed\)/);
  assert.match(checkout, /new URL\("\/api\/ai-marketplace\/download", request\.url\)/);
  assert.match(checkout, /download\.searchParams\.set\("product", product\.product_id\)/);
  assert.match(checkout, /return NextResponse\.redirect\(download, 303\)/);
  assert.ok(checkout.indexOf("existingEntitlement.allowed") < checkout.indexOf("stripe.checkout.sessions.create"));
});
