import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.json");
const schemaPath = path.join(root, "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.schema.json");
const reportPath = path.join(root, "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md");
const digestPath = path.join(root, "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.sha256");

const expectedFamilyMaximums = {
  "03.01": 22,
  "03.02": 3,
  "03.03": 9,
  "03.04": 12,
  "03.05": 12,
  "03.06": 5,
  "03.07": 6,
  "03.08": 9,
  "03.09": 2,
  "03.10": 8,
  "03.11": 4,
  "03.12": 5,
  "03.13": 16,
  "03.14": 8,
  "03.15": 3,
  "03.16": 3,
  "03.17": 3,
};

const allowedStatuses = new Set([
  "implemented_source_evidence",
  "partial_external_evidence_required",
  "organizational_evidence_required",
  "scope_dependent",
]);

const allowedMethods = new Set(["examine", "interview", "test"]);
const statusSeverity = {
  implemented_source_evidence: 0,
  partial_external_evidence_required: 1,
  organizational_evidence_required: 2,
  scope_dependent: 3,
};

function fail(message) {
  console.error(`CMMC traceability gate failed: ${message}`);
  process.exit(1);
}

function readText(file) {
  if (!fs.existsSync(file)) fail(`required file is missing: ${path.relative(root, file)}`);
  return fs.readFileSync(file, "utf8");
}

function parseJson(file, label) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function unique(values) {
  return new Set(values).size === values.length;
}

function escapeCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", "<br>");
}

function expectedRequirementSlots() {
  const ids = [];
  for (const [family, maximum] of Object.entries(expectedFamilyMaximums)) {
    for (let index = 1; index <= maximum; index += 1) {
      ids.push(`${family}.${String(index).padStart(2, "0")}`);
    }
  }
  return ids;
}

