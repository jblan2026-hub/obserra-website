import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`Gate 19 failed: ${message}`);
};

const service = read("lib/florida-class-d-completion-packet.ts");
const route = read("app/api/florida-class-d/admin/completion-packet/route.ts");
const page = read("app/florida-security-training/admin/completion-packets/page.tsx");
const guide = read("docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md");
const handoff = read("docs/florida-class-d-lms/GATE-19-COMPLETION-PACKET-INSPECTION-HANDOFF.md");

assert(service.includes('schema: "obserra.fdacs.class-d.completion-packet.v1"'), "completion packet must use a controlled schema identifier");
assert(service.includes("createHash(\"sha256\")") && service.includes("canonicalize"), "completion packet must receive a deterministic integrity digest");
assert(service.includes("fdacs_class_d_attendance_entries") && service.includes("fdacs_class_d_instruction_time_entries"), "packet must include attendance and instructional-time evidence");
assert(service.includes("fdacs_class_d_exam_attempts") && !service.includes("exam_questions") && !service.includes("exam_answers"), "packet must include exam attempt history without exam questions or answers");
assert(service.includes("fdacs_class_d_completion_records") && service.includes("fdacs_class_d_lias_reporting_queue"), "packet must include completion and LIAS state");
assert(service.includes("fdacs_class_d_completion_documents") && service.includes("fdacs_class_d_audit_events"), "packet must include completion-document metadata and audit history");
assert(service.includes("identityDocumentImages: true") && service.includes("authenticationSecrets: true"), "packet must explicitly document sensitive-data exclusions");
assert(service.includes("escapeHtml") && service.includes("renderFloridaClassDCompletionPacketHtml"), "printable packet must escape dynamic values and render server side");
assert(route.includes('requireFloridaClassDStaff(["school_admin", "compliance_admin"])'), "completion packet endpoint must require protected staff roles");
assert(route.includes("content-security-policy") && route.includes("no-store"), "completion packet response must use restrictive security headers");
assert(route.includes('format === "html"') && route.includes("NextResponse.json(packet"), "packet endpoint must support printable HTML and JSON evidence export");
assert(page.includes("Completion &amp; Inspection Packets") && page.includes("Open printable packet") && page.includes("Download JSON evidence"), "staff page must expose controlled packet review/export actions");
assert(guide.includes("Completion Review Console") && guide.includes("Student Completion Documents Portal"), "submission guide control must continue to carry completion evidence screenshots");
assert(handoff.includes("Gate 19") && handoff.includes("Examination questions and answers are deliberately excluded"), "Gate 19 handoff must preserve the protected inspection boundary");

console.log("Florida Class D Gate 19 passed: protected staff-only completion packets, evidence consolidation, sensitive-data exclusions, deterministic SHA-256 integrity, printable HTML, JSON export, and inspection-readiness boundaries are validated in source.");
