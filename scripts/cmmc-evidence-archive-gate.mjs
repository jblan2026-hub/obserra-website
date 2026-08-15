import fs from "node:fs";

const read = (file) => {
  if (!fs.existsSync(file)) throw new Error(`CMMC archive gate failed: missing ${file}`);
  return fs.readFileSync(file, "utf8");
};

const base = read("supabase/migrations/20260814161500_cmmc_evidence_indefinite_archive.sql");
const contract = read("supabase/migrations/20260814180000_cmmc_objective_evidence_contract.sql");
const manifestPrecedenceFix = read("supabase/migrations/20260815133133_cmmc_archive_manifest_precedence_fix.sql");
const client = read("scripts/cmmc-archive-release-evidence.mjs");
const workflow = read(".github/workflows/cmmc-evidence-governance.yml");
const schema = JSON.parse(read("docs/compliance/CMMC-SYSTEM-EVIDENCE.schema.json"));
const source = JSON.parse(read("docs/compliance/CMMC-SYSTEM-SCOPE-SOURCE.json"));
const handoff = JSON.parse(read("docs/compliance/CMMC-CONTINUOUS-AUDIT-HANDOFF.json"));

function requireText(content, value, message) {
  if (!content.includes(value)) throw new Error(`CMMC archive gate failed: ${message}`);
}

for (const [value, message] of [
  ["create table if not exists public.cmmc_evidence_archive", "base archive table must exist"],
  ["create trigger cmmc_evidence_archive_immutable", "archive must reject update/delete"],
  ["create trigger cmmc_evidence_archive_events_immutable", "access events must reject update/delete"],
  ["retention_mode = 'indefinite'", "indefinite retention must be a database constraint"],
  ["legal_hold_active = true", "legal hold must be a database constraint"],
  ["automatic_deletion_enabled = false", "automatic deletion must be disabled by constraint"],
  ["contains_cui = false", "CUI must be rejected from this archive"],
  ["contains_personal_data = false", "personal data must be rejected from this archive"],
  ["contains_payment_data = false", "payment data must be rejected from this archive"],
  ["contains_secret_material = false", "secret material must be rejected from this archive"],
  ["force row level security", "archive tables must force RLS"],
]) requireText(base, value, message);

for (const [value, message] of [
  ["evidence_contract_version", "v2 evidence contract version must be stored"],
  ["authority_profile_sha256", "authority profile hash must be stored"],
  ["evidence_schema_sha256", "evidence schema hash must be stored"],
  ["mapping_source_sha256", "mapping source hash must be stored"],
  ["generator_sha256", "generator hash must be stored"],
  ["machine_readable_artifact_path", "machine-readable artifact path must be stored"],
  ["machine_readable_artifact_sha256", "machine-readable artifact hash must be stored"],
  ["human_readable_extract_path", "human-readable extract path must be stored"],
  ["human_readable_extract_sha256", "human-readable extract hash must be stored"],
  ["paired_digest_manifest_sha256", "paired-view digest manifest hash must be stored"],
  ["baseline_authority_ids", "exact authority identifiers must be stored"],
  ["system_ids", "separated system identifiers must be stored"],
  ["objective_ids", "objective identifiers must be stored"],
  ["evidence_origin", "evidence origin must be stored"],
  ["artifact_owner_legal_name", "artifact legal owner must be stored"],
  ["scope_statement", "evidence scope must be stored"],
  ["claim_boundary", "claim boundary must be stored"],
  ["target_revision_sha", "exact release revision must be stored"],
  ["test_result_sha256", "test result hash must be stored"],
  ["pending_human_review_is_failure = false", "pending human review must remain non-failing"],
  ["finding_eligible", "finding eligibility must be explicit"],
  ["Only an assessor determination may record an assessment finding", "non-assessor evidence must not create findings"],
  ["32-cfr-part-170-2026-08-12", "32 CFR Part 170 authority must be mandatory"],
  ["dod-cmmc-l2-assessment-guide-v2.13-2024-09", "DoD Assessment Guide v2.13 authority must be mandatory"],
  ["nist-sp-800-171r2-upd1", "NIST SP 800-171 Revision 2 authority must be mandatory"],
  ["nist-sp-800-171a-june-2018", "NIST SP 800-171A June 2018 authority must be mandatory"],
  ["create or replace function public.cmmc_list_evidence_v2", "auditor catalog function must exist"],
  ["create or replace function public.cmmc_verify_evidence_archive_chain", "archive chain verifier must exist"],
  ["create or replace function public.cmmc_verify_evidence_event_chain", "access-event chain verifier must exist"],
  ["grant execute on function public.cmmc_archive_evidence_v2", "only the controlled v2 RPC must be granted"],
]) requireText(contract, value, message);

