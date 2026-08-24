import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const webhookUrl = new URL("../app/api/webhook/stripe-ai-marketplace/route.ts", import.meta.url);
const migrationUrl = new URL("../supabase/migrations/20260824231857_ai_marketplace_v12_lifecycle_monotonicity.sql", import.meta.url);

test("Marketplace lifecycle attribution survives catalog revisions and current Stripe invoice shape", async () => {
  const webhook = await readFile(webhookUrl, "utf8");

  assert.match(webhook, /function v12LifecycleMetadata/);
  assert.match(webhook, /function v12Metadata/);
  assert.match(webhook, /parent\?\.type === "subscription_details"/);
  assert.match(webhook, /stripe\.invoicePayments\.list/);
  assert.match(webhook, /payment: \{ type: "payment_intent", payment_intent: paymentIntentId \}/);
  assert.match(webhook, /subscription\.livemode !== live \|\| !v12LifecycleMetadata\(subscription\.metadata\)/);
});

test("Marketplace dispute closure applies only final Stripe outcomes", async () => {
  const webhook = await readFile(webhookUrl, "utf8");

  assert.match(webhook, /dispute\.status === "lost"\) return lifecycleFromDispute\(event, "chargeback"/);
  assert.match(webhook, /dispute\.status === "won"\) return lifecycleFromDispute\(event, "payment_recovered"/);
  assert.match(webhook, /if \(event\.type === "charge\.dispute\.closed"\)[\s\S]*return false;/);
});

test("Marketplace durable lifecycle projection is monotonic and updates unpaid checkout attempts", async () => {
  const migration = await readFile(migrationUrl, "utf8");

  assert.match(migration, /state in \('reserved', 'checkout_created'\)/);
  assert.match(migration, /if p_lifecycle = 'payment_recovered'/);
  assert.match(migration, /o\.order_status = 'payment_failed'/);
  assert.match(migration, /p_event_type = 'charge\.dispute\.closed' and o\.order_status = 'disputed'/);
  assert.match(migration, /o\.order_status not in \('refunded', 'chargeback', 'revoked', 'expired', 'cancelled'\)/);
  assert.match(migration, /revoke all on function public\.obserra_ai_marketplace_record_v12_lifecycle/);
  assert.match(migration, /grant execute on function public\.obserra_ai_marketplace_record_v12_lifecycle[\s\S]*to service_role/);
});
