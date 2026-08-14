import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const migration = read("supabase/migrations/20260813051000_fdacs_class_d_live_polls.sql");
const polls = read("lib/florida-class-d-polls.ts");
const studentApi = read("app/api/florida-class-d/live/route.ts");
const adminApi = read("app/api/florida-class-d/admin/live/route.ts");
const studentUi = read("app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx");
const instructorUi = read("app/florida-security-training/admin/live/[liveSessionId]/InstructorLiveConsole.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-9-PARTICIPATION-HANDOFF.md");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

for (const [value, message] of [
  ["create table if not exists public.fdacs_class_d_live_polls", "Structured live polls require a durable regulated poll table."],
  ["create table if not exists public.fdacs_class_d_live_poll_responses", "Structured live polls require durable per-student response records."],
  ["unique (poll_id, enrollment_id)", "A student must be limited to one response per structured poll."],
  ["fdacs_class_d_one_open_live_poll_idx", "The database must prevent more than one open poll per live session."],
  ["where status = 'open'", "The one-open-poll constraint must apply only to open polls."],
  ["response_milliseconds between 0 and 7200000", "Poll response timing must be bounded in the database."],
  ["fdacs_class_d_open_live_poll", "A controlled poll-open transaction is required."],
  ["fdacs_class_d_submit_live_poll_response", "A controlled student poll-response transaction is required."],
  ["fdacs_class_d_close_live_poll", "A controlled poll-close transaction is required."],
  ["where id = p_live_session_id and status = 'live'", "Structured polls may open only during live instruction."],
  ["student has already submitted this poll", "Duplicate student responses must fail closed."],
  ["'poll_response', 'Structured live poll response submitted'", "Structured poll participation must also be represented in the live interaction evidence stream."],
  ["alter table public.fdacs_class_d_live_polls force row level security", "Live poll records must force row-level security."],
  ["alter table public.fdacs_class_d_live_poll_responses force row level security", "Live poll response records must force row-level security."],
  ["revoke all on table public.fdacs_class_d_live_polls from public, anon, authenticated", "Direct browser access to live poll records must be revoked."],
  ["revoke all on table public.fdacs_class_d_live_poll_responses from public, anon, authenticated", "Direct browser access to live poll response records must be revoked."],
]) requireText(migration, value, message);

for (const [value, message] of [
  ["getFloridaClassDStudentPollState", "Student poll state must be generated through a student-safe server service."],
  ['select: "id,question,options,status,opened_at"', "Student poll payload must exclude the correct answer field."],
  ["selected_option_index,submitted_at", "Student poll state must return whether the student already answered without returning correctness."],
  ["getFloridaClassDInstructorPolls", "Instructor poll history and response counts are required."],
  ["response_count", "Instructor polling requires per-poll response counts."],
  ["getFloridaClassDParticipationAnalytics", "Per-student participation analytics are required."],
  ["questionCount", "Participation analytics must count live student questions."],
  ["handRaiseCount", "Participation analytics must count hand raises."],
  ["pollResponseRate", "Participation analytics must calculate poll response rate."],
  ["pollCorrectCount", "Instructor analytics may retain scored live-poll outcomes for instructional review."],
]) requireText(polls, value, message);

requireText(studentApi, "getFloridaClassDStudentPollState", "Student live API must return student-safe structured poll state.");
requireText(studentApi, 'body.action === "poll_response"', "Student live API must expose the structured poll-response action.");
requireText(studentApi, "submitFloridaClassDLivePollResponse", "Student poll responses must use the controlled poll transaction.");
requireText(studentApi, "activePollResponse", "Student API must return prior-response state to prevent duplicate UX submissions.");

requireText(adminApi, "getFloridaClassDInstructorPolls", "Instructor live API must return structured poll state.");
requireText(adminApi, "getFloridaClassDParticipationAnalytics", "Instructor live API must return participation analytics.");
requireText(adminApi, 'body.action === "poll_create"', "Instructor live API must support controlled poll creation.");
requireText(adminApi, 'body.action === "poll_close"', "Instructor live API must support controlled poll closure.");
requireText(adminApi, "openFloridaClassDLivePoll", "Instructor poll creation must use the controlled server service.");
requireText(adminApi, "closeFloridaClassDLivePoll", "Instructor poll closure must use the controlled server service.");

requireText(studentUi, "Live knowledge poll", "Student live classroom must expose structured live polls.");
requireText(studentUi, "Response recorded in your regulated participation record", "Student UI must confirm durable participation recording.");
requireText(studentUi, "Correct-answer data is not exposed through the student live-class API", "Student UI must state the correct-answer confidentiality boundary.");
requireText(instructorUi, "Structured live poll", "Instructor console must expose the structured poll builder.");
requireText(instructorUi, "Current poll responses", "Instructor console must expose current poll response count.");
requireText(instructorUi, "participationLabel", "Instructor roster must display per-student participation evidence.");
requireText(handoff, "## Gate 9 — Structured Live Polls and Participation Analytics", "The dedicated Class D Gate 9 handoff must record polling and analytics controls.");

console.log("Florida Class D Gate 9 passed: structured live polls, one-response controls, student-safe payloads, instructor analytics, and participation evidence validated in source.");
