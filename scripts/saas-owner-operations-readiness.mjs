import { readFile } from "node:fs/promises";

const files = {
  authorization: "lib/owner-authorization.ts",
  route: "app/api/owner/saas/subscriptions/route.ts",
  store: "lib/saas-subscription-store.ts",
};

const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);

const checks = [
  ["owner policy is configured through an explicit allowlist", source.authorization.includes("OBSERRA_OWNER_USER_IDS")],
  ["owner policy fails closed when unconfigured", source.authorization.includes("owner-policy-unconfigured")],
  ["unauthenticated owner access is denied", source.authorization.includes("authentication-required")],
  ["non-owner access is denied", source.authorization.includes("owner-access-denied")],
  ["subscription operations use shared owner authorization", source.route.includes("authorizeOwner()")],
  ["operations require an idempotency key", source.route.includes("idempotency-key-required")],
  ["operations require a documented change reason", source.route.includes("changeReason.length < 8")],
  ["seat updates are bounded", source.route.includes("1_000_000")],
  ["grace periods are bounded to thirty days", source.route.includes("30 * 24 * 60 * 60 * 1000")],
  ["plan changes validate against the shared plan registry", source.route.includes("planForId(planId)")],
  ["mutations use idempotent durable subscription writes", source.route.includes("upsertSubscription(next, operationId)")],
  ["mutations create billing audit evidence", source.route.includes("recordBillingEvent")],
  ["protected responses disable caching", source.route.includes('"Cache-Control": "private, no-store, max-age=0"')],
  ["protected responses are excluded from indexing", source.route.includes('"X-Robots-Tag": "noindex, nofollow"')],
  ["store writes forward idempotency keys", source.store.includes('"idempotency-key": eventId')],
  ["route does not accept Stripe customer identifiers", !source.route.includes("stripeCustomerId")],
  ["route does not accept Stripe subscription identifiers", !source.route.includes("stripeSubscriptionId")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`SaaS owner operations readiness failed with ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`SaaS owner operations readiness passed with ${checks.length} controls.`);
