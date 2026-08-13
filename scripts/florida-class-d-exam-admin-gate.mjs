import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const migration = read("supabase/migrations/20260813061000_fdacs_class_d_exam_bank_admin.sql");
const service = read("lib/florida-class-d-exam-admin.ts");
const api = read("app/api/florida-class-d/admin/exam-bank/route.ts");
const handoff = read("docs/florida-class-d-lms/GATE-13-EXAM-BANK-ADMIN-HANDOFF.md");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(migration, "fdacs_class_d_exam_bank_imports", "Gate 13 requires durable exam-bank import records.");
requireText(migration, "source_sha256", "Exam-bank imports require immutable source hashing.");
requireText(migration, "force row level security", "Exam-bank import records must force RLS.");
requireText(migration, "grant execute on function public.fdacs_class_d_mark_exam_bank_approved", "Exam-bank status promotion must remain service-role controlled.");
requireText(migration, "only a draft exam bank may be marked submitted", "Only validated draft banks may enter the Division-submitted state.");
requireText(migration, "exam bank must be division-submitted before approval is recorded", "Approval cannot bypass the submitted state.");
requireText(migration, "status = 'retired'", "Promoting a new approved bank must retire the prior approved bank.");

requireText(service, "publicRepositoryQuestionBankAllowed: false", "Production examination questions must not be stored in the public repository.");
requireText(service, "answerKeysStoredOnlyInProtectedDatastore: true", "Answer keys must remain in the protected datastore.");
requireText(service, "payload.questions.length !== 170", "Exam-bank import must require exactly 170 questions.");
requireText(service, "count.tf * 2 > count.total", "Exam-bank import must enforce the 50-percent true/false subject limit.");
requireText(service, "counts.size !== 18", "Exam-bank import must require all 18 controlled subject areas.");
requireText(service, "fdacs_class_d_validate_exam_bank", "Imported exam banks must be database-validated before status promotion.");
requireText(service, "sourceSha256", "Exam-bank import must preserve a source digest for traceability.");
requireText(service, "OBSERRA_FDACS_CLASS_D_EXAM_ADMIN_ENABLED", "Exam-bank administration requires an independent fail-closed feature gate.");

requireText(api, 'requireFloridaClassDStaff(["compliance_admin"])', "Exam-bank write operations must require compliance administrator authorization.");
requireText(api, 'body.action === "import"', "Protected API must support controlled exam-bank import.");
requireText(api, 'body.action === "mark_submitted"', "Protected API must support Division-submission state recording.");
requireText(api, 'body.action === "mark_approved"', "Protected API must support recording Division approval only after external approval exists.");
requireText(handoff, "# Florida Class D Gate 13 Handoff", "Gate 13 requires a dedicated controlled handoff.");

console.log("Florida Class D Gate 13 passed: protected exam-bank import, source hashing, 170-question validation, 18-subject coverage, true/false limits, service-role status promotion, and Division-approval recording boundaries are validated in source.");
