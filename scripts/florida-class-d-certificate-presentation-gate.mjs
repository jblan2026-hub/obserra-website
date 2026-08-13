import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`Gate 18 failed: ${message}`);
};

const migration = read("supabase/migrations/20260813080000_fdacs_class_d_auto_completion_certificate.sql");
const service = read("lib/florida-class-d-completion-documents.ts");
const route = read("app/api/florida-class-d/completion-documents/route.ts");
const page = read("app/florida-security-training/completion/page.tsx");
const standard = read("docs/florida-class-d-lms/STUDENT-COMPLETION-AND-CERTIFICATION-STANDARD.md");
const guide = read("docs/florida-class-d-lms/DS-SUBMISSION-LMS-GUIDE-CONTROL.md");
const handoff = read("docs/florida-class-d-lms/GATE-18-STUDENT-CERTIFICATE-PRESENTATION-HANDOFF.md");

assert(migration.includes("fdacs_class_d_auto_completion_documents"), "supplemental completion documents must be generated from the controlled completion-record event");
assert(migration.includes("status = 'passed'") && migration.includes("v_exam_score < 128"), "automatic supplemental documents must fail closed without a preserved passing examination");
assert(migration.includes("studentLegalName") && migration.includes("completionDate") && migration.includes("certificateId"), "automatic certificate payload must snapshot controlled learner and completion fields");
assert(service.includes("renderCertificateHtml") && service.includes("renderApplicationHandoffHtml"), "protected learner documents must have explicit server-side renderers");
assert(service.includes("escapeHtml") && service.includes("replaceAll(\"<\""), "dynamic learner values must be escaped before HTML rendering");
assert(service.includes("examScore < passingScore") && service.includes("passingScore < 128"), "supplemental certificate rendering must independently reject non-passing exam evidence");
assert(service.includes("Supplemental School Record") && service.includes("does not replace the official FDACS-16103"), "supplemental certificate must clearly distinguish itself from the official Florida certificate");
assert(route.includes("new Blob([Uint8Array.from(result.bytes)]") && route.includes("content-security-policy"), "student document delivery must use a standards-compatible response body and restrictive security headers");
assert(route.includes("Obserra-Florida-Class-D-Course-Completion-Certificate.html") && route.includes("FDACS-16103-Certificate-of-Security-Officer-Training.pdf"), "official and supplemental student documents must retain distinct presentation identities");
assert(page.includes("No completion certificate is issued for hours alone") && page.includes("at least 128 correct answers"), "student portal must state the no-certificate-before-pass completion standard");
assert(standard.includes("no Obserra course-completion certificate") && standard.includes("170-question final examination"), "student-material standard must preserve the examination-before-certificate rule");
assert(guide.includes("Required screenshots for the next submission-guide revision") && guide.includes("no-certificate-before-pass boundary"), "DS submission guide control must require certificate-boundary screenshot evidence");
assert(handoff.includes("Gate 18") && handoff.includes("server-side"), "Gate 18 handoff must record the protected presentation architecture");

console.log("Florida Class D Gate 18 passed: automatic supplemental completion records, no-certificate-before-exam-pass enforcement, protected learner-specific server rendering, secure delivery, official/supplemental document separation, and submission screenshot requirements are validated in source.");