for (const content of [contract, manifestPrecedenceFix]) {
  requireText(
    content,
    "(p_evidence_contract ->> 'machineReadableArtifactSha256') ||",
    "machine-readable digest extraction must be parenthesized before manifest concatenation",
  );
  requireText(
    content,
    "(p_evidence_contract ->> 'humanReadableExtractSha256') ||",
    "human-readable digest extraction must be parenthesized before manifest concatenation",
  );
}
requireText(
  manifestPrecedenceFix,
  "create or replace function public.cmmc_archive_evidence_v2",
  "forward-only manifest precedence correction must replace the controlled archive RPC",
);
requireText(
  manifestPrecedenceFix,
  "grant execute on function public.cmmc_archive_evidence_v2",
  "manifest precedence correction must preserve service-role-only execution",
);

if ((contract.match(/\$\$/g) ?? []).length % 2 !== 0) throw new Error("CMMC archive gate failed: migration dollar quotes are unbalanced");
if (/\b(drop table|truncate table)\b/i.test(contract)) throw new Error("CMMC archive gate failed: objective contract migration contains destructive table operations");
if ((manifestPrecedenceFix.match(/\$\$/g) ?? []).length % 2 !== 0) throw new Error("CMMC archive gate failed: manifest precedence correction dollar quotes are unbalanced");
if (/\b(drop table|truncate table)\b/i.test(manifestPrecedenceFix)) throw new Error("CMMC archive gate failed: manifest precedence correction contains destructive table operations");

for (const [value, message] of [
  ['bundle.bundleState !== "final_release_evidence"', "client must reject non-final bundles"],
  ['bundle.repositoryRevision.workingTreeState !== "clean"', "client must require a clean exact release tree"],
  ['bundle.summary?.unmappedRequiredObjectiveCount !== 0', "client must reject missing objective coverage"],
  ['mapping.finding !== "not_assessed"', "client must reject product-created assessor findings"],
  ['drift.overallStatus !== "passed"', "client must require a passing live authority-drift result"],
  ['controlIds.length !== 207 || objectiveIds.length !== 830', "client must require complete unique controls and objectives"],
  ['pendingHumanReviewIsFailure: false', "client must record human pending as non-failure"],
  ['machineReadableArtifactPath: files[0].path', "client must bind the canonical machine-readable artifact"],
  ['humanReadableExtractPath: files[1].path', "client must bind the derived human-readable extract"],
  ['pairedDigestManifestSha256: files[2].sha256', "client must bind the paired-view digest manifest"],
  ['fdacsDatabaseAuditSha256: files[7].sha256', "archive package must bind the FDACS database security-protocol audit record"],
  ['fdacsDatabaseAuditSchemaSha256: files[10].sha256', "archive package must bind the FDACS database audit schema"],
  ['containsPersonalData: false', "package must declare no PII"],
  ['containsSecretMaterial: false', "package must declare no secrets"],
  ['retentionMode: "indefinite"', "package must request indefinite retention"],
  ['cmmc_archive_evidence_v2', "client must use the fail-closed v2 RPC"],
  ['cmmc_list_evidence_v2', "client must verify controlled auditor-catalog readability"],
  ['cmmc_verify_evidence_archive_chain', "client must verify the live artifact chain"],
  ['cmmc_verify_evidence_event_chain', "client must verify the live access-event chain"],
  ['cmmc_evidence_archive_health', "client must verify live indefinite-retention health"],
  ['schemaVersion: "obserra.cmmc.archive-receipt.v2"', "client must emit a machine-readable verified receipt"],
  ['# Verified CMMC Evidence Archive Receipt', "client must derive a human-readable verified receipt"],
]) requireText(client, value, message);

