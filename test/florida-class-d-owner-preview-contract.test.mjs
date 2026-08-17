import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const files = {
  policy: new URL("../lib/florida-class-d-owner-preview.ts", import.meta.url),
  auth: new URL("../lib/florida-class-d-owner-preview-auth.ts", import.meta.url),
  state: new URL("../lib/florida-class-d-owner-preview-state.ts", import.meta.url),
  stateContract: new URL("../lib/florida-class-d-owner-preview-state-contract.ts", import.meta.url),
  daily: new URL("../lib/florida-class-d-owner-preview-daily.ts", import.meta.url),
  dailyServer: new URL("../lib/florida-class-d-owner-preview-daily-server.ts", import.meta.url),
  page: new URL("../app/florida-security-training/owner-preview/page.tsx", import.meta.url),
  console: new URL("../app/florida-security-training/owner-preview/OwnerPreviewConsole.tsx", import.meta.url),
  dailyApi: new URL("../app/api/florida-class-d/owner-preview/daily/route.ts", import.meta.url),
  courseware: new URL("../lib/florida-class-d-owner-preview-courseware.ts", import.meta.url),
  coursewareApi: new URL("../app/api/florida-class-d/owner-preview/courseware/route.ts", import.meta.url),
  coursewareMigration: new URL("../supabase/migrations/20260816010000_fdacs_owner_review_courseware_storage.sql", import.meta.url),
  activationApi: new URL("../app/api/florida-class-d/owner-preview/activation-request/route.ts", import.meta.url),
  mutationBoundary: new URL("../lib/florida-class-d-mutation-boundary.ts", import.meta.url),
  providerRouting: new URL("../lib/auth/provider-routing.ts", import.meta.url),
  productionActivation: new URL("../lib/florida-class-d-production-activation.ts", import.meta.url),
  proxy: new URL("../proxy.ts", import.meta.url),
  nextConfig: new URL("../next.config.ts", import.meta.url),
  env: new URL("../.env.example", import.meta.url),
};

async function source(name) {
  return readFile(files[name], "utf8");
}

function ownerReviewPolicyModule(environment) {
  const output = ts.transpileModule(readFileSync(files.policy, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const expectedFdacsOrigin = "https://ggkxgjhsbgbifiqrhavr.supabase.co";
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require: (specifier) => specifier === "server-only"
      ? {}
      : specifier === "./florida-class-d-supabase-config"
      ? {
          floridaClassDSupabaseOriginAuthorized: (url, ref) => url === expectedFdacsOrigin && ref === "ggkxgjhsbgbifiqrhavr",
          floridaClassDServiceRoleKeyAuthorized: (key) => typeof key === "string" && key.startsWith("sb_secret_") && key.length >= 32,
        }
      : (() => { throw new Error(`Unexpected import: ${specifier}`); })(),
    process: { env: { ...environment } },
    Date,
  });
  return module.exports;
}

test("owner preview is exact-release, Supabase-owner-only, AAL2, non-credit, and fail closed", async () => {
  const [policy, auth, env] = await Promise.all([source("policy"), source("auth"), source("env")]);
  for (const name of [
    "OBSERRA_FDACS_OWNER_PREVIEW_ENABLED",
    "OBSERRA_FDACS_OWNER_PREVIEW_NON_CREDIT",
    "OBSERRA_FDACS_OWNER_PREVIEW_RELEASE_SHA",
    "OBSERRA_FDACS_OWNER_PREVIEW_EXPIRES_AT",
    "OBSERRA_FDACS_OWNER_PREVIEW_EVIDENCE_SHA256",
  ]) {
    assert.match(policy, new RegExp(name));
    assert.match(env, new RegExp(`${name}=`));
  }
  assert.match(policy, /VERCEL_ENV[\s\S]*preview/);
  assert.match(policy, /OBSERRA_FDACS_RUNTIME_ENVIRONMENT[\s\S]*uat/);
  assert.match(policy, /VERCEL_GIT_COMMIT_SHA/);
  assert.match(policy, /OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED/);
  assert.match(policy, /FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED/);
  assert.match(policy, /OBSERRA_FDACS_CLASS_D_COMPLETION_REVIEW_ENABLED/);
  assert.match(policy, /OBSERRA_FDACS_CLASS_D_LIAS_WORKFLOW_ENABLED/);
  assert.match(policy, /OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED/);
  assert.match(policy, /OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER[\s\S]*daily/);
  assert.match(policy, /OBSERRA_FDACS_DAILY_API_KEY/);
  assert.match(policy, /OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED/);
  assert.match(policy, /ftkjhmtfyfkartfsnkjb/);
  assert.match(auth, /getInternalOwnerAuthority/);
  assert.match(auth, /internalIdentityAuthorized/);
  assert.match(auth, /emailVerified/);
  assert.match(auth, /protectedReadiness\.ready/);
  assert.match(auth, /assuranceLevel[\s\S]*aal2/);
  assert.match(auth, /principalId/);
  assert.match(auth, /sessionId/);
  assert.match(auth, /correlationId/);
});

