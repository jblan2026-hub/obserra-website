import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  ownerSession: new URL("../lib/florida-class-d-owner-test-session.ts", import.meta.url),
  productionValidation: new URL("../lib/florida-class-d-production-owner-validation.ts", import.meta.url),
  mutationBoundary: new URL("../lib/florida-class-d-mutation-boundary.ts", import.meta.url),
  ownerIdentity: new URL("../lib/florida-class-d-production-owner-identity.ts", import.meta.url),
  identityPage: new URL("../app/florida-security-training/owner-validation/identity/page.tsx", import.meta.url),
  identityClient: new URL("../app/florida-security-training/owner-validation/identity/OwnerIdentityValidationClient.tsx", import.meta.url),
  commandCenter: new URL("../app/florida-security-training/owner-validation/page.tsx", import.meta.url),
  lmsPage: new URL("../app/florida-security-training/owner-validation/lms/page.tsx", import.meta.url),
  ownerLmsConsole: new URL("../app/florida-security-training/owner-validation/lms/OwnerValidationLmsConsole.tsx", import.meta.url),
  ownerPreview: new URL("../app/florida-security-training/owner-preview/OwnerPreviewConsole.tsx", import.meta.url),
  dailyApi: new URL("../app/api/florida-class-d/owner-validation/daily/route.ts", import.meta.url),
  coursewareApi: new URL("../app/api/florida-class-d/owner-validation/courseware/route.ts", import.meta.url),
  nextConfig: new URL("../next.config.ts", import.meta.url),
};

async function source(name) {
  return readFile(files[name], "utf8");
}

test("AAL2 owner test session is authenticated, release-bound, and preserves dependency outages as retriable", async () => {
  assert.equal(existsSync(files.ownerSession), true, "owner test session boundary must exist");
  const [ownerSession, productionValidation] = await Promise.all([
    source("ownerSession"),
    source("productionValidation"),
  ]);
  assert.match(ownerSession, /requireFloridaClassDProductionOwnerPrincipal/);
  assert.match(ownerSession, /FloridaClassDProductionOwnerAuthorizationError/);
  assert.match(ownerSession, /error\.status === 503/);
  assert.match(ownerSession, /FDACS_OWNER_TEST_AUTHORITY_UNAVAILABLE/);
  assert.match(ownerSession, /FDACS_OWNER_TEST_AAL2_REQUIRED/);
  assert.match(ownerSession, /VERCEL_GIT_COMMIT_SHA/);
  assert.match(ownerSession, /releaseCommitSha/);
  assert.doesNotMatch(ownerSession, /PRODUCTION_OWNER_VALIDATION_AUTHORIZED|OWNER_PREVIEW_ENABLED/);
  assert.match(productionValidation, /class FloridaClassDProductionOwnerAuthorizationError/);
  assert.match(productionValidation, /authority\.status === "unavailable"/);
  assert.match(productionValidation, /FDACS_PRODUCTION_OWNER_AUTHORITY_UNAVAILABLE/);
});

test("owner provider test mutations are same-origin admitted and authenticated inside their routes", async () => {
  const boundary = await source("mutationBoundary");
  assert.match(boundary, /OWNER_VALIDATION_IDENTITY_PATH/);
  assert.match(boundary, /OWNER_VALIDATION_DAILY_PATH/);
  assert.match(boundary, /OWNER_VALIDATION_COURSEWARE_PATH/);
  assert.match(boundary, /production_owner_validation/);
  assert.doesNotMatch(boundary, /getFloridaClassDProductionOwnerValidationConfiguration/);
});

test("owner Stripe Identity test is bound to the authenticated AAL2 owner session and deployed commit", async () => {
  const [identity, page, client] = await Promise.all([
    source("ownerIdentity"),
    source("identityPage"),
    source("identityClient"),
  ]);
  assert.match(identity, /requireFloridaClassDOwnerTestPrincipal/);
  assert.doesNotMatch(identity, /requireFloridaClassDProductionOwnerValidationPrincipal/);
  assert.match(identity, /obserra_auth_session_id/);
  assert.match(identity, /obserra_release_sha/);
  assert.match(identity, /require_matching_selfie:\s*true/);
  assert.doesNotMatch(page, /authorized=\{configuration\.authorized\}/);
  assert.doesNotMatch(client, /disabled=\{!authorized \|\| busy\}/);
  assert.match(client, /Start hosted ID verification/);
  assert.match(client, /providerLivemode === true/);
  assert.match(client, /providerLivemode === false/);
  assert.match(client, /Stripe provider mode unavailable/);
});

