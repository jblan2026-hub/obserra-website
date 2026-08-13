import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const recordsPath = path.join(root, "lib", "florida-class-d-records.ts");
const coursePath = path.join(root, "lib", "florida-class-d.ts");
const handoffPath = path.join(root, "docs", "florida-class-d-lms", "HANDOFF.md");

const records = fs.readFileSync(recordsPath, "utf8");
const course = fs.readFileSync(coursePath, "utf8");
const handoff = fs.readFileSync(handoffPath, "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(message);
}

requireText(records, 'courseId: "florida-class-d-40-hour"', "Enrollment must bind to the controlled Florida Class D course id.");
requireText(records, "minimumInstructionalMinutes: 2400", "Instructional time must require 2,400 minutes / 40 hours.");
requireText(records, "requiredInstructionalDays: 5", "The record model must preserve five instructional days.");
requireText(records, "requiredModules: 18", "The record model must preserve all 18 modules.");
requireText(records, "appendOnlyAuditEvents: true", "Audit history must remain append-only by policy.");
requireText(records, "examRequiresInstructionComplete: true", "Exam eligibility must depend on completion of instruction.");
requireText(records, "paymentRequiresRegulatoryLaunchGate: true", "Payment must remain behind the regulatory launch gate.");
requireText(records, "completionRequiresInstructorReview: true", "Completion must retain instructor review.");
requireText(records, "liasSubmissionIsAdministrativeAction: true", "LIAS must remain an authorized administrative action, not an unverified direct automation.");
requireText(records, "studentMayNotModifyAttendanceCredit: true", "Students may not modify credited attendance.");
requireText(records, "studentMayNotModifyInstructionTimeCredit: true", "Students may not modify credited instructional time.");
requireText(records, "studentMayNotModifyExamEligibility: true", "Students may not modify their own exam eligibility.");

for (const entity of [
  "FloridaClassDStudentIdentity",
  "FloridaClassDEnrollment",
  "FloridaClassDCohort",
  "FloridaClassDAttendanceEntry",
  "FloridaClassDInstructionTimeEntry",
  "FloridaClassDModuleProgress",
  "FloridaClassDLearningCheckResult",
  "FloridaClassDRemediationRecord",
  "FloridaClassDAuditEvent",
]) {
  requireText(records, `type ${entity}`, `Missing required regulated record type: ${entity}`);
}

for (const role of ["student", "instructor", "school_admin", "compliance_admin", "system"]) {
  requireText(records, `${role}: [`, `Missing access-control boundary for ${role}.`);
}

requireText(records, "export function isExamEligible", "A deterministic exam-eligibility policy function is required.");
requireText(records, 'input.identityStatus === "verified"', "Exam eligibility must require verified identity.");
requireText(records, "input.creditedInstructionalMinutes >=", "Exam eligibility must enforce credited instructional time.");
requireText(records, "uniqueCompleted.size ===", "Exam eligibility must enforce completion of all modules.");
requireText(records, "input.openRemediationModuleIds.length === 0", "Exam eligibility must fail while remediation remains open.");

requireText(course, 'status: "coming-soon"', "Public course must remain Coming Soon during Gate 2.");
requireText(handoff, "## LMS / Regulated School System Handoff", "Florida LMS work must be recorded in its own handoff area.");
requireText(handoff, "Gate 2 — Regulated Student Record Model", "Handoff must record Gate 2 status.");
requireText(handoff, "Separate from Academy course-content build", "Handoff must explicitly remain separate from course-content production.");

console.log("Florida Class D Gate 2 passed: regulated student record model and handoff boundaries validated.");