test("production owner review has a distinct exact-release authorization and never enables regulated production", async () => {
  const [policy, auth, env, proxy, activation] = await Promise.all([
    source("policy"),
    source("auth"),
    source("env"),
    source("proxy"),
    source("productionActivation"),
  ]);
  for (const name of [
    "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_AUTHORIZED",
    "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_NON_CREDIT",
    "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_RELEASE_SHA",
    "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_EXPIRES_AT",
    "OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_EVIDENCE_SHA256",
  ]) {
    assert.match(policy, new RegExp(name));
    assert.match(env, new RegExp(`${name}=`));
  }
  assert.match(policy, /VERCEL_ENV[\s\S]*production/);
  assert.match(policy, /VERCEL_GIT_COMMIT_SHA/);
  assert.match(policy, /productionRuntimeAuthorized:\s*false/);
  assert.match(policy, /enrollmentCreationAuthorized:\s*false/);
  assert.match(policy, /paymentAuthorized:\s*false/);
  assert.match(policy, /trainingDeliveryAuthorized:\s*false/);
  assert.match(policy, /trainingCreditEligible:\s*false/);
  assert.match(policy, /completionAuthorized:\s*false/);
  assert.match(policy, /certificateAuthorized:\s*false/);
  assert.match(policy, /liasAuthorized:\s*false/);
  assert.match(proxy, /productionOwnerReviewAuthorized/);
  assert.match(proxy, /floridaClassDProductionOwnerReviewExecutionAuthorized/);
  assert.match(auth, /getInternalOwnerAuthority/);
  assert.match(auth, /protectedReadiness\.ready/);
  assert.match(auth, /assuranceLevel[\s\S]*aal2/);
  const regulated = activation.slice(activation.indexOf("export function floridaClassDRegulatedExecutionAuthorized"), activation.indexOf("export function getFloridaClassDProductionActivationReport"));
  assert.doesNotMatch(regulated, /PRODUCTION_OWNER_REVIEW|OwnerPreview/);
});

