import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const parse = (file) => JSON.parse(read(file));
const checks = [];
const check = (condition, description) => checks.push([Boolean(condition), description]);

const files = [
  "compliance/nist-security-by-design-crosswalk.json",
  "compliance/iso27001-security-by-design-crosswalk.json",
  "compliance/soc2-security-by-design-crosswalk.json",
  "compliance/privacy-security-by-design-crosswalk.json",
  "lib/governance-evidence.ts",
  "lib/governance-pdf.ts",
  "lib/governance-excel.ts",
  "lib/governance-export-audit.ts",
  "lib/vulnerability-intelligence.ts",
  "lib/compliance-compiler.ts",
  "app/admin/governance/page.tsx",
  "app/admin/governance/ContinuousCompliancePanel.tsx",
  "app/admin/governance/GovernanceExportActions.tsx",
  "app/admin/governance/VulnerabilityIntelligencePanel.tsx",
  "app/api/owner/governance/compliance-status/route.ts",
  "app/api/owner/governance/vulnerabilities/route.ts",
  "app/api/owner/governance/export/excel/route.ts",
  "app/api/owner/governance/export/pdf/route.ts",
  "app/api/owner/governance/export/email/route.ts",
];
for (const file of files) check(fs.existsSync(path.join(root, file)), `required governance artifact exists: ${file}`);

const frameworks = [
  ["NIST", parse("compliance/nist-security-by-design-crosswalk.json"), 18],
  ["ISO 27001", parse("compliance/iso27001-security-by-design-crosswalk.json"), 20],
  ["SOC 2", parse("compliance/soc2-security-by-design-crosswalk.json"), 20],
  ["Privacy", parse("compliance/privacy-security-by-design-crosswalk.json"), 16],
];
for (const [name, framework, minimum] of frameworks) {
  check(framework.schemaVersion === "1.0", `${name} declares schema version`);
  check(Array.isArray(framework.controls), `${name} contains controls`);
  check(framework.controls.length >= minimum, `${name} meets minimum control coverage`);
  check(framework.controls.every((control) => typeof control.controlId === "string" && control.controlId.length > 1), `${name} controls have identifiers`);
  check(framework.controls.every((control) => typeof control.capability === "string" && control.capability.length >= 20), `${name} controls have implementation summaries`);
  check(framework.controls.every((control) => Array.isArray(control.evidence) && control.evidence.length > 0), `${name} controls have evidence references`);
  check(framework.controls.every((control) => Array.isArray(control.tests) && control.tests.length > 0), `${name} controls have test references`);
  check(framework.controls.every((control) => ["implemented", "partial", "planned"].includes(control.status)), `${name} controls have bounded statuses`);
  check(new Set(framework.controls.map((control) => control.controlId)).size === framework.controls.length, `${name} control identifiers are unique`);
}

const iso = frameworks[1][1];
const soc2 = frameworks[2][1];
const privacy = frameworks[3][1];
check(/licensed ISO control text is not reproduced/i.test(iso.notice), "ISO licensed text is not reproduced");
check(/authoritative AICPA criteria text is not reproduced/i.test(soc2.notice), "SOC 2 authoritative text is not reproduced");
check(/legal and licensed standards text is not reproduced/i.test(privacy.notice), "privacy legal and licensed text is not reproduced");
check(privacy.frameworks.includes("NIST Privacy Framework 1.0"), "privacy uses stable NIST Privacy Framework 1.0");
check(privacy.frameworks.includes("ISO/IEC 27701:2025"), "privacy aligns to ISO 27701:2025");
check(privacy.frameworks.includes("GDPR"), "privacy aligns to GDPR");

const registry = read("lib/governance-evidence.ts");
for (const phrase of ["getGovernanceControls", "getAuditableDocuments", "getGovernanceSummary", "buildGovernanceExport", 'framework: "NIST"', 'framework: "ISO 27001"', 'framework: "SOC 2"', 'framework: "Privacy"', "coveragePercent", "evidenceReferences", "validationCommands", "not a certification"]) check(registry.includes(phrase), `governance registry includes ${phrase}`);

