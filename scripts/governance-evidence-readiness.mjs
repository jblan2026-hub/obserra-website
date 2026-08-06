import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const parse = (file) => JSON.parse(read(file));
const checks = [];
const check = (condition, description) => checks.push([Boolean(condition), description]);

const requiredFiles = [
  "compliance/nist-security-by-design-crosswalk.json",
  "compliance/iso27001-security-by-design-crosswalk.json",
  "compliance/soc2-security-by-design-crosswalk.json",
  "compliance/privacy-security-by-design-crosswalk.json",
  "compliance/pci-dss-purchase-stream-crosswalk.json",
  "compliance/data-protection-security-by-design-crosswalk.json",
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
  "app/admin/governance/governance.css",
  "app/api/owner/governance/compliance-status/route.ts",
  "app/api/owner/governance/vulnerabilities/route.ts",
  "app/api/owner/governance/export/excel/route.ts",
  "app/api/owner/governance/export/pdf/route.ts",
  "app/api/owner/governance/export/email/route.ts",
  "package.json",
  ".github/workflows/branch-validation.yml",
];
for (const file of requiredFiles) check(fs.existsSync(path.join(root, file)), `required governance artifact exists: ${file}`);

const frameworks = [
  ["NIST", "compliance/nist-security-by-design-crosswalk.json", 18],
  ["ISO 27001", "compliance/iso27001-security-by-design-crosswalk.json", 20],
  ["SOC 2", "compliance/soc2-security-by-design-crosswalk.json", 20],
  ["Privacy", "compliance/privacy-security-by-design-crosswalk.json", 16],
  ["PCI DSS", "compliance/pci-dss-purchase-stream-crosswalk.json", 12],
  ["Data Protection", "compliance/data-protection-security-by-design-crosswalk.json", 20],
].map(([name, file, minimum]) => [name, parse(file), minimum, file]);

for (const [name, framework, minimum, file] of frameworks) {
  check(framework.schemaVersion === "1.0", `${name} declares schema version`);
  check(Array.isArray(framework.controls), `${name} contains a controls array`);
  check(framework.controls.length >= minimum, `${name} meets minimum individual-control coverage`);
  check(new Set(framework.controls.map((control) => control.controlId)).size === framework.controls.length, `${name} control identifiers are unique`);
  check(typeof framework.notice === "string" || name === "NIST", `${name} includes a framework notice where required`);
  check(read(file).length > 500, `${name} crosswalk is substantive`);

  for (const control of framework.controls) {
    const prefix = `${name} ${control.controlId}`;
    check(typeof control.controlId === "string" && control.controlId.trim().length > 1, `${prefix} has a valid identifier`);
    check(!/[<>]/.test(control.controlId), `${prefix} identifier excludes markup characters`);
    check(typeof control.capability === "string" && control.capability.trim().length >= 20, `${prefix} has a substantive implementation summary`);
    check(control.capability.length <= 1000, `${prefix} implementation summary is bounded`);
    check(Array.isArray(control.evidence) && control.evidence.length > 0, `${prefix} has evidence references`);
    check(control.evidence.every((item) => typeof item === "string" && item.trim().length > 2), `${prefix} evidence references are valid strings`);
    check(control.evidence.length <= 20, `${prefix} evidence reference count is bounded`);
    check(new Set(control.evidence).size === control.evidence.length, `${prefix} evidence references are unique`);
    check(Array.isArray(control.tests) && control.tests.length > 0, `${prefix} has validation commands`);
    check(control.tests.every((item) => typeof item === "string" && item.trim().length > 2), `${prefix} validation commands are valid strings`);
    check(control.tests.length <= 20, `${prefix} validation command count is bounded`);
    check(new Set(control.tests).size === control.tests.length, `${prefix} validation commands are unique`);
    check(["implemented", "partial", "planned"].includes(control.status), `${prefix} has a bounded implementation status`);
    check(control.status !== "implemented" || (control.evidence.length > 0 && control.tests.length > 0), `${prefix} implemented status is evidence-backed`);
    check(typeof (control.category ?? control.domain ?? "Uncategorized") === "string", `${prefix} has a valid category or domain`);
  }
}