test("production owner review evaluator authorizes only the exact bounded real-owner profile", () => {
  const nowMs = Date.parse("2026-08-15T20:00:00.000Z");
  const releaseSha = "c1bcbf308e73b398cfcfc72519e41c9b68408f82";
  const baseline = {
    VERCEL_ENV: "production",
    VERCEL_GIT_COMMIT_SHA: releaseSha,
    OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_AUTHORIZED: "enabled",
    OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_NON_CREDIT: "acknowledged",
    OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_RELEASE_SHA: releaseSha,
    OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_EXPIRES_AT: "2026-08-22T20:00:00.000Z",
    OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_EVIDENCE_SHA256: "a".repeat(64),
    OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED: "true",
    NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL: "https://ftkjhmtfyfkartfsnkjb.supabase.co",
    NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_owner_review_test",
    OBSERRA_AUTH_SUPABASE_PROJECT_REF: "ftkjhmtfyfkartfsnkjb",
    OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER: "daily",
    OBSERRA_FDACS_DAILY_API_KEY: "present-not-a-real-secret",
    OBSERRA_FDACS_SUPABASE_URL: "https://ggkxgjhsbgbifiqrhavr.supabase.co",
    OBSERRA_FDACS_SUPABASE_PROJECT_REF: "ggkxgjhsbgbifiqrhavr",
    OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY: `sb_secret_${"x".repeat(32)}`,
    OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED: "disabled",
    FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED: "false",
  };
  const readyModule = ownerReviewPolicyModule(baseline);
  const ready = readyModule.getFloridaClassDOwnerPreviewReport(nowMs);
  assert.equal(ready.authorized, true);
  assert.equal(ready.mode, "production_owner_review");
  assert.equal(ready.profile, "internal_owner_production_review_real_readonly_noncredit");
  for (const field of [
    "productionRuntimeAuthorized",
    "enrollmentCreationAuthorized",
    "paymentAuthorized",
    "trainingDeliveryAuthorized",
    "trainingCreditEligible",
    "completionAuthorized",
    "certificateAuthorized",
    "liasAuthorized",
  ]) assert.equal(ready[field], false, field);
  for (const [name, value] of [
    ["VERCEL_ENV", "preview"],
    ["VERCEL_GIT_COMMIT_SHA", "b".repeat(40)],
    ["OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_EXPIRES_AT", "2026-09-15T20:00:00.000Z"],
    ["OBSERRA_FDACS_PRODUCTION_OWNER_REVIEW_EVIDENCE_SHA256", ""],
    ["OBSERRA_FDACS_OWNER_PREVIEW_ENABLED", "enabled"],
    ["OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED", "enabled"],
    ["FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED", "true"],
    ["OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED", "false"],
    ["OBSERRA_FDACS_DAILY_API_KEY", ""],
    ["OBSERRA_FDACS_SUPABASE_SERVICE_ROLE_KEY", ""],
  ]) {
    const report = ownerReviewPolicyModule({ ...baseline, [name]: value }).getFloridaClassDOwnerPreviewReport(nowMs);
    assert.equal(report.authorized, false, name);
    assert.equal(report.productionRuntimeAuthorized, false, name);
    assert.equal(report.enrollmentCreationAuthorized, false, name);
  }
});

test("every owner-preview module is provider-neutral and contains no Clerk fallback", async () => {
  const names = ["policy", "auth", "state", "daily", "dailyServer", "courseware", "page", "console", "dailyApi", "coursewareApi", "activationApi"];
  for (const name of names) {
    const text = await source(name);
    assert.doesNotMatch(text, /@clerk|CLERK_|OBSERRA_IDENTITY_RUNTIME_ENABLED|ownerEmailAllowed|factorVerificationAge/, `${name} must not depend on Clerk`);
  }
  assert.match(await source("auth"), /\.\/auth\/authority-repository/);
  assert.match(await source("dailyServer"), /florida-class-d-daily-provider/);
  assert.doesNotMatch(await source("dailyServer"), /florida-class-d-media/);
});

test("rendered owner experience uses real services, real empty states, and no fabricated content", async () => {
  const [page, consoleSource, state, dailyApi, activationApi] = await Promise.all([
    source("page"), source("console"), source("state"), source("dailyApi"), source("activationApi"),
  ]);
  const combinedUi = `${page}\n${consoleSource}`;
  assert.equal(existsSync(new URL("../lib/florida-class-d-owner-preview-fixtures.ts", import.meta.url)), false);
  assert.doesNotMatch(combinedUi, /owner-preview-fixtures/);
  assert.match(page, /readFloridaClassDOwnerPreviewState/);
  assert.match(page, /report\.watermark/);
  assert.match(consoleSource, /watermark/);
  assert.match(await source("policy"), /INTERNAL OWNER UAT — REAL DATA — READ-ONLY — NON-CREDIT/);
  assert.match(await source("policy"), /INTERNAL OWNER REVIEW — REAL DATA — READ-ONLY — NON-CREDIT/);
  assert.match(combinedUi, /owner-preview__watermark/);
  assert.match(combinedUi, /owner-preview__watermark-inline/);
  for (const workflow of ["Cohort status", "Roster", "Live classroom", "Attendance and presence", "Exam monitoring", "Completion review", "Activation request"]) {
    assert.match(combinedUi, new RegExp(workflow, "i"));
  }
  assert.doesNotMatch(combinedUi, /synthetic|fixture|demo|simulation/i);
  assert.doesNotMatch(consoleSource, /placeholder=/i);
  assert.doesNotMatch(consoleSource, /Synthetic Learner|Start fixture|Issue fixture|Open fixture/i);
  assert.match(consoleSource, /No learners or enrollments/);
  assert.match(consoleSource, /authoritative row count/i);
  assert.match(await source("stateContract"), /method:\s*"HEAD"/);
  assert.match(state, /prefer:\s*"count=exact"/);
  assert.match(await source("stateContract"), /no zero-row assumption was made/i);
  assert.doesNotMatch(state, /method:\s*"(?:POST|PUT|PATCH|DELETE)"/);
  assert.match(dailyApi, /trainingCreditEligible:\s*false/);
  assert.match(dailyApi, /attendanceCredited:\s*false/);
  assert.match(dailyApi, /instructionalTimeCredited:\s*false/);
  assert.match(consoleSource, /Upload courseware/);
  assert.match(consoleSource, /Mute or remove participants/);
  assert.match(consoleSource, /Camera and microphone available/);
  assert.match(consoleSource, /PowerPoint/);
  assert.match(activationApi, /requestOwnerActivationAudit/);
  assert.match(activationApi, /activationPerformed:\s*false/);
});

