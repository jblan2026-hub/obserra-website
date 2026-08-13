import fs from "node:fs";

const migration = fs.readFileSync("supabase/migrations/20260813110000_fdacs_class_d_text_screen_timing.sql", "utf8");
const completionGuard = fs.readFileSync("supabase/migrations/20260813111000_fdacs_class_d_text_screen_completion_guard.sql", "utf8");
const service = fs.readFileSync("lib/florida-class-d-text-screen.ts", "utf8");
const sharedData = fs.readFileSync("lib/florida-class-d-acceptance.ts", "utf8");
const studentApi = fs.readFileSync("app/api/florida-class-d/live/route.ts", "utf8");
const instructorApi = fs.readFileSync("app/api/florida-class-d/admin/live/route.ts", "utf8");
const studentUi = fs.readFileSync("app/florida-security-training/live/[liveSessionId]/InstructionalTextScreen.tsx", "utf8");
const liveClassroom = fs.readFileSync("app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx", "utf8");
const instructorControl = fs.readFileSync("app/florida-security-training/admin/live/[liveSessionId]/InstructionalTextScreenControl.tsx", "utf8");
const instructorConsole = fs.readFileSync("app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx", "utf8");
const handoff = fs.readFileSync("docs/florida-class-d-lms/GATE-24-TEXT-SCREEN-TIMING-HANDOFF.md", "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

for (const [value, message] of [
  ["fdacs_class_d_live_text_screens", "Gate 24 must persist controlled text screens."],
  ["fdacs_class_d_live_text_screen_views", "Gate 24 must persist learner text-screen evidence."],
  ["v_minimum_seconds := greatest(1, ((v_word_count * 60) + 49) / 50)", "Minimum text-screen time must be calculated server-side at 60 seconds per 50 words, prorated."],
  ["current_segment_type = 'instruction'", "Text screens must open only during live instruction."],
  ["last_heartbeat_at >= now() - interval '150 seconds'", "Learner text timing must require a current active device lease."],
  ["v_credit := least(v_elapsed, 20)", "Text-screen heartbeats must cap elapsed credit per server heartbeat."],
  ["minimum instructional text screen time has not been met", "Acknowledgment must fail before minimum server-observed time."],
  ["instructor discussion confirmation is required before closing the text screen", "Instructor discussion confirmation must be required before closure."],
  ["force row level security", "Gate 24 evidence tables must force row-level security."],
  ["revoke all on table public.fdacs_class_d_live_text_screens from public, anon, authenticated", "Direct browser access to controlled text screens must be revoked."],
]) requireText(migration, value, message);

requireText(completionGuard, "s.status = 'open'", "Learner acknowledgment must be limited to an open instructional text screen.");
requireText(completionGuard, "fdacs_class_d_missing_text_screen_acknowledgments", "Gate 24 must expose missing text-screen acknowledgments for downstream completion review.");
requireText(completionGuard, "v.acknowledged_at is null", "Missing acknowledgment evidence must be detectable for completion review.");

requireText(sharedData, "export async function floridaClassDRegulatedRequest", "Gate 24 must use the protected regulated server data helper.");
requireText(sharedData, 'process.env.OBSERRA_SUPABASE_URL?.trim() || ""', "Protected regulated data access must require explicit Supabase runtime configuration.");
if (/DEFAULT_SUPABASE_URL/.test(service)) throw new Error("Gate 24 text-screen service may not use a hardcoded Supabase fallback URL.");

for (const value of [
  "getFloridaClassDActiveTextScreen",
  "getFloridaClassDTextScreenViews",
  "openFloridaClassDLiveTextScreen",
  "beginFloridaClassDLiveTextScreenView",
  "heartbeatFloridaClassDLiveTextScreenView",
  "acknowledgeFloridaClassDLiveTextScreen",
  "closeFloridaClassDLiveTextScreen",
]) requireText(service, value, `Gate 24 service is missing ${value}.`);

for (const value of ["activeTextScreen", "text_screen_begin", "text_screen_heartbeat", "text_screen_acknowledge"]) {
  requireText(studentApi, value, `Student live API is missing Gate 24 control: ${value}.`);
}
requireText(studentApi, "requireFloridaClassDSignedInUser", "Student text-screen operations must require authenticated Class D access.");

for (const value of ["activeTextScreen", "textScreenViews", "text_screen_open", "text_screen_close"]) {
  requireText(instructorApi, value, `Instructor live API is missing Gate 24 control: ${value}.`);
}
requireText(instructorApi, 'requireFloridaClassDStaff(["instructor", "school_admin", "compliance_admin"])', "Instructor text-screen controls must preserve staff authorization.");

requireText(studentUi, 'document.visibilityState !== "visible"', "Hidden tabs must not send instructional text timing heartbeats.");
requireText(studentUi, 'action: "text_screen_begin"', "Learner UI must begin server-side text timing.");
requireText(studentUi, 'action: "text_screen_heartbeat"', "Learner UI must maintain server-side text timing evidence.");
requireText(studentUi, 'action: "text_screen_acknowledge"', "Learner UI must persist acknowledgment through the server API.");
requireText(studentUi, "setInterval", "Learner text timing must use recurring server heartbeats while visible.");
requireText(liveClassroom, "<InstructionalTextScreen", "The real learner live classroom must render the Gate 24 text-screen component.");
requireText(liveClassroom, "state?.activeTextScreen", "Learner UI must use the server-returned active text screen rather than placeholder content.");

requireText(instructorControl, 'action: "text_screen_open"', "Instructor UI must open a real controlled text screen through the protected API.");
requireText(instructorControl, 'action: "text_screen_close"', "Instructor UI must close a real controlled text screen through the protected API.");
requireText(instructorControl, "discussionNote", "Instructor UI must capture discussion confirmation before closure.");
requireText(instructorControl, "minimum_seconds", "Instructor UI must display the server-calculated minimum duration.");
requireText(instructorConsole, "<InstructionalTextScreenControl", "The real instructor live console must render the Gate 24 control.");
requireText(instructorConsole, "textScreenViews", "Instructor console must expose learner text-screen evidence.");

requireText(handoff, "No mockup, placeholder, client-only timer", "Gate 24 audit handoff must reject mockups and client-only compliance timing.");
requireText(handoff, "No production migration has been applied", "Gate 24 handoff must preserve the production fail-closed boundary.");

console.log("Florida Class D Gate 24 passed: server-calculated text-screen timing, authenticated visible-tab evidence, learner acknowledgment, instructor discussion confirmation, and protected audit boundaries are enforced in source.");
