import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mappingPath = path.join(root, "docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.json");
const schemaPath = path.join(root, "docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.schema.json");
const reportPath = path.join(root, "docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MATRIX.md");
const digestPath = path.join(root, "docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.sha256");

const rev2FamilyMaximums = {
  "3.1": 22,
  "3.2": 3,
  "3.3": 9,
  "3.4": 9,
  "3.5": 11,
  "3.6": 3,
  "3.7": 6,
  "3.8": 9,
  "3.9": 2,
  "3.10": 6,
  "3.11": 3,
  "3.12": 4,
  "3.13": 16,
  "3.14": 7,
};

function fail(message) {
  console.error(`CMMC dual-baseline gate failed: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`required file is missing: ${path.relative(root, file)}`);
  return fs.readFileSync(file, "utf8");
}

function json(file, label) {
  try {
    return JSON.parse(read(file));
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

function rev3IdFor(rev2Id) {
  const [major, family, item] = rev2Id.split(".");
  return `${major.padStart(2, "0")}.${family.padStart(2, "0")}.${item.padStart(2, "0")}`;
}

function rev2IdFor(rev3Id) {
  const [major, family, item] = rev3Id.split(".");
  const candidate = `${Number(major)}.${Number(family)}.${Number(item)}`;
  return Number(major) === 3 && Number(family) <= 14 ? candidate : null;
}

function escapeCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function activeRev3Requirements(registry) {
  const active = [];
  for (const [familyCode, family] of Object.entries(registry.requirements ?? {})) {
    for (const item of family.items ?? []) {
      active.push({ id: item[0], title: item[1], familyCode, family: family.family });
    }
  }
  return active;
}

function validate(mapping, schema, rev3) {
  if (schema?.title !== "Obserra CMMC Level 2 Rev. 2 and Rev. 3 Dual-Baseline Mapping") {
    fail("mapping schema title is unexpected");
  }
  if (mapping?.schemaVersion !== "1.0") fail("schemaVersion must be 1.0");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(mapping?.snapshotDate ?? "")) fail("snapshotDate must use YYYY-MM-DD");
  if (!/^[0-9a-f]{40}$/.test(mapping?.program?.startingSourceSha ?? "")) fail("startingSourceSha must be an exact Git SHA");
  if (!String(mapping?.program?.claimBoundary ?? "").includes("does not claim a MET assessment result")) {
    fail("claim boundary must prohibit an unassessed MET claim");
  }
  if (mapping?.baselines?.cmmcLevel2Assessment?.requirementCount !== 110) fail("Rev. 2 assessment baseline must contain 110 requirements");
  if (mapping?.baselines?.cmmcLevel2Assessment?.assessmentStatus !== "not_assessed") fail("Rev. 2 assessment status must remain not_assessed");
  if (mapping?.baselines?.forwardEngineering?.activeRequirementCount !== 97) fail("Rev. 3 active count must be 97");
  if (mapping?.baselines?.forwardEngineering?.withdrawnIdentifierCount !== 33) fail("Rev. 3 withdrawn count must be 33");
  if (mapping?.scopeState?.cuiProcessingAuthorized !== false || mapping?.scopeState?.formalCuiAssessmentScopeEstablished !== false) {
    fail("CUI processing and formal assessment scope must remain unauthorized/unestablished until evidence exists");
  }
  if (!Array.isArray(mapping?.authoritativeSources) || mapping.authoritativeSources.length < 6 || !unique(mapping.authoritativeSources)) {
    fail("authoritativeSources must contain at least six unique official sources");
  }

  const expectedPaths = {
    schema: "docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.schema.json",
    generator: "scripts/cmmc-level2-dual-baseline.mjs",
    humanReadable: "docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MATRIX.md",
    digest: "docs/florida-class-d-lms/CMMC-LEVEL-2-DUAL-BASELINE-MAPPING.sha256",
    ciCommand: "npm run verify:cmmc-dual-baseline",
  };
  for (const [key, expected] of Object.entries(expectedPaths)) {
    if (mapping?.outputs?.[key] !== expected) fail(`outputs.${key} must remain bound to ${expected}`);
  }

  const familyCodes = Object.keys(mapping?.rev2Families ?? {});
  const expectedFamilyCodes = Object.keys(rev2FamilyMaximums);
  if (familyCodes.length !== 14 || expectedFamilyCodes.some((family) => !familyCodes.includes(family))) {
    fail("Rev. 2 families must exactly cover the 14 CMMC Level 2 families");
  }

  const rev2Requirements = [];
  for (const familyCode of expectedFamilyCodes) {
    const family = mapping.rev2Families[familyCode];
    if (!/^[A-Z]{2}$/.test(family?.code ?? "") || !String(family?.name ?? "").trim()) fail(`family ${familyCode} metadata is incomplete`);
    const items = family.requirements;
    if (!Array.isArray(items) || items.length !== rev2FamilyMaximums[familyCode]) {
      fail(`family ${familyCode} must contain exactly ${rev2FamilyMaximums[familyCode]} requirements`);
    }
    for (let index = 1; index <= rev2FamilyMaximums[familyCode]; index += 1) {
      const item = items[index - 1];
      const expectedId = `${familyCode}.${index}`;
      if (!Array.isArray(item) || item.length !== 2 || item[0] !== expectedId || !String(item[1] ?? "").trim()) {
        fail(`family ${familyCode} must contain ordered requirement ${expectedId} with a title`);
      }
      rev2Requirements.push({ id: item[0], title: item[1], familyCode, familyCodeShort: family.code, family: family.name });
    }
  }
  if (rev2Requirements.length !== 110 || !unique(rev2Requirements.map((item) => item.id))) fail("Rev. 2 catalog must contain exactly 110 unique requirements");

  if (mapping.baselines.forwardEngineering.registry !== "docs/florida-class-d-lms/CMMC-LEVEL-2-REV3-TRACEABILITY.json") {
    fail("Rev. 3 registry binding is not canonical");
  }
  const activeRev3 = activeRev3Requirements(rev3);
  const activeRev3Ids = new Set(activeRev3.map((item) => item.id));
  const withdrawnRev3Ids = new Set(rev3.withdrawnRequirementIds ?? []);
  if (activeRev3.length !== 97 || withdrawnRev3Ids.size !== 33) fail("linked Rev. 3 register has an unexpected catalog size");
  if ([...activeRev3Ids].some((id) => withdrawnRev3Ids.has(id))) fail("linked Rev. 3 register overlaps active and withdrawn identifiers");

  for (const requirement of rev2Requirements) {
    const id = rev3IdFor(requirement.id);
    if (!activeRev3Ids.has(id) && !withdrawnRev3Ids.has(id)) fail(`Rev. 2 requirement ${requirement.id} has no active or withdrawn Rev. 3 disposition`);
  }

  const traceRecords = rev3.traceRecords ?? [];
  const rev2Ids = new Set(rev2Requirements.map((item) => item.id));
  for (const trace of traceRecords) {
    for (const id of trace.rev2 ?? []) if (!rev2Ids.has(id)) fail(`trace ${trace.id} maps unknown Rev. 2 requirement ${id}`);
    for (const evidence of trace.evidence ?? []) {
      if (/^https?:\/\//.test(evidence) || /^external:/.test(evidence)) continue;
      if (!fs.existsSync(path.join(root, evidence))) fail(`trace ${trace.id} references missing evidence ${evidence}`);
    }
  }

  const traceByRev2 = new Map(rev2Requirements.map((item) => [item.id, []]));
  const traceByRev3 = new Map(activeRev3.map((item) => [item.id, []]));
  for (const trace of traceRecords) {
    for (const id of trace.rev2 ?? []) traceByRev2.get(id)?.push(trace);
    for (const id of trace.rev3 ?? []) traceByRev3.get(id)?.push(trace);
  }

  return { rev2Requirements, activeRev3, activeRev3Ids, withdrawnRev3Ids, traceByRev2, traceByRev3 };
}

function render(mapping, rev3, validation, digest, rev3Digest) {
  const directActive = validation.rev2Requirements.filter((item) => validation.activeRev3Ids.has(rev3IdFor(item.id))).length;
  const withdrawn = validation.rev2Requirements.length - directActive;
  const tracedRev2 = validation.rev2Requirements.filter((item) => validation.traceByRev2.get(item.id)?.length).length;
  const rev3Only = validation.activeRev3.filter((item) => rev2IdFor(item.id) === null).length;
  const lines = [
    "# CMMC Level 2 Rev. 2 and NIST SP 800-171 Rev. 3 Dual-Baseline Matrix",
    "",
    "> GENERATED FILE. DO NOT EDIT MANUALLY. Update the dual-baseline JSON and the controlled Rev. 3 registry, then run `npm run generate:cmmc-dual-baseline`.",
    "",
    `Dual-baseline registry SHA-256: \`${digest}\``,
    `Linked Rev. 3 registry SHA-256: \`${rev3Digest}\``,
    `Snapshot date: \`${mapping.snapshotDate}\``,
    `Starting source SHA: \`${mapping.program.startingSourceSha}\``,
    "",
    "## Claim boundary",
    "",
    mapping.program.claimBoundary,
    "",
    "Every Rev. 2 requirement is deliberately marked `not_assessed`. Source or provider evidence can support an assessment, but it cannot produce a MET result without evaluating all applicable NIST SP 800-171A Jun2018 determination statements in the approved assessment scope.",
    "",
    "## Catalog completeness",
    "",
    "| Baseline relationship | Count |",
    "| --- | ---: |",
    `| Rev. 2 assessment requirements | ${validation.rev2Requirements.length} |`,
    `| Rev. 2 identifiers still active under the same Rev. 3 number | ${directActive} |`,
    `| Rev. 2 identifiers withdrawn in Rev. 3 | ${withdrawn} |`,
    `| Rev. 2 requirements with explicit implementation trace records | ${tracedRev2} |`,
    `| Active Rev. 3 requirements | ${validation.activeRev3.length} |`,
    `| Rev. 3-only active requirements without a same-number Rev. 2 item | ${rev3Only} |`,
    `| Withdrawn Rev. 3 identifiers retained | ${validation.withdrawnRev3Ids.size} |`,
    "",
    "## Current CMMC Level 2 assessment baseline: all 110 Rev. 2 requirements",
    "",
    "| Rev. 2 | Family | Requirement | Assessment | Rev. 3 identifier disposition | Implementation traces | Evidence state |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const requirement of validation.rev2Requirements) {
    const rev3Id = rev3IdFor(requirement.id);
    const active = validation.activeRev3Ids.has(rev3Id);
    const traces = validation.traceByRev2.get(requirement.id) ?? [];
    lines.push(`| ${requirement.id} | ${requirement.familyCodeShort} / ${escapeCell(requirement.family)} | ${escapeCell(requirement.title)} | not_assessed | ${rev3Id} ${active ? "active" : "withdrawn"} | ${traces.map((trace) => trace.id).join(", ") || "none"} | ${traces.length ? "trace evidence available; assessment pending" : "evidence mapping required"} |`);
  }

  lines.push(
    "",
    "## Forward engineering baseline: all 97 active Rev. 3 requirements",
    "",
    "| Rev. 3 | Family | Requirement | Same-number Rev. 2 | Implementation traces |",
    "| --- | --- | --- | --- | --- |",
  );

  const rev2IdSet = new Set(validation.rev2Requirements.map((item) => item.id));
  for (const requirement of validation.activeRev3) {
    const rev2Id = rev2IdFor(requirement.id);
    const traces = validation.traceByRev3.get(requirement.id) ?? [];
    lines.push(`| ${requirement.id} | ${escapeCell(requirement.family)} | ${escapeCell(requirement.title)} | ${rev2Id && rev2IdSet.has(rev2Id) ? rev2Id : "Rev. 3-only"} | ${traces.map((trace) => trace.id).join(", ") || "none"} |`);
  }

  lines.push(
    "",
    "## Mapping rules",
    "",
    `- ${mapping.mappingPolicy.directIdentifierRule}`,
    `- ${mapping.mappingPolicy.implementationRule}`,
    `- ${mapping.mappingPolicy.assessmentRule}`,
    `- ${mapping.mappingPolicy.rev3OnlyRule}`,
    "",
    "## Scope state",
    "",
    `- Formal CUI assessment scope established: **${mapping.scopeState.formalCuiAssessmentScopeEstablished ? "yes" : "no"}**`,
    `- SSP complete: **${mapping.scopeState.sspComplete ? "yes" : "no"}**`,
    `- Asset inventory complete: **${mapping.scopeState.assetInventoryComplete ? "yes" : "no"}**`,
    `- Network and data-flow diagrams complete: **${mapping.scopeState.networkAndDataFlowDiagramsComplete ? "yes" : "no"}**`,
    `- CUI processing authorized: **${mapping.scopeState.cuiProcessingAuthorized ? "yes" : "no"}**`,
    "",
    "## Authoritative sources",
    "",
    ...mapping.authoritativeSources.map((source) => `- ${source}`),
    "",
    "## Drift control",
    "",
    "CI validates the complete 110-item Rev. 2 catalog, the complete 97-active/33-withdrawn Rev. 3 catalog, every identifier disposition, every explicit implementation trace, every local evidence reference, the generated report, and both input digests.",
    "",
    `Verification command: \`${mapping.outputs.ciCommand}\``,
  );
  return `${lines.join("\n")}\n`;
}

