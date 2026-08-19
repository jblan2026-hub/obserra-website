import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Florida Class D production capacity is explicitly engineered for 200 concurrent students", () => {
  const policy = read("lib/florida-class-d-live-policy.ts");
  const media = read("lib/florida-class-d-media.ts");
  const liveClassroomMigration = read("supabase/migrations/20260813043000_fdacs_class_d_live_classroom.sql");
  const capacityGate = read("scripts/florida-class-d-capacity-gate.mjs");
  const workflow = read(".github/workflows/florida-class-d-lms-gates.yml");

  assert.match(policy, /platformConcurrentStudentTarget:\s*200/);
  assert.match(policy, /dailyRoomParticipantLimit:\s*75/);
  assert.match(policy, /reservedInstructorSeatsPerRoom:\s*1/);
  assert.match(policy, /studentSeatsPerRoom:\s*74/);
  assert.match(policy, /minimumParallelRoomsForTarget:\s*3/);
  assert.match(policy, /capacityTargetRequiresParallelRooms:\s*true/);
  assert.match(policy, /heartbeatSeconds:\s*60/);
  assert.match(policy, /capacityHeartbeatWritesPerMinute:\s*200/);
  assert.match(policy, /capacityHeartbeatWritesPerSecondCeiling:\s*4/);

  assert.match(media, /max_participants:\s*75/);
  assert.match(media, /roomName\(liveSessionId\)/);
  assert.doesNotMatch(media, /max_participants:\s*200/);

  assert.match(liveClassroomMigration, /fdacs_class_d_device_session_idx/);
  assert.match(liveClassroomMigration, /unique \(enrollment_id, live_session_id\)/);
  assert.match(liveClassroomMigration, /fdacs_class_d_record_live_heartbeat/);
  assert.match(liveClassroomMigration, /least\(90, extract\(epoch from \(now\(\) - v_lease\.last_heartbeat_at\)\)::integer\)/);

  assert.match(capacityGate, /capacityHeartbeatWritesPerMinute/);
  assert.match(capacityGate, /capacityHeartbeatWritesPerSecondCeiling/);
  assert.match(capacityGate, /productionLoadTestStillRequired:\s*true/);

  assert.match(workflow, /Run Gate 36 concurrent learner capacity verification/);
  assert.match(workflow, /node scripts\/florida-class-d-capacity-gate\.mjs/);
});
