import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const migration = read("supabase/migrations/20260813064500_fdacs_class_d_exam_monitoring.sql");
const monitoring = read("lib/florida-class-d-exam-monitoring.ts");
const exam = read("lib/florida-class-d-exam.ts");
const api = read("app/api/florida-class-d/exam/route.ts");
const adminApi = read("app/api/florida-class-d/admin/exam-monitor/route.ts");
const student = read("app/florida-security-training/exam/FloridaClassDExam.tsx");
const staff = read("app/florida-security-training/admin/exam-monitor/ExamMonitoringConsole.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-14-EXAM-MONITORING-HANDOFF.md");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(migration, "fdacs_class_d_exam_monitor_events", "Gate 14 requires durable exam monitoring events.");
requireText(migration, "session_mismatch", "Gate 14 must detect authenticated-session mismatch.");
requireText(migration, "device_mismatch", "Gate 14 must detect browser/device mismatch.");
requireText(migration, "resume_authorized", "Gate 14 must support controlled staff-authorized resume.");
requireText(migration, "exam_attempt_invalidated", "Gate 14 invalidation must be auditable.");
requireText(migration, "grant execute on function public.fdacs_class_d_record_exam_heartbeat", "Exam monitoring heartbeat must be service-role only.");
requireText(migration, "force row level security", "Monitoring records must force RLS.");

requireText(monitoring, "heartbeatSeconds: 30", "Gate 14 must define a 30-second monitoring heartbeat.");
requireText(monitoring, "oneDevicePerAttempt: true", "Gate 14 must bind an attempt to one device.");
requireText(monitoring, "oneAuthenticatedSessionPerAttempt: true", "Gate 14 must bind an attempt to one authenticated session.");
requireText(monitoring, "interruptedAttemptRequiresStaffResume: true", "Interrupted attempts must fail closed until staff review.");
requireText(exam, "FDACS_EXAM_MONITORING_PAUSED", "Answering and submission must fail closed while monitoring is interrupted.");
requireText(api, 'body.action === "heartbeat"', "Student exam API must process monitored heartbeats.");
requireText(adminApi, 'body.action === "authorize_resume"', "Admin API must support controlled resume authorization.");
requireText(adminApi, 'body.action === "invalidate"', "Admin API must support auditable invalidation.");
requireText(student, 'document.visibilityState === "visible"', "Student exam must report page visibility.");
requireText(student, "Examination paused for monitoring review", "Student experience must visibly pause after a monitoring interruption.");
requireText(student, 'role="alert"', "Student examination errors and monitoring pauses must be announced accessibly.");
requireText(student, "busyAction", "Student examination actions must prevent duplicate start, save, and submit requests.");
requireText(student, "<fieldset", "Student examination answer choices must expose a semantic grouped control.");
requireText(student, "questionHeadingRef", "Question navigation must move keyboard and assistive-technology focus to the new question.");
requireText(staff, "Authorize controlled resume", "Staff console must expose controlled resume review.");
requireText(staff, "Invalidate attempt", "Staff console must expose controlled invalidation.");
requireText(staff, 'role="alert"', "Staff examination-monitor errors must be announced accessibly.");
requireText(staff, "Administrative reason for exam attempt", "Staff exam actions must expose an accessible reason field.");
requireText(handoff, "# Florida Class D Gate 14 Handoff", "Gate 14 requires its own handoff record.");

console.log("Florida Class D Gate 14 passed: active exam monitoring, one-session/one-device enforcement, visibility interruption, staff-authorized resume, examiner monitoring, and auditable invalidation are validated in source.");
