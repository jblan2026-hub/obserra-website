import crypto from "node:crypto";
import fs from "node:fs";

const files = {
  boundary: "supabase/migrations/20260814170000_fdacs_class_d_pii_boundary_hardening.sql",
  archive: "supabase/migrations/20260814171000_fdacs_class_d_automatic_record_archive.sql",
  identity: "supabase/migrations/20260814172000_fdacs_class_d_instructor_identity_attendance.sql",
  investigator: "supabase/migrations/20260814173000_fdacs_class_d_investigator_audit_access.sql",
  performance: "supabase/migrations/20260814174000_fdacs_class_d_audit_performance_and_explicit_deny.sql",
  functionHardening: "supabase/migrations/20260814175000_fdacs_class_d_trigger_function_execute_hardening.sql",
  manifest: "scripts/florida-class-d-migration-manifest.mjs",
  cmmcSource: "docs/compliance/CMMC-SYSTEM-SCOPE-SOURCE.json",
};

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`FDACS PII database audit gate: missing ${path}`);
  return fs.readFileSync(path, "utf8");
}

function requireText(label, value, expected) {
  if (!value.includes(expected)) throw new Error(`FDACS PII database audit gate: ${label} missing ${expected}`);
}

function rejectText(label, value, rejected) {
  if (value.includes(rejected)) throw new Error(`FDACS PII database audit gate: ${label} contains forbidden ${rejected}`);
}

const sql = Object.fromEntries(Object.entries(files).map(([key, path]) => [key, read(path)]));
const combined = `${sql.boundary}\n${sql.archive}\n${sql.identity}\n${sql.investigator}\n${sql.performance}\n${sql.functionHardening}`;

for (const expected of [
  "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  "ggkxgjhsbgbifiqrhavr",
  "regulated_student_pii_non_cui",
  "cui_processing_authorized boolean not null default false check (cui_processing_authorized = false)",
  "payment_data_authorized boolean not null default false check (payment_data_authorized = false)",
  "automatic_deletion_enabled boolean not null default false check (automatic_deletion_enabled = false)",
  "minimum_retention_years smallint not null default 2 check (minimum_retention_years = 2)",
  "operational_retention_years smallint not null default 3 check (operational_retention_years >= minimum_retention_years)",
  "F.A.C. 5N-1.140(5)",
  "F.S. 493.6132",
]) requireText("boundary", sql.boundary, expected);

for (const expected of [
  "fdacs_class_d_record_archive_jobs",
  "fdacs_class_d_queue_enrollment_archive_job",
  "fdacs_class_d_queue_enrolled_archive_job",
  "fdacs_class_d_record_archive_health",
  "to service_role",
]) requireText("automatic archive", sql.archive, expected);

for (const expected of [
  "fdacs_class_d_identity_verification_sessions",
  "fdacs_class_d_instructor_identity_attestations",
  "fdacs_class_d_daily_identity_checkins",
  "fdacs_class_d_daily_attendance_attestations",
  "fdacs_class_d_identity_attendance_evidence_export",
  "identityImagesCopiedToLms",
  "biometricTemplateStoredByLms",
  "pre_instruction_daily_student_identity_verified_by_di_instructor",
]) requireText("identity and attendance", sql.identity, expected);

for (const expected of [
  "fdacs_class_d_record_authority_snapshots",
  "Final adopted rule effective 2024-11-28",
  "immediateInvestigatorProduction",
  "electronicRecordsMustBeReproducibleOrTransmittable",
  "fdacs_class_d_security_protocol_evidence",
  "SYS-FDACS-DATABASE",
  "exact_release_commit_sha",
  "technical_disposition",
  "human_disposition text not null default 'pending' check (human_disposition = 'pending')",
  "pending_human_is_technical_failure boolean not null default false check (pending_human_is_technical_failure = false)",
  "assessment_finding text not null default 'not_assessed' check (assessment_finding = 'not_assessed')",
  "fdacs_class_d_investigator_audit_exports",
  "fdacs_class_d_generate_investigator_audit_export",
  "fdacs_class_d_finalize_investigator_audit_export",
  "fdacs_class_d_record_investigator_export_delivery",
  "eligibleAsFinalFdacsRecordEvidence',false",
  "eligibleAsFinalFdacsRecordEvidence',true",
  "fdacs_class_d_verify_activation_evidence_chain",
  "fdacs_class_d_verify_record_access_chain",
  "fdacs_class_d_verify_identity_provider_event_chain",
  "fdacs_class_d_verify_protected_artifact_chain",
  "fdacs_class_d_verify_investigator_export_chain",
  "from public,anon,authenticated,service_role",
  "to service_role",
]) requireText("investigator audit", sql.investigator, expected);

