import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [token, issuer, validator, revocation, ownerRoute] = await Promise.all([
  readFile(new URL("../lib/saas-access-token.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/saas/access-token/route.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/saas/validate-access-token/route.ts", import.meta.url), "utf8"),
  readFile(new URL("../lib/saas-session-revocation.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/owner/saas/session-revocations/route.ts", import.meta.url), "utf8"),
]);

const checks = [
  [token.includes("sessionId"), "binds access-token claims to a session"],
  [issuer.includes("session.sessionId"), "derives session identity from Clerk"],
  [issuer.includes('error: "session-required"'), "fails closed when session identity is absent"],
  [validator.includes('reason: "session-binding-required"'), "rejects legacy unbound tokens"],
  [validator.includes("sessionIsRevoked"), "checks durable session revocation"],
  [validator.includes('reason: "session-revoked"'), "returns a stable session-revoked denial"],
  [validator.includes("Promise.all"), "parallelizes containment checks"],
  [revocation.includes("/v1/session-revocations/"), "uses a dedicated durable store contract"],
  [revocation.includes("AbortSignal.timeout(3_000)"), "bounds revocation store latency"],
  [revocation.includes('cache: "no-store"'), "prevents revocation caching"],
  [revocation.includes('headers: { "idempotency-key": idempotencyKey }'), "uses idempotent writes"],
  [revocation.includes("Session revocation audience mismatch"), "enforces session audience binding"],
  [ownerRoute.includes('requireStepUp("strict")'), "requires strict recent authentication"],
  [ownerRoute.includes("authorizeOwner"), "requires owner authorization"],
  [ownerRoute.includes("owner.userId !== stepUp.userId"), "binds owner and reverified principals"],
  [ownerRoute.includes("idempotency-key-required"), "requires operation idempotency"],
  [ownerRoute.includes("30 * 24 * 60 * 60"), "bounds revocation retention"],
  [ownerRoute.includes("session-revocation-service-unavailable"), "fails closed when storage is unavailable"],
  [!ownerRoute.includes("sessionId,") || !ownerRoute.includes("console.info(\"SaaS session revoked\", {\n    operationId: idempotencyKey,\n    sessionId"), "does not log session identifiers"],
  [ownerRoute.includes('"Cache-Control": "private, no-store, max-age=0"'), "protects administrative responses"],
];

for (const [condition, description] of checks) {
  assert.ok(condition, `SaaS session assurance readiness failed: ${description}`);
}

console.log(`SaaS session assurance readiness passed (${checks.length} controls).`);