test("owner courseware is private, exact-release bound, media restricted, and non-credit", async () => {
  const [courseware, coursewareApi, migration, consoleSource, nextConfig] = await Promise.all([
    source("courseware"),
    source("coursewareApi"),
    source("coursewareMigration"),
    source("console"),
    source("nextConfig"),
  ]);
  assert.match(courseware, /fdacs-owner-review-courseware/);
  assert.match(courseware, /createSignedUploadUrl/);
  assert.match(courseware, /createSignedUrl/);
  assert.match(courseware, /owner-review\/\$\{normalized\}/);
  assert.match(courseware, /100 \* 1024 \* 1024/);
  assert.match(courseware, /\.pptx/);
  assert.match(courseware, /application\/pdf/);
  assert.match(courseware, /video\/mp4/);
  assert.match(courseware, /trainingCreditEligible:\s*false/);
  assert.match(courseware, /regulatedDatabaseWritesAuthorized:\s*false/);
  assert.match(coursewareApi, /requireFloridaClassDOwnerPreviewPrincipal/);
  assert.match(coursewareApi, /cache-control.*private, no-store/i);
  assert.match(coursewareApi, /trainingCreditEligible:\s*false/g);
  assert.match(coursewareApi, /regulatedDatabaseWritesAuthorized:\s*false/g);
  assert.match(migration, /insert into storage\.buckets/);
  assert.match(migration, /public,[\s\S]*false/);
  assert.doesNotMatch(migration, /fdacs_class_d_(?:student|enrollment|attendance|completion|lias)/i);
  assert.match(consoleSource, /\.pptx,\.pdf,\.png,\.jpg,\.jpeg,\.webp,\.mp4,\.webm/);
  assert.match(consoleSource, /screen-share control/);
  assert.match(nextConfig, /ggkxgjhsbgbifiqrhavr\.storage\.supabase\.co/);
});

test("real FDACS state reads exact counts and never fabricates zero on failure", async () => {
  const { evaluateFloridaClassDOwnerPreviewState } = await import("../lib/florida-class-d-owner-preview-state-contract.ts");
  const requested = [];
  const ready = await evaluateFloridaClassDOwnerPreviewState({
    nowMs: Date.parse("2026-08-15T20:00:00.000Z"),
    request: async (table, init) => {
      requested.push({ table, init });
      return new Response(null, { status: 200, headers: { "content-range": "*/0" } });
    },
  });
  assert.equal(ready.status, "ready");
  assert.equal(Object.values(ready.counts).every((value) => value === 0), true);
  assert.equal(requested.length, 10);
  assert.equal(requested.every(({ init }) => init.method === "HEAD"), true);
  assert.equal(ready.regulatedWritesAuthorized, false);
  assert.equal(ready.trainingCreditEligible, false);
  assert.equal(ready.completionAuthorized, false);
  assert.equal(ready.certificateAuthorized, false);
  assert.equal(ready.liasAuthorized, false);

  const unavailable = await evaluateFloridaClassDOwnerPreviewState({
    request: async () => new Response(null, { status: 503 }),
  });
  assert.equal(unavailable.status, "unavailable");
  assert.equal(Object.values(unavailable.counts).every((value) => value === null), true);
  assert.match(unavailable.blockingReason, /no zero-row assumption/i);
});

