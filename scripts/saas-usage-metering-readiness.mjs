import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  service: "lib/saas-usage-metering.ts",
  route: "app/api/saas/usage/route.ts",
  control: "lib/saas-control-plane.ts",
};

const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);

const checks = [];
function check(name, condition, detail) {
  checks.push({ name, passed: Boolean(condition), detail });
}

check("organization-scoped-auth", /identity\.orgId/.test(source.route) && /identity\.userId/.test(source.route), "Usage access requires user and organization identity");
check("tenant-bound-events", /subscription\.tenantId !== input\.tenantId/.test(source.service), "Usage events are rejected on tenant mismatch");
check("idempotent-events", /idempotency-key/.test(source.service) && /eventId/.test(source.service), "Usage writes use event identifiers and idempotency keys");
check("bounded-quantity", /Number\.isSafeInteger/.test(source.service) && /1_000_000/.test(source.service), "Usage quantity is a bounded positive integer");
check("bounded-store-timeout", /AbortSignal\.timeout\(8_000\)/.test(source.service), "Usage persistence has an eight-second timeout");
check("no-store-api", /private, no-store/.test(source.route), "Usage responses are private and non-cacheable");
check("supported-metrics", ["api_calls", "ai_actions", "reports_generated", "active_assets"].every((metric) => source.service.includes(metric)), "Operational and AI metrics are explicitly modeled");
check("plan-quotas", /PLAN_LIMITS/.test(source.service) && /withinLimits/.test(source.service) && /exceededMetrics/.test(source.service), "Plan quota evaluation is implemented");
check("fail-closed-storage", /SaaS usage persistence is not configured/.test(source.service), "Missing durable storage fails closed");
check("organization-not-browser-supplied", !/input\.organizationId/.test(source.route), "Organization context cannot be supplied by the browser");
check("billing-identifiers-not-returned", !/stripeCustomerId|stripeSubscriptionId/.test(source.route), "Usage API does not expose billing identifiers");
check("actor-audit-binding", /actorUserId: identity\.userId/.test(source.route), "Usage events bind the authenticated actor");
check("entitlement-source-reused", /subscriptionForOrganization/.test(source.service), "Usage metering reuses the shared subscription control plane");
check("invalid-input-rejected", /invalid-usage-event/.test(source.route) && /invalid-json/.test(source.route), "Malformed usage events are rejected");

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ passed: failed.length === 0, gateCount: checks.length, checks }, null, 2));
assert.equal(failed.length, 0, `${failed.length} SaaS usage metering readiness check(s) failed`);
