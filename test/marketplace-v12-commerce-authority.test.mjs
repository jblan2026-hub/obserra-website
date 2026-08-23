import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("v1.2 checkout is server-bound to one release, exact price, authenticated tenant, and durable reservation", () => {
  const checkout = read("app/api/ai-marketplace/checkout/route.ts");
  for (const marker of ["sameOrigin", "await auth()", "marketplaceV12ProductCommerce", "reserveMarketplaceV12Checkout", "stripe.prices.retrieve", "validV12Price", "catalogRevision", "artifactSha256", "bindingKey", "payment_intent_data", "subscription_data", "recordMarketplaceV12Checkout"]) assert.match(checkout, new RegExp(marker));
  assert.match(checkout, /input\.revision !== expectedRevision/);
  assert.match(checkout, /line_items: \[\{ price: priceId, quantity: 1 \}\]/);
  assert.doesNotMatch(checkout, /unit_amount:\s*form/);
  assert.doesNotMatch(checkout, /entitlement.*active/i);
});

test("v1.2 webhook uses Stripe signatures, exact paid-session validation, and durable lifecycle projection", () => {
  const webhook = read("app/api/webhook/stripe-ai-marketplace/route.ts");
  for (const marker of ["webhooks.constructEvent", "readStripeWebhookBody", "session.payment_status !== \"paid\"", "session.status !== \"complete\"", "recordMarketplaceV12PaidCheckout", "checkout.session.async_payment_failed", "checkout.session.expired", "invoice.payment_failed", "charge.refunded", "charge.dispute.created", "recordMarketplaceV12Lifecycle"]) assert.match(webhook, new RegExp(marker.replaceAll(".", "\\.")));
  assert.match(webhook, /event\.livemode !== live/);
  assert.match(webhook, /session\.livemode !== event\.livemode/);
});

test("durable v1.2 authority records checkout, orders, lifecycle, entitlement, download audit, and bridge grants service-only", () => {
  const migration = read("supabase/release-authority/migrations/20260823140000_ai_marketplace_v12_commerce_authority.sql");
  for (const marker of ["v12_checkout_attempts", "v12_orders", "v12_webhook_events", "v12_audit_events", "v12_download_events", "v12_install_grants", "v12_install_receipts", "obserra_ai_marketplace_record_v12_paid_checkout", "obserra_ai_marketplace_record_v12_lifecycle", "obserra_ai_marketplace_record_v12_download", "obserra_ai_marketplace_consume_v12_install_grant", "access_status='active'"]) assert.match(migration, new RegExp(marker));
  assert.match(migration, /on conflict\(stripe_event_id\)\s+do nothing/);
  assert.match(migration, /grant execute .* to service_role/);
  assert.doesNotMatch(migration, /grant execute .* to anon/);
});

test("protected download and one-click bridge gates never trust the browser or expose a general install command", () => {
  const download = read("app/api/ai-marketplace/download/route.ts");
  const install = read("app/api/ai-marketplace/install-grant/route.ts");
  const exchange = read("app/api/ai-marketplace/install-grant/exchange/route.ts");
  const receipt = read("app/api/ai-marketplace/install-grant/receipt/route.ts");
  const bridge = read("lib/marketplace-v12-install-bridge.ts");
  for (const marker of ["marketplaceV12DeliveryEntitlement", "recordMarketplaceV12Download", "marketplaceV12Release", "signedAiMarketplaceReleaseUrl", "referrer-policy", "x-content-type-options"]) assert.match(download, new RegExp(marker));
  for (const marker of ["sameOrigin", "createMarketplaceV12InstallGrant", "marketplaceV12InstallBridgeConfigured", "obserra://install?grant="]) assert.match(install, new RegExp(marker.replaceAll("?", "\\?")));
  assert.match(exchange, /verifyMarketplaceV12BridgeRequest/);
  assert.match(exchange, /consumeMarketplaceV12InstallGrant/);
  assert.match(receipt, /createHash\("sha256"\)/);
  assert.match(receipt, /verifyMarketplaceV12BridgeRequest/);
  assert.match(bridge, /createPublicKey/);
  assert.match(bridge, /asymmetricKeyType !== "ed25519"/);
  assert.match(bridge, /obserra:\/\/install/);
  assert.doesNotMatch(install, /destination/);
  assert.doesNotMatch(exchange, /shell|exec|command/i);
});
