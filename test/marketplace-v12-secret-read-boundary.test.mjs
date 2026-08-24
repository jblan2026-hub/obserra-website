import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/marketplace-v12-stripe-reconcile-request.yml", "utf8");

test("Marketplace Stripe reconciliation does not capture GitHub masking commands as secret values", () => {
  assert.match(workflow, /read_secret_into\(\)/u);
  assert.match(workflow, /printf -v "\$\{target\}" '%s' "\$\{value\}"/u);
  assert.match(workflow, /read_secret_into applications-stripe-secret-key stripe_key/u);
  assert.match(workflow, /read_secret_into applications-supabase-service-role-key service_role_key/u);
  assert.doesNotMatch(workflow, /stripe_key="\$\(read_secret /u);
  assert.doesNotMatch(workflow, /service_role_key="\$\(read_secret /u);
  assert.doesNotMatch(workflow, /hash_secret="\$\(read_secret /u);
});
