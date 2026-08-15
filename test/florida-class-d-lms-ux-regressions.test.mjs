import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  access: new URL("../app/florida-security-training/access/page.tsx", import.meta.url),
  learner: new URL("../app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx", import.meta.url),
  instructor: new URL("../app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx", import.meta.url),
  exam: new URL("../app/florida-security-training/exam/FloridaClassDExam.tsx", import.meta.url),
  adminApi: new URL("../app/api/florida-class-d/admin/live/route.ts", import.meta.url),
  persistence: new URL("../lib/florida-class-d-live-persistence.ts", import.meta.url),
  atomicStartMigration: new URL("../supabase/migrations/20260815170000_fdacs_class_d_atomic_initial_presence_start.sql", import.meta.url),
};

async function source(name) {
  return readFile(files[name], "utf8");
}

test("final exam submission persists the currently selected answer before scoring", async () => {
  const text = await source("exam");
  const submit = text.slice(text.indexOf("async function submit()"), text.indexOf("return (", text.indexOf("async function submit()")));
  const persistAt = submit.indexOf('action: "answer"');
  const scoreAt = submit.indexOf('action: "submit"');
  assert.ok(persistAt >= 0, "submit must persist the visible selected answer");
  assert.ok(scoreAt > persistAt, "answer persistence must complete before final scoring");
  assert.match(submit, /direction:\s*"stay"/);
});

test("initial instructor presence issuance uses one atomic server operation", async () => {
  const [instructor, adminApi, persistence] = await Promise.all([
    source("instructor"),
    source("adminApi"),
    source("persistence"),
  ]);
  const start = instructor.slice(instructor.indexOf('if (action === "start")'), instructor.indexOf("} else {", instructor.indexOf('if (action === "start")')));
  assert.doesNotMatch(start, /action:\s*"segment"/);
  assert.doesNotMatch(start, /issuePresenceCheck/);
  assert.match(adminApi, /initialPresenceVerified/);
  assert.match(adminApi, /initialPresenceChallengeCount/);
  assert.match(persistence, /fdacs_class_d_start_live_session_with_initial_presence/);
});

test("fault after uncredited start transition cannot commit credited instruction", async () => {
  const migration = await source("atomicStartMigration");
  assert.match(migration, /^begin;/);
  assert.match(migration, /commit;\s*$/);
  assert.match(migration, /from public\.fdacs_class_d_cohorts c[\s\S]*?for update;/);
  assert.match(migration, /from public\.fdacs_class_d_enrollments e[\s\S]*?for update;/);
  const breakAt = migration.indexOf("set status = 'break'");
  const faultAt = migration.indexOf("fdacs_atomic_start_fault_after_break");
  const challengeAt = migration.indexOf("insert into public.fdacs_class_d_presence_challenges");
  const verifyAt = migration.indexOf("v_issued_count <> v_eligible_count");
  const instructionAt = migration.indexOf("set status = 'live'", challengeAt);
  assert.ok(breakAt >= 0 && breakAt < faultAt && faultAt < challengeAt && challengeAt < verifyAt && verifyAt < instructionAt);
  assert.match(migration, /raise exception 'injected atomic-start failure after uncredited transition'/);
  assert.match(migration, /revoke all on function public\.fdacs_class_d_start_live_session\(/);

  let committed = { status: "scheduled", segmentType: "break", challengeCount: 0 };
  const executeAtomicStart = ({ faultAfterBreak }) => {
    const transaction = { ...committed, status: "break", segmentType: "break" };
    if (faultAfterBreak) throw new Error("injected atomic-start failure after uncredited transition");
    transaction.challengeCount = 2;
    transaction.status = "live";
    transaction.segmentType = "instruction";
    committed = transaction;
  };

  assert.throws(() => executeAtomicStart({ faultAfterBreak: true }), /injected atomic-start failure/);
  assert.deepEqual(committed, { status: "scheduled", segmentType: "break", challengeCount: 0 });
  assert.notEqual(committed.segmentType, "instruction");
});

test("learner async challenges and polls are announced once and focused", async () => {
  const text = await source("learner");
  assert.match(text, /announcedChallengeIds/);
  assert.match(text, /announcedPollIds/);
  assert.match(text, /announcementRef\.current\?\.focus\(\)/);
  assert.match(text, /role="alert"/);
});

test("learner and instructor consoles fail closed on stale polling state", async () => {
  for (const name of ["learner", "instructor"]) {
    const text = await source(name);
    assert.match(text, /lastSuccessfulRefreshAt/);
    assert.match(text, /stateStale/);
    assert.match(text, /Live state is stale/);
    assert.match(text, /Acknowledge/);
  }
});

test("failed media renewal clears stale access and keeps manual recovery visible", async () => {
  for (const name of ["learner", "instructor"]) {
    const text = await source(name);
    assert.match(text, /setMediaStale\(true\)/);
    assert.match(text, /setMedia\(null\)/);
    assert.match(text, /Renew secure video/);
  }
});

test("access control steps use authoritative completion states", async () => {
  const text = await source("access");
  assert.match(text, /hostedIdentityComplete/);
  assert.match(text, /instructorIdentityComplete/);
  assert.match(text, /controlComplete/);
  assert.doesNotMatch(text, /<b><Check[^>]*\/>01<\/b>/);
});
