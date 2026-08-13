import fs from "node:fs";

const migration = fs.readFileSync("supabase/migrations/20260813090000_fdacs_class_d_nonproduction_acceptance.sql", "utf8");
const service = fs.readFileSync("lib/florida-class-d-acceptance.ts", "utf8");
const page = fs.readFileSync("app/florida-security-training/admin/acceptance/page.tsx", "utf8");

const domains = [
  "identity_enrollment", "live_media", "attendance_time", "presence_challenges", "observer_access",
  "makeup", "recorded_makeup", "exam", "retest", "completion", "completion_documents", "lias_workflow",
  "inspection_packet", "quality_capa", "retention", "security_headers", "mobile_desktop", "accessibility",
];

if (!migration.includes("v_expected integer := 18")) throw new Error("Gate 23 requires all 18 domains before finalization.");
if (!migration.includes("synthetic_identity_confirmed")) throw new Error("Gate 23 requires synthetic identity confirmation.");
if (!service.includes("FLORIDA_CLASS_D_ACCEPTANCE_DOMAINS")) throw new Error("Gate 23 acceptance service is missing.");
if (!page.includes("Non-Production Acceptance Evidence")) throw new Error("Gate 23 acceptance page is missing.");

for (const domain of domains) {
  if (!migration.includes(domain) || !service.includes(domain)) throw new Error(`Gate 23 domain missing: ${domain}`);
}

console.log("Florida Class D Gate 23 acceptance artifact verification passed.");
