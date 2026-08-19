import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const policy = read("lib/florida-class-d-live-policy.ts");
const media = read("lib/florida-class-d-media.ts");
const liveClassroomMigration = read("supabase/migrations/20260813043000_fdacs_class_d_live_classroom.sql");
const workflow = read(".github/workflows/florida-class-d-lms-gates.yml");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(`Gate 36 failed: ${message}`);
}

function numericProperty(source, name) {
  const match = source.match(new RegExp(`${name}:\\s*(\\d+)`));
  if (!match) throw new Error(`Gate 36 failed: missing numeric policy ${name}`);
  return Number(match[1]);
}

const target = numericProperty(policy, "platformConcurrentStudentTarget");
const roomLimit = numericProperty(policy, "dailyRoomParticipantLimit");
const reservedInstructorSeats = numericProperty(policy, "reservedInstructorSeatsPerRoom");
const studentSeatsPerRoom = numericProperty(policy, "studentSeatsPerRoom");
const minimumParallelRooms = numericProperty(policy, "minimumParallelRoomsForTarget");
const heartbeatSeconds = numericProperty(policy, "heartbeatSeconds");
const heartbeatWritesPerMinute = numericProperty(policy, "capacityHeartbeatWritesPerMinute");
const heartbeatWritesPerSecondCeiling = numericProperty(policy, "capacityHeartbeatWritesPerSecondCeiling");

if (target !== 200) throw new Error(`Gate 36 failed: concurrent student target must be exactly 200, found ${target}`);
if (roomLimit !== 75) throw new Error(`Gate 36 failed: governed Daily room limit must remain 75, found ${roomLimit}`);
if (reservedInstructorSeats !== 1) throw new Error(`Gate 36 failed: one instructor seat must be reserved per room, found ${reservedInstructorSeats}`);
if (studentSeatsPerRoom !== roomLimit - reservedInstructorSeats) {
  throw new Error("Gate 36 failed: governed learner seats must equal the room limit minus the reserved instructor seat");
}
if (minimumParallelRooms !== Math.ceil(target / studentSeatsPerRoom)) {
  throw new Error("Gate 36 failed: minimum parallel-room count does not cover the 200-student target");
}
if (minimumParallelRooms * studentSeatsPerRoom < target) {
  throw new Error("Gate 36 failed: configured parallel rooms do not provide enough learner seats");
}
if (heartbeatSeconds !== 60) {
  throw new Error(`Gate 36 failed: regulated heartbeat cadence must remain 60 seconds, found ${heartbeatSeconds}`);
}
if (heartbeatWritesPerMinute !== target) {
  throw new Error("Gate 36 failed: expected heartbeat writes per minute must equal the 200-student target");
}
if (heartbeatWritesPerSecondCeiling !== Math.ceil(target / heartbeatSeconds)) {
  throw new Error("Gate 36 failed: heartbeat write ceiling must cover the steady-state 200-student cadence");
}

requireText(policy, "capacityTargetRequiresParallelRooms: true", "capacity must be achieved through parallel regulated rooms rather than overloading one room");
requireText(media, `max_participants: ${roomLimit}`, "Daily room provisioning must use the governed per-room participant ceiling");
requireText(media, "roomName(liveSessionId)", "media rooms must remain isolated by live-session identity");
if (media.includes("max_participants: 200")) {
  throw new Error("Gate 36 failed: a single Daily room may not be configured for all 200 learners");
}

requireText(liveClassroomMigration, "fdacs_class_d_device_session_idx", "heartbeat lookups must retain the live-session and enrollment device index");
requireText(liveClassroomMigration, "unique (enrollment_id, live_session_id)", "per-learner live-time totals must remain one row per session");
requireText(liveClassroomMigration, "fdacs_class_d_record_live_heartbeat", "the regulated heartbeat function must remain present");
requireText(liveClassroomMigration, "least(90, extract(epoch from (now() - v_lease.last_heartbeat_at))::integer)", "heartbeat credit must remain bounded against delayed or bursty requests");
requireText(liveClassroomMigration, "for update", "heartbeat and device-lease mutation paths must retain row-level serialization");

requireText(workflow, "Run Gate 36 concurrent learner capacity verification", "regulated CI must make capacity verification mandatory");
requireText(workflow, "node scripts/florida-class-d-capacity-gate.mjs", "regulated CI must execute the capacity verifier");

console.log(JSON.stringify({
  gate: "florida-class-d-capacity-v2",
  targetConcurrentStudents: target,
  dailyRoomParticipantLimit: roomLimit,
  reservedInstructorSeatsPerRoom: reservedInstructorSeats,
  studentSeatsPerRoom,
  minimumParallelRooms,
  availableStudentSeats: minimumParallelRooms * studentSeatsPerRoom,
  heartbeatSeconds,
  expectedHeartbeatWritesPerMinute: heartbeatWritesPerMinute,
  expectedHeartbeatWritesPerSecondCeiling: heartbeatWritesPerSecondCeiling,
  databaseHeartbeatPathIndexed: true,
  databaseHeartbeatCreditBounded: true,
  singleRoomOverloadProhibited: true,
  productionLoadTestStillRequired: true,
}, null, 2));
