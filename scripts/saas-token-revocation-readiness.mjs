import { readFile } from "node:fs/promises";

const files = {
  service: "lib/saas-token-revocation.ts",
  ownerRoute: "app/api/owner/saas/token-revocations/route.ts",
  validator: "app/api/saas/validate-access-token/route.ts",
};
const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);

const checks = [
  ["revocations use durable control-plane storage", source.service.includes("OBSERRA_CONTROL_PLANE_STORE_URL")],
  ["revocation storage uses authenticated requests", source.service.includes("OBSERRA_CONTROL_PLANE_STORE_TOKEN")],
  ["revocation lookups have bounded timeouts", source.service.includes("AbortSignal.timeout(3_000)")],
  ["revocation writes are idempotent", source.service.includes('"idempotency-key": idempotencyKey')],
  ["revocation records are expiration bounded", source.service.includes("expiresAt <= Math.floor(Date.now() / 1000)")],
  ["revocation lookup enforces organization audience", source.service.includes("result.organizationId !== input.organizationId")],
  ["revocation lookup enforces product audience", source.service.includes("result.productSlug !== input.productSlug")],
  ["owner revocation requires shared owner authorization", source.ownerRoute.includes("authorizeOwner()")],
  ["owner revocation requires a reason", source.ownerRoute.includes("reason.length < 8")],
  ["owner revocation requires idempotency", source.ownerRoute.includes("idempotency-key-required")],
  ["owner revocation verifies the signed token", source.ownerRoute.includes("verifySaasAccessToken(token)")],
  ["owner revocation does not disclose nonce", !source.ownerRoute.includes("nonce: verified.claims.nonce,") || !source.ownerRoute.includes("return noStore({ nonce")],
  ["validator checks durable revocation state", source.validator.includes("tokenIsRevoked")],
  ["validator rejects revoked tokens", source.validator.includes('reason: "token-revoked"')],
  ["validator fails closed when revocation is unavailable", source.validator.includes('reason: "revocation-service-unavailable"')],
  ["validator does not expose token nonce", !source.validator.includes("nonce: result.claims.nonce")],
  ["protected routes disable caching", source.ownerRoute.includes('"Cache-Control": "private, no-store, max-age=0"') && source.validator.includes('"Cache-Control": "private, no-store, max-age=0"')],
  ["protected routes are excluded from indexing", source.ownerRoute.includes('"X-Robots-Tag": "noindex, nofollow"') && source.validator.includes('"X-Robots-Tag": "noindex, nofollow"')],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`SaaS token revocation readiness failed with ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`SaaS token revocation readiness passed with ${checks.length} controls.`);
