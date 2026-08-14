import crypto from "node:crypto";
import fs from "node:fs";

const sourcePath = "docs/compliance/CMMC-SYSTEM-EVIDENCE.json";
const schemaPath = "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.schema.json";
const generatorPath = "scripts/cmmc-technical-human-disposition.mjs";
const outputPath = "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.json";
const humanPath = "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.md";
const digestPath = "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.sha256";
const mode = process.argv.includes("--write") ? "write" : "check";
const LEGAL_OWNER = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";

function fail(message) {
  throw new Error(`CMMC technical/human disposition gate failed: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`missing ${file}`);
  return fs.readFileSync(file, "utf8");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

const bundleRaw = read(sourcePath);
const schemaRaw = read(schemaPath);
const generatorRaw = read(generatorPath);
let bundle;
let schema;
try {
  bundle = JSON.parse(bundleRaw);
  schema = JSON.parse(schemaRaw);
} catch (error) {
  fail(`source or schema JSON is invalid: ${error instanceof Error ? error.message : String(error)}`);
}
if (bundle.schemaVersion !== "2.0" || bundle.legalOwner !== LEGAL_OWNER) fail("canonical bundle identity is invalid");
if (schema.title !== `${LEGAL_OWNER} Technical and Human Disposition Audit Record`) fail("disposition schema identity is invalid");
if (bundle.assessmentDispositionPolicy?.technicalAndHumanResultsSeparated !== true || bundle.assessmentDispositionPolicy?.pendingHumanReviewIsFailure !== false) fail("canonical bundle does not separate technical and human results");

const objectiveDispositions = bundle.systems.flatMap((system) => system.objectiveMappings.map((mapping) => ({
  systemId: system.systemId,
  baselineAuthorityId: mapping.baselineAuthorityId,
  assessmentAuthorityId: mapping.assessmentAuthorityId,
  controlId: mapping.controlId,
  objectiveId: mapping.objectiveId,
  technicalResultState: mapping.technicalResult.state,
  technicalResultExactRevision: mapping.technicalResult.exactRevision,
  technicalResultArtifactSha256: mapping.technicalResult.resultArtifactSha256,
  humanReviewState: mapping.humanAssessmentState,
  pendingHumanReviewIsFailure: mapping.pendingHumanReviewIsFailure,
  finding: mapping.finding,
})));
if (objectiveDispositions.length !== bundle.summary.objectiveMappingCount) fail("objective disposition count does not reconcile to the canonical bundle");
if (objectiveDispositions.some((item) => item.humanReviewState !== "pending" || item.pendingHumanReviewIsFailure !== false || item.finding !== "not_assessed")) fail("every human review must remain pending/non-failing and every finding not_assessed");

const systemDispositions = bundle.systems.map((system) => {
  const mappings = system.objectiveMappings;
  return {
    systemId: system.systemId,
    objectiveCount: mappings.length,
    technicalDisposition: system.findingEligibility.technicalStatus,
    technicalPassed: mappings.filter((item) => item.technicalResult.state === "passed").length,
    technicalFailed: mappings.filter((item) => item.technicalResult.state === "failed").length,
    technicalNotTested: mappings.filter((item) => item.technicalResult.state === "not_tested").length,
    humanDisposition: "pending",
    humanPending: mappings.length,
  };
});

const record = {
  schemaVersion: "1.0",
  recordId: `${bundle.bundleId}:technical-human-disposition`,
  recordState: bundle.bundleState === "final_release_evidence" ? "final_release_disposition_record" : "working_disposition_record",
  generatedAt: bundle.generatedAt,
  legalOwner: LEGAL_OWNER,
  schemaReference: { path: schemaPath, sha256: sha256(schemaRaw) },
  generatorReference: { path: generatorPath, sha256: sha256(generatorRaw) },
  sourceBundle: {
    path: sourcePath,
    bundleId: bundle.bundleId,
    bundleState: bundle.bundleState,
    sha256: sha256(bundleRaw),
    revisionBinding: bundle.repositoryRevision.revisionBinding,
    exactReleaseCommitSha: bundle.repositoryRevision.exactReleaseCommitSha,
  },
  technicalGate: {
    disposition: bundle.summary.technicalGateDisposition,
    passCriteria: bundle.assessmentDispositionPolicy.technicalGateCriteria.pass,
    failCriteria: bundle.assessmentDispositionPolicy.technicalGateCriteria.fail,
    pendingCriteria: bundle.assessmentDispositionPolicy.technicalGateCriteria.pending,
    passed: bundle.summary.technicalPassedObjectiveCount,
    failed: bundle.summary.technicalFailedObjectiveCount,
    notTested: bundle.summary.technicalNotTestedObjectiveCount,
    humanReviewStateAffectsOutcome: false,
  },
  humanReview: {
    disposition: "pending",
    completionCriteria: bundle.assessmentDispositionPolicy.humanReviewCriteria.completion,
    pendingCriteria: bundle.assessmentDispositionPolicy.humanReviewCriteria.pending,
    pending: bundle.summary.humanPendingObjectiveCount,
    completed: 0,
    notRequired: 0,
    pendingIsTechnicalFailure: false,
    completionRequiredForTechnicalPass: false,
  },
  separationInvariant: {
    independentChannels: true,
    allCurrentHumanReviewsPending: true,
    pendingHumanCannotFailTechnicalGate: true,
    findingRemainsNotAssessed: true,
  },
  systemDispositions,
  objectiveDispositions,
  summary: {
    systemCount: systemDispositions.length,
    objectiveDispositionCount: objectiveDispositions.length,
    allHumanPending: true,
    technicalAndHumanCountsReconciled:
      objectiveDispositions.length === bundle.summary.technicalPassedObjectiveCount + bundle.summary.technicalFailedObjectiveCount + bundle.summary.technicalNotTestedObjectiveCount &&
      objectiveDispositions.length === bundle.summary.humanPendingObjectiveCount,
    failClosed: true,
  },
  claimBoundary: "This independent disposition record separates automated technical results from pending human review. It does not create a MET, NOT MET, or NOT APPLICABLE assessor finding, certify CMMC status, or authorize CUI processing.",
};
if (!record.summary.technicalAndHumanCountsReconciled) fail("technical and human counts do not reconcile");
if (record.technicalGate.disposition === "passed" && record.technicalGate.notTested !== 0) fail("technical gate cannot pass with untested objectives");

const lines = [
  "# CMMC Technical Gate and Human Review Disposition",
  "",
  "> GENERATED FROM THE CANONICAL MACHINE-READABLE SYSTEM EVIDENCE RECORD. DO NOT EDIT MANUALLY.",
  "",
  `- **Legal owner:** ${LEGAL_OWNER}`,
  `- **Record:** \`${record.recordId}\``,
  `- **State:** \`${record.recordState}\``,
  `- **Generated:** \`${record.generatedAt}\``,
  `- **Source bundle:** \`${record.sourceBundle.bundleId}\``,
  `- **Source bundle SHA-256:** \`${record.sourceBundle.sha256}\``,
  `- **Revision binding:** \`${record.sourceBundle.revisionBinding}\``,
  "",
  "## Independent pass criteria",
  "",
  `**Technical pass:** ${record.technicalGate.passCriteria}`,
  "",
  `**Technical fail:** ${record.technicalGate.failCriteria}`,
  "",
  `**Technical pending:** ${record.technicalGate.pendingCriteria}`,
  "",
  `**Human completion:** ${record.humanReview.completionCriteria}`,
  "",
  `**Human pending:** ${record.humanReview.pendingCriteria}`,
  "",
  "Human review state does not affect the technical result. Pending human review is not a technical failure and is not required for a technical pass.",
  "",
  "## Current disposition",
  "",
  `- Technical: \`${record.technicalGate.disposition}\` — ${record.technicalGate.passed} passed, ${record.technicalGate.failed} failed, ${record.technicalGate.notTested} not tested.`,
  `- Human: \`pending\` — ${record.humanReview.pending} pending, 0 completed, 0 not required.`,
  `- Assessment finding: \`not_assessed\` for every objective.`,
  "",
  "## Per-system reconciliation",
  "",
  "| System | Objectives | Technical | Passed | Failed | Not tested | Human | Human pending |",
  "| --- | ---: | --- | ---: | ---: | ---: | --- | ---: |",
  ...record.systemDispositions.map((system) => `| \`${escapeCell(system.systemId)}\` | ${system.objectiveCount} | ${system.technicalDisposition} | ${system.technicalPassed} | ${system.technicalFailed} | ${system.technicalNotTested} | pending | ${system.humanPending} |`),
  "",
  "## Claim boundary",
  "",
  record.claimBoundary,
  "",
  `The complete ${record.summary.objectiveDispositionCount}-row machine-readable disposition ledger is in \`${outputPath}\`.`,
  "",
];

const expectedJson = `${JSON.stringify(record, null, 2)}\n`;
const expectedHuman = `${lines.join("\n").trimEnd()}\n`;
const expectedDigest = [
  `${sha256(expectedJson)}  CMMC-TECHNICAL-HUMAN-DISPOSITION.json`,
  `${sha256(expectedHuman)}  CMMC-TECHNICAL-HUMAN-DISPOSITION.md`,
  `${sha256(bundleRaw)}  CMMC-SYSTEM-EVIDENCE.json`,
  `${sha256(schemaRaw)}  CMMC-TECHNICAL-HUMAN-DISPOSITION.schema.json`,
  `${sha256(generatorRaw)}  cmmc-technical-human-disposition.mjs`,
  "",
].join("\n");

if (mode === "write") {
  fs.writeFileSync(outputPath, expectedJson, "utf8");
  fs.writeFileSync(humanPath, expectedHuman, "utf8");
  fs.writeFileSync(digestPath, expectedDigest, "utf8");
} else {
  if (read(outputPath) !== expectedJson) fail("machine-readable disposition record drifted");
  if (read(humanPath) !== expectedHuman) fail("human-readable disposition extract drifted");
  if (read(digestPath) !== expectedDigest) fail("disposition digest manifest drifted");
}

console.log(`CMMC technical/human disposition ${mode === "write" ? "generated" : "verified"}: technical ${record.technicalGate.disposition}; human pending ${record.humanReview.pending}/${record.summary.objectiveDispositionCount}; human pending is not a technical failure.`);
