import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const policy = read("lib/florida-class-d-live-policy.ts");
const media = read("lib/florida-class-d-media.ts");
const classroom = read("app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx");
const liveClassroomMigration = read("supabase/migrations/20260813043000_fdacs_class_d_live_classroom.sql");
const loadTest = read("load/florida-class-d-200-students.k6.js");
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
const heartbeatSteadyStateWritesPerSecondTarget = numericProperty(policy, "capacityHeartbeatSteadyStateWritesPerSecondTarget");
const heartbeatPhaseWindowSeconds = numericProperty(policy, "capacityHeartbeatPhaseWindowSeconds");

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
if (heartbeatPhaseWindowSeconds !== 55 || heartbeatPhaseWindowSeconds >= heartbeatSeconds) {
  throw new Error("Gate 36 failed: heartbeat phase window must remain 55 seconds and below the 60-second attendance cadence");
}
if (heartbeatSteadyStateWritesPerSecondTarget !== Math.ceil(target / heartbeatPhaseWindowSeconds)) {
  throw new Error("Gate 36 failed: heartbeat steady-state target must cover 200 learners across the governed phase window");
}

requireText(policy, "capacityTargetRequiresParallelRooms: true", "capacity must be achieved through parallel regulated rooms rather than overloading one room");
requireText(media, `max_participants: ${roomLimit}`, "Daily room provisioning must use the governed per-room participant ceiling");
requireText(media, "roomName(liveSessionId)", "media rooms must remain isolated by live-session identity");
if (media.includes("max_participants: 200")) {
  throw new Error("Gate 36 failed: a single Daily room may not be configured for all 200 learners");
}

requireText(classroom, "const STATE_REFRESH_INTERVAL_MS = 15_000", "learner state polling must remain bounded at the optimized 15-second interval");
requireText(classroom, "const HEARTBEAT_INTERVAL_MS = 60_000", "learner attendance heartbeat cadence must remain 60 seconds");
requireText(classroom, "function deterministicPhaseOffset", "learner recurring traffic must use deterministic phase staggering");
requireText(classroom, "HEARTBEAT_MINIMUM_PHASE_MS = 5_000", "heartbeat phase staggering must avoid an immediate synchronized burst");
requireText(classroom, "STATE_REFRESH_MINIMUM_PHASE_MS = 1_000", "state refresh phase staggering must avoid synchronized polling");
requireText(classroom, "heartbeatPhaseDelay", "heartbeat timers must derive a per-browser phase delay");
requireText(classroom, "stateRefreshPhaseDelay", "state refresh timers must derive a per-browser phase delay");
requireText(classroom, "window.setTimeout", "recurring learner traffic must be phase-started with bounded timeouts");

requireText(liveClassroomMigration, "fdacs_class_d_device_session_idx", "heartbeat lookups must retain the live-session and enrollment device index");
requireText(liveClassroomMigration, "unique (enrollment_id, live_session_id)", "per-learner live-time totals must remain one row per session");
requireText(liveClassroomMigration, "fdacs_class_d_record_live_heartbeat", "the regulated heartbeat function must remain present");
requireText(liveClassroomMigration, "least(90, extract(epoch from (now() - v_lease.last_heartbeat_at))::integer)", "heartbeat credit must remain bounded against delayed or bursty requests");
requireText(liveClassroomMigration, "for update", "heartbeat and device-lease mutation paths must retain row-level serialization");

requireText(loadTest, "TARGET_CONCURRENT_STUDENTS = 200", "the executable load harness must target exactly 200 authenticated learners");
requireText(loadTest, 'executor: "constant-vus"', "the load harness must maintain concurrent learners rather than send a one-shot burst");
requireText(loadTest, "vus: TARGET_CONCURRENT_STUDENTS", "the load harness must bind VUs to the governed capacity target");
requireText(loadTest, "FDACS_LOAD_TEST_IDENTITIES_JSON", "the load harness must require real authenticated learner identities");
requireText(loadTest, "ALLOW_PRODUCTION_LOAD_TEST", "the load harness must block accidental production load by default");
requireText(loadTest, 'http_req_failed: ["rate<0.01"]', "the load harness must enforce a sub-one-percent HTTP failure threshold");
requireText(loadTest, 'http_req_duration: ["p(95)<2000", "p(99)<4000"]', "the load harness must enforce latency thresholds");
requireText(loadTest, 'operation: "heartbeat"', "the workload must exercise regulated attendance heartbeat writes");
requireText(loadTest, 'operation: "state"', "the workload must exercise learner state reads");
requireText(loadTest, 'operation: "media"', "the workload must exercise real Daily media access issuance");

requireText(workflow, "Run Gate 36 concurrent learner capacity verification", "regulated CI must make capacity verification mandatory");
requireText(workflow, "node scripts/florida-class-d-capacity-gate.mjs", "regulated CI must execute the capacity verifier");

console.log(JSON.stringify({
  gate: "florida-class-d-capacity-v4",
  targetConcurrentStudents: target,
  dailyRoomParticipantLimit: roomLimit,
  reservedInstructorSeatsPerRoom: reservedInstructorSeats,
  studentSeatsPerRoom,
  minimumParallelRooms,
  availableStudentSeats: minimumParallelRooms * studentSeatsPerRoom,
  heartbeatSeconds,
  expectedHeartbeatWritesPerMinute: heartbeatWritesPerMinute,
  heartbeatSteadyStateWritesPerSecondTarget,
  heartbeatPhaseWindowSeconds,
  deterministicHeartbeatStaggeringRequired: true,
  deterministicStatePollingStaggeringRequired: true,
  databaseHeartbeatPathIndexed: true,
  databaseHeartbeatCreditBounded: true,
  executableAuthenticatedLoadHarness: "load/florida-class-d-200-students.k6.js",
  loadHarnessRequiresRealLearnerSessions: true,
  accidentalProductionLoadBlocked: true,
  singleRoomOverloadProhibited: true,
  productionLoadTestStillRequired: true,
}, null, 2));