const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : null;
if (!mode) fail("use --write to generate artifacts or --check to verify committed artifacts");

const mappingRaw = read(mappingPath);
const mapping = json(mappingPath, "dual-baseline mapping");
const schema = json(schemaPath, "dual-baseline schema");
const rev3Path = path.join(root, mapping?.baselines?.forwardEngineering?.registry ?? "missing");
const rev3Raw = read(rev3Path);
const rev3 = json(rev3Path, "Rev. 3 traceability register");
const validation = validate(mapping, schema, rev3);
const digest = sha256(mappingRaw);
const rev3Digest = sha256(rev3Raw);
const expectedReport = render(mapping, rev3, validation, digest, rev3Digest);
const expectedDigest = `${digest}  ${path.basename(mappingPath)}\n${rev3Digest}  ${path.basename(rev3Path)}\n`;

if (mode === "write") {
  fs.writeFileSync(reportPath, expectedReport, "utf8");
  fs.writeFileSync(digestPath, expectedDigest, "utf8");
  console.log(`Generated dual-baseline matrix for ${validation.rev2Requirements.length} Rev. 2 and ${validation.activeRev3.length} active Rev. 3 requirements.`);
  console.log(`Dual-baseline SHA-256: ${digest}`);
  process.exit(0);
}

if (!fs.existsSync(reportPath)) fail(`generated matrix is missing: ${path.relative(root, reportPath)}`);
if (!fs.existsSync(digestPath)) fail(`digest file is missing: ${path.relative(root, digestPath)}`);
if (read(reportPath) !== expectedReport) fail("generated matrix has drifted from the machine-readable sources");
if (read(digestPath) !== expectedDigest) fail("dual-baseline digest has drifted from the machine-readable sources");

console.log(`CMMC dual-baseline mapping passed for ${validation.rev2Requirements.length} Rev. 2 requirements, ${validation.activeRev3.length} active Rev. 3 requirements, and ${validation.withdrawnRev3Ids.size} withdrawn Rev. 3 identifiers.`);
console.log(`Dual-baseline SHA-256: ${digest}`);
