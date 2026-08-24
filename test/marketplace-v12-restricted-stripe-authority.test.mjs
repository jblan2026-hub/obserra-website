import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const files = [
  "scripts/reconcile-marketplace-v12-stripe-bindings.mjs",
  "scripts/verify-marketplace-v12-stripe-evidence.mjs",
  "scripts/marketplace-v12-artifact-ingest-azure.mjs",
];

test("Marketplace v1.2 accepts governed standard and restricted live Stripe keys consistently", () => {
  for (const path of files) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /\(\?:sk\|rk\)_live_/u, `${path} must accept sk_live_ and rk_live_ authority`);
    assert.doesNotMatch(source, /\/\^sk_live_/u, `${path} must not regress to sk_live_-only authority`);
  }
});
