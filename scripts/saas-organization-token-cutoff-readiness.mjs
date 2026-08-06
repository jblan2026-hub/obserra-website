import { readFile } from "node:fs/promises";

const files = {
  service: "lib/saas-organization-token-cutoff.ts",
  ownerRoute: "app/api/owner/saas/organization-token-cutoff/route.ts",
  validator: "app/api/saas/validate-access-token/route.ts",
};
const source = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, "utf8")])),
);

const checks = [
  ["cutoff records are organization scoped", source.service.includes("organizationId")],
  ["cutoff writes are idempotent", source.service.includes('"idempotency-key"')],
  ["cutoff storage uses bounded timeout", source.service.includes("AbortSignal.timeout(3_000)")],
  ["cutoff storage uses no-store", source.service.includes('cache: "no-store"')],
  ["missing persistence fails closed", source.service.includes("persistence is not configured")],
  ["future cutoff timestamps are bounded", source.service.includes("+ 60")],
  ["owner route requires owner authorization", source.ownerRoute.includes("authorizeOwner")],
  ["owner route requires non-null principal", source.ownerRoute.includes("owner-principal-unavailable")],
  ["owner route requires idempotency", source.ownerRoute.includes("idempotency-key-required")],
  ["owner route requires operational reason", source.ownerRoute.includes("reason.length < 8")],
  ["owner route uses private no-store", source.ownerRoute.includes('"Cache-Control": "private, no-store, max-age=0"')],
  ["owner route excludes indexing", source.ownerRoute.includes('"X-Robots-Tag": "noindex, nofollow"')],
  ["validator checks organization cutoff", source.validator.includes("tokenPredatesOrganizationCutoff")],
  ["validator rejects pre-cutoff tokens", source.validator.includes("organization-token-cutoff")],
  ["validator performs containment checks in parallel", source.validator.includes("Promise.all")],
  ["validator fails closed when containment is unavailable", source.validator.includes("containment-service-unavailable")],
  ["browser cannot set token cutoff during validation", !source.validator.includes("invalidateBefore")],
  ["cutoff responses do not disclose signing secrets", !source.ownerRoute.includes("OBSERRA_SAAS_ACCESS_TOKEN_SECRET")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failed.length) {
  console.error(`SaaS organization token cutoff readiness failed with ${failed.length} issue(s).`);
  process.exit(1);
}
console.log(`SaaS organization token cutoff readiness passed with ${checks.length} controls.`);
