import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  proxy: new URL("../proxy.ts", import.meta.url),
  ownerAuth: new URL("../lib/florida-class-d-owner-preview-auth.ts", import.meta.url),
  mutationBoundary: new URL("../lib/florida-class-d-mutation-boundary.ts", import.meta.url),
  ownerIdentity: new URL("../lib/florida-class-d-production-owner-identity.ts", import.meta.url),
  identityPage: new URL("../app/florida-security-training/owner-validation/identity/page.tsx", import.meta.url),
  identityClient: new URL("../app/florida-security-training/owner-validation/identity/OwnerIdentityValidationClient.tsx", import.meta.url),
  commandCenter: new URL("../app/florida-security-training/owner-validation/page.tsx", import.meta.url),
  ownerPreview: new URL("../app/florida-security-training/owner-preview/OwnerPreviewConsole.tsx", import.meta.url),
};

async function source(name) {
  return readFile(files[name], "utf8");
}

test("AAL2 owner can enter the owner LMS test workspace without release-flag gating", async () => {
  const [proxy, ownerAuth] = await Promise.all([source("proxy"), source("ownerAuth")]);

  assert.doesNotMatch(proxy, /temporarilyDisableOwnerReviewRoute\(request\)/);
  assert.doesNotMatch(ownerAuth, /if \(!report\.authorized/);
  assert.match(ownerAuth, /getInternalOwnerAuthority/);
  assert.match(ownerAuth, /roles\.includes\("owner"\)/);
  assert.match(ownerAuth, /assuranceLevel === "aal2"/);
  assert.match(ownerAuth, /VERCEL_GIT_COMMIT_SHA/);
});

test("owner provider diagnostics pass the same-origin boundary and authenticate inside the route", async () => {
  const boundary = await source("mutationBoundary");

  assert.match(boundary, /OWNER_PREVIEW_DAILY_PATH[\s\S]*authorized:\s*true/);
  assert.match(boundary, /OWNER_PREVIEW_COURSEWARE_PATH[\s\S]*authorized:\s*true/);
  assert.match(boundary, /OWNER_VALIDATION_PREFIX[\s\S]*authorized:\s*true/);
});

test("owner Stripe Identity test is bound to the authenticated AAL2 owner session and deployed commit", async () => {
  const [identity, page, client] = await Promise.all([
    source("ownerIdentity"),
    source("identityPage"),
    source("identityClient"),
  ]);

  assert.match(identity, /requireFloridaClassDProductionOwnerPrincipal/);
  assert.doesNotMatch(identity, /requireFloridaClassDProductionOwnerValidationPrincipal/);
  assert.match(identity, /VERCEL_GIT_COMMIT_SHA/);
  assert.match(identity, /obserra_auth_session_id/);
  assert.match(identity, /require_matching_selfie:\s*true/);
  assert.doesNotMatch(page, /authorized=\{configuration\.authorized\}/);
  assert.doesNotMatch(client, /disabled=\{!authorized \|\| busy\}/);
});

test("owner command center exposes live instructor video and courseware testing", async () => {
  const [commandCenter, ownerPreview] = await Promise.all([
    source("commandCenter"),
    source("ownerPreview"),
  ]);

  assert.match(commandCenter, /\/florida-security-training\/owner-preview/);
  assert.match(ownerPreview, /Create live classroom/);
  assert.match(ownerPreview, /instructorJoinUrl/);
  assert.match(ownerPreview, /<iframe[\s\S]*daily\.instructorJoinUrl/);
  assert.match(ownerPreview, /Upload courseware/);
  assert.match(ownerPreview, /<video[\s\S]*controls/);
});
