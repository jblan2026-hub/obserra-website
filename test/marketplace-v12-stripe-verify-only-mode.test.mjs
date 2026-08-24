import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const path = ".github/workflows/marketplace-v12-stripe-reconcile-request.yml";
const source = fs.readFileSync(path, "utf8");

test("Marketplace request workflow supports exact verify-only execution without Stripe writes", () => {
  assert.match(source, /review-only\|verify-only/);
  assert.match(source, /id: request/);
  assert.match(source, /steps\.request\.outputs\.mode == 'review-only'/);
  assert.match(source, /Reconcile deterministic live Stripe shard without checkout activation/);
  assert.match(source, /Verify catalog-wide live Stripe binding evidence/);
  assert.match(source, /verify-marketplace-v12-stripe-evidence\.mjs/);
  assert.match(source, /allowCheckoutActivation == false/);
  assert.match(source, /allowCharges == false/);
  assert.match(source, /allowSubscriptions == false/);
  assert.match(source, /allowEntitlements == false/);
  assert.doesNotMatch(source, /checkout\.sessions\.create|paymentIntents\.create|charges\.create|subscriptions\.create|refunds\.create/);
});

test("Marketplace request is read from the exact PR head while executable code stays on base main", () => {
  assert.match(source, /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
  assert.match(source, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/);
  assert.match(source, /path: \.marketplace-request/);
  assert.match(source, /sparse-checkout:[\s\S]*ops\/marketplace-v12-stripe-reconcile-request\.json/);
  assert.match(source, /git -C \.marketplace-request rev-parse HEAD/);
  assert.match(source, /request_path="\.marketplace-request\/ops\/marketplace-v12-stripe-reconcile-request\.json"/);
  assert.doesNotMatch(source, /mode="\$\(jq -r '\.mode \/\/ empty' ops\/marketplace-v12-stripe-reconcile-request\.json\)"/);
});
