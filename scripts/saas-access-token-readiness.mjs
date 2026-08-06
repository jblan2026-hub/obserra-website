import { readFile } from "node:fs/promises";

const files = {
  token: "lib/saas-access-token.ts",
  issuer: "app/api/saas/access-token/route.ts",
  validator: "app/api/saas/validate-access-token/route.ts",
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
  ["issuer requires Clerk authentication", source.issuer.includes("session.userId")],
  ["issuer requires Clerk organization context", source.issuer.includes("session.orgId")],
  ["issuer evaluates shared product entitlement", source.issuer.includes("evaluateProductEntitlement")],
  ["issuer rejects unentitled access", source.issuer.includes("!entitlement.allowed")],
  ["issuer validates bounded TTL", source.issuer.includes("ttlSeconds > 300")],
  ["issuer returns no-store responses", source.issuer.includes('"Cache-Control": "private, no-store, max-age=0"')],
  ["issuer excludes responses from indexing", source.issuer.includes('"X-Robots-Tag": "noindex, nofollow"')],
  ["issuer does not accept organization identity from body", !source.issuer.includes("body.organizationId")],
  ["issuer does not expose Stripe identifiers", !source.issuer.includes("stripeCustomerId") && !source.issuer.includes("stripeSubscriptionId")],
  ["validator requires a separate service credential", source.validator.includes("OBSERRA_SAAS_TOKEN_VALIDATION_SECRET")],
  ["validator service credential requires at least 32 characters", source.validator.includes("configured.length < 32")],
  ["validator compares service credentials in constant time", source.validator.includes("timingSafeEqual")],
  ["validator requires product audience binding", source.validator.includes("!token || !productSlug")],
  ["validator supports organization audience binding", source.validator.includes("organizationId")],
  ["validator bounds token input size", source.validator.includes("8_192")],
  ["validator fails closed when signing is unavailable", source.validator.includes("validation-service-unavailable")],
  ["validator returns sanitized claims without nonce", !source.validator.includes("nonce: result.claims.nonce")],
  ["validator responses are private and non-cacheable", source.validator.includes('"Cache-Control": "private, no-store, max-age=0"')],
  ["validator excludes responses from indexing", source.validator.includes('"X-Robots-Tag": "noindex, nofollow"')],
  ["validator does not expose Stripe identifiers", !source.validator.includes("stripeCustomerId") && !source.validator.includes("stripeSubscriptionId")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`SaaS access-token readiness failed with ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`SaaS access-token readiness passed with ${checks.length} controls.`);
