import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(`Gate 20 failed: ${message}`);
};

const migration = read("supabase/migrations/20260813083000_fdacs_class_d_quality_retention.sql");
const service = read("lib/florida-class-d-quality.ts");
const route = read("app/api/florida-class-d/admin/quality/route.ts");
const page = read("app/florida-security-training/admin/quality/page.tsx");
const consoleSource = read("app/florida-security-training/admin/quality/QualityConsole.tsx");
const handoff = read("docs/florida-class-d-lms/GATE-20-QUALITY-RETENTION-CAPA-HANDOFF.md");

for (const table of ["fdacs_class_d_quality_cases","fdacs_class_d_quality_case_events","fdacs_class_d_retention_reviews"]) {
  assert(migration.includes(`public.${table}`), `migration must create ${table}`);
  assert(migration.includes(`alter table public.${table} enable row level security`), `${table} must enable RLS`);
  assert(migration.includes(`alter table public.${table} force row level security`), `${table} must force RLS`);
  assert(migration.includes(`revoke all on table public.${table} from public, anon, authenticated`), `${table} must deny direct browser access`);
}

assert(migration.includes("quality-case event history is append-only") && migration.includes("before update or delete on public.fdacs_class_d_quality_case_events"), "quality event history must be append-only");
assert(migration.includes("fdacs_class_d_open_quality_case") && migration.includes("fdacs_class_d_progress_quality_case"), "quality cases must use controlled server RPCs");
assert(migration.includes("fdacs_class_d_upsert_retention_review"), "retention reviews must use a controlled server RPC");
assert(migration.includes("interval '2 years'") && migration.includes("interval '3 years'"), "regulatory minimum and operational retention periods must remain distinct");
assert(migration.includes("legal_hold_active") && migration.includes("disposition_blocked"), "legal hold must block disposition eligibility");
assert(service.includes('regulatoryMinimumRetentionYears: 2') && service.includes('operationalRetentionYears: 3'), "quality policy must preserve separate two-year minimum and three-year operational retention");
assert(service.includes('dispositionRequiresHumanAuthorization: true') && service.includes('legalHoldBlocksDisposition: true'), "record disposition must remain human controlled and legal-hold aware");
assert(service.includes("OBSERRA_FDACS_CLASS_D_QUALITY_ENABLED"), "quality-management actions must remain independently feature gated");
assert(route.includes('requireFloridaClassDStaff(["school_admin", "compliance_admin"])'), "quality API must require protected staff roles");
assert(route.includes('action === "open_case"') && route.includes('action === "progress_case"') && route.includes('action === "retention_review"'), "quality API must expose controlled case and retention actions");
assert(page.includes('requireFloridaClassDStaff(["school_admin", "compliance_admin"])'), "quality page must require protected staff roles");
assert(consoleSource.includes("Quality, CAPA &amp; Record Retention") && consoleSource.includes("Close after verification"), "staff console must expose CAPA workflow and verified closure");
assert(consoleSource.includes("Minimum retain until") && consoleSource.includes("Operational retain until") && consoleSource.includes("Legal hold"), "staff console must show retention and legal-hold controls");
assert(handoff.includes("Gate 20") && handoff.includes("two-year regulatory minimum") && handoff.includes("three-year operational retention"), "Gate 20 handoff must preserve retention-policy distinction");

console.log("Florida Class D Gate 20 passed: staff-only quality/CAPA cases, append-only quality history, two-year minimum versus three-year operational retention, legal-hold blocking, and fail-closed quality controls are validated in source.");