for (const eventType of [
  "'investigator_export_requested'",
  "'investigator_export_completed'",
  "'identity_attendance_exported'",
]) requireText("controlled access event", sql.boundary, eventType);

for (const migration of [
  "20260814170000_fdacs_class_d_pii_boundary_hardening.sql",
  "20260814171000_fdacs_class_d_automatic_record_archive.sql",
  "20260814172000_fdacs_class_d_instructor_identity_attendance.sql",
  "20260814173000_fdacs_class_d_investigator_audit_access.sql",
  "20260814174000_fdacs_class_d_audit_performance_and_explicit_deny.sql",
  "20260814175000_fdacs_class_d_trigger_function_execute_hardening.sql",
]) requireText("migration manifest", sql.manifest, migration);

for (const expected of [
  "fdacs_authority_snapshot_authority_idx",
  "fdacs_archive_jobs_artifact_idx",
  "fdacs_identity_att_verification_idx",
  "fdacs_browser_deny_all",
  "as restrictive for all to anon, authenticated using (false) with check (false)",
]) requireText("performance and explicit deny", sql.performance, expected);

for (const expected of [
  "fdacs_class_d_reject_lias_workflow_mutation",
  "set search_path = ''",
  "from public, anon, authenticated",
  "to service_role",
]) requireText("trigger function execute hardening", sql.functionHardening, expected);

for (const forbidden of [
  "grant select on table public.fdacs_class_d_investigator_audit_exports to anon",
  "grant select on table public.fdacs_class_d_investigator_audit_exports to authenticated",
  "identity_document_images_authorized boolean not null default true",
  "automatic_deletion_enabled boolean not null default true",
  "assessment_finding text not null default 'met'",
]) rejectText("regulated database contract", combined.toLowerCase(), forbidden.toLowerCase());

const cmmcSource = JSON.parse(sql.cmmcSource);
const fdacsSystem = cmmcSource.systems.find((system) => system.systemId === "SYS-FDACS-DATABASE");
if (!fdacsSystem) throw new Error("FDACS PII database audit gate: SYS-FDACS-DATABASE is absent from the CMMC source record");
if (fdacsSystem.systemType !== "regulated_pii_database") throw new Error("FDACS PII database audit gate: CMMC system type must remain regulated_pii_database");
if (fdacsSystem.operationalDisposition !== "fail_closed_pending_mandatory_prerequisite") throw new Error("FDACS PII database audit gate: production disposition must remain fail closed pending prerequisites");
if (!fdacsSystem.scope?.environments?.includes("isolated_fdacs_production")) throw new Error("FDACS PII database audit gate: CMMC scope must name the isolated FDACS production environment");
for (const claim of ["Live verification", "forced-RLS/browser-deny", "remain unverified"]) {
  if (!fdacsSystem.claimBoundary.includes(claim)) throw new Error(`FDACS PII database audit gate: CMMC claim boundary is missing ${claim}`);
}
for (const mapping of fdacsSystem.controlMappings ?? []) {
  for (const artifactId of ["EV-FDACS-AUDIT-SQL", "EV-FDACS-DENY-SQL", "EV-FDACS-AUDIT-GATE", "EV-FDACS-LIVE-RECEIPT"]) {
    if (!mapping.artifactIds?.includes(artifactId)) throw new Error(`FDACS PII database audit gate: ${mapping.baseline} mapping is missing ${artifactId}`);
  }
  if (!mapping.claimBoundary.includes("exact-release")) throw new Error(`FDACS PII database audit gate: ${mapping.baseline} must preserve the exact-release claim boundary`);
}

const sha256 = crypto.createHash("sha256").update(combined).digest("hex");
console.log(`FDACS PII database audit gate passed: isolated retention, automatic archival, daily identity/attendance, investigator export, exact-release CMMC security-protocol mapping, and five independent hash-chain verifiers are present. Source SHA-256 ${sha256}.`);
