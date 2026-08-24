import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const path = "scripts/verify-marketplace-v12-stripe-evidence.mjs";
const source = fs.readFileSync(path, "utf8");

test("Marketplace Stripe verifier uses bounded resilient readback without commerce writes", () => {
  assert.match(source, /const VERIFY_CONCURRENCY = 4;/);
  assert.match(source, /const VERIFY_RETRY_ATTEMPTS = 5;/);
  assert.match(source, /const VERIFY_PACE_MS = 20;/);
  assert.match(source, /maxNetworkRetries: 4/);
  assert.match(source, /timeout: 30_000/);
  assert.match(source, /retryRead\(\(\) => stripe\.accounts\.retrieve\(\)\)/);
  assert.match(source, /retryRead\(\(\) => stripe\.prices\.retrieve\(binding\.priceId, \{ expand: \["product"\] \}\)\)/);
  assert.match(source, /recordFailure\(binding, "metadata"\)/);
  assert.match(source, /recordFailure\(binding, "retrieve", error\)/);
  assert.match(source, /failureStageCounts:/);
  assert.match(source, /providerFailureClassCounts:/);
  assert.match(source, /reviewOnly: true/);
  assert.match(source, /activationChanged: false/);
  assert.doesNotMatch(source, /stripe\.(?:products|prices|checkout\.sessions|paymentIntents|subscriptions)\.(?:create|update|del|cancel)/);
});
