import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Florida Class D production capacity is explicitly engineered for 200 concurrent students", () => {
  const policy = read("lib/florida-class-d-live-policy.ts");
  const media = read("lib/florida-class-d-media.ts");
  const workflow = read(".github/workflows/florida-class-d-lms-gates.yml");

  assert.match(policy, /platformConcurrentStudentTarget:\s*200/);
  assert.match(policy, /dailyRoomParticipantLimit:\s*75/);
  assert.match(policy, /reservedInstructorSeatsPerRoom:\s*1/);
  assert.match(policy, /studentSeatsPerRoom:\s*74/);
  assert.match(policy, /minimumParallelRoomsForTarget:\s*3/);
  assert.match(policy, /capacityTargetRequiresParallelRooms:\s*true/);

  assert.match(media, /max_participants:\s*75/);
  assert.match(media, /roomName\(liveSessionId\)/);
  assert.doesNotMatch(media, /max_participants:\s*200/);

  assert.match(workflow, /Run Gate 36 concurrent learner capacity verification/);
  assert.match(workflow, /node scripts\/florida-class-d-capacity-gate\.mjs/);
});
