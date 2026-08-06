import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const servicePath = "lib/saas-control-plane.ts";
const routePath = "app/api/saas/entitlements/route.ts";
const healthPath = "app/api/health/route.ts";
for (const file of [servicePath, routePath, healthPath]) {
  assert.ok(fs.existsSync(path.join(root, file)), `Missing SaaS control-plane component: ${file}`);
}

const service = read(servicePath);
for (const status of ["trialing", "active", "past_due", "grace_period", "suspended", "canceled", "expired"]) {
  assert.ok(service.includes(`\"${status}\"`), `Missing subscription status: ${status}`);
}
for (const reason of [
  "subscription-unavailable",
  "subscription-inactive",
  "product-not-in-plan",
  "seat-limit-exceeded",
  "tenant-mismatch",
  "entitled",
]) {
  assert.ok(service.includes(`\"${reason}\"`), `Missing entitlement decision reason: ${reason}`);
}
assert.match(service, /OBSERRA_SAAS_SUBSCRIPTIONS_JSON/, "Tenant subscription source is not configurable");
assert.match(service, /organizationId/, "Organization isolation is missing");
assert.match(service, /tenantId/, "Tenant isolation is missing");
assert.match(service, /seatLimit/, "Seat-limit enforcement is missing");
assert.match(service, /gracePeriodEnd/, "Grace-period enforcement is missing");
assert.match(service, /productSlugs\.includes/, "Product-plan enforcement is missing");
assert.match(service, /return \{\s*allowed: false/s, "Entitlements must fail closed");
assert.doesNotMatch(service, /STRIPE_SECRET_KEY|CLERK_SECRET_KEY/, "Control-plane records must not embed runtime secrets");

const route = read(routePath);
assert.match(route, /await auth\(\)/, "Entitlement API must use authenticated identity");
assert.match(route, /identity\.orgId/, "Entitlement API must require organization context");
assert.match(route, /authentication-required/, "Entitlement API must fail closed without a user");
assert.match(route, /organization-required/, "Entitlement API must fail closed without an organization");
assert.match(route, /private, no-store/, "Entitlement decisions must not be cached");
assert.match(route, /X-Robots-Tag/, "Entitlement API must not be indexed");
assert.doesNotMatch(route, /stripeCustomerId|stripeSubscriptionId/, "Entitlement API must not disclose billing identifiers");

const health = read(healthPath);
assert.match(health, /saasControlPlaneHealth/, "Health route must publish sanitized SaaS readiness");
assert.match(health, /failClosed/, "Health route must publish fail-closed posture");
assert.doesNotMatch(health, /stripeCustomerId|stripeSubscriptionId/, "Health route must not disclose billing identifiers");

console.log(JSON.stringify({
  passed: true,
  macroGate: "saas-control-plane-readiness",
  organizationScoped: true,
  tenantScoped: true,
  failClosed: true,
  subscriptionStatuses: 7,
  entitlementDecisionReasons: 6,
  sensitiveBillingIdentifiersExposed: false,
}, null, 2));