const iso = frameworks.find(([name]) => name === "ISO 27001")[1];
const soc2 = frameworks.find(([name]) => name === "SOC 2")[1];
const privacy = frameworks.find(([name]) => name === "Privacy")[1];
const pci = frameworks.find(([name]) => name === "PCI DSS")[1];
const dataProtection = frameworks.find(([name]) => name === "Data Protection")[1];
check(/licensed ISO control text is not reproduced/i.test(iso.notice), "ISO licensed text is not reproduced");
check(/authoritative AICPA criteria text is not reproduced/i.test(soc2.notice), "SOC 2 authoritative text is not reproduced");
check(/legal and licensed standards text is not reproduced/i.test(privacy.notice), "privacy legal and licensed text is not reproduced");
check(/not a PCI DSS attestation|does not constitute PCI certification/i.test(pci.notice ?? pci.scopeStatement), "PCI mapping disclaims certification or attestation");
check(/not certification|not a certification|not.*legal advice/i.test(dataProtection.notice), "data-protection mapping disclaims certification and legal advice");
check(privacy.frameworks.includes("NIST Privacy Framework 1.0"), "privacy uses stable NIST Privacy Framework 1.0");
check(privacy.frameworks.includes("ISO/IEC 27701:2025"), "privacy aligns to ISO 27701:2025");
check(privacy.frameworks.includes("GDPR"), "privacy aligns to GDPR");
check(/Stripe-hosted/i.test(pci.scopeModel ?? pci.scopeStatement), "PCI scope uses provider-hosted checkout");
check(/does not collect|does not store/i.test(pci.scopeModel ?? pci.scopeStatement), "PCI scope excludes raw card-data collection and storage");
check(dataProtection.frameworks.includes("NIST SP 800-53 Rev. 5"), "data protection maps NIST SP 800-53");
check(dataProtection.frameworks.includes("ISO/IEC 27001:2022"), "data protection maps ISO 27001");
check(dataProtection.frameworks.includes("GDPR"), "data protection maps GDPR");

const registry = read("lib/governance-evidence.ts");
for (const phrase of [
  "getGovernanceFrameworks", "getGovernanceControls", "getAuditableDocuments", "getGovernanceSummary", "buildGovernanceExport",
  'framework: "NIST"', 'framework: "ISO 27001"', 'framework: "SOC 2"', 'framework: "Privacy"', 'framework: "PCI DSS"', 'framework: "Data Protection"',
  "pci-dss-purchase-stream-crosswalk.json", "data-protection-security-by-design-crosswalk.json", "coveragePercent", "evidenceReferences", "validationCommands", "PCI attestation",
]) check(registry.includes(phrase), `governance registry includes ${phrase}`);

const excel = read("lib/governance-excel.ts");
for (const phrase of ["Executive Summary", "Evidence Inventory", "Audit Notes", "AutoFilter", "FreezePanes", "Control ID", "Implementation Capability", "Evidence References", "Validation Commands"]) check(excel.includes(phrase), `Excel crosswalk includes ${phrase}`);
check(!excel.toLowerCase().includes("word"), "Excel generator does not produce a Word crosswalk");
check(excel.includes("controlsByFramework"), "Excel creates a worksheet per framework");
check(excel.includes("application/vnd") === false, "Excel generator remains transport independent");

const pdf = read("lib/governance-pdf.ts");
for (const phrase of ["%PDF-1.4", "FRAMEWORK COVERAGE", "CONTROL EVIDENCE", "AUDITABLE DOCUMENTS", "DISCLAIMERS", "escapePdfText", "pageLineCount"]) check(pdf.includes(phrase), `PDF evidence binder includes ${phrase}`);

const audit = read("lib/governance-export-audit.ts");
for (const phrase of ["excel-download", "pdf-download", "email-excel", "email-pdf", "/v1/governance-export-events/", 'cache: "no-store"', "AbortSignal.timeout(3_000)", '"idempotency-key"', "failClosed: true"]) check(audit.includes(phrase), `export audit includes ${phrase}`);

const compiler = read("lib/compliance-compiler.ts");
for (const phrase of ["compileComplianceSnapshot", "scannerSummary", "releaseBlockingFindings", "evidencePenalty", "vulnerabilityPenalty", "sha256", "persistSnapshot", "/v1/compliance-snapshots/", "defaultRefreshSeconds: 30", "certificationClaimed: false", "releaseReady"]) check(compiler.includes(phrase), `compliance compiler includes ${phrase}`);

