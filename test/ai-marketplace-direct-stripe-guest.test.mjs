import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public Marketplace purchase goes directly to Stripe without account access", async () => {
  const checkoutUi = await readFile(new URL("../app/ai-marketplace/MarketplaceV12Checkout.tsx", import.meta.url), "utf8");
  const guestCheckout = await readFile(new URL("../app/api/ai-marketplace/guest-checkout/route.ts", import.meta.url), "utf8");

  assert.match(checkoutUi, /action="\/api\/ai-marketplace\/guest-checkout"/);
  assert.match(checkoutUi, /providerReady && productReady/);
  assert.doesNotMatch(checkoutUi, /\/api\/ai-marketplace\/access/);
  assert.doesNotMatch(checkoutUi, /auth\(\)/);
  assert.match(checkoutUi, /continue directly to Stripe/);
  assert.match(checkoutUi, /protected download starts automatically/);

  assert.doesNotMatch(guestCheckout, /\/sign-in/);
  assert.doesNotMatch(guestCheckout, /auth\(\)/);
  assert.doesNotMatch(guestCheckout, /primaryAccountEmail/);
  assert.doesNotMatch(guestCheckout, /consent_collection/);
  assert.match(guestCheckout, /createMarketplaceV12GuestIdentity/);
  assert.match(guestCheckout, /reserveMarketplaceV12Checkout/);
  assert.match(guestCheckout, /recordMarketplaceV12Checkout/);
  assert.match(guestCheckout, /purchase-download/);
  assert.match(guestCheckout, /\{CHECKOUT_SESSION_ID\}/);
  assert.match(guestCheckout, /stage = "session"/);
  assert.match(guestCheckout, /stage = "record"/);
});

test("guest purchase download requires verified Stripe payment and durable entitlement", async () => {
  const download = await readFile(new URL("../app/api/ai-marketplace/purchase-download/route.ts", import.meta.url), "utf8");
  const token = await readFile(new URL("../lib/marketplace-v12-guest-purchase.ts", import.meta.url), "utf8");

  assert.match(download, /session\.status !== "complete"/);
  assert.match(download, /session\.payment_status !== "paid"/);
  assert.match(download, /session\.livemode !== live/);
  assert.match(download, /marketplaceV12DeliveryEntitlement/);
  assert.match(download, /recordMarketplaceV12Download/);
  assert.match(download, /marketplaceV12SignedAzureReleaseUrl/);
  assert.match(download, /http-equiv="refresh" content="2"/);
  assert.match(download, /retries automatically while your entitlement is finalized/);
  assert.match(download, /"retry-after": "2"/);
  assert.doesNotMatch(download, /auth\(\)/);

  assert.match(token, /createHmac/);
  assert.match(token, /timingSafeEqual/);
  assert.match(token, /user_guest_/);
  assert.match(token, /marketplace-v12-guest-download/);
});
