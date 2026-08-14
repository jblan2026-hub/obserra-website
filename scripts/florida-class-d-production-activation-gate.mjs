import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const activation = read("lib/florida-class-d-production-activation.ts");
const livePolicy = read("lib/florida-class-d-live-policy.ts");
const scheduling = read("lib/florida-class-d-scheduling.ts");
const enrollmentRoute = read("app/api/florida-class-d/enrollment/route.ts");
const examRoute = read("app/api/florida-class-d/exam/route.ts");
const readiness = read("lib/florida-class-d-runtime-readiness.ts");
const activationPage = read("app/florida-security-training/admin/production-activation/page.tsx");
const workflow = read(".github/workflows/florida-class-d-lms-gates.yml");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(`Gate 26 failed: ${message}`);
}

for (const [value, message] of [
  ["OBSERRA_FDACS_RELEASE_CANDIDATE_SHA", "exact frozen release-candidate SHA must be required"],
  ["OBSERRA_FDACS_UAT_ACCEPTED_RELEASE_SHA", "candidate-bound accepted UAT SHA must be required"],
  ["VERCEL_GIT_COMMIT_SHA", "deployed Vercel Git SHA must be bound to the candidate"],
  ["OBSERRA_FDACS_PUBLIC_ORIGIN", "canonical regulated public origin must be required"],
  ["https://www.obserrallc.com", "canonical production origin must remain www.obserrallc.com"],
  ["pk_live_", "live Clerk publishable configuration must be required"],
  ["sk_live_", "live Clerk server configuration must be required"],
  ["OBSERRA_SUPABASE_URL", "protected database origin must be required"],
  ["OBSERRA_SUPABASE_SERVICE_ROLE_KEY", "protected database service credential must be required"],
  ["OBSERRA_FDACS_CLASS_D_MEDIA_PROVIDER", "live-media provider must be required"],
  ["OBSERRA_FDACS_DAILY_API_KEY", "Daily protected credential must be required"],
  ["OBSERRA_FDACS_DS_LICENSE_STATUS", "active Class DS license status must be required"],
  ["OBSERRA_FDACS_DS_LICENSE_NUMBER", "actual Class DS license number must be required privately"],
  ["OBSERRA_FDACS_DI_LICENSE_NUMBER", "Class DI license must be required privately"],
  ["OBSERRA_FDACS_DOCUMENTS_BUCKET", "controlled completion-document bucket must be required"],
  ["OBSERRA_FDACS_DB_PROMOTION_STATUS", "database promotion verification must be required"],
  ["OBSERRA_FDACS_EXAM_BANK_STATUS", "Division-approved examination-bank authorization must be required"],
  ["OBSERRA_FDACS_LIAS_PROCEDURE_STATUS", "LIAS procedure verification must be required"],
  ["OBSERRA_FDACS_SECURITY_ACCEPTANCE_STATUS", "production security acceptance must be required"],
  ["OBSERRA_FDACS_ROLLBACK_STATUS", "rollback verification must be required"],
  ["OBSERRA_FDACS_OWNER_RELEASE_APPROVAL", "owner release approval must be required"],
  ["OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED", "explicit final activation authorization must be required"],
  ["floridaClassDProductionActivationAuthorized", "a single reusable production authorization function must exist"],
  ["readyForOwnerActivationDecision", "the readiness report must separate readiness from final activation"],
  ["unauthorizedEnabledFeatureFlags", "feature flags enabled before authorization must be identified"],
  ["secretsExposed: false", "Gate 26 reports must suppress secret values"],
]) requireText(activation, value, message);

const exactBindingChecks = [
  "accepted.toLowerCase() === candidate.toLowerCase()",
  "deployed.toLowerCase() === candidate.toLowerCase()",
];
for (const value of exactBindingChecks) {
  requireText(activation, value, "candidate, accepted UAT, and deployed SHAs must match exactly");
}

for (const flag of [
  "OBSERRA_FDACS_CLASS_D_LIVE_ENABLED",
  "OBSERRA_FDACS_CLASS_D_MEDIA_ENABLED",
  "OBSERRA_FDACS_CLASS_D_SCHEDULING_ENABLED",
  "OBSERRA_FDACS_CLASS_D_MAKEUP_ENABLED",
  "OBSERRA_FDACS_CLASS_D_RECORDED_MAKEUP_ENABLED",
  "OBSERRA_FDACS_CLASS_D_EXAM_ENABLED",
  "OBSERRA_FDACS_CLASS_D_EXAM_ADMIN_ENABLED",
  "OBSERRA_FDACS_CLASS_D_COMPLETION_REVIEW_ENABLED",
  "OBSERRA_FDACS_CLASS_D_LIAS_WORKFLOW_ENABLED",
  "OBSERRA_FDACS_CLASS_D_COMPLETION_DOCUMENTS_ENABLED",
  "OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED",
]) {
  requireText(activation, flag, `Gate 26 must inventory ${flag}`);
  requireText(readiness, flag, `Gate 22 readiness must inventory ${flag}`);
}
requireText(readiness, "FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED", "Gate 22 must inventory pre-enrollment activation");
requireText(readiness, "OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED", "Gate 22 must require Gate 26 authorization to remain disabled during readiness review");

requireText(livePolicy, 'import { floridaClassDProductionActivationAuthorized }', "live instruction must import the Gate 26 authorization boundary");
requireText(livePolicy, "floridaClassDProductionActivationAuthorized() &&", "live instruction must fail closed behind Gate 26");
requireText(scheduling, 'import { floridaClassDProductionActivationAuthorized }', "production scheduling must import Gate 26");
requireText(scheduling, "floridaClassDProductionActivationAuthorized() &&", "production scheduling must fail closed behind Gate 26");
requireText(enrollmentRoute, 'import { floridaClassDProductionActivationAuthorized }', "regulated enrollment API must import Gate 26");
requireText(enrollmentRoute, "floridaClassDProductionActivationAuthorized() && floridaClassDPreEnrollmentEnabled()", "regulated enrollment must require Gate 26 and its independent enrollment flag");
requireText(examRoute, 'import { floridaClassDProductionActivationAuthorized }', "student examination API must import Gate 26");
requireText(examRoute, "floridaClassDProductionActivationAuthorized() && floridaClassDExamEnabled()", "student examination must require Gate 26 and its independent exam flag");

requireText(activationPage, 'requireFloridaClassDStaff(["school_admin", "compliance_admin"])', "Gate 26 console must require protected school/compliance staff authorization");
requireText(activationPage, "getFloridaClassDProductionActivationReport", "Gate 26 console must render the server-controlled activation report");
requireText(activationPage, "secrets suppressed", "Gate 26 console must explicitly preserve secret suppression");

requireText(workflow, "Run Gate 26 production activation source verification", "the dedicated regulated workflow must make Gate 26 mandatory");
requireText(workflow, "node scripts/florida-class-d-production-activation-gate.mjs", "the Gate 26 verifier must run in CI");

console.log("Florida Class D Gate 26 passed: exact-release production activation authorization, candidate-bound UAT and deployment binding, complete regulated feature inventory, live/scheduling/enrollment/exam fail-closed integration, protected owner decision visibility, and mandatory CI enforcement are validated in source.");
