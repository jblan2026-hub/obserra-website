import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [service, route] = await Promise.all([
  readFile(new URL("../lib/saas-service-credentials.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/saas/validate-access-token/route.ts", import.meta.url), "utf8"),
]);

const checks = [
  [service.includes("OBSERRA_SAAS_SERVICE_CREDENTIALS_JSON"), "uses an explicit service credential registry"],
  [service.includes("parsed.length > 100"), "bounds the number of registered services"],
  [service.includes("seen.has(serviceId)"), "rejects duplicate service identities"],
  [service.includes("secrets.length > 3"), "bounds rotating secrets per service"],
  [service.includes("secret.length < 32"), "requires strong service secrets"],
  [service.includes("products.length === 0"), "requires a product allowlist"],
  [service.includes("candidate.enabled !== false"), "supports emergency service disablement"],
  [service.includes("timingSafeEqual"), "uses constant-time secret comparison"],
  [service.includes("service.products.includes(input.productSlug)"), "binds credentials to approved products"],
  [service.includes('reason: "service-product-not-authorized"'), "returns a stable product-authorization denial"],
  [service.includes('reason: "service-authentication-required"'), "returns a stable credential denial"],
  [service.includes("rotationSupported"), "reports credential rotation readiness"],
  [service.includes("failClosed: true"), "fails closed on registry errors"],
  [route.includes("authorizeSaasService"), "enforces the credential registry in token validation"],
  [route.includes("serviceAuthorization.allowed"), "requires an authorized service before rate limiting and token work"],
  [route.includes('reason: "service-authorization-unavailable"'), "fails closed when registry parsing is unavailable"],
  [route.includes("x-obserra-service-id"), "requires explicit service identity"],
  [route.includes("x-obserra-service-key"), "requires a service secret"],
  [route.indexOf("authorizeSaasService") < route.indexOf("enforceValidationRateLimit"), "authorizes service before consuming distributed rate-limit capacity"],
  [route.indexOf("enforceValidationRateLimit") < route.indexOf("verifySaasAccessToken(token"), "rate limits before cryptographic token validation"],
  [!route.includes("OBSERRA_SAAS_TOKEN_VALIDATION_SECRET"), "removes the global shared validation secret"],
  [route.includes('"Cache-Control": "private, no-store, max-age=0"'), "keeps validation responses private and non-cacheable"],
];

for (const [condition, description] of checks) {
  assert.ok(condition, `SaaS service credential readiness failed: ${description}`);
}

console.log(`SaaS service credential readiness passed (${checks.length} controls).`);
