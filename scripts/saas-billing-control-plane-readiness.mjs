import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  controlPlane: "lib/saas-control-plane.ts",
  store: "lib/saas-subscription-store.ts",
  reconciliation: "lib/saas-billing-reconciliation.ts",
  webhook: "app/api/saas/billing/webhook/route.ts",
  portal: "app/api/saas/billing/portal/route.ts",
  entitlements: "app/api/saas/entitlements/route.ts",
  health: "app/api/health/route.ts",
};

const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([name, path]) => [name, await readFile(path, "utf8")])),
);

const checks = [];
function check(name, operation) {
  try {
    operation();
    checks.push({ name, status: "pass" });
  } catch (error) {
    checks.push({ name, status: "fail", detail: error instanceof Error ? error.message : String(error) });
  }
}

check("durable-store-abstraction", () => {
  assert.match(source.store, /OBSERRA_CONTROL_PLANE_STORE_URL/);
  assert.match(source.store, /OBSERRA_CONTROL_PLANE_STORE_TOKEN/);
  assert.match(source.store, /AbortSignal\.timeout\(8_000\)/);
  assert.match(source.store, /cache:\s*"no-store"/);
  assert.match(source.store, /idempotency-key/);
  assert.match(source.store, /read-only-bootstrap/);
});

check("entitlements-use-durable-store", () => {
  assert.match(source.controlPlane, /readSubscriptionByOrganization/);
  assert.match(source.controlPlane, /await readSubscriptionByOrganization/);
  assert.match(source.entitlements, /await evaluateProductEntitlement/);
  assert.match(source.controlPlane, /tenant-mismatch/);
  assert.match(source.controlPlane, /seat-limit-exceeded/);
  assert.match(source.controlPlane, /subscription-inactive/);
});

check("signed-webhook-boundary", () => {
  assert.match(source.webhook, /STRIPE_SAAS_WEBHOOK_SECRET/);
  assert.match(source.webhook, /stripe-signature/);
  assert.match(source.webhook, /constructEventAsync/);
  assert.match(source.webhook, /request\.text\(\)/);
  assert.match(source.webhook, /Cache-Control.*no-store/s);
  assert.doesNotMatch(source.webhook, /request\.json\(\)/);
});

check("replay-and-idempotency-controls", () => {
  assert.match(source.reconciliation, /billingEventWasProcessed/);
  assert.match(source.reconciliation, /already-processed/);
  assert.match(source.reconciliation, /recordBillingEvent/);
  assert.match(source.reconciliation, /upsertSubscription\(record, event\.id\)/);
});

check("subscription-lifecycle-mapping", () => {
  for (const signal of ["trialing", "active", "past_due", "grace_period", "suspended", "canceled"]) {
    assert.match(source.reconciliation, new RegExp(signal));
  }
  assert.match(source.reconciliation, /OBSERRA_SAAS_GRACE_PERIOD_DAYS/);
  assert.match(source.reconciliation, /Math\.max\(1, Math\.min\(days, 30\)\)/);
});

check("tenant-metadata-integrity", () => {
  assert.match(source.reconciliation, /organizationId/);
  assert.match(source.reconciliation, /tenantId/);
  assert.match(source.reconciliation, /planId/);
  assert.match(source.reconciliation, /does not match the persisted tenant/);
});

check("customer-billing-portal-is-organization-bound", () => {
  assert.match(source.portal, /identity\.orgId/);
  assert.match(source.portal, /subscriptionForOrganization\(identity\.orgId\)/);
  assert.match(source.portal, /billingPortal\.sessions\.create/);
  assert.match(source.portal, /subscription\.stripeCustomerId/);
  assert.doesNotMatch(source.portal, /searchParams\.get\(["']customer/);
  assert.doesNotMatch(source.portal, /request\.json\(\)/);
});

check("sensitive-identifiers-not-returned-by-entitlement-api", () => {
  assert.doesNotMatch(source.entitlements, /stripeCustomerId/);
  assert.doesNotMatch(source.entitlements, /stripeSubscriptionId/);
});

check("health-contract-exposes-sanitized-control-plane-state", () => {
  assert.match(source.health, /saasControlPlaneHealth/);
  assert.doesNotMatch(source.health, /stripeCustomerId/);
  assert.doesNotMatch(source.health, /stripeSubscriptionId/);
});

const failed = checks.filter((item) => item.status === "fail");
console.log(JSON.stringify({ passed: failed.length === 0, gateCount: checks.length, checks }, null, 2));
assert.equal(failed.length, 0, `${failed.length} SaaS billing control-plane readiness gate(s) failed`);
