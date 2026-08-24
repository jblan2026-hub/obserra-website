import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public Marketplace purchase goes directly to Stripe without account access", async () => {
  const checkoutUi = await readFile(new URL("../app/ai-marketplace/MarketplaceV12Checkout.tsx", import.meta.url), "utf8");
  const guestCheckout = await readFile(new URL("../app/api/ai-marketplace/guest-checkout/route.ts", import.meta.url), "utf8");

  assert.match(checkoutUi, /action="\/api\/ai-marketplace\/guest-checkout"/);
  assert.match(checkoutUi, /providerReady && productReady/);
  assert.doesNotMatch(checkoutUi, /providerReady && productReady && accessReady/);
  assert.match(checkoutUi, /Pay securely by card with Stripe/);

  assert.doesNotMatch(guestCheckout, /\/sign-in/);
  assert.doesNotMatch(guestCheckout, /auth\(\)/);
  assert.doesNotMatch(guestCheckout, /primaryAccountEmail/);
  assert.match(guestCheckout, /payment_method_types: \["card"\]/);
  assert.match(guestCheckout, /createMarketplaceV12GuestIdentity/);
  assert.match(guestCheckout, /reserveMarketplaceV12Checkout/);
  assert.match(guestCheckout, /recordMarketplaceV12Checkout/);
  assert.match(guestCheckout, /purchase-download/);
  assert.match(guestCheckout, /\{CHECKOUT_SESSION_ID\}/);
});

test("guest Stripe Checkout request stays minimal and reports the failing backend stage", async () => {
  const guestCheckout = await readFile(new URL("../app/api/ai-marketplace/guest-checkout/route.ts", import.meta.url), "utf8");

  assert.match(guestCheckout, /stage = "stripe-session"/);
  assert.match(guestCheckout, /stage = "durable-record"/);
  assert.match(guestCheckout, /stripeType/);
  assert.match(guestCheckout, /stripeCode/);
  assert.match(guestCheckout, /stripeRequestId/);
  assert.doesNotMatch(guestCheckout, /consent_collection/);
  assert.doesNotMatch(guestCheckout, /customer_update/);
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
  assert.doesNotMatch(download, /auth\(\)/);

  assert.match(token, /createHmac/);
  assert.match(token, /timingSafeEqual/);
  assert.match(token, /user_guest_/);
  assert.match(token, /marketplace-v12-guest-download/);
});
