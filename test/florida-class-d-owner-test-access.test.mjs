import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  ownerSession: new URL("../lib/florida-class-d-owner-test-session.ts", import.meta.url),
  mutationBoundary: new URL("../lib/florida-class-d-mutation-boundary.ts", import.meta.url),
  ownerIdentity: new URL("../lib/florida-class-d-production-owner-identity.ts", import.meta.url),
  identityPage: new URL("../app/florida-security-training/owner-validation/identity/page.tsx", import.meta.url),
  identityClient: new URL("../app/florida-security-training/owner-validation/identity/OwnerIdentityValidationClient.tsx", import.meta.url),
  commandCenter: new URL("../app/florida-security-training/owner-validation/page.tsx", import.meta.url),
  lmsPage: new URL("../app/florida-security-training/owner-validation/lms/page.tsx", import.meta.url),
  ownerLmsConsole: new URL("../app/florida-security-training/owner-validation/lms/OwnerValidationLmsConsole.tsx", import.meta.url),
  ownerLmsCss: new URL("../app/florida-security-training/owner-validation/lms/owner-lms.css", import.meta.url),
  learnerPage: new URL("../app/florida-security-training/owner-validation/lms/learner/[surface]/page.tsx", import.meta.url),
  learnerWorkspace: new URL("../app/florida-security-training/owner-validation/lms/learner/[surface]/OwnerLearnerWorkspace.tsx", import.meta.url),
  dailyApi: new URL("../app/api/florida-class-d/owner-validation/daily/route.ts", import.meta.url),
  coursewareApi: new URL("../app/api/florida-class-d/owner-validation/courseware/route.ts", import.meta.url),
};

async function source(name) {
  return readFile(files[name], "utf8");
}

test("AAL2 owner test session is authenticated, preview-capable, release-bound, and fail closed", async () => {
  assert.equal(existsSync(files.ownerSession), true, "owner test session boundary must exist");
  const ownerSession = await source("ownerSession");
  assert.match(ownerSession, /getInternalOwnerAuthority/);
  assert.match(ownerSession, /ALLOWED_OWNER_TEST_ENVIRONMENTS/);
  assert.match(ownerSession, /"preview", "production"/);
  assert.match(ownerSession, /authority\.status === "unavailable"/);
  assert.match(ownerSession, /authority\.status !== "ready"/);
  assert.match(ownerSession, /authority\.internalIdentityAuthorized/);
  assert.match(ownerSession, /authority\.emailVerified/);
  assert.match(ownerSession, /authority\.protectedReadiness\.ready/);
  assert.match(ownerSession, /roles\.includes\("owner"\)/);
  assert.match(ownerSession, /assuranceLevel !== "aal2"/);
  assert.match(ownerSession, /FDACS_OWNER_TEST_AUTHORITY_UNAVAILABLE/);
  assert.match(ownerSession, /FDACS_OWNER_TEST_AAL2_REQUIRED/);
  assert.match(ownerSession, /VERCEL_GIT_COMMIT_SHA/);
  assert.match(ownerSession, /releaseCommitSha/);
  assert.doesNotMatch(ownerSession, /PRODUCTION_OWNER_VALIDATION_AUTHORIZED|OWNER_PREVIEW_ENABLED/);
});