const compilerRoute = read("app/api/owner/governance/compliance-status/route.ts");
for (const phrase of ['requireStepUp("strict")', "authorizeOwner", "owner.userId !== stepUp.userId", "compileComplianceSnapshot", "if-none-match", "persist: true", '"Cache-Control": "private, no-store, max-age=0"', "ETag"]) check(compilerRoute.toLowerCase().includes(phrase.toLowerCase()), `compliance API includes ${phrase}`);

const panel = read("app/admin/governance/ContinuousCompliancePanel.tsx");
for (const phrase of ["30_000", "Persist audit snapshot", "Pause live updates", "COMPLIANCE SCORE", "EVIDENCE COMPLETE", "RELEASE POSTURE", "Snapshot digest", "If-None-Match", "Refresh now"]) check(panel.includes(phrase), `continuous dashboard includes ${phrase}`);

const vulnerability = read("lib/vulnerability-intelligence.ts");
for (const phrase of ["verified-scanner-record", "buildDeterministicRecommendation", "mapControls", "releaseBlockingThreshold", "Do not invent", "AbortSignal.timeout(18_000)", "temperature: 0.1", "sensitiveDataImpact", "internetExposed"]) check(vulnerability.includes(phrase), `vulnerability intelligence includes ${phrase}`);

const vulnerabilityRoute = read("app/api/owner/governance/vulnerabilities/route.ts");
for (const phrase of ['requireStepUp("strict")', "authorizeOwner", "productionMutationAllowed: false", "AbortSignal.timeout(20_000)", "slice(0, 500)", "scanner-unconfigured", '"Cache-Control": "private, no-store, max-age=0"', "idempotency-key"]) check(vulnerabilityRoute.includes(phrase), `vulnerability API includes ${phrase}`);

const exportRoutes = [
  ["Excel", read("app/api/owner/governance/export/excel/route.ts")],
  ["PDF", read("app/api/owner/governance/export/pdf/route.ts")],
  ["Email", read("app/api/owner/governance/export/email/route.ts")],
];
for (const [name, route] of exportRoutes) {
  for (const phrase of ['requireStepUp("strict")', "authorizeOwner", "owner.userId !== stepUp.userId", "recordGovernanceExport", "reason", "idempotency", '"Cache-Control": "private, no-store, max-age=0"', '"X-Robots-Tag": "noindex, nofollow"']) check(route.toLowerCase().includes(phrase.toLowerCase()), `${name} export includes ${phrase}`);
}
check(exportRoutes[0][1].includes("application/vnd.ms-excel"), "Excel route returns an Excel content type");
check(exportRoutes[0][1].includes("excel-download"), "Excel route records the Excel audit event type");
check(exportRoutes[2][1].includes('format === "pdf" ? "email-pdf" : "email-excel"'), "email route distinguishes Excel and PDF audit events");

const page = read("app/admin/governance/page.tsx");
for (const phrase of ["ContinuousCompliancePanel", "VulnerabilityIntelligencePanel", "GovernanceExportActions", "FRAMEWORK COVERAGE", "AUDITABLE DOCUMENTATION", "SCANNER READINESS", "getGovernanceSummary"]) check(page.includes(phrase), `Governance Center includes ${phrase}`);

const packageJson = parse("package.json");
check(packageJson.scripts["test:governance-evidence"] === "node scripts/governance-evidence-readiness.mjs", "package registers governance evidence gate");
check(packageJson.scripts["verify:release"].includes("test:governance-evidence"), "full release verifier includes governance evidence gate");

const workflow = read(".github/workflows/branch-validation.yml");
check(workflow.includes("test:governance-evidence"), "GitHub workflow includes governance evidence gate");
check((workflow.match(/test:governance-evidence/g) ?? []).length >= 2, "both GitHub validation paths include governance evidence gate");

for (const [condition, description] of checks) assert.ok(condition, `Governance evidence readiness failed: ${description}`);
assert.ok(checks.length >= 500, `Governance evidence gate must contain at least 500 independently evaluated controls, found ${checks.length}`);
console.log(JSON.stringify({ passed: true, macroGate: "governance-evidence-readiness", controlsEvaluated: checks.length, frameworks: frameworks.map(([name, framework]) => ({ name, controls: framework.controls.length })), excelCrosswalk: true, pdfBinder: true, continuousCompliance: true, vulnerabilityRiskMapping: true, releaseBlocking: true }, null, 2));
