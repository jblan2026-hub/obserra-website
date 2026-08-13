import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const records = read("supabase/migrations/20260813052000_fdacs_class_d_makeup_records.sql");
const access = read("supabase/migrations/20260813052100_fdacs_class_d_makeup_access.sql");
const constraints = read("supabase/migrations/20260813052200_fdacs_class_d_makeup_constraints.sql");
const service = read("lib/florida-class-d-makeup.ts");
const studentApi = read("app/api/florida-class-d/makeup/route.ts");
const adminApi = read("app/api/florida-class-d/admin/makeup/route.ts");
const studentPage = read("app/florida-security-training/makeup/page.tsx");
const studentPortal = read("app/florida-security-training/makeup/MakeupPortal.tsx");
const adminPage = read("app/florida-security-training/admin/makeup/page.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-10-MAKEUP-HANDOFF.md");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(records, "create table if not exists public.fdacs_class_d_makeup_assignments", "Gate 10 requires durable make-up assignment records.");
requireText(records, "create table if not exists public.fdacs_class_d_makeup_questions", "Gate 10 requires a durable student/instructor make-up question channel.");
requireText(records, "delivery_method in ('live_makeup','recorded_makeup')", "Make-up delivery method must distinguish live and recorded instruction.");
requireText(access, "force row level security", "Make-up tables must force row-level security.");
requireText(access, "revoke all on table public.fdacs_class_d_makeup_assignments from public, anon, authenticated", "Direct browser access to make-up assignments must be revoked.");
requireText(access, "revoke all on table public.fdacs_class_d_makeup_questions from public, anon, authenticated", "Direct browser access to make-up questions must be revoked.");
requireText(constraints, "fdacs_class_d_makeup_status_check", "Make-up assignment status must be database constrained.");
requireText(constraints, "fdacs_class_d_makeup_certified_minutes_check", "Certified make-up minutes must be constrained by assigned minutes.");
requireText(constraints, "fdacs_class_d_makeup_evidence_time_check", "Make-up evidence timestamps must be ordered.");

requireText(service, "MAX_RECORDED_MAKEUP_MINUTES = 600", "Recorded make-up must remain capped at 600 minutes per student.");
requireText(service, "MAX_DAILY_INSTRUCTIONAL_MINUTES = 480", "Daily reconciliation must retain the 480-minute instructional ceiling.");
requireText(service, "MAX_COURSE_INSTRUCTIONAL_MINUTES = 2400", "Course reconciliation must retain the 2,400-minute instructional ceiling.");
requireText(service, "OBSERRA_FDACS_CLASS_D_MAKEUP_ENABLED", "Make-up workflow requires an independent production feature gate.");
requireText(service, 'OBSERRA_FDACS_DS_LICENSE_STATUS?.trim().toLowerCase() === "active"', "Make-up workflow must remain disabled until Class DS status is active.");
requireText(service, "originalLiveAttendanceRemainsImmutable: true", "Make-up workflow must preserve the original live-attendance evidence.");
requireText(service, "certificationMutationEnabledInThisGate: false", "Instructional-credit mutation must fail closed until the transactional certification subgate.");
requireText(service, "recordedPlaybackEnabledInThisGate: false", "Recorded playback must remain disabled until its protected delivery subgate.");
requireText(service, "activeRecordedAssignedMinutes", "Recorded assignment totals must be checked before creation.");
requireText(service, "makeup_auto_cancelled_recorded_limit", "Concurrent recorded assignment overflow must auto-cancel rather than remain active.");
requireText(service, "submitFloridaClassDMakeupQuestion", "Students must be able to submit make-up questions.");
requireText(service, "answerFloridaClassDMakeupQuestion", "Authorized staff must be able to answer make-up questions.");
requireText(service, "previewFloridaClassDMakeupReconciliation", "Gate 10 must calculate an auditable time-reconciliation ceiling.");
requireText(service, "maximumCertifiableMinutes", "Reconciliation must calculate the maximum permissible credit without mutating it.");

requireText(studentApi, "requireFloridaClassDSignedInUser", "Student make-up API must require authentication.");
requireText(studentApi, 'body.action !== "question"', "Student API must restrict its write path to the controlled question action.");
requireText(adminApi, "requireFloridaClassDStaff", "Make-up administration API must require staff authorization.");
requireText(adminApi, 'body.action === "assign"', "Admin API must support controlled make-up assignment.");
requireText(adminApi, 'body.action === "answer"', "Admin API must support instructor responses.");
requireText(adminApi, 'body.action === "preview_reconciliation"', "Admin API must expose reconciliation preview.");
requireText(adminApi, "FDACS_MAKEUP_CERTIFICATION_TRANSACTION_PENDING", "Instructional-credit certification must remain explicitly fail closed in this subgate.");

requireText(studentPage, "MakeupPortal", "Student make-up route must render the dedicated portal.");
requireText(studentPortal, "Regulated time reconciliation", "Student portal must explain its controlled time-reconciliation purpose.");
requireText(adminPage, "requireFloridaClassDStaff", "Admin make-up route must enforce staff authorization server-side.");
requireText(handoff, "# Florida Class D Gate 10 Handoff", "Gate 10 requires its own controlled handoff record.");
requireText(handoff, "600 minutes", "Gate 10 handoff must preserve the recorded make-up ceiling.");

console.log("Florida Class D Gate 10 foundation passed: make-up assignments, student/instructor questions, reconciliation ceilings, protected records, and fail-closed credit mutation are validated in source.");
