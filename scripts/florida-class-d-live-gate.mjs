import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const policy = read("lib/florida-class-d-live-policy.ts");
const records = read("lib/florida-class-d-records.ts");
const persistence = read("lib/florida-class-d-live-persistence.ts");
const migration = read("supabase/migrations/20260813043000_fdacs_class_d_live_classroom.sql");
const studentApi = read("app/api/florida-class-d/live/route.ts");
const adminApi = read("app/api/florida-class-d/admin/live/route.ts");
const studentUi = read("app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx");
const instructorUi = read("app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx");
const course = read("lib/florida-class-d.ts");
const publicPage = read("app/florida-security-training/page.tsx");

const required = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

required(policy, 'physicalInstructionLocationState: "FL"', "Live instruction policy must require a Florida physical instruction location.");
required(policy, "tlsRequired: true", "Live instruction policy must require TLS.");
required(policy, "singleDeviceRequired: true", "Live instruction policy must require one active device per learner.");
required(policy, "challengeIntervalMinutes: 110", "Presence challenges must occur more frequently than the two-hour maximum interval.");
required(policy, "challengeRetryMinutes: 5", "Presence challenge retry window must be five minutes.");
required(policy, "breakMinutes: 15", "Scheduled lesson breaks must remain fifteen minutes.");
required(policy, "breaksCountTowardInstruction: false", "Break time must never count toward the 40 instructional hours.");
required(policy, "instructionalMinutesPerDay: 480", "Each day must retain 480 instructional minutes.");
required(policy, "trackedBreakMinutesPerDay: 45", "Each day must track three fifteen-minute breaks.");
required(policy, "minimumScreenSecondsPer50Words: 60", "Text-screen timing policy must preserve one minute per 50 words.");
required(policy, "studentQuestionsEnabled: true", "Students must be able to submit questions to the live instructor.");
required(policy, 'process.env.OBSERRA_FDACS_DS_LICENSE_STATUS?.trim().toLowerCase() === "active"', "Live instruction must remain disabled until the DS license status is active.");
required(policy, "OBSERRA_FDACS_DI_LICENSE_NUMBER", "Live instruction must require the configured DI license number.");
required(policy, "OBSERRA_FDACS_DS_LICENSE_NUMBER", "Live instruction must require the configured DS license number.");

for (const type of ["FloridaClassDLiveSession", "FloridaClassDDeviceLease", "FloridaClassDPresenceChallenge", "FloridaClassDLiveTimeTotal", "FloridaClassDLiveInteraction"]) {
  required(records, `type ${type}`, `Missing live regulated record contract: ${type}`);
}
required(records, "breakMinutesAreTrackedButNotCredited: true", "Record policy must distinguish break time from credited instruction.");
required(records, "singleActiveDevicePerEnrollment: true", "Record policy must enforce a single active device.");
required(records, "dailyAttendanceRequiresInstructorVerification: true", "Daily attendance must require instructor verification.");
required(records, '"ask_live_question"', "Student role must be permitted to ask live questions.");
required(records, '"answer_student_questions"', "Instructor role must be permitted to answer live questions.");
required(records, '"issue_presence_challenge"', "Instructor role must be permitted to issue presence challenges.");

for (const table of ["fdacs_class_d_live_sessions", "fdacs_class_d_device_leases", "fdacs_class_d_live_time_totals", "fdacs_class_d_presence_challenges", "fdacs_class_d_live_interactions"]) {
  required(migration, `create table if not exists public.${table}`, `Missing live regulated table ${table}.`);
  required(migration, `alter table public.${table} enable row level security`, `${table} must enable RLS.`);
  required(migration, `alter table public.${table} force row level security`, `${table} must force RLS.`);
  required(migration, `revoke all on table public.${table} from public, anon, authenticated`, `${table} must deny direct browser database access.`);
}
required(migration, "fdacs_class_d_one_active_device_idx", "Database must enforce one active learner device lease.");
required(migration, "last_heartbeat_at >= now() - interval '150 seconds'", "Device lease must fail closed while another active device is present.");
required(migration, "presence_challenge_failed_student_marked_absent", "Failed re-attempted presence challenge must mark the learner absent for review.");
required(migration, "uncredited_connected_seconds", "Connected time while marked absent must remain uncredited.");
required(migration, "break_presence_seconds", "Break presence must be stored separately.");
required(migration, "instructional_presence_seconds", "Instructional presence must be stored separately.");
required(migration, "fdacs_class_d_restore_presence_after_review", "Instructor review path is required after a failed presence challenge.");

required(persistence, "fdacs_class_d_acquire_device_lease", "Server persistence must acquire the single-device lease through the controlled RPC.");
required(persistence, "fdacs_class_d_record_live_heartbeat", "Server persistence must record presence heartbeats.");
required(persistence, "fdacs_class_d_respond_presence_challenge", "Server persistence must record challenge responses.");
required(persistence, "fdacs_class_d_live_interactions", "Server persistence must retain live Q&A and participation records.");

required(studentApi, "floridaClassDLiveInstructionEnabled", "Student live API must fail closed behind the regulatory live gate.");
required(studentApi, 'body.action === "heartbeat"', "Student live API must support presence heartbeats.");
required(studentApi, 'body.action === "challenge"', "Student live API must support presence challenges.");
required(studentApi, '"question", "hand_raise", "response", "poll_response"', "Student live API must support interaction events.");
required(adminApi, "requireFloridaClassDStaff", "Instructor live API must require server-side staff authorization.");
required(adminApi, 'body.action === "challenge"', "Instructor live API must support security challenges.");
required(adminApi, 'body.action === "segment"', "Instructor live API must control instruction versus break segments.");
required(adminApi, '"answer", "prompt", "poll"', "Instructor live API must support interactive teaching events.");

required(studentUi, "Attendance and time tracking are active", "Student classroom must disclose active attendance/time tracking.");
required(studentUi, "Breaks are tracked in the LMS but are not credited", "Student classroom must clearly distinguish break time from instruction.");
if (!studentUi.includes("Live Q&A") && !studentUi.includes("Live Q&amp;A")) {
  throw new Error("Student classroom must expose live Q&A.");
}
required(instructorUi, "Live attendance and time roster", "Instructor console must expose live attendance and time evidence.");
required(instructorUi, "Issue presence check", "Instructor console must expose security challenge control.");
required(instructorUi, "Start 15-minute break", "Instructor console must expose the required break control.");
required(instructorUi, "Student questions", "Instructor console must expose student questions.");
required(instructorUi, "elapsedInstructionMinutes >= 105", "Instructor console must automatically trigger a presence check before two instructional hours elapse.");

required(course, "liveLessonsPerDay: 4", "Course model must define four live lessons per day.");
required(course, "trackedBreakMinutesPerDay: 45", "Course model must define 45 tracked break minutes per day.");
required(publicPage, "Break time is recorded but is never credited", "Public preview must accurately disclose tracked break treatment.");
required(course, 'status: "coming-soon"', "Live source implementation must not open the course publicly.");

console.log("Florida Class D live instruction gate passed: source supports live teaching, single-device presence, time separation, challenges, Q&A, breaks, and fail-closed DS activation.");