test("Daily diagnostic creates one exact private classroom with instructor moderation and three learner views", async () => {
  const { createFloridaClassDOwnerPreviewDailySession, deleteFloridaClassDOwnerPreviewDailyRoom } = await import("../lib/florida-class-d-owner-preview-daily.ts");
  const releaseSha = "c1bcbf308e73b398cfcfc72519e41c9b68408f82";
  const nowMs = Date.parse("2026-08-15T20:00:00.000Z");
  const calls = [];
  let tokenIndex = 0;
  const request = async (path, init = {}, allowNotFound = false) => {
    calls.push({ path, init, allowNotFound });
    if (path === "/rooms") {
      const body = JSON.parse(init.body);
      return { name: body.name, url: `https://obserra.daily.co/${body.name}` };
    }
    if (path === "/meeting-tokens") return { token: `owner-token-${tokenIndex += 1}` };
    if (path.startsWith("/rooms/") && init.method === "DELETE") return {};
    throw new Error(`Unexpected test request ${init.method ?? "GET"} ${path}`);
  };
  const access = await createFloridaClassDOwnerPreviewDailySession({ request, releaseSha, nowMs, nonce: "abc123def456" });
  assert.equal(access.provider, "daily");
  assert.equal(access.ownerOnly, true);
  assert.equal(access.recordingEnabled, false);
  assert.equal(access.trainingCreditEligible, false);
  assert.equal(access.attendanceCredited, false);
  assert.equal(access.instructionalTimeCredited, false);
  assert.match(access.instructorJoinUrl, /^https:\/\/obserra\.daily\.co\/[^?]+\?t=owner-token-1$/);
  assert.equal(access.participantJoinUrls.length, 3);
  assert.equal(access.maximumParticipants, 4);
  assert.doesNotMatch(JSON.stringify(access), /api[_-]?key|authorization|bearer/i);
  const roomBody = JSON.parse(calls[0].init.body);
  assert.equal(roomBody.privacy, "private");
  assert.equal(roomBody.properties.max_participants, 4);
  assert.equal(roomBody.properties.eject_at_room_exp, true);
  assert.equal(roomBody.properties.enable_screenshare, true);
  assert.equal(roomBody.properties.enable_chat, true);
  assert.equal(roomBody.properties.enable_recording_ui, false);
  assert.equal(roomBody.properties.exp, Math.floor(nowMs / 1000) + 60 * 60);
  const tokenBodies = calls.filter((call) => call.path === "/meeting-tokens").map((call) => JSON.parse(call.init.body).properties);
  assert.equal(tokenBodies.length, 4);
  assert.equal(tokenBodies[0].eject_at_token_exp, true);
  assert.equal(tokenBodies[0].is_owner, true);
  assert.equal(tokenBodies[0].permissions.canAdmin, true);
  assert.equal(tokenBodies.slice(1).every((token) => token.is_owner === false), true);
  assert.equal(tokenBodies.slice(1).every((token) => token.start_audio_off === true), true);
  assert.equal(tokenBodies.slice(1).every((token) => token.start_video_off === true), true);
  assert.equal(tokenBodies.slice(1).every((token) => token.permissions.canSend === true && token.permissions.canAdmin === false), true);
  await deleteFloridaClassDOwnerPreviewDailyRoom({ request, roomName: access.roomName, releaseSha });
  assert.ok(calls.some((call) => call.path === `/rooms/${encodeURIComponent(access.roomName)}` && call.init.method === "DELETE"));
});

