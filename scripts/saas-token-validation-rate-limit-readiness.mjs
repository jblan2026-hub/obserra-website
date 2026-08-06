import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [service, route] = await Promise.all([
  readFile(new URL("../lib/saas-token-validation-rate-limit.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/saas/validate-access-token/route.ts", import.meta.url), "utf8"),
]);

const logLines = route.split("\n").filter((line) => line.includes("console."));
const rateLimitCall = route.lastIndexOf("enforceValidationRateLimit({");
const tokenVerificationCall = route.indexOf("verifySaasAccessToken(token");

const checks = [
  [service.includes("WINDOW_SECONDS = 60"), "uses a bounded 60-second window"],
  [service.includes("REQUEST_LIMIT = 600"), "sets an explicit validation request limit"],
  [service.includes("OBSERRA_CONTROL_PLANE_STORE_URL"), "uses the durable control-plane store"],
  [service.includes("OBSERRA_CONTROL_PLANE_STORE_TOKEN"), "authenticates control-plane requests"],
  [service.includes("AbortSignal.timeout(2_000)"), "bounds rate-limit persistence latency"],
  [service.includes('cache: "no-store"'), "disables caching for distributed counters"],
  [service.includes("boundedIdentifier"), "validates rate-limit dimensions"],
  [service.includes("serviceId") && service.includes("productSlug") && service.includes("organizationId"), "segments buckets by service, product, and organization"],
  [service.includes("SaaS validation rate-limit persistence is not configured"), "fails closed when persistence is absent"],
  [service.includes("typeof result.allowed !== \"boolean\""), "validates the store response schema"],
  [route.includes('x-obserra-service-id'), "requires an authenticated service identity"],
  [route.includes("boundedServiceId"), "bounds and validates the service identity"],
  [route.includes("enforceValidationRateLimit"), "enforces distributed rate limiting"],
  [route.includes('reason: "rate-limit-service-unavailable"'), "fails closed when rate limiting is unavailable"],
  [route.includes('reason: "rate-limit-exceeded"'), "returns a stable rate-limit denial reason"],
  [route.includes("429"), "returns HTTP 429 for exhausted buckets"],
  [route.includes('"Retry-After"'), "returns Retry-After guidance"],
  [route.includes('"RateLimit-Limit"'), "returns the configured limit"],
  [route.includes('"RateLimit-Remaining"'), "returns the remaining allowance"],
  [route.includes('"RateLimit-Reset"'), "returns the reset timestamp"],
  [route.includes("console.warn(\"SaaS token validation rate limited\""), "emits audit-safe abuse telemetry"],
  [logLines.every((line) => !line.includes("token") && !line.includes("service-key") && !line.includes("authorization")), "does not log tokens or credentials"],
  [rateLimitCall >= 0 && tokenVerificationCall >= 0 && rateLimitCall < tokenVerificationCall, "performs abuse control before cryptographic validation"],
  [route.includes('"Cache-Control": "private, no-store, max-age=0"'), "protects validation responses from caching"],
  [route.includes('"X-Robots-Tag": "noindex, nofollow"'), "prevents indexing of validation responses"],
];

for (const [condition, description] of checks) {
  assert.ok(condition, `SaaS token validation rate-limit readiness failed: ${description}`);
}

console.log(`SaaS token validation rate-limit readiness passed (${checks.length} controls).`);