test("owner validation pages elevate signed-in AAL1 sessions through MFA instead of the global error boundary", async () => {
  const [commandCenter, identityPage, lmsPage] = await Promise.all([
    source("commandCenter"),
    source("identityPage"),
    source("lmsPage"),
  ]);
  for (const page of [commandCenter, identityPage, lmsPage]) {
    assert.match(page, /getInternalOwnerAuthority/);
    assert.match(page, /redirect/);
    assert.match(page, /assuranceLevel\s*!==\s*["']aal2["']/);
    assert.match(page, /\/auth\/mfa\?redirect_url=/);
    assert.match(page, /\/sign-in\?redirect_url=/);
  }
});

test("owner command center exposes a validated real LMS test workspace with Daily instructor video and courseware", async () => {
  assert.equal(existsSync(files.lmsPage), true, "owner LMS test page must exist");
  assert.equal(existsSync(files.dailyApi), true, "owner Daily test API must exist");
  assert.equal(existsSync(files.coursewareApi), true, "owner courseware test API must exist");
  const [commandCenter, lmsPage, ownerLmsConsole, ownerPreview, dailyApi, coursewareApi, nextConfig] = await Promise.all([
    source("commandCenter"), source("lmsPage"), source("ownerLmsConsole"), source("ownerPreview"), source("dailyApi"), source("coursewareApi"), source("nextConfig"),
  ]);
  assert.match(commandCenter, /\/florida-security-training\/owner-validation\/lms/);
  assert.match(lmsPage, /OwnerPreviewConsole/);
  assert.match(lmsPage, /initialView="live"/);
  assert.match(lmsPage, /\/api\/florida-class-d\/owner-validation\/daily/);
  assert.match(lmsPage, /\/api\/florida-class-d\/owner-validation\/courseware/);
  assert.match(ownerLmsConsole, /function isHttpsUrlArray/);
  assert.match(ownerLmsConsole, /!isHttpsUrlArray\(result\.participantJoinUrls\)/);
  assert.match(ownerLmsConsole, /result\.trainingCreditEligible !== false/);
  assert.match(ownerLmsConsole, /function isCourseware\(/);
  assert.match(ownerLmsConsole, /function isCoursewareArray\(/);
  assert.match(ownerLmsConsole, /!isCoursewareArray\(result\.courseware\)/);
  assert.match(ownerLmsConsole, /!isCourseware\(finalized\.courseware\)/);
  assert.doesNotMatch(ownerLmsConsole, /courseware as Courseware\[\]|finalized\.courseware as Courseware/);
  assert.match(ownerLmsConsole, /async function createCoursewareView/);
  assert.match(ownerLmsConsole, /setCoursewareView\(await createCoursewareView\(item\)\)/);
  assert.match(ownerLmsConsole, /roomNameRef\.current = null;\s*setDaily\(null\);\s*void deleteDailyRoom\(roomName, true\)/s);
  assert.match(ownerLmsConsole, /<nav className="owner-preview__participant-links" aria-labelledby="owner-learner-views-heading">/);
  assert.match(ownerLmsConsole, /<section className="owner-preview__courseware-list" aria-labelledby="owner-protected-courseware-heading">/);
  assert.match(ownerPreview, /Create live classroom/);
  assert.match(ownerPreview, /instructorJoinUrl/);
  assert.match(ownerPreview, /<iframe[\s\S]*instructorJoinUrl/);
  assert.match(ownerPreview, /Upload courseware/);
  assert.match(ownerPreview, /<video[\s\S]*controls/);
  assert.match(dailyApi, /requireFloridaClassDOwnerTestPrincipal/);
  assert.match(coursewareApi, /requireFloridaClassDOwnerTestPrincipal/);
  assert.match(nextConfig, /florida-security-training\/owner-validation\/lms/);
  assert.match(nextConfig, /protectedVideoInstructorHeaders/);
});
