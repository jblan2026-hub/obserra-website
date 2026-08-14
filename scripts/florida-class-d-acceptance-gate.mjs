import fs from "node:fs";

const migration = fs.readFileSync("supabase/migrations/20260813090000_fdacs_class_d_nonproduction_acceptance.sql", "utf8");
const service = fs.readFileSync("lib/florida-class-d-acceptance.ts", "utf8");
const page = fs.readFileSync("app/florida-security-training/admin/acceptance/page.tsx", "utf8");
const api = fs.readFileSync("app/api/florida-class-d/admin/acceptance/route.ts", "utf8");

const domains = [
  "identity_enrollment", "live_media", "attendance_time", "presence_challenges", "observer_access",
  "makeup", "recorded_makeup", "exam", "retest", "completion", "completion_documents", "lias_workflow",
  "inspection_packet", "quality_capa", "retention", "security_headers", "mobile_desktop", "accessibility",
];

if (!migration.includes("v_expected integer := 18")) throw new Error("Gate 23 requires all 18 domains before finalization.");
if (!migration.includes("synthetic_identity_confirmed")) throw new Error("Gate 23 requires synthetic identity confirmation.");
if (!migration.includes("development") || !migration.includes("sandbox") || !migration.includes("staging") || !migration.includes("uat")) {
  throw new Error("Gate 23 database contract must remain limited to controlled non-production environments.");
}
if (!service.includes("FLORIDA_CLASS_D_ACCEPTANCE_DOMAINS")) throw new Error("Gate 23 acceptance service is missing.");
if (!service.includes('process.env.OBSERRA_SUPABASE_URL?.trim() || ""')) throw new Error("Gate 23 acceptance service must require explicit protected database runtime configuration.");
if (!service.includes("Release commit SHA must be 40 lowercase hexadecimal characters")) throw new Error("Gate 23 acceptance runs must remain release-commit bound.");
if (!service.includes("synthetic_identity_confirmed: true")) throw new Error("Gate 23 acceptance service must explicitly mark synthetic identity use.");
if (!service.includes("Passed acceptance checks require an evidence reference")) throw new Error("Gate 23 passed checks must require evidence references.");
if (!service.includes("fdacs_class_d_finalize_acceptance_run")) throw new Error("Gate 23 acceptance finalization must remain database controlled.");
if (!page.includes("Non-Production Acceptance Evidence")) throw new Error("Gate 23 acceptance page is missing.");
if (!api.includes('requireFloridaClassDStaff(["school_admin", "compliance_admin"])')) throw new Error("Gate 23 acceptance API must remain restricted to school/compliance administration.");

for (const domain of domains) {
  if (!migration.includes(domain) || !service.includes(domain)) throw new Error(`Gate 23 domain missing: ${domain}`);
}

console.log("Florida Class D Gate 23 acceptance artifact verification passed: 18-domain finalization, non-production scope, synthetic identity confirmation, release binding, explicit protected runtime configuration, evidence-required passing checks, staff authorization, and database-controlled finalization are present in source.");
