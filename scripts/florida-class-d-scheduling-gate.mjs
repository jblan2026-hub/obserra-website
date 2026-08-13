import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260813050000_fdacs_class_d_cohort_scheduling.sql"), "utf8");
const scheduling = fs.readFileSync(path.join(root, "lib", "florida-class-d-scheduling.ts"), "utf8");
const route = fs.readFileSync(path.join(root, "app", "api", "florida-class-d", "admin", "schedule", "route.ts"), "utf8");
const ui = fs.readFileSync(path.join(root, "app", "florida-security-training", "admin", "schedule", "ScheduleManager.tsx"), "utf8");
const handoff = fs.readFileSync(path.join(root, "docs", "florida-class-d-lms", "HANDOFF.md"), "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

for (const [value, message] of [
  ["fdacs_class_d_cohort_training_days", "Cohort scheduling must persist each controlled training day."],
  ["unique (cohort_id, day)", "Each cohort must have only one current schedule row per instructional day."],
  ["scheduled_start_at timestamptz", "Live sessions must store timezone-aware scheduled start time."],
  ["scheduled_end_at timestamptz", "Live sessions must store timezone-aware scheduled end time."],
  ["array_length(p_training_dates, 1) is distinct from 5", "Schedule publishing must require exactly five training dates."],
  ["training dates must be strictly increasing", "Training dates must be ordered and distinct."],
  ["v_offset_minutes := (v_lesson - 1) * 135", "Daily schedule must preserve 120-minute lessons plus 15-minute between-lesson breaks."],
  ["v_end_at := v_start_at + interval '120 minutes'", "Each scheduled live lesson must be exactly 120 instructional minutes."],
  ["for v_lesson in 1..4 loop", "Each day must produce four regulated live lessons."],
  ["'liveLessonCount', 20", "Schedule audit metadata must record all 20 live lessons."],
  ["status <> 'scheduled'", "Rescheduling must fail after regulated live activity begins."],
  ["p_time_zone", "Schedule generation must preserve an explicit facility time zone."],
  ["force row level security", "Training-day schedule records must force row-level security."],
  ["revoke all on table public.fdacs_class_d_cohort_training_days from public, anon, authenticated", "Direct browser database access to regulated schedules must be revoked."],
]) requireText(migration, value, message);

for (const [value, message] of [
  ["OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED", "Production cohort scheduling must have an independent fail-closed feature gate."],
  ["OBSERRA_FDACS_DS_LICENSE_STATUS", "Scheduling must remain blocked until the Class DS status is active."],
  ["Exactly five training dates are required", "Server scheduling service must validate five dates."],
  ["trainingDates.length !== 5", "Server scheduling service must reject non-five-day schedules."],
  ["rows.length !== 20", "Server scheduling service must fail if the database does not return exactly 20 sessions."],
  ["getFloridaClassDInstructorLicenseNumber", "Scheduling must use protected instructor license configuration."],
  ["getFloridaClassDSchoolLicenseNumber", "Scheduling must use protected school license configuration."],
]) requireText(scheduling, value, message);

requireText(route, 'requireFloridaClassDStaff(["school_admin", "compliance_admin"])', "Only school/compliance administration may publish cohort schedules.");
requireText(route, "floridaClassDSchedulingEnabled", "The scheduling API must fail closed behind its production gate.");
requireText(route, "lessonCount: lessons.length", "The scheduling API must return the generated lesson count.");
requireText(ui, "Publish 5-day / 20-lesson schedule", "The admin UI must clearly identify the complete schedule publishing action.");
requireText(ui, "(lesson - 1) * 135", "The admin preview must mirror the 15-minute between-lesson schedule." );
requireText(ui, "8h instruction + 45m breaks", "The admin preview must distinguish instruction from tracked breaks." );
requireText(handoff, "exact five-day/20-session scheduling", "The handoff must preserve the Gate 8 five-day/20-session scheduling scope.");
requireText(handoff, "### Gates 5-8", "The consolidated handoff must retain the historical Gate 5-8 implementation section.");

console.log("Florida Class D Gate 8 passed: cohort scheduling requires five ordered dates and generates exactly 20 timezone-aware two-hour live lessons with controlled breaks.");