test("legacy owner provider diagnostics remain same-origin admitted and authenticated inside their routes", async () => {
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
  const [commandCenter, identityPage, lmsPage, learnerPage] = await Promise.all([
    source("commandCenter"),
    source("identityPage"),
    source("lmsPage"),
    source("learnerPage"),
  ]);
  for (const page of [commandCenter, identityPage, lmsPage, learnerPage]) {
    assert.match(page, /getInternalOwnerAuthority/);
    assert.match(page, /redirect/);
    assert.match(page, /assuranceLevel\s*!==\s*["']aal2["']/);
    assert.match(page, /\/auth\/mfa\?redirect_url=/);
    assert.match(page, /\/sign-in\?redirect_url=/);
  }
});

test("owner LMS is a functional persistent instructor workspace with real media, monitoring, chat, notes, breaks, and courseware", async () => {
  for (const name of ["lmsPage", "ownerLmsConsole", "ownerLmsCss", "learnerPage", "learnerWorkspace"]) {
    assert.equal(existsSync(files[name]), true, `${name} must exist`);
  }
  const [commandCenter, lmsPage, consoleSource, learnerPage, learnerSource, css] = await Promise.all([
    source("commandCenter"), source("lmsPage"), source("ownerLmsConsole"), source("learnerPage"), source("learnerWorkspace"), source("ownerLmsCss"),
  ]);

  assert.match(commandCenter, /\/florida-security-training\/owner-validation\/lms/);
  assert.match(lmsPage, /OwnerValidationLmsConsole/);
  assert.match(lmsPage, /prepareSupabaseAuthRuntime/);
  assert.match(lmsPage, /releaseCommitSha=\{actor\.releaseCommitSha\}/);
  assert.match(lmsPage, /\.\/owner-lms\.css/);

  assert.match(consoleSource, /createSupabaseBrowserClient/);
  assert.match(consoleSource, /owner_lms_sessions/);
  assert.match(consoleSource, /owner_lms_participants/);
  assert.match(consoleSource, /owner_lms_messages/);
  assert.match(consoleSource, /owner_lms_notes/);
  assert.match(consoleSource, /owner_lms_course_assets/);
  assert.match(consoleSource, /owner-lms-courseware/);
  assert.match(consoleSource, /new RTCPeerConnection/);
  assert.match(consoleSource, /navigator\.mediaDevices\.getUserMedia/);
  assert.match(consoleSource, /navigator\.mediaDevices\.getDisplayMedia/);
  assert.match(consoleSource, /supabase\.channel\(`owner-lms-webrtc:/);
  assert.match(consoleSource, /Student monitoring|STUDENT MONITORING/);
  assert.match(consoleSource, /CLASS CHAT/);
  assert.match(consoleSource, /INSTRUCTOR NOTES/);
  assert.match(consoleSource, /Start 15 minute break/);
  assert.match(consoleSource, /Open learner 1/);
  assert.match(consoleSource, /Open learner 2/);
  assert.match(consoleSource, /Open learner 3/);
  assert.match(consoleSource, /Upload courseware/);
  assert.match(consoleSource, /createSignedUrl/);
  assert.match(consoleSource, /active_course_asset_id/);
  assert.match(consoleSource, /No regulated attendance or training credit is written/);
  assert.doesNotMatch(consoleSource, /\/api\/florida-class-d\/(?:admin\/)?live/);
  assert.doesNotMatch(consoleSource, /attendanceCredited:\s*true|trainingCreditEligible:\s*true|completionAuthorized:\s*true|liasAuthorized:\s*true/);

  assert.match(learnerPage, /requireFloridaClassDOwnerTestPrincipal/);
  assert.match(learnerPage, /SURFACES/);
  assert.match(learnerPage, /owner-lms\.css/);
  assert.match(learnerSource, /owner_lms_participants/);
  assert.match(learnerSource, /last_seen_at/);
  assert.match(learnerSource, /hand_raised/);
  assert.match(learnerSource, /owner_lms_messages/);
  assert.match(learnerSource, /new RTCPeerConnection/);
  assert.match(learnerSource, /navigator\.mediaDevices\.getUserMedia/);
  assert.match(learnerSource, /active_course_asset_id/);
  assert.match(learnerSource, /createSignedUrl/);
  assert.match(learnerSource, /OWNER AAL2 LEARNER REHEARSAL · NO REGULATED CREDIT/);
  assert.doesNotMatch(learnerSource, /\/api\/florida-class-d\/(?:admin\/)?live/);

  assert.match(css, /owner-lms-classroom-grid/);
  assert.match(css, /owner-lms-roster/);
  assert.match(css, /owner-lms-chat-feed/);
  assert.match(css, /owner-lms-learner-grid/);
});

test("legacy Daily and service-role courseware diagnostics remain protected but are no longer required by the functional owner workspace", async () => {
  assert.equal(existsSync(files.dailyApi), true);
  assert.equal(existsSync(files.coursewareApi), true);
  const [dailyApi, coursewareApi, consoleSource] = await Promise.all([
    source("dailyApi"), source("coursewareApi"), source("ownerLmsConsole"),
  ]);
  assert.match(dailyApi, /requireFloridaClassDOwnerTestPrincipal/);
  assert.match(coursewareApi, /requireFloridaClassDOwnerTestPrincipal/);
  assert.doesNotMatch(consoleSource, /owner-validation\/daily|owner-validation\/courseware/);
});
