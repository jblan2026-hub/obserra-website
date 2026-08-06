import { readFile } from "node:fs/promises";

const files = {
  token: "lib/saas-access-token.ts",
  route: "app/api/saas/access-token/route.ts",
};
const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);

const checks = [
  ["tokens use HMAC SHA-256", source.token.includes('createHmac("sha256"')],
  ["signatures use constant-time comparison", source.token.includes("timingSafeEqual")],
  ["signing secret requires at least 32 characters", source.token.includes("secret.length < 32")],
  ["token lifetime is capped at five minutes", source.token.includes("MAX_TTL_SECONDS = 300")],
  ["token verification enforces expiration", source.token.includes("claims.expiresAt <= now")],
  ["token verification supports product binding", source.token.includes("product-mismatch")],
  ["token verification supports organization binding", source.token.includes("organization-mismatch")],
  ["issuer requires Clerk authentication", source.route.includes("session.userId")],
  ["issuer requires Clerk organization context", source.route.includes("session.orgId")],
  ["issuer evaluates shared product entitlement", source.route.includes("evaluateProductEntitlement")],
  ["issuer rejects unentitled access", source.route.includes("!entitlement.allowed")],
  ["issuer validates bounded TTL", source.route.includes("ttlSeconds > 300")],
  ["issuer returns no-store responses", source.route.includes('"Cache-Control": "private, no-store, max-age=0"')],
  ["issuer excludes responses from indexing", source.route.includes('"X-Robots-Tag": "noindex, nofollow"')],
  ["issuer does not accept organization identity from body", !source.route.includes("body.organizationId")],
  ["issuer does not expose Stripe identifiers", !source.route.includes("stripeCustomerId") && !source.route.includes("stripeSubscriptionId")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`SaaS access-token readiness failed with ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`SaaS access-token readiness passed with ${checks.length} controls.`);
