import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(
  "supabase/release-authority/migrations/20260822163000_applications_reversal_ordering.sql",
  "utf8",
);

test("Applications refunds and disputes project fail-closed regardless of webhook delivery order", () => {
  assert.match(migration, /from obserra_app_commerce\.payment_events[\s\S]*event_type in \('charge\.refunded', 'charge\.dispute\.created', 'charge\.dispute\.closed'\)/);
  assert.match(migration, /when v_projected_reversal_status in \('full_refund', 'dispute_open'\) then 'revoked'/);
  assert.match(migration, /when obserra_app_commerce\.subscriptions\.reversal_status <> 'none' or excluded\.reversal_status <> 'none' then 'suspended'/);
  assert.match(migration, /last_event_created = greatest\(last_event_created, v_latest_reversal\.event_created\)/);
  assert.doesNotMatch(migration, /where stripe_subscription_id = p_subscription_id and last_event_created <= p_event_created/);
});

test("Applications reversal replay remains append-only, idempotent, and collision detecting", () => {
  assert.match(migration, /on conflict \(stripe_event_id\) do nothing/);
  assert.match(migration, /Applications Stripe reversal event identity collision/);
  assert.match(migration, /reversal_status = 'full_refund' then 'full_refund'/);
  assert.match(migration, /grant execute on function public\.obserra_applications_apply_reversal[\s\S]*to service_role/);
});