const excel = read("lib/governance-excel.ts");
for (const phrase of ["Executive Summary", "Evidence Inventory", "Audit Notes", "AutoFilter", "FreezePanes", "NIST", "ISO 27001", "SOC 2", "Privacy"]) check(excel.includes(phrase), `Excel crosswalk includes ${phrase}`);
check(!excel.toLowerCase().includes("word"), "Excel generator does not produce a Word crosswalk");

const pdf = read("lib/governance-pdf.ts");
for (const phrase of ["%PDF-1.4", "FRAMEWORK COVERAGE", "CONTROL EVIDENCE", "AUDITABLE DOCUMENTS", "DISCLAIMERS", "escapePdfText", "pageLineCount"]) check(pdf.includes(phrase), `PDF evidence binder includes ${phrase}`);

const audit = read("lib/governance-export-audit.ts");
for (const phrase of ["excel-download", "pdf-download", "email-excel", "email-pdf", "/v1/governance-export-events/", 'cache: "no-store"', "AbortSignal.timeout(3_000)", '"idempotency-key"', "failClosed: true"]) check(audit.includes(phrase), `export audit includes ${phrase}`);

const compiler = read("lib/compliance-compiler.ts");
for (const phrase of ["compileComplianceSnapshot", "scannerSummary", "releaseBlockingFindings", "evidencePenalty", "vulnerabilityPenalty", "createHash(\"sha256\")", "persistSnapshot", "/v1/compliance-snapshots/", "defaultRefreshSeconds: 30", "certificationClaimed: false"]) check(compiler.includes(phrase), `compliance compiler includes ${phrase}`);

const compilerRoute = read("app/api/owner/governance/compliance-status/route.ts");
for (const phrase of ['requireStepUp("strict")', "authorizeOwner", "owner.userId !== stepUp.userId", "compileComplianceSnapshot", "If-None-Match".toLowerCase(), "persist: true", '"Cache-Control": "private, no-store, max-age=0"']) check(compilerRoute.toLowerCase().includes(phrase.toLowerCase()), `compliance API includes ${phrase}`);

const panel = read("app/admin/governance/ContinuousCompliancePanel.tsx");
for (const phrase of ["30_000", "Persist audit snapshot", "Pause live updates", "COMPLIANCE SCORE", "EVIDENCE COMPLETE", "RELEASE POSTURE", "Snapshot digest", "If-None-Match"]) check(panel.includes(phrase), `continuous dashboard includes ${phrase}`);

const vulnerability = read("lib/vulnerability-intelligence.ts");
for (const phrase of ["verified-scanner-record", "buildDeterministicRecommendation", "mapControls", "releaseBlockingThreshold", "Do not invent", "AbortSignal.timeout(18_000)", "temperature: 0.1"]) check(vulnerability.includes(phrase), `vulnerability intelligence includes ${phrase}`);

const vulnerabilityRoute = read("app/api/owner/governance/vulnerabilities/route.ts");
for (const phrase of ['requireStepUp("strict")', "authorizeOwner", "productionMutationAllowed: false", "AbortSignal.timeout(20_000)", "slice(0, 500)", "scanner-unconfigured", '"Cache-Control": "private, no-store, max-age=0"']) check(vulnerabilityRoute.includes(phrase), `vulnerability API includes ${phrase}`);

const exportRoutes = [
  ["Excel", read("app/api/owner/governance/export/excel/route.ts")],
  ["PDF", read("app/api/owner/governance/export/pdf/route.ts")],
  ["Email", read("app/api/owner/governance/export/email/route.ts")],
];
for (const [name, route] of exportRoutes) {
  for (const phrase of ['requireStepUp("strict")', "authorizeOwner", "owner.userId !== stepUp.userId", "recordGovernanceExport", "reason", "idempotency", '"Cache-Control": "private, no-store, max-age=0"', '"X-Robots-Tag": "noindex, nofollow"']) check(route.toLowerCase().includes(phrase.toLowerCase()), `${name} export includes ${phrase}`);
}

for (const [condition, description] of checks) assert.ok(condition, `Governance evidence readiness failed: ${description}`);
assert.ok(checks.length >= 100, `Governance evidence gate must contain at least 100 controls, found ${checks.length}`);
console.log(`Governance evidence and continuous compliance readiness passed (${checks.length} controls).`);
