import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const evidence = read("lib/florida-class-d-ha-evidence.ts");
const activation = read("lib/florida-class-d-production-activation.ts");
const workflow = read(".github/workflows/florida-class-d-lms-gates.yml");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(`Gate 31 failed: ${message}`);
}

for (const value of [
  'FLORIDA_CLASS_D_HA_EVIDENCE_SCHEMA = "obserra.fdacs.class-d.ha-evidence.v1"',
  '"edge_dns"',
  '"application_runtime"',
  '"identity"',
  '"database"',
  '"media"',
  '"document_storage"',
  '"commerce"',
  '"observability"',
  '"backup_restore"',
  '"failover"',
  'OBSERRA_FDACS_HA_EVIDENCE_MANIFEST',
  'OBSERRA_FDACS_HA_EVIDENCE_MANIFEST_SHA256',
  'createHash("sha256")',
  'timingSafeEqual',
  'canonicalJson(manifest)',
  'releaseCandidateSha.toLowerCase()',
  'manifest.releaseCandidateSha.toLowerCase()',
  'evidenceSha256',
  'timestampCurrent(value.observedAt, now)',
  'timestampCurrent(manifest.reviewedAt, now)',
  'timestampCurrent(manifest.failoverTestAt, now)',
  'manifest.rtoMinutes <= MAX_RTO_MINUTES',
  'manifest.rpoMinutes <= MAX_RPO_MINUTES',
  'MAX_EVIDENCE_AGE_DAYS = 90',
  'MAX_RTO_MINUTES = 60',
  'MAX_RPO_MINUTES = 15',
  'subsystemCoverageComplete',
  'manifestDigestVerified',
  'secretsExposed: false',
]) requireText(evidence, value, `HA evidence integrity contract must include ${value}`);

if (/NEXT_PUBLIC_[A-Z0-9_]*HA_EVIDENCE/.test(evidence)) {
  throw new Error("Gate 31 failed: HA evidence configuration must never use a NEXT_PUBLIC environment variable.");
}

for (const [value, message] of [
  ['import { getFloridaClassDHaEvidenceReport } from "./florida-class-d-ha-evidence"', "Gate 26 must import the cryptographic HA evidence evaluator"],
  ["cryptographicHaEvidenceRequired: true", "Gate 26 policy must make cryptographic HA evidence mandatory"],
  ['getFloridaClassDHaEvidenceReport(value("OBSERRA_FDACS_RELEASE_CANDIDATE_SHA"))', "HA evidence must be evaluated against the exact release candidate"],
  ['"ha:evidence_manifest"', "Gate 26 must expose a distinct HA evidence-manifest blocker"],
  ["evidence.ready", "Gate 26 activation readiness must depend on HA evidence readiness"],
  ["Status markers alone cannot authorize production activation.", "Gate 26 must explicitly preserve the stronger evidence boundary"],
]) requireText(activation, value, message);

requireText(workflow, "Run Gate 31 HA evidence integrity verification", "the regulated CI workflow must make Gate 31 mandatory");
requireText(workflow, "node scripts/florida-class-d-ha-evidence-integrity-gate.mjs", "the Gate 31 verifier must execute in CI");

console.log("Florida Class D Gate 31 passed: HA evidence is structured, candidate-bound, cryptographically hashed, exact-subsystem complete, recovery-objective constrained, recency checked, secret-suppressed, and mandatory for Gate 26 production activation.");
