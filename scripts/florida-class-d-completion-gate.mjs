import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const migration = read("supabase/migrations/20260813073000_fdacs_class_d_completion_review.sql");
const service = read("lib/florida-class-d-completion.ts");
const api = read("app/api/florida-class-d/admin/completion/route.ts");
const ui = read("app/florida-security-training/admin/completion/CompletionReviewConsole.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-16-COMPLETION-REVIEW-HANDOFF.md");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(migration, "fdacs_class_d_completion_records", "Gate 16 must create durable successful-completion records.");
requireText(migration, "fdacs_class_d_lias_reporting_queue", "Gate 16 must prepare a durable LIAS reporting queue.");
requireText(migration, "identity_status = 'verified'", "Completion must require verified learner identity.");
requireText(migration, "v_total_minutes >= 2400", "Completion must require the full 40 instructional hours.");
requireText(migration, "v_days_ready = 5", "Completion must reconcile all five training days.");
requireText(migration, "v_module_complete_count = 18", "Completion must require all 18 module checks.");
requireText(migration, "status = 'passed' and passed = true and score >= 128", "Completion must require a preserved passing examination attempt.");
requireText(migration, "presence_state = 'absent_challenge'", "Completion must fail closed on unresolved live-presence security state.");
requireText(migration, "status in ('in_progress','interrupted')", "Completion must fail closed while an exam remains active or interrupted.");
requireText(migration, "completed_at is null", "Completion must fail closed on open remediation items.");
requireText(migration, "existingCompletionId", "Completion readiness must detect duplicate non-voided completion records.");
requireText(migration, "'lias_reporting_prepared'", "Completion approval must audit LIAS queue preparation.");
requireText(migration, "revoke execute on function public.fdacs_class_d_approve_completion", "Completion approval RPC must not be executable by public browser roles.");

requireText(service, "OBSERRA_FDACS_CLASS_D_COMPLETION_REVIEW_ENABLED", "Completion review must be separately feature gated.");
requireText(service, "liasExecutionMode: \"manual_queue_only\"", "LIAS handling must remain manual queue preparation only.");
requireText(service, "completionDoesNotEqualLicense: true", "The source must preserve the completion-versus-license distinction.");
requireText(service, "getFloridaClassDCompletionReadiness", "Gate 16 requires server-side completion readiness evaluation.");
requireText(service, "approveFloridaClassDCompletion", "Gate 16 requires protected successful-completion approval.");

requireText(api, "requireFloridaClassDStaff([\"compliance_admin\"])", "Completion approval must require the compliance-admin role.");
requireText(api, 'body.action !== "approve_completion"', "Completion admin API must expose only the controlled approval action in this gate.");
requireText(ui, "Approve completion & prepare LIAS queue", "The administrative console must expose the controlled completion action.");
requireText(ui, "does not automate or scrape the FDACS LIAS portal", "The console must disclose the manual LIAS boundary.");
requireText(handoff, "# Florida Class D Gate 16 Handoff", "Gate 16 requires a dedicated handoff record.");

console.log("Florida Class D Gate 16 passed: successful-completion review, 40-hour/five-day reconciliation, 18 module checks, passing-exam evidence, unresolved-security/remediation blocking, compliance approval, and manual LIAS queue preparation are validated in source.");