for (const [value, message] of [
  ["github.event_name == 'push' && github.ref == 'refs/heads/main'", "archive automation must run only after an approved main merge"],
  ['--release "${GITHUB_SHA}"', "release evidence must bind to the exact approved SHA"],
  ["npm run verify:cmmc-authority-drift", "approved release must perform live authority verification"],
  ["node scripts/cmmc-archive-release-evidence.mjs", "approved release must archive final evidence"],
  ["--receipt-output", "approved release must retain machine/human verified archive receipts"],
  ["OBSERRA_CMMC_ARCHIVE_SERVICE_ROLE_KEY", "archive credential must come from a protected secret"],
  ['"app/apps/**"', "Applications path must be excluded"],
  ['"app/api/apps/**"', "Applications API path must be excluded"],
  ['"app/portal/applications/**"', "Applications portal path must be excluded"],
  ['"lib/apps/**"', "Applications library path must be excluded"],
  ["FDACS-PII-DATABASE-AUDIT.schema.json", "workflow artifact must retain the FDACS database audit schema"],
]) requireText(workflow, value, message);

if (/NEXT_PUBLIC_[A-Z0-9_]*(SERVICE_ROLE|ARCHIVE.*KEY)/.test(`${client}\n${workflow}`)) {
  throw new Error("CMMC archive gate failed: archive credentials must never use a NEXT_PUBLIC variable");
}

if (schema?.properties?.assessmentDispositionPolicy?.properties?.pendingHumanReviewIsFailure?.const !== false) {
  throw new Error("CMMC archive gate failed: evidence schema does not enforce non-failing pending human review");
}
if (source?.assessmentDispositionPolicy?.technicalGateCriteria?.humanReviewStateAffectsTechnicalOutcome !== false ||
    source?.assessmentDispositionPolicy?.humanReviewCriteria?.defaultState !== "pending" ||
    source?.assessmentDispositionPolicy?.humanReviewCriteria?.pendingIsTechnicalFailure !== false ||
    source?.assessmentDispositionPolicy?.humanReviewCriteria?.humanCompletionRequiredForTechnicalPass !== false) {
  throw new Error("CMMC archive gate failed: technical and human pass criteria are not independently enforced");
}
if (schema?.properties?.auditViews?.properties?.pairedDigestManifest?.properties?.coversBothViews?.const !== true) {
  throw new Error("CMMC archive gate failed: evidence schema does not require paired machine/human audit views");
}
if (source?.approvedChangeAutomation?.failClosed !== true || source?.approvedChangeAutomation?.retentionMode !== "indefinite_immutable_archive") {
  throw new Error("CMMC archive gate failed: controlled source does not require fail-closed indefinite automation");
}
if (handoff?.archiveTargetDecision?.physicalIsolationRequired !== true ||
    handoff?.archiveTargetDecision?.academyProjectRejectedAsArchiveTarget !== true ||
    handoff?.archiveTargetDecision?.academyOrApplicationsMutationPerformed !== false) {
  throw new Error("CMMC archive gate failed: archive target isolation or Applications non-mutation decision is missing");
}
if (handoff?.highAvailabilityContract?.required !== true ||
    handoff?.highAvailabilityContract?.meetsHighAvailability !== false ||
    handoff?.highAvailabilityContract?.currentState !== "not_configured_not_tested") {
  throw new Error("CMMC archive gate failed: pending HA state is absent or overstated");
}

console.log("CMMC evidence archive gate passed: exact revisions, governing authorities, separated systems, objective mappings, paired machine/human views, artifact/test hashes, legal ownership, scope and claim boundaries, non-failing human-pending state, assessor-only findings, append-only access events, chain verification, non-CUI limits, and indefinite retention are enforced in source.");
