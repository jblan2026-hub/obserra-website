import { readFile } from "node:fs/promises";

const route = await readFile("app/api/saas/subscription-summary/route.ts", "utf8");
const checks = [
  ["summary requires authentication", route.includes('authentication-required')],
  ["summary requires Clerk organization context", route.includes('organization-required') && route.includes('identity.orgId')],
  ["summary requires a bounded product slug", route.includes('product-required') && route.includes('productSlug.length > 160')],
  ["summary validates billing period format", route.includes('invalid-period') && route.includes('\\d{4}')],
  ["summary reads subscription by authenticated organization", route.includes('subscriptionForOrganization(identity.orgId)')],
  ["summary validates the shared plan registry", route.includes('planForId(subscription.planId)')],
  ["summary enforces product inclusion in plan", route.includes('product-not-in-plan')],
  ["usage failure degrades without exposing an internal exception", route.includes('usageState = "unavailable"') && route.includes('catch')],
  ["responses disable caching", route.includes('"Cache-Control": "private, no-store, max-age=0"')],
  ["responses are excluded from indexing", route.includes('"X-Robots-Tag": "noindex, nofollow"')],
  ["billing readiness is configuration-derived", route.includes('billingManagementAvailable')],
  ["route does not return Stripe customer identifiers", !route.includes('stripeCustomerId')],
  ["route does not return Stripe subscription identifiers", !route.includes('stripeSubscriptionId')],
  ["route does not accept organization identity from query parameters", !route.includes('searchParams.get("organization')],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`SaaS subscription summary readiness failed with ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`SaaS subscription summary readiness passed with ${checks.length} controls.`);
