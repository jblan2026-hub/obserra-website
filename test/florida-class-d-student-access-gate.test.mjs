import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  access: new URL("../app/florida-security-training/access/page.tsx", import.meta.url),
  enroll: new URL("../app/florida-security-training/enroll/page.tsx", import.meta.url),
  identity: new URL("../app/florida-security-training/identity/page.tsx", import.meta.url),
  live: new URL("../app/florida-security-training/live/[liveSessionId]/page.tsx", import.meta.url),
  exam: new URL("../app/florida-security-training/exam/page.tsx", import.meta.url),
  makeup: new URL("../app/florida-security-training/makeup/page.tsx", import.meta.url),
  completion: new URL("../app/florida-security-training/completion/page.tsx", import.meta.url),
  studentAccess: new URL("../lib/florida-class-d-student-access.ts", import.meta.url),
  env: new URL("../.env.example", import.meta.url),
};

async function source(name) {
  return readFile(files[name], "utf8");
}

test("every student training and record surface requires authenticated eligible enrollment", async () => {
  const [access, live, exam, makeup, completion, policy] = await Promise.all([
    source("access"),
    source("live"),
    source("exam"),
    source("makeup"),
    source("completion"),
    source("studentAccess"),
  ]);

  assert.match(policy, /getFloridaClassDIdentityVerificationStatus/);
  assert.match(policy, /enrollmentId/);
  assert.match(policy, /instructionalAccessGranted/);
  assert.match(policy, /enrolled/);
  assert.match(policy, /in_progress/);

  for (const route of [access, live, exam, makeup, completion]) {
    assert.match(route, /auth\(\)/);
    assert.match(route, /evaluateFloridaClassDStudentAccess/);
    assert.match(route, /notFound\(\)/);
  }
  assert.doesNotMatch(access, /Begin controlled enrollment/);
});

test("identity requires an existing eligible pre-course enrollment", async () => {
  const identity = await source("identity");
  assert.match(identity, /auth\(\)/);
  assert.match(identity, /evaluateFloridaClassDIdentityStageAccess/);
  assert.match(identity, /notFound\(\)/);
});

test("enrollment creation UI remains unavailable while its explicit flag is false", async () => {
  const [enroll, env] = await Promise.all([source("enroll"), source("env")]);
  assert.match(enroll, /floridaClassDPreEnrollmentEnabled/);
  assert.match(enroll, /notFound\(\)/);
  assert.match(env, /^FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED=false$/m);
  assert.match(env, /^OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED=disabled$/m);
  assert.match(env, /^OBSERRA_FDACS_CLASS_D_COMPLETION_REVIEW_ENABLED=disabled$/m);
  assert.match(env, /^OBSERRA_FDACS_CLASS_D_LIAS_WORKFLOW_ENABLED=disabled$/m);
  assert.match(env, /^OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED=disabled$/m);
});