function validateRegistry(registry, schema) {
  if (schema?.title !== "Obserra CMMC Level 2 NIST SP 800-171 Rev. 3 Traceability Register") {
    fail("traceability schema title is unexpected");
  }
  if (registry?.schemaVersion !== "1.0") fail("schemaVersion must be 1.0");
  if (registry?.framework?.engineeringBaseline?.publication !== "NIST SP 800-171 Rev. 3") {
    fail("engineering baseline must be NIST SP 800-171 Rev. 3");
  }
  if (registry?.framework?.engineeringBaseline?.assessmentPublication !== "NIST SP 800-171A Rev. 3") {
    fail("assessment baseline must be NIST SP 800-171A Rev. 3");
  }
  if (registry?.framework?.engineeringBaseline?.activeRequirementCount !== 97) {
    fail("Rev. 3 active requirement count must be 97");
  }
  if (registry?.framework?.cmmcLevel2CurrentRuleBaseline?.publication !== "NIST SP 800-171 Rev. 2") {
    fail("current CMMC Level 2 rule crosswalk must remain explicitly bound to NIST SP 800-171 Rev. 2 until the governing rule changes");
  }
  if (registry?.framework?.cmmcLevel2CurrentRuleBaseline?.requirementCount !== 110) {
    fail("current CMMC Level 2 rule crosswalk must retain the 110 Rev. 2 requirement count");
  }
  if (registry?.scope?.cuiProcessingAuthorized !== false) {
    fail("CUI processing must remain unauthorized until the formal assessment boundary and evidence are complete");
  }
  if (registry?.scope?.formalCuiAssessmentScopeEstablished !== false) {
    fail("formal CUI assessment scope must not be represented as established without an approved assessment boundary");
  }
  if (!/^[0-9a-f]{40}$/.test(registry?.program?.sourceCheckpoint ?? "")) {
    fail("program sourceCheckpoint must be an exact 40 character Git SHA");
  }
  if (!String(registry?.program?.claimBoundary ?? "").includes("does not claim CMMC certification")) {
    fail("claim boundary must explicitly prohibit a CMMC certification claim");
  }

  const familyCodes = Object.keys(registry?.requirements ?? {});
  const expectedFamilies = Object.keys(expectedFamilyMaximums);
  if (familyCodes.length !== expectedFamilies.length || expectedFamilies.some((family) => !familyCodes.includes(family))) {
    fail("requirement families do not exactly match the 17 NIST SP 800-171 Rev. 3 families");
  }

  const active = [];
  const activeById = new Map();
  for (const family of expectedFamilies) {
    const familyRecord = registry.requirements[family];
    if (!familyRecord || typeof familyRecord.family !== "string" || familyRecord.family.trim() === "") {
      fail(`family metadata is incomplete for ${family}`);
    }
    if (!allowedStatuses.has(familyRecord.defaultStatus)) {
      fail(`family ${family} has an invalid default status`);
    }
    if (!Array.isArray(familyRecord.items) || familyRecord.items.length === 0) {
      fail(`family ${family} has no active requirements`);
    }
    for (const item of familyRecord.items) {
      if (!Array.isArray(item) || item.length !== 2) fail(`family ${family} contains a malformed requirement tuple`);
      const [id, title] = item;
      if (!/^03\.[0-9]{2}\.[0-9]{2}$/.test(id)) fail(`invalid Rev. 3 requirement id: ${id}`);
      if (!id.startsWith(`${family}.`)) fail(`requirement ${id} is stored under the wrong family ${family}`);
      if (typeof title !== "string" || title.trim() === "" || /withdrawn/i.test(title)) fail(`invalid active requirement title for ${id}`);
      if (activeById.has(id)) fail(`duplicate active Rev. 3 requirement id: ${id}`);
      const record = { id, title, familyCode: family, family: familyRecord.family, defaultStatus: familyRecord.defaultStatus };
      active.push(record);
      activeById.set(id, record);
    }
  }

  if (active.length !== 97) fail(`expected 97 active Rev. 3 requirements, found ${active.length}`);
  const withdrawn = registry?.withdrawnRequirementIds;
  if (!Array.isArray(withdrawn) || withdrawn.length !== 33 || !unique(withdrawn)) {
    fail("withdrawnRequirementIds must contain exactly 33 unique identifiers");
  }
  if (withdrawn.some((id) => activeById.has(id))) fail("an identifier cannot be both active and withdrawn");

  const expectedSlots = expectedRequirementSlots().sort();
  const representedSlots = [...active.map((item) => item.id), ...withdrawn].sort();
  if (expectedSlots.length !== representedSlots.length || expectedSlots.some((id, index) => id !== representedSlots[index])) {
    fail("active plus withdrawn Rev. 3 identifiers do not exactly cover the official numbered requirement slots");
  }

  const traceRecords = registry?.traceRecords;
  if (!Array.isArray(traceRecords) || traceRecords.length === 0) fail("traceRecords must not be empty");
  const traceIds = traceRecords.map((record) => record.id);
  if (!unique(traceIds)) fail("trace record ids must be unique");

  const traceByRequirement = new Map(active.map((item) => [item.id, []]));
  for (const record of traceRecords) {
    if (!/^TR-[0-9]{3}$/.test(record.id ?? "")) fail(`invalid trace record id: ${record.id}`);
    if (!allowedStatuses.has(record.status)) fail(`trace record ${record.id} has invalid status`);
    if (!Array.isArray(record.rev3) || record.rev3.length === 0 || !unique(record.rev3)) fail(`trace record ${record.id} must map unique Rev. 3 requirements`);
    if (!Array.isArray(record.rev2) || !unique(record.rev2) || record.rev2.some((id) => !/^3\.[0-9]{1,2}\.[0-9]{1,2}$/.test(id))) {
      fail(`trace record ${record.id} has malformed CMMC Rev. 2 crosswalk ids`);
    }
    if (!Array.isArray(record.methods) || record.methods.length === 0 || record.methods.some((method) => !allowedMethods.has(method))) {
      fail(`trace record ${record.id} has invalid assessment methods`);
    }
    if (!Array.isArray(record.evidence) || record.evidence.length === 0 || !unique(record.evidence)) fail(`trace record ${record.id} must contain unique evidence references`);
    for (const id of record.rev3) {
      if (!activeById.has(id)) fail(`trace record ${record.id} maps unknown or withdrawn Rev. 3 requirement ${id}`);
      traceByRequirement.get(id).push(record);
    }
    for (const evidence of record.evidence) {
      if (/^https?:\/\//.test(evidence) || /^external:/.test(evidence)) continue;
      const evidencePath = path.join(root, evidence);
      if (!fs.existsSync(evidencePath)) fail(`trace record ${record.id} references missing evidence path: ${evidence}`);
    }
    for (const field of ["title", "implementation", "boundary", "gap"]) {
      if (typeof record[field] !== "string" || record[field].trim() === "") fail(`trace record ${record.id} is missing ${field}`);
    }
  }

  const gaps = registry?.openAuditGaps;
  if (!Array.isArray(gaps)) fail("openAuditGaps must be an array");
  const gapIds = gaps.map((gap) => gap.id);
  if (!unique(gapIds)) fail("audit gap ids must be unique");
  for (const gap of gaps) {
    if (!/^GAP-[0-9]{3}$/.test(gap.id ?? "") || gap.status !== "open") fail(`invalid audit gap record ${gap.id}`);
    if (!Array.isArray(gap.requiredFor) || gap.requiredFor.some((id) => !activeById.has(id))) fail(`audit gap ${gap.id} maps an unknown requirement`);
  }

  const configuredPaths = registry?.traceability ?? {};
  const expectedPathBindings = {
    singleSourceOfTruth: "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.json",
    schema: "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.schema.json",
    generator: "scripts/cmmc-level2-rev3-traceability.mjs",
    humanReadable: "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-AUDIT-MATRIX.md",
    digest: "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.sha256",
  };
  for (const [key, expected] of Object.entries(expectedPathBindings)) {
    if (configuredPaths[key] !== expected) fail(`traceability.${key} must remain bound to ${expected}`);
  }
  if (configuredPaths.ciCommand !== "npm run verify:cmmc-traceability") fail("traceability CI command is not canonical");

  return { active, activeById, traceByRequirement };
}

function resolvedRequirementStatus(requirement, traceByRequirement) {
  const statuses = [requirement.defaultStatus, ...(traceByRequirement.get(requirement.id) ?? []).map((record) => record.status)];
  return statuses.reduce((current, candidate) => statusSeverity[candidate] > statusSeverity[current] ? candidate : current);
}

function renderReport(registry, validation, registryDigest) {
  const { active, traceByRequirement } = validation;
  const counts = Object.fromEntries([...allowedStatuses].map((status) => [status, 0]));
  for (const requirement of active) counts[resolvedRequirementStatus(requirement, traceByRequirement)] += 1;

  const lines = [
    "# CMMC Level 2 and NIST SP 800-171 Rev. 3 Audit Traceability Matrix",
    "",
    "> GENERATED FILE. DO NOT EDIT MANUALLY. Update `CMMC-LEVEL-2-REV3-TRACEABILITY.json` and run `npm run generate:cmmc-traceability`.",
    "",
    `Registry SHA-256: \`${registryDigest}\``,
    `Registry schema version: \`${registry.schemaVersion}\``,
    `Registry snapshot date: \`${registry.snapshotDate}\``,
    `Source checkpoint represented by the register: \`${registry.program.sourceCheckpoint}\``,
    "",
    "## Audit Claim Boundary",
    "",
    registry.program.claimBoundary,
    "",
    "NIST SP 800-171 Rev. 3 is the engineering baseline and NIST SP 800-171A Rev. 3 is the assessment procedure baseline for this traceability package. The current CMMC Level 2 rule baseline is retained separately because the current DoD assessment regime continues to reference the 110 NIST SP 800-171 Rev. 2 requirements. The Rev. 2 mappings in this report are a crosswalk aid and do not convert Rev. 3 implementation evidence into a CMMC certification claim.",
    "",
    "## Scope State",
    "",
    `Formal CUI assessment scope established: **${registry.scope.formalCuiAssessmentScopeEstablished ? "yes" : "no"}**`,
    `SSP complete: **${registry.scope.sspComplete ? "yes" : "no"}**`,
    `Network diagram complete: **${registry.scope.networkDiagramComplete ? "yes" : "no"}**`,
    `Asset inventory complete: **${registry.scope.assetInventoryComplete ? "yes" : "no"}**`,
    `CUI processing authorized: **${registry.scope.cuiProcessingAuthorized ? "yes" : "no"}**`,
    "",
    registry.scope.boundary,
    "",
    "## Requirement Coverage Summary",
    "",
    "| Resolved status | Count |",
    "| --- | ---: |",
    `| implemented source evidence | ${counts.implemented_source_evidence} |`,
    `| partial external evidence required | ${counts.partial_external_evidence_required} |`,
    `| organizational evidence required | ${counts.organizational_evidence_required} |`,
    `| scope dependent | ${counts.scope_dependent} |`,
    `| **Total active Rev. 3 requirements** | **${active.length}** |`,
    "",
    "A requirement status is deliberately conservative. The family default remains in force unless trace evidence is at least as restrictive. Source evidence therefore cannot silently promote an organizational or scope dependent requirement to complete.",
    "",
    "## NIST SP 800-171 Rev. 3 Requirement Matrix",
    "",
    "| Rev. 3 requirement | Title | Family | Resolved status | Trace records |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const requirement of active) {
    const traces = traceByRequirement.get(requirement.id) ?? [];
    lines.push(`| ${requirement.id} | ${escapeCell(requirement.title)} | ${escapeCell(requirement.family)} | ${resolvedRequirementStatus(requirement, traceByRequirement)} | ${traces.map((record) => record.id).join(", ") || "none yet"} |`);
  }

  lines.push("", "## Implementation Trace Records", "");
  for (const record of registry.traceRecords) {
    lines.push(
      `### ${record.id} ${record.title}`,
      "",
      `Status: \`${record.status}\``,
      "",
      `NIST SP 800-171 Rev. 3: ${record.rev3.map((id) => `\`${id}\``).join(", ")}`,
      "",
      `Current CMMC Level 2 Rev. 2 crosswalk: ${record.rev2.length ? record.rev2.map((id) => `\`${id}\``).join(", ") : "pending formal crosswalk review"}`,
      "",
      `Assessment methods: ${record.methods.map((method) => `\`${method}\``).join(", ")}`,
      "",
      `Responsible boundary: ${record.boundary}`,
      "",
      record.implementation,
      "",
      "Evidence:",
      "",
      ...record.evidence.map((evidence) => `* \`${evidence}\``),
      "",
      `Open evidence condition: ${record.gap}`,
      "",
    );
  }

  lines.push("## Provisional Asset Scope", "", "| Asset | Provisional category | Evidence state |", "| --- | --- | --- |");
  for (const asset of registry.scope.assets) {
    lines.push(`| ${escapeCell(asset.asset)} | ${escapeCell(asset.provisionalCategory)} | ${escapeCell(asset.evidenceState)} |`);
  }

  lines.push("", "## Open Audit Gaps", "");
  for (const gap of registry.openAuditGaps) {
    lines.push(`### ${gap.id} ${gap.title}`, "", gap.detail, "", `Mapped Rev. 3 requirements: ${gap.requiredFor.length ? gap.requiredFor.map((id) => `\`${id}\``).join(", ") : "cross framework or program level"}`, "");
  }

  lines.push("## Current CMMC Rule State", "", registry.framework.cmmcLevel2CurrentRuleBaseline.ruleState, "", registry.framework.cmmcLevel2CurrentRuleBaseline.crosswalkPurpose, "", "## Authoritative Sources", "");
  for (const source of registry.framework.officialSources) lines.push(`* ${source}`);

  lines.push("", "## Drift Control", "", registry.traceability.driftPolicy, "", `Verification command: \`${registry.traceability.ciCommand}\``, "");
  return `${lines.join("\n")}\n`;
}

