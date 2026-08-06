import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [guard, billing, subscriptions, revocations, cutoff] = await Promise.all([
  readFile(new URL("../lib/require-step-up.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/saas/billing/portal/route.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/owner/saas/subscriptions/route.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/owner/saas/token-revocations/route.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/api/owner/saas/organization-token-cutoff/route.ts", import.meta.url), "utf8"),
]);

const protectedRoutes = [billing, subscriptions, revocations, cutoff];
const checks = [
  [guard.includes('auth, reverificationErrorResponse'), "uses Clerk signed-session reverification"],
  [guard.includes('identity.has({ reverification: preset })'), "checks factor verification freshness"],
  [guard.includes('reverificationErrorResponse(preset)'), "returns Clerk-compatible reverification errors"],
  [guard.includes('preset: StepUpPreset = "strict"'), "defaults to strict recent verification"],
  [guard.includes('"Cache-Control": "private, no-store, max-age=0"'), "keeps authentication failures private"],
  [guard.includes('"X-Robots-Tag": "noindex, nofollow"'), "prevents authentication response indexing"],
  [protectedRoutes.every((source) => source.includes('requireStepUp("strict")')), "protects every high-risk route with strict step-up"],
  [protectedRoutes.every((source) => source.includes("if (!stepUp.allowed) return stepUp.response")), "blocks requests before sensitive work"],
  [billing.indexOf('requireStepUp("strict")') < billing.indexOf("subscriptionForOrganization"), "steps up before billing account access"],
  [subscriptions.indexOf('requireStepUp("strict")') < subscriptions.indexOf("readSubscriptionByOrganization"), "steps up before subscription mutation"],
  [revocations.indexOf('requireStepUp("strict")') < revocations.indexOf("verifySaasAccessToken"), "steps up before token inspection or revocation"],
  [cutoff.indexOf('requireStepUp("strict")') < cutoff.indexOf("setOrganizationTokenCutoff"), "steps up before organization-wide containment"],
  [subscriptions.includes("owner.userId !== stepUp.userId"), "binds owner subscription actions to the reverified principal"],
  [revocations.includes("actorUserId !== stepUp.userId"), "binds token revocation to the reverified principal"],
  [cutoff.includes("ownerUserId !== stepUp.userId"), "binds organization containment to the reverified principal"],
  [!protectedRoutes.some((source) => source.includes('type="password"')), "does not add password collection to protected routes"],
];

for (const [condition, description] of checks) {
  assert.ok(condition, `Step-up enforcement readiness failed: ${description}`);
}

console.log(`Step-up enforcement readiness passed (${checks.length} controls).`);
