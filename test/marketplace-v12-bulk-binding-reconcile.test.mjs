import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SCRIPT = "scripts/reconcile-marketplace-v12-stripe-bindings.mjs";
const WORKFLOW = ".github/workflows/marketplace-v12-stripe-binding-reconcile.yml";
const REVISION = "487043cc23975012e83764a9a0f258f9ff705ab656084be558e76fa64f47faf2";

test("bulk reconciler is exact-catalog, shardable, idempotent, and review-only", () => {
  const source = readFileSync(SCRIPT, "utf8");
  assert.match(source, new RegExp(REVISION));
  assert.match(source, /subjects\.length\s*!==\s*11_390|subjects\.length\s*!==\s*11390/);
  assert.match(source, /--shard-index/);
  assert.match(source, /--shard-count/);
  assert.match(source, /--concurrency/);
  assert.match(source, /products\.search/);
  assert.match(source, /products\.create/);
  assert.match(source, /prices\.list/);
  assert.match(source, /prices\.create/);
  assert.match(source, /idempotencyKey/);
  assert.match(source, /obserra_ai_marketplace_record_v12_binding_review/);
  assert.match(source, /createHmac/);
  assert.match(source, /activationChanged:\s*false/);
  assert.match(source, /checkoutActivated:\s*false/);
  assert.doesNotMatch(source, /checkout\.sessions\.create|paymentIntents\.create|charges\.create|subscriptions\.create|refunds\.create/);
  assert.doesNotMatch(source, /console\.log\([^)]*(?:stripeKey|serviceRoleKey|hashSecret)/);
});

test("bulk binding workflow is manual, exact-main pinned, production OIDC, and non-activating", () => {
  const workflow = readFileSync(WORKFLOW, "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /^\s+(?:push|pull_request):/m);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /environment: production/);
  assert.match(workflow, /git rev-parse HEAD/);
  assert.match(workflow, new RegExp(REVISION));
  assert.match(workflow, /azure\/login@v3\.0\.1/);
  assert.match(workflow, /applications-supabase-service-role-key/);
  assert.match(workflow, /applications-stripe-secret-key/);
  assert.match(workflow, /applications-commerce-hash-secret/);
  assert.match(workflow, /matrix:/);
  assert.match(workflow, /shard:\s*\[0,\s*1,\s*2,\s*3\]/);
  assert.match(workflow, /reconcile-marketplace-v12-stripe-bindings\.mjs/);
  assert.match(workflow, /verify-marketplace-v12-stripe-evidence\.mjs/);
  assert.match(workflow, /OBSERRA_MARKETPLACE_V12_EVIDENCE_RUN=review/);
  assert.match(workflow, /OBSERRA_ALLOW_LIVE_STRIPE_OUTSIDE_PRODUCTION=true/);
  assert.doesNotMatch(workflow, /ai-marketplace-v12-activation-approved-revision/);
  assert.doesNotMatch(workflow, /ai-marketplace-v12-release-evidence|marketplace-v12-artifact-ingest/);
});
