import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const migration = read("supabase/migrations/20260813060000_fdacs_class_d_final_exam.sql");
const service = read("lib/florida-class-d-exam.ts");
const api = read("app/api/florida-class-d/exam/route.ts");
const ui = read("app/florida-security-training/exam/FloridaClassDExam.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-12-FINAL-EXAM-HANDOFF.md");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(migration, "required_question_count integer not null default 170", "Gate 12 must fix the total examination question count at 170.");
requireText(migration, "passing_score integer not null default 128", "Gate 12 must fix the passing score at 128.");
requireText(migration, "minimum_exam_seconds integer not null default 7200", "Gate 12 must enforce a minimum two-hour examination duration.");
requireText(migration, "status = 'division_approved'", "Gate 12 must require a Division-approved examination bank.");
requireText(migration, "having count(*) filter (where question_type = 'true_false') * 2 > count(*)", "Gate 12 must reject subject areas with more than 50 percent true/false questions.");
requireText(migration, "array_agg(id order by random())", "Gate 12 must randomize test questions.");
requireText(migration, "revoke all on table public.fdacs_class_d_exam_questions from public, anon, authenticated", "Exam questions and answer keys must not be directly browser accessible.");
requireText(migration, "minimum two-hour examination duration has not elapsed", "Submission must fail closed before two hours elapse.");
requireText(migration, "v_score >= 128", "Database scoring must apply the 128-question passing threshold.");

requireText(service, "answerKeyBrowserExposureAllowed: false", "Answer keys must remain server-only.");
requireText(service, "OBSERRA_FDACS_CLASS_D_EXAM_ENABLED", "The exam requires an independent fail-closed feature gate.");
requireText(service, "divisionApprovedBankRequired: true", "The service must declare the Division-approved bank requirement.");
requireText(service, "studentSafeQuestion", "The service must emit a student-safe question payload.");
requireText(service, "correct_choice_key", "Scoring may use the answer key only on the protected service/database boundary.");

requireText(api, "requireFloridaClassDSignedInUser", "The examination API must require authenticated learner identity.");
requireText(api, 'body.action === "start"', "The examination API must support controlled attempt start.");
requireText(api, 'body.action === "answer"', "The examination API must support controlled answer persistence.");
requireText(api, 'body.action === "submit"', "The examination API must support controlled submission.");

requireText(ui, "170 questions", "The learner UI must disclose the 170-question controlled examination.");
requireText(ui, "minimum 2 hours", "The learner UI must disclose the minimum two-hour examination duration.");
requireText(ui, "The answer key and scoring logic are never sent to the browser", "The learner UI must preserve examination security expectations.");
requireText(handoff, "# Florida Class D Gate 12 Handoff", "Gate 12 requires a dedicated handoff record.");

console.log("Florida Class D Gate 12 passed: protected 170-question examination architecture, Division-approved bank gating, two-hour minimum duration, randomized question order, 128 passing threshold, and server-only scoring boundaries are validated in source.");