test("Daily room is cleaned up if owner-token provisioning fails", async () => {
  const { createFloridaClassDOwnerPreviewDailySession } = await import("../lib/florida-class-d-owner-preview-daily.ts");
  const calls = [];
  const request = async (path, init = {}) => {
    calls.push({ path, init });
    if (path === "/rooms") {
      const body = JSON.parse(init.body);
      return { name: body.name, url: `https://obserra.daily.co/${body.name}` };
    }
    if (path === "/meeting-tokens") throw new Error("owner token failed");
    if (path.startsWith("/rooms/") && init.method === "DELETE") return {};
    throw new Error("unexpected test request");
  };
  await assert.rejects(createFloridaClassDOwnerPreviewDailySession({ request, releaseSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82", nowMs: Date.now(), nonce: "cleanupcase1" }), /owner token failed/);
  assert.ok(calls.some((call) => call.path.startsWith("/rooms/") && call.init.method === "DELETE"));
});

test("only exact audited owner provider actions bypass the owner read-only mutation lock", async () => {
  const { identityProviderForRequest } = await import("../lib/auth/provider-routing.ts");
  for (const [pathname, method] of [["/api/florida-class-d/owner-preview/daily", "POST"], ["/api/florida-class-d/owner-preview/daily", "DELETE"], ["/api/florida-class-d/owner-preview/courseware", "POST"], ["/api/florida-class-d/owner-preview/courseware", "DELETE"], ["/api/florida-class-d/owner-preview/activation-request", "POST"]]) {
    const decision = identityProviderForRequest({ pathname, method });
    assert.equal(decision.provider, "supabase");
    assert.equal(decision.accessPolicy, "internal_owner_read_only");
    assert.equal(decision.mutationAllowed, true);
  }
  for (const [pathname, method] of [["/api/florida-class-d/owner-preview/daily", "PUT"], ["/api/florida-class-d/owner-preview/courseware", "PUT"], ["/api/florida-class-d/owner-preview/activation-request", "DELETE"]]) {
    const decision = identityProviderForRequest({ pathname, method });
    assert.equal(decision.accessPolicy, "internal_owner_read_only");
    assert.equal(decision.mutationAllowed, false);
  }
  for (const [pathname, method] of [["/api/florida-class-d/admin/live", "POST"], ["/api/florida-class-d/admin/enrollments", "POST"], ["/api/florida-class-d/admin/completion", "POST"]]) {
    const decision = identityProviderForRequest({ pathname, method });
    assert.equal(decision.accessPolicy, "internal_owner_read_only");
    assert.equal(decision.mutationAllowed, false);
  }
  const learner = identityProviderForRequest({ pathname: "/api/florida-class-d/live", method: "POST" });
  assert.equal(learner.accessPolicy, "standard_authenticated");
  assert.equal(learner.mutationAllowed, true);
});

test("owner provider mutations stay release-bound, same-origin, noindex, and isolated from regulated execution", async () => {
  const [boundary, activation, proxy, nextConfig] = await Promise.all([source("mutationBoundary"), source("productionActivation"), source("proxy"), source("nextConfig")]);
  assert.match(boundary, /OWNER_PREVIEW_DAILY_PATH/);
  assert.match(boundary, /OWNER_PREVIEW_COURSEWARE_PATH/);
  assert.match(boundary, /OWNER_PREVIEW_ACTIVATION_REQUEST_PATH/);
  assert.match(boundary, /floridaClassDOwnerPreviewExecutionAuthorized/);
  const regulated = activation.slice(activation.indexOf("export function floridaClassDRegulatedExecutionAuthorized"), activation.indexOf("export function getFloridaClassDProductionActivationReport"));
  assert.doesNotMatch(regulated, /OwnerPreview/);
  assert.match(proxy, /floridaClassDMutationOriginAuthorized/);
  assert.match(proxy, /\/florida-security-training\/owner-preview/);
  assert.match(proxy, /\/api\/florida-class-d\/owner-preview/);
  assert.match(proxy, /const isRestrictedOwnerClassroom = pathMatchesPrefix\(pathname, "\/florida-security-training\/owner-preview"\);/);
  assert.match(proxy, /display-capture=\(self "https:\/\/\*\.daily\.co"\)/);
  assert.match(nextConfig, /source:\s*"\/florida-security-training\/owner-preview\/:path\*"[\s\S]*headers:\s*protectedVideoInstructorHeaders/);
  assert.match(nextConfig, /value:\s*"camera=\(\), microphone=\(\), display-capture=\(\)/);
});


test("owner-review outage switch prevents middleware 503 responses", async () => {
  const proxy = await source("proxy");
  assert.match(proxy, /temporarilyDisableOwnerReviewRoute/);
  assert.match(proxy, /FDACS_OWNER_REVIEW_TEMPORARILY_UNAVAILABLE/);
  assert.match(proxy, /owner_review", "temporarily_unavailable/);
  assert.match(proxy, /status: 404/);
  assert.match(proxy, /NextResponse\.redirect\(destination, 307\)/);
});