const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : null;
if (!mode) fail("use --write to generate artifacts or --check to verify committed artifacts");

const registryRaw = readText(registryPath);
const registry = parseJson(registryPath, "traceability register");
const schema = parseJson(schemaPath, "traceability schema");
const validation = validateRegistry(registry, schema);
const digest = sha256(registryRaw);
const expectedReport = renderReport(registry, validation, digest);
const expectedDigest = `${digest}  ${path.basename(registryPath)}\n`;

if (mode === "write") {
  fs.writeFileSync(reportPath, expectedReport, "utf8");
  fs.writeFileSync(digestPath, expectedDigest, "utf8");
  console.log(`Generated CMMC Level 2 Rev. 3 audit matrix for ${validation.active.length} active requirements.`);
  console.log(`Registry SHA-256: ${digest}`);
  process.exit(0);
}

if (!fs.existsSync(reportPath)) fail(`generated human readable matrix is missing: ${path.relative(root, reportPath)}`);
if (!fs.existsSync(digestPath)) fail(`registry digest file is missing: ${path.relative(root, digestPath)}`);
const actualReport = fs.readFileSync(reportPath, "utf8");
const actualDigest = fs.readFileSync(digestPath, "utf8");
if (actualReport !== expectedReport) fail("human readable audit matrix has drifted from the machine readable source; regenerate it");
if (actualDigest !== expectedDigest) fail("registry SHA-256 digest has drifted from the machine readable source; regenerate it");

console.log(`CMMC Level 2 Rev. 3 traceability passed for ${validation.active.length} active requirements and ${registry.traceRecords.length} trace records.`);
console.log(`Registry SHA-256: ${digest}`);
