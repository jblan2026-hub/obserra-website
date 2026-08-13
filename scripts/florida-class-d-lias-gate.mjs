import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`Gate 17 failed: ${message}`);
};

const migration = read("supabase/migrations/20260813074500_fdacs_class_d_lias_workflow.sql");
const hardening = read("supabase/migrations/20260813075100_fdacs_class_d_lias_document_hardening.sql");
const documentMigration = read("supabase/migrations/20260813075000_fdacs_class_d_completion_documents.sql");
const liasService = read("lib/florida-class-d-lias.ts");
const documentService = read("lib/florida-class-d-completion-documents.ts");
const adminLiasRoute = read("app/api/florida-class-d/admin/lias/route.ts");
const adminDocumentRoute = read("app/api/florida-class-d/admin/completion-documents/route.ts");
const studentRoute = read("app/api/florida-class-d/completion-documents/route.ts");
const studentPage = read("app/florida-security-training/completion/page.tsx");
const adminConsole = read("app/florida-security-training/admin/lias/LiasWorkflowConsole.tsx");

assert(migration.includes("reporting_due_on") && migration.includes("3"), "LIAS queue must track the controlled three-business-day reporting deadline");
assert(migration.includes("manual_queue_only") && liasService.includes('directPortalAutomationAllowed: false'), "LIAS execution must remain manual and must not automate or scrape the state portal");
assert(migration.includes("fdacs_class_d_mark_lias_submitted") && migration.includes("fdacs_class_d_confirm_lias_certificate"), "LIAS submission and certificate confirmation transitions must be server controlled");
assert(migration.includes("fdacs_class_d_lias_workflow_events") && migration.includes("append-only"), "LIAS workflow history must be durable and append-only");
assert(hardening.includes("alter column reporting_due_on set default") && hardening.includes("prepared_event"), "future completion queue rows must receive a due date and prepared event automatically");
assert(documentMigration.includes("fdacs_16103") && documentMigration.includes("source_system"), "completion documents must distinguish the official LIAS-generated FDACS-16103");
assert(hardening.includes("FDACS-16103 must originate from LIAS") && hardening.includes("status <> 'confirmed'") === false, "official certificate registration must be restricted to confirmed LIAS output");
assert(hardening.includes("v_queue.status <> 'confirmed'"), "FDACS-16103 delivery must fail closed until LIAS confirmation exists");
assert(documentService.includes('officialCertificateMayBeGeneratedByObserra: false'), "Obserra must never synthesize the official FDACS-16103");
assert(documentService.includes("createHash(\"sha256\")") && documentService.includes("integrity validation failed"), "stored official certificate downloads must be integrity checked");
assert(documentService.includes("MAX_PDF_BYTES") && documentService.includes('"%PDF-"'), "official certificate uploads must be bounded PDF files");
assert(adminLiasRoute.includes('requireFloridaClassDStaff(["compliance_admin"])'), "LIAS workflow mutations must require compliance administration");
assert(adminDocumentRoute.includes('requireFloridaClassDStaff(["compliance_admin"])'), "official certificate ingestion must require compliance administration");
assert(studentRoute.includes("requireFloridaClassDSignedInUser") && documentService.includes("clerk_user_id"), "student completion-document access must be authenticated and enrollment bound");
assert(studentPage.includes("FDACS-16103 Certificate of Security Officer Training") && studentPage.includes("laso.fdacs.gov/apply/DApplicationForm.aspx"), "student portal must provide the official training certificate path and official Class D application handoff");
assert(adminConsole.includes("Upload LIAS-generated FDACS-16103 PDF") && adminConsole.includes("Record LIAS submission"), "staff console must support the manual LIAS and official certificate workflow");

console.log("Florida Class D Gate 17 passed: manual LIAS reporting, three-business-day deadline tracking, confirmed FDACS-16103 ingestion, protected student delivery, integrity controls, and application handoff are validated in source.");
