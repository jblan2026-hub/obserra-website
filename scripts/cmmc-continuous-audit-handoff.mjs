import crypto from "node:crypto";
import fs from "node:fs";

const sourcePath = "docs/compliance/CMMC-CONTINUOUS-AUDIT-HANDOFF.json";
const humanPath = "docs/compliance/CMMC-CONTINUOUS-AUDIT-HANDOFF.md";
const digestPath = "docs/compliance/CMMC-CONTINUOUS-AUDIT-HANDOFF.sha256";
const mode = process.argv.includes("--write") ? "write" : "check";
const LEGAL_OWNER = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";

function fail(message) {
  throw new Error(`CMMC continuity handoff gate failed: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`missing ${file}`);
  return fs.readFileSync(file, "utf8");
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

const sourceRaw = read(sourcePath);
let source;
try {
  source = JSON.parse(sourceRaw);
} catch (error) {
  fail(`machine-readable handoff is invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

if (source.schemaVersion !== "obserra.cmmc.continuity-handoff.v1") fail("schemaVersion is invalid");
if (source.legalOwner !== LEGAL_OWNER) fail("complete legal owner name is required");
if (!/^[0-9a-f]{40}$/.test(source.workingBaseCommitSha ?? "")) fail("working base commit must be exact");
if (!Array.isArray(source.authorities) || source.authorities.length !== 6) fail("six exact governing/supplemental authorities are required");
if (!Array.isArray(source.scope?.excludedPathPrefixes) || !source.scope.excludedPathPrefixes.includes("app/apps/") || !source.scope.excludedPathPrefixes.includes("lib/apps/")) fail("Applications exclusions are incomplete");
if (source.canonicalAuditRecord?.objectiveCoverage?.uniqueObjectives !== 830 || source.canonicalAuditRecord?.objectiveCoverage?.separatedSystemObjectiveMappings !== 3048) fail("objective coverage is incomplete");
if (source.canonicalAuditRecord?.currentTechnicalDisposition?.humanPendingIsFailure !== false) fail("human-pending non-failure rule is missing");
if (source.archiveContract?.retentionMode !== "indefinite" || source.archiveContract?.automaticDeletionEnabled !== false || source.archiveContract?.legalHoldRequired !== true) fail("indefinite retention contract is incomplete");
if (source.archiveTargetDecision?.physicalIsolationRequired !== true || source.archiveTargetDecision?.academyProjectRejectedAsArchiveTarget !== true || source.archiveTargetDecision?.academyOrApplicationsMutationPerformed !== false) fail("dedicated archive isolation decision is incomplete");
if (source.archiveTargetDecision?.quotedProjectCost?.amountUsd !== 10 || source.archiveTargetDecision?.quotedProjectCost?.recurrence !== "monthly") fail("dedicated archive project quote is missing or stale");
if (source.highAvailabilityContract?.required !== true || source.highAvailabilityContract?.meetsHighAvailability !== false || source.highAvailabilityContract?.additionalAddonCostsConfirmed !== false) fail("pending HA and cost state is mislabeled");
if (source.highAvailabilityContract?.recoveryObjectives?.maximumRtoMinutes !== 60 || source.highAvailabilityContract?.recoveryObjectives?.maximumRpoMinutes !== 15) fail("HA recovery objectives do not match policy");
if (source.websiteCredentialRemediation?.systemId !== "SYS-WEBSITE" || source.websiteCredentialRemediation?.canonicalPage !== "https://www.obserrallc.com/about") fail("website credential remediation boundary is invalid");
if (source.websiteCredentialRemediation?.liveAuthority?.technicalResult !== "failed" || source.websiteCredentialRemediation?.liveAuthority?.renderedCredentialImageCount !== 9 || source.websiteCredentialRemediation?.liveAuthority?.brokenCredentialImageCount !== 9 || source.websiteCredentialRemediation?.liveAuthority?.nonzeroNaturalDimensionCount !== 0) fail("current live website credential failure is mislabeled");
if (source.websiteCredentialRemediation?.candidateSource?.publicationState !== "published_ready_staged_not_canonical" || source.websiteCredentialRemediation?.candidateSource?.authoritativeTechnicalState !== "not_tested" || source.websiteCredentialRemediation?.candidateSource?.eligibleAsFinalEvidence !== false) fail("staged website release is mislabeled as canonical, final, or green");
if (!/^[0-9a-f]{40}$/.test(source.websiteCredentialRemediation?.candidateSource?.exactReleaseCommitSha ?? "") || source.websiteCredentialRemediation.candidateSource.exactReleaseCommitSha !== source.websiteCredentialRemediation.candidateSource.mergedProductionCommitSha) fail("staged website release commit is missing or inconsistent");
if (!/^dpl_[A-Za-z0-9]+$/.test(source.websiteCredentialRemediation?.candidateSource?.stagedVercelDeploymentId ?? "") || source.websiteCredentialRemediation?.candidateSource?.stagedDeploymentState !== "READY" || source.websiteCredentialRemediation?.candidateSource?.stagedDeploymentPromotionState !== "blocked_by_required_checks_and_clerk_dns") fail("staged Vercel deployment evidence is incomplete or mislabeled");
if (source.websiteCredentialRemediation?.candidateSource?.authorizedCredentialCount !== 9 || source.websiteCredentialRemediation?.candidateSource?.credentialHolderAuthorizedUploadCount !== 6 || source.websiteCredentialRemediation?.candidateSource?.liveVerifiedAdgObservationCount !== 3) fail("website credential candidate inventory is incomplete");
if (!Array.isArray(source.websiteCredentialRemediation?.candidateSource?.localCandidateValidations) || source.websiteCredentialRemediation.candidateSource.localCandidateValidations.length !== 4 || source.websiteCredentialRemediation.candidateSource.localCandidateValidations.some((result) => result.outcome !== "satisfied_locally_non_authoritative")) fail("website credential candidate validations are incomplete or mislabeled as authoritative");
if (source.websiteCredentialRemediation?.humanReview !== "pending" || source.websiteCredentialRemediation?.pendingHumanIsTechnicalFailure !== false || source.websiteCredentialRemediation?.assessmentFinding !== "not_assessed") fail("website human/assessor disposition is invalid");
if (source.fdacsPiiDatabaseAudit?.providerProjectRef !== "ggkxgjhsbgbifiqrhavr") fail("FDACS isolated audit project is invalid");
if (source.fdacsPiiDatabaseAudit?.securityAdvisorFindingCount !== 0 || source.fdacsPiiDatabaseAudit?.unindexedForeignKeyFindingCount !== 0 || source.fdacsPiiDatabaseAudit?.failedChainCount !== 0) fail("FDACS live audit result contains an unresolved technical finding");
if (source.fdacsPiiDatabaseAudit?.browserTablePrivilegeCount !== 0 || source.fdacsPiiDatabaseAudit?.browserFunctionExecutePrivilegeCount !== 0) fail("FDACS browser table or routine privilege remains live");
if (source.fdacsPiiDatabaseAudit?.preflightFinalized !== false || source.fdacsPiiDatabaseAudit?.productionRuntimeAuthorized !== false) fail("FDACS pending finalization/activation is mislabeled");
if (source.fdacsPiiDatabaseAudit?.humanReview !== "pending" || source.fdacsPiiDatabaseAudit?.assessmentFinding !== "not_assessed") fail("FDACS human/assessor disposition is invalid");
if (source.legalIdentityAudit?.legalEntityName !== LEGAL_OWNER || source.legalIdentityAudit?.authoritativeTechnicalState !== "not_tested" || source.legalIdentityAudit?.candidateValidationOutcome !== "satisfied_locally_non_authoritative" || source.legalIdentityAudit?.findingCount !== 0 || source.legalIdentityAudit?.failClosed !== true) fail("legal identity candidate is missing or mislabeled as green");
if (source.legalIdentityAudit?.humanReview !== "pending" || source.legalIdentityAudit?.pendingHumanIsTechnicalFailure !== false || source.legalIdentityAudit?.assessmentFinding !== "not_assessed" || source.legalIdentityAudit?.eligibleAsFinalEvidence !== false) fail("legal identity human/assessor/final-evidence disposition is invalid");
if (source.legalIdentityAudit?.applicationsWorkstreamExcluded !== true || source.legalIdentityAudit?.verificationCommand !== "npm run verify:legal-identity-audit") fail("legal identity audit scope or verification contract is invalid");
if (source.continuousAuditLinks?.released === true) {
  for (const field of ["machineReadable", "humanReadable", "workflowRuns"]) {
    if (!String(source.continuousAuditLinks[field] ?? "").startsWith("https://")) fail(`released ${field} link must be HTTPS`);
  }
  if (source.statusClaim !== "verified_live_continuous_audit") fail("released links require verified live status");
} else if (source.statusClaim === "verified_live_continuous_audit") {
  fail("live status cannot be recorded while links remain unreleased");
}
for (const blocker of source.liveActivationBlockers ?? []) {
  if (!/^LIVE-[0-9]{3}$/.test(blocker.id ?? "") || !["pending", "complete"].includes(blocker.state)) fail("live blocker record is invalid");
}

const lines = [
  "# CMMC Continuous Audit and Recovery Handoff",
  "",
  "> GENERATED FROM `CMMC-CONTINUOUS-AUDIT-HANDOFF.json`. DO NOT EDIT THIS EXTRACT MANUALLY.",
  "",
  `- **Legal owner:** ${source.legalOwner}`,
  `- **Updated:** \`${source.updatedAt}\``,
  `- **Repository/branch:** \`${source.repository}\` / \`${source.workingBranch}\``,
  `- **Base commit:** \`${source.workingBaseCommitSha}\``,
  `- **Status:** \`${source.statusClaim}\``,
  "",
  source.statusRule,
  "",
  "## Canonical paired audit record",
  "",
  `- Machine-readable: \`${source.canonicalAuditRecord.machineReadablePath}\``,
  `- Human-readable extract: \`${source.canonicalAuditRecord.humanReadableExtractPath}\``,
  `- Paired digest manifest: \`${source.canonicalAuditRecord.pairedDigestManifestPath}\``,
  `- Schema: \`${source.canonicalAuditRecord.schemaPath}\``,
  `- Controlled source: \`${source.canonicalAuditRecord.controlledSourcePath}\``,
  `- Verification: \`${source.canonicalAuditRecord.verificationCommand}\``,
  "",
  `Coverage is ${source.canonicalAuditRecord.objectiveCoverage.governingRev2Objectives} governing objectives plus ${source.canonicalAuditRecord.objectiveCoverage.supplementalRev3Objectives} supplemental objectives across ${source.canonicalAuditRecord.objectiveCoverage.separatedSystemObjectiveMappings} separated-system mappings. Current technical results are ${source.canonicalAuditRecord.currentTechnicalDisposition.passed} passed, ${source.canonicalAuditRecord.currentTechnicalDisposition.failed} failed, and ${source.canonicalAuditRecord.currentTechnicalDisposition.notTested} not tested. Human pending is not a technical failure; the finding remains \`${source.canonicalAuditRecord.currentTechnicalDisposition.assessmentFinding}\`.`,
  "",
  "## Permanent archive target and high availability",
  "",
  `Physical isolation is required. The Academy project \`${source.archiveTargetDecision.academyProjectRef}\` is rejected as the archive target because its live boundary includes Applications tables; Academy or Applications mutations performed: \`${source.archiveTargetDecision.academyOrApplicationsMutationPerformed}\`. The dedicated project is \`${source.archiveTargetDecision.dedicatedProjectState}\` at the observed quote of $${source.archiveTargetDecision.quotedProjectCost.amountUsd}/${source.archiveTargetDecision.quotedProjectCost.recurrence}.`,
  "",
  `HA is \`${source.highAvailabilityContract.currentState}\` and meets the requirement: \`${source.highAvailabilityContract.meetsHighAvailability}\`. Target RTO is at most ${source.highAvailabilityContract.recoveryObjectives.maximumRtoMinutes} minutes and target RPO is at most ${source.highAvailabilityContract.recoveryObjectives.maximumRpoMinutes} minutes. ${source.highAvailabilityContract.providerFacts.inference}`,
  "",
  "Required HA evidence:",
  "",
  ...source.highAvailabilityContract.requiredEvidence.map((item) => `- ${item}`),
  "",
  "## Public website credential remediation",
  "",
  `The canonical page [${source.websiteCredentialRemediation.canonicalPage}](${source.websiteCredentialRemediation.canonicalPage}) currently serves Vercel deployment \`${source.websiteCredentialRemediation.liveAuthority.deploymentId}\` at commit \`${source.websiteCredentialRemediation.liveAuthority.deployedCommitSha}\`. Live technical result is \`${source.websiteCredentialRemediation.liveAuthority.technicalResult}\`: ${source.websiteCredentialRemediation.liveAuthority.brokenCredentialImageCount} of ${source.websiteCredentialRemediation.liveAuthority.renderedCredentialImageCount} EC-Council images had zero natural dimensions.`,
  "",
  `The release is \`${source.websiteCredentialRemediation.candidateSource.publicationState}\` at exact merged commit \`${source.websiteCredentialRemediation.candidateSource.exactReleaseCommitSha}\` and Vercel deployment \`${source.websiteCredentialRemediation.candidateSource.stagedVercelDeploymentId}\`; it is not canonical or final evidence. It contains ${source.websiteCredentialRemediation.candidateSource.authorizedCredentialCount} authorized local assets, ${source.websiteCredentialRemediation.candidateSource.credentialHolderAuthorizedUploadCount} exact credential-holder uploads, and ${source.websiteCredentialRemediation.candidateSource.liveVerifiedAdgObservationCount} live Active ADG issuer observations.`,
  "",
  `Authoritative candidate technical state is \`${source.websiteCredentialRemediation.candidateSource.authoritativeTechnicalState}\` and therefore is not green. Local results are validation observations only:`,
  "",
  "| Candidate check | Non-authoritative outcome | Result |",
  "| --- | --- | --- |",
  ...source.websiteCredentialRemediation.candidateSource.localCandidateValidations.map((result) => `| \`${escapeCell(result.check)}\` | \`${result.outcome}\` | ${escapeCell(result.result)} |`),
  "",
  `Human review is \`${source.websiteCredentialRemediation.humanReview}\`; pending human review is not a technical failure; the assessment finding is \`${source.websiteCredentialRemediation.assessmentFinding}\`. ${source.websiteCredentialRemediation.claimBoundary}`,
  "",
  "## FDACS student-PII database audit",
  "",
  `- Machine-readable: \`${source.fdacsPiiDatabaseAudit.machineReadablePath}\``,
  `- Human-readable: \`${source.fdacsPiiDatabaseAudit.humanReadablePath}\``,
  `- Paired digest: \`${source.fdacsPiiDatabaseAudit.pairedDigestPath}\``,
  `- Evidence schema: \`${source.fdacsPiiDatabaseAudit.evidenceSchemaPath}\``,
  `- Live receipt: \`${source.fdacsPiiDatabaseAudit.controlledLiveReceiptPath}\``,
  `- Verification: \`${source.fdacsPiiDatabaseAudit.verificationCommand}\``,
  `- Live status: \`${source.fdacsPiiDatabaseAudit.status}\``,
  "",
  `${source.fdacsPiiDatabaseAudit.liveAppliedMigrationCount} migrations are live in the isolated project. Provider results: ${source.fdacsPiiDatabaseAudit.securityAdvisorFindingCount} security findings, ${source.fdacsPiiDatabaseAudit.unindexedForeignKeyFindingCount} unindexed foreign keys, ${source.fdacsPiiDatabaseAudit.browserTablePrivilegeCount} browser table privileges, ${source.fdacsPiiDatabaseAudit.browserFunctionExecutePrivilegeCount} browser execute privileges across ${source.fdacsPiiDatabaseAudit.fdacsFunctionCount} FDACS routines, ${source.fdacsPiiDatabaseAudit.explicitBrowserDenyPolicyCount} explicit deny policies, and ${source.fdacsPiiDatabaseAudit.validChainCount} valid/${source.fdacsPiiDatabaseAudit.failedChainCount} failed chains. Technical checks are ${source.fdacsPiiDatabaseAudit.technicalChecks.passed} passed, ${source.fdacsPiiDatabaseAudit.technicalChecks.failed} failed, and ${source.fdacsPiiDatabaseAudit.technicalChecks.notTested} not tested. Human review is \`${source.fdacsPiiDatabaseAudit.humanReview}\`; finding is \`${source.fdacsPiiDatabaseAudit.assessmentFinding}\`.`,
  "",
  `Preflight export \`${source.fdacsPiiDatabaseAudit.preflightExportId}\` has payload SHA-256 \`${source.fdacsPiiDatabaseAudit.preflightPayloadSha256}\` and remains correctly non-final. ${source.fdacsPiiDatabaseAudit.claimBoundary}`,
  "",
  "## Legal identity source audit",
  "",
  `- Machine-readable: \`${source.legalIdentityAudit.machineReadablePath}\``,
  `- Human-readable: \`${source.legalIdentityAudit.humanReadablePath}\``,
  `- Paired digest: \`${source.legalIdentityAudit.pairedDigestPath}\``,
  `- Machine schema: \`${source.legalIdentityAudit.schemaPath}\``,
  `- Fail-closed gate: \`${source.legalIdentityAudit.gatePath}\``,
  `- Verification: \`${source.legalIdentityAudit.verificationCommand}\``,
  "",
  `Authoritative technical state is \`${source.legalIdentityAudit.authoritativeTechnicalState}\` and candidate validation is \`${source.legalIdentityAudit.candidateValidationOutcome}\` with ${source.legalIdentityAudit.findingCount} findings. Human review is \`${source.legalIdentityAudit.humanReview}\`, pending human review is not a technical failure, the assessment finding is \`${source.legalIdentityAudit.assessmentFinding}\`, and final-evidence eligibility is \`${source.legalIdentityAudit.eligibleAsFinalEvidence}\`. ${source.legalIdentityAudit.claimBoundary}`,
  "",
  "## Scope",
  "",
  `Included: ${source.scope.included.map((item) => `\`${item}\``).join(", ")}.`,
  "",
  `Excluded: **${source.scope.excludedWorkstream}** — ${source.scope.excludedPathPrefixes.map((item) => `\`${item}\``).join(", ")}.`,
  "",
  "## Governing and supplemental authorities",
  "",
  "| Authority ID | Role |",
  "| --- | --- |",
  ...source.authorities.map((item) => `| \`${escapeCell(item.authorityId)}\` | ${escapeCell(item.role)} |`),
  "",
  "## Verified local results",
  "",
  ...source.verifiedLocalResults.map((item) => `- ${item}`),
  "",
  "## Live activation blockers",
  "",
  "| ID | State | Required item |",
  "| --- | --- | --- |",
  ...source.liveActivationBlockers.map((item) => `| \`${item.id}\` | \`${item.state}\` | ${escapeCell(item.item)} |`),
  "",
  "## Continuous audit links",
  "",
  source.continuousAuditLinks.released
    ? `- Machine: ${source.continuousAuditLinks.machineReadable}\n- Human: ${source.continuousAuditLinks.humanReadable}\n- Workflow: ${source.continuousAuditLinks.workflowRuns}`
    : `Not released: ${source.continuousAuditLinks.reason}`,
  "",
  "## Resume order",
  "",
  ...source.resumeOrder.map((item, index) => `${index + 1}. ${item}`),
  "",
  "## Claim boundary",
  "",
  source.claimBoundary,
  "",
];

const expectedHuman = `${lines.join("\n").trimEnd()}\n`;
const expectedDigest = `${hash(sourceRaw)}  CMMC-CONTINUOUS-AUDIT-HANDOFF.json\n${hash(expectedHuman)}  CMMC-CONTINUOUS-AUDIT-HANDOFF.md\n`;

if (mode === "write") {
  fs.writeFileSync(humanPath, expectedHuman, "utf8");
  fs.writeFileSync(digestPath, expectedDigest, "utf8");
} else {
  if (read(humanPath) !== expectedHuman) fail("human-readable extract drifted from machine source");
  if (read(digestPath) !== expectedDigest) fail("paired digest manifest drifted");
}

console.log(`CMMC continuity handoff ${mode === "write" ? "generated" : "verified"}: status ${source.statusClaim}; live links released ${source.continuousAuditLinks.released}.`);
