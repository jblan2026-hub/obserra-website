import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const LEGAL_OWNER = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const bundlePath = path.join(root, "docs/compliance/CMMC-SYSTEM-EVIDENCE.json");
const reportPath = path.join(root, "docs/compliance/CMMC-SYSTEM-EVIDENCE.md");
const digestPath = path.join(root, "docs/compliance/CMMC-SYSTEM-EVIDENCE.sha256");
const driftPath = path.join(root, "docs/compliance/CMMC-AUTHORITY-DRIFT-CHECK.json");
const authorityPath = path.join(root, "docs/compliance/CMMC-AUTHORITY-PROFILE.json");
const dispositionPath = path.join(root, "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.json");
const dispositionHumanPath = path.join(root, "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.md");
const dispositionDigestPath = path.join(root, "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.sha256");
const fdacsAuditPath = path.join(root, "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.json");
const fdacsAuditHumanPath = path.join(root, "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.md");
const fdacsAuditDigestPath = path.join(root, "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.sha256");
const fdacsAuditSchemaPath = path.join(root, "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.schema.json");
const dryRun = process.argv.includes("--dry-run");
const outputIndex = process.argv.indexOf("--output");
const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : null;
const receiptIndex = process.argv.indexOf("--receipt-output");
const receiptOutputPath = receiptIndex >= 0 ? process.argv[receiptIndex + 1] : null;

function fail(message) {
  console.error(`CMMC release-archive gate failed: ${message}`);
  process.exit(1);
}

function read(file, label) {
  if (!fs.existsSync(file)) fail(`${label} is missing: ${path.relative(root, file)}`);
  return fs.readFileSync(file);
}

function json(file, label) {
  try {
    return JSON.parse(read(file, label).toString("utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function sortedUnique(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, "en", { numeric: true }));
}

function requireHash(value, label) {
  if (!/^[0-9a-f]{64}$/.test(value ?? "")) fail(`${label} must be a lowercase SHA-256`);
}

function verifyDigestManifest(raw, files) {
  const entries = new Map();
  for (const line of raw.toString("utf8").split(/\r?\n/).filter(Boolean)) {
    const match = line.match(/^([0-9a-f]{64})  (.+)$/);
    if (!match) fail(`digest manifest contains an invalid line: ${line}`);
    entries.set(match[2], match[1]);
  }
  for (const file of files) {
    const expected = entries.get(path.basename(file.path));
    if (!expected || expected !== file.sha256) fail(`digest manifest does not verify ${file.path}`);
  }
}

const bundleRaw = read(bundlePath, "machine-readable evidence register");
const reportRaw = read(reportPath, "human-readable evidence register");
const digestRaw = read(digestPath, "evidence digest manifest");
const driftRaw = read(driftPath, "authority drift report");
const authorityRaw = read(authorityPath, "authority profile");
const dispositionRaw = read(dispositionPath, "technical/human disposition record");
const dispositionHumanRaw = read(dispositionHumanPath, "technical/human disposition human extract");
const dispositionDigestRaw = read(dispositionDigestPath, "technical/human disposition digest");
const fdacsAuditRaw = read(fdacsAuditPath, "FDACS database machine audit record");
const fdacsAuditHumanRaw = read(fdacsAuditHumanPath, "FDACS database human audit extract");
const fdacsAuditDigestRaw = read(fdacsAuditDigestPath, "FDACS database audit digest");
const fdacsAuditSchemaRaw = read(fdacsAuditSchemaPath, "FDACS database audit schema");
const bundle = json(bundlePath, "machine-readable evidence register");
const drift = json(driftPath, "authority drift report");
const authority = json(authorityPath, "authority profile");
const disposition = json(dispositionPath, "technical/human disposition record");
const fdacsAudit = json(fdacsAuditPath, "FDACS database machine audit record");

if (bundle.schemaVersion !== "2.0" || bundle.bundleState !== "final_release_evidence") fail("only a final_release_evidence schema 2.0 bundle may be archived");
if (bundle.legalOwner !== LEGAL_OWNER || authority.legalOwner !== LEGAL_OWNER) fail(`legal owner must be ${LEGAL_OWNER}`);
if (!/^[0-9a-f]{40}$/.test(bundle.repositoryRevision?.exactReleaseCommitSha ?? "")) fail("bundle must be bound to an exact 40-character release commit");
if (bundle.repositoryRevision.headCommitSha !== bundle.repositoryRevision.exactReleaseCommitSha || bundle.repositoryRevision.revisionBinding !== "exact_release_commit") {
  fail("bundle HEAD and exact release revision binding do not match");
}
if (bundle.repositoryRevision.workingTreeState !== "clean") fail("final release bundle must originate from a clean in-scope tree");
if (bundle.summary?.failClosed !== true || bundle.summary?.unmappedRequiredObjectiveCount !== 0) fail("bundle objective verification is not fail-closed and complete");
if (bundle.summary.governingObjectiveCount !== 320 || bundle.summary.rev3ObjectiveCount !== 510) fail("bundle does not retain the complete governing and supplemental objective catalogs");
if (bundle.auditViews?.machineReadable?.path !== "docs/compliance/CMMC-SYSTEM-EVIDENCE.json" ||
    bundle.auditViews?.humanReadableExtract?.path !== "docs/compliance/CMMC-SYSTEM-EVIDENCE.md" ||
    bundle.auditViews?.pairedDigestManifest?.path !== "docs/compliance/CMMC-SYSTEM-EVIDENCE.sha256" ||
    bundle.auditViews?.pairedDigestManifest?.coversBothViews !== true) {
  fail("bundle does not declare the required paired machine/human audit views");
}
if (bundle.systems.some((system) => system.objectiveMappings.some((mapping) => mapping.finding !== "not_assessed"))) {
  fail("product/organization release evidence cannot create an assessor finding");
}
if (disposition.legalOwner !== LEGAL_OWNER || disposition.sourceBundle?.sha256 !== sha256(bundleRaw) || disposition.summary?.failClosed !== true || disposition.summary?.allHumanPending !== true) {
  fail("technical/human disposition is not fail-closed, fully pending, or bound to the exact machine register");
}
if (disposition.humanReview?.pendingIsTechnicalFailure !== false || disposition.objectiveDispositions?.some((objective) => objective.assessmentFinding !== "not_assessed")) {
  fail("technical/human disposition improperly converts human pending into failure or creates an assessor finding");
}
if (fdacsAudit.legalOwner !== LEGAL_OWNER || fdacsAudit.systemId !== "SYS-FDACS-DATABASE" || fdacsAudit.summary?.liveTechnicalChecksFailed !== 0 || fdacsAudit.summary?.allLiveChainsValid !== true) {
  fail("FDACS database audit identity or live technical summary is invalid");
}
if (fdacsAudit.cmmcSecurityProtocolProof?.centralMachineSha256 !== sha256(bundleRaw) ||
    fdacsAudit.cmmcSecurityProtocolProof?.centralHumanSha256 !== sha256(reportRaw) ||
    fdacsAudit.cmmcSecurityProtocolProof?.separateDispositionSha256 !== sha256(dispositionRaw)) {
  fail("FDACS proof-of-security-protocol record is not bound to the exact CMMC machine, human, and disposition records");
}
if (fdacsAudit.liveAuditPackageTest?.studentPiiIncluded !== false || fdacsAudit.humanReview?.state !== "pending" || fdacsAudit.humanReview?.pendingIsTechnicalFailure !== false || fdacsAudit.humanReview?.assessmentFinding !== "not_assessed") {
  fail("FDACS audit package contains PII or violates the human/technical/assessor claim boundary");
}
if (fdacsAudit.generatedFrom?.evidenceSchema?.sha256 !== sha256(fdacsAuditSchemaRaw)) fail("FDACS audit schema hash binding is invalid");
if (drift.overallStatus !== "passed" || drift.failClosed !== true || drift.silentBaselineUpdatesAllowed !== false) fail("official authority drift result is not current/passing");
if (drift.authorityProfile?.sha256 !== sha256(authorityRaw) || bundle.authorityProfile?.sha256 !== sha256(authorityRaw)) fail("authority profile hash binding is inconsistent");

const files = [
  { path: "docs/compliance/CMMC-SYSTEM-EVIDENCE.json", mediaType: "application/json", bytes: bundleRaw },
  { path: "docs/compliance/CMMC-SYSTEM-EVIDENCE.md", mediaType: "text/markdown", bytes: reportRaw },
  { path: "docs/compliance/CMMC-SYSTEM-EVIDENCE.sha256", mediaType: "text/plain", bytes: digestRaw },
  { path: "docs/compliance/CMMC-AUTHORITY-DRIFT-CHECK.json", mediaType: "application/json", bytes: driftRaw },
  { path: "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.json", mediaType: "application/json", bytes: dispositionRaw },
  { path: "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.md", mediaType: "text/markdown", bytes: dispositionHumanRaw },
  { path: "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.sha256", mediaType: "text/plain", bytes: dispositionDigestRaw },
  { path: "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.json", mediaType: "application/json", bytes: fdacsAuditRaw },
  { path: "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.md", mediaType: "text/markdown", bytes: fdacsAuditHumanRaw },
  { path: "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.sha256", mediaType: "text/plain", bytes: fdacsAuditDigestRaw },
  { path: "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.schema.json", mediaType: "application/schema+json", bytes: fdacsAuditSchemaRaw },
].map((file) => ({ ...file, sha256: sha256(file.bytes) }));
verifyDigestManifest(digestRaw, files.slice(0, 2));
verifyDigestManifest(dispositionDigestRaw, files.slice(4, 6));
verifyDigestManifest(fdacsAuditDigestRaw, [files[7], files[8], files[10]]);

const releaseSha = bundle.repositoryRevision.exactReleaseCommitSha;
const packageEnvelope = {
  schemaVersion: "1.0",
  packageId: `obserra-cmmc-release-evidence-${releaseSha}`,
  packageState: "final",
  legalOwner: LEGAL_OWNER,
  releaseSha,
  generatedAt: bundle.generatedAt,
  authorityProfileId: authority.profileId,
  authorityProfileSha256: sha256(authorityRaw),
  bundleId: bundle.bundleId,
  bundleSha256: sha256(bundleRaw),
  files: files.map((file) => ({
    path: file.path,
    mediaType: file.mediaType,
    sha256: file.sha256,
    encoding: "base64",
    content: file.bytes.toString("base64"),
  })),
  classification: "internal_non_cui",
  containsCui: false,
  containsPersonalData: false,
  containsPaymentData: false,
  containsSecretMaterial: false,
  retentionMode: "indefinite",
  automaticDeletionEnabled: false,
  claimBoundary: "Exact-revision non-CUI engineering and organization evidence package, including the non-PII FDACS database security-protocol audit record. It does not contain student records and does not create an assessor determination, CMMC certification, CUI authorization, FedRAMP authorization, or FDACS approval.",
};
const packageRaw = Buffer.from(`${JSON.stringify(packageEnvelope)}\n`, "utf8");
if (packageRaw.length > 10 * 1024 * 1024) fail(`evidence package is ${packageRaw.length} bytes and exceeds the 10-MiB archive boundary`);
const packageSha256 = sha256(packageRaw);
const baselineAuthorityIds = authority.authorities.map((item) => item.authorityId);
for (const required of [
  "32-cfr-part-170-2026-08-12",
  "dod-cmmc-l2-assessment-guide-v2.13-2024-09",
  "nist-sp-800-171r2-upd1",
  "nist-sp-800-171a-june-2018",
]) if (!baselineAuthorityIds.includes(required)) fail(`authority profile is missing ${required}`);
const controlIds = sortedUnique(bundle.systems.flatMap((system) => system.objectiveMappings.map((mapping) => mapping.controlId)));
const objectiveIds = sortedUnique(bundle.systems.flatMap((system) => system.objectiveMappings.map((mapping) => mapping.objectiveId)));
const systemIds = sortedUnique(bundle.systems.map((system) => system.systemId));
if (controlIds.length !== 207 || objectiveIds.length !== 830 || systemIds.length < 10) fail("archive package does not contain complete separated control, objective, and system mappings");

const allPassed = bundle.summary.technicalFailedObjectiveCount === 0 && bundle.summary.technicalNotTestedObjectiveCount === 0 && bundle.summary.technicalPassedObjectiveCount === bundle.summary.objectiveMappingCount;
const evidenceContract = {
  evidenceContractVersion: "obserra.cmmc.evidence.v2",
  bundleState: "final_release_evidence",
  authorityProfileId: authority.profileId,
  authorityProfileSha256: sha256(authorityRaw),
  evidenceSchemaSha256: bundle.schemaReference.sha256,
  mappingSourceSha256: bundle.sourceDefinition.sha256,
  generatorSha256: bundle.generatorReference.sha256,
  machineReadableArtifactPath: files[0].path,
  machineReadableArtifactSha256: files[0].sha256,
  humanReadableExtractPath: files[1].path,
  humanReadableExtractSha256: files[1].sha256,
  pairedDigestManifestPath: files[2].path,
  pairedDigestManifestSha256: files[2].sha256,
  baselineAuthorityIds,
  systemIds,
  objectiveIds,
  evidenceOrigin: "organization_evidence",
  artifactState: "final",
  artifactOwnerLegalName: LEGAL_OWNER,
  artifactOwnerRole: "Evidence records custodian",
  scopeStatement: `Exact release ${releaseSha}; ${systemIds.length} separated systems; ${controlIds.length} governing and supplemental controls; ${objectiveIds.length} unique objectives; Applications workstream excluded.`,
  claimBoundary: packageEnvelope.claimBoundary,
  targetRevisionSha: releaseSha,
  testMethod: "examine",
  testResult: "passed",
  testResultSha256: sha256(digestRaw),
  technicalResultState: allPassed ? "passed" : "not_tested",
  humanAssessmentState: "pending",
  pendingHumanReviewIsFailure: false,
  operationalDisposition: "scope_dependent",
  findingEligible: allPassed,
  assessmentFinding: "not_assessed",
};
const rpcPayload = {
  p_evidence_ref: `release:${releaseSha}:cmmc-system-evidence-v2`,
  p_control_ids: controlIds,
  p_title: `CMMC exact-revision system evidence ${releaseSha}`,
  p_artifact_name: `obserra-cmmc-release-evidence-${releaseSha}.json`,
  p_content_type: "application/vnd.obserra.cmmc-evidence-package+json",
  p_artifact_base64: packageRaw.toString("base64"),
  p_source_system: "SYS-GITHUB-CI",
  p_source_created_at: bundle.generatedAt,
  p_actor_ref: process.env.OBSERRA_CMMC_ARCHIVE_ACTOR_REF?.trim() || `github-actions:${process.env.GITHUB_REPOSITORY ?? "local"}:${process.env.GITHUB_RUN_ID ?? "dry-run"}`,
  p_evidence_contract: evidenceContract,
  p_release_sha: releaseSha,
  p_evidence_metadata: {
    bundleId: bundle.bundleId,
    bundleSha256: sha256(bundleRaw),
    packageSha256,
    machineReadableArtifactPath: files[0].path,
    machineReadableArtifactSha256: files[0].sha256,
    humanReadableExtractPath: files[1].path,
    humanReadableExtractSha256: files[1].sha256,
    pairedDigestManifestPath: files[2].path,
    pairedDigestManifestSha256: files[2].sha256,
    technicalHumanDispositionSha256: files[4].sha256,
    fdacsDatabaseAuditSha256: files[7].sha256,
    fdacsDatabaseAuditHumanSha256: files[8].sha256,
    fdacsDatabaseAuditSchemaSha256: files[10].sha256,
    authorityDriftReportSha256: sha256(driftRaw),
    systemCount: systemIds.length,
    controlCount: controlIds.length,
    objectiveCount: objectiveIds.length,
    technicalPassedObjectiveCount: bundle.summary.technicalPassedObjectiveCount,
    technicalFailedObjectiveCount: bundle.summary.technicalFailedObjectiveCount,
    technicalNotTestedObjectiveCount: bundle.summary.technicalNotTestedObjectiveCount,
    humanPendingIsFailure: false,
  },
  p_classification: "internal_non_cui",
};

if (outputPath) {
  const full = path.resolve(root, outputPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, packageRaw);
  fs.writeFileSync(`${full}.sha256`, `${packageSha256}  ${path.basename(full)}\n`, "utf8");
}

if (dryRun) {
  console.log(`CMMC release evidence archive dry run passed for ${releaseSha}.`);
  console.log(`Systems/controls/objectives: ${systemIds.length}/${controlIds.length}/${objectiveIds.length}`);
  console.log(`Package bytes/SHA-256: ${packageRaw.length}/${packageSha256}`);
  console.log(`Finding eligible: ${evidenceContract.findingEligible}; human pending is not failure.`);
  process.exit(0);
}

const archiveUrl = (process.env.OBSERRA_CMMC_ARCHIVE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, "");
const serviceRoleKey = (process.env.OBSERRA_CMMC_ARCHIVE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
if (!archiveUrl.startsWith("https://") || !serviceRoleKey) fail("live archive requires OBSERRA_CMMC_ARCHIVE_URL and OBSERRA_CMMC_ARCHIVE_SERVICE_ROLE_KEY (or the controlled Supabase equivalents)");

async function callRpc(name, payload, timeout = 120_000) {
  const response = await fetch(`${archiveUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeout),
  });
  const responseText = await response.text();
  if (!response.ok) fail(`${name} RPC returned HTTP ${response.status}: ${responseText.slice(0, 1000)}`);
  try {
    return JSON.parse(responseText);
  } catch {
    fail(`${name} RPC returned non-JSON data`);
  }
}

const archived = await callRpc("cmmc_archive_evidence_v2", rpcPayload);
if (archived.artifactSha256 !== packageSha256 || archived.retentionMode !== "indefinite" || archived.legalHoldActive !== true || !/^[0-9a-f]{64}$/.test(archived.chainSha256 ?? "")) {
  fail("archive RPC response failed digest, retention, legal-hold, or chain verification");
}

const auditActor = process.env.OBSERRA_CMMC_ARCHIVE_ACTOR_REF?.trim() || `github-actions:${process.env.GITHUB_REPOSITORY ?? "local"}:${process.env.GITHUB_RUN_ID ?? "live"}`;
const catalog = await callRpc("cmmc_list_evidence_v2", {
  p_actor_ref: auditActor,
  p_access_purpose: `Verify release archive receipt for ${releaseSha}`,
  p_limit: 1,
  p_offset: 0,
});
if (!Array.isArray(catalog) || catalog.length !== 1 || catalog[0].archive_id !== archived.archiveId || catalog[0].artifact_sha256 !== packageSha256 || catalog[0].target_revision_sha !== releaseSha) {
  fail("archived evidence was not immediately readable through the controlled auditor catalog");
}
const archiveChain = await callRpc("cmmc_verify_evidence_archive_chain", {});
const eventChain = await callRpc("cmmc_verify_evidence_event_chain", {});
const archiveHealth = await callRpc("cmmc_evidence_archive_health", {});
if (archiveChain?.verified !== true || !/^[0-9a-f]{64}$/.test(archiveChain.chainHeadSha256 ?? "")) fail("live evidence artifact-chain verification failed");
if (eventChain?.verified !== true || !/^[0-9a-f]{64}$/.test(eventChain.eventChainHeadSha256 ?? "")) fail("live evidence access-event-chain verification failed");
if (archiveHealth?.operational !== true || archiveHealth.retentionMode !== "indefinite" || archiveHealth.legalHoldEnforced !== true || archiveHealth.automaticDeletionEnabled !== false) {
  fail("live evidence archive health or indefinite-retention enforcement failed");
}

if (receiptOutputPath) {
  const receipt = {
    schemaVersion: "obserra.cmmc.archive-receipt.v2",
    receiptState: "verified_live_archive_receipt",
    legalOwner: LEGAL_OWNER,
    releaseSha,
    evidenceRef: rpcPayload.p_evidence_ref,
    archiveId: archived.archiveId,
    archivedAt: archived.archivedAt,
    idempotentReplay: archived.idempotentReplay === true,
    package: {
      path: outputPath ?? null,
      sha256: packageSha256,
      bytes: packageRaw.length,
      machineReadableArtifactPath: files[0].path,
      machineReadableArtifactSha256: files[0].sha256,
      humanReadableExtractPath: files[1].path,
      humanReadableExtractSha256: files[1].sha256,
      pairedDigestManifestPath: files[2].path,
      pairedDigestManifestSha256: files[2].sha256,
      technicalHumanDispositionSha256: files[4].sha256,
      fdacsDatabaseAuditSha256: files[7].sha256,
      fdacsDatabaseAuditHumanSha256: files[8].sha256,
      fdacsDatabaseAuditSchemaSha256: files[10].sha256,
    },
    archive: {
      artifactSha256: archived.artifactSha256,
      chainSha256: archived.chainSha256,
      retentionMode: archived.retentionMode,
      legalHoldActive: archived.legalHoldActive,
      findingEligible: archived.findingEligible,
    },
    controlledCatalogRead: {
      verified: true,
      sequenceId: catalog[0].sequence_id,
      evidenceOrigin: catalog[0].evidence_origin,
      technicalResultState: catalog[0].technical_result_state,
      humanAssessmentState: catalog[0].human_assessment_state,
      pendingHumanReviewIsFailure: catalog[0].pending_human_review_is_failure,
      assessmentFinding: catalog[0].assessment_finding,
    },
    artifactChain: archiveChain,
    accessEventChain: eventChain,
    archiveHealth,
    claimBoundary: packageEnvelope.claimBoundary,
  };
  const full = path.resolve(root, receiptOutputPath);
  const markdownPath = full.endsWith(".json") ? full.replace(/\.json$/, ".md") : `${full}.md`;
  const manifestPath = full.endsWith(".json") ? full.replace(/\.json$/, ".sha256") : `${full}.sha256`;
  const receiptRaw = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  const receiptSha256 = sha256(receiptRaw);
  const markdown = [
    "# Verified CMMC Evidence Archive Receipt",
    "",
    "> GENERATED FROM THE MACHINE-READABLE RECEIPT. DO NOT EDIT MANUALLY.",
    "",
    `- **Legal owner:** ${LEGAL_OWNER}`,
    `- **Release SHA:** \`${releaseSha}\``,
    `- **Archive ID:** \`${archived.archiveId}\``,
    `- **Archived at:** \`${archived.archivedAt}\``,
    `- **Package SHA-256:** \`${packageSha256}\``,
    `- **Machine-readable evidence SHA-256:** \`${files[0].sha256}\``,
    `- **Human-readable extract SHA-256:** \`${files[1].sha256}\``,
    `- **Technical/human disposition SHA-256:** \`${files[4].sha256}\``,
    `- **FDACS database audit SHA-256:** \`${files[7].sha256}\``,
    `- **FDACS database audit schema SHA-256:** \`${files[10].sha256}\``,
    `- **Archive chain verified:** \`${archiveChain.verified}\``,
    `- **Access-event chain verified:** \`${eventChain.verified}\``,
    `- **Retention:** \`${archiveHealth.retentionMode}\`; legal hold \`${archiveHealth.legalHoldEnforced}\`; automatic deletion \`${archiveHealth.automaticDeletionEnabled}\``,
    `- **Technical result:** \`${catalog[0].technical_result_state}\``,
    `- **Human assessment:** \`${catalog[0].human_assessment_state}\` (pending is failure: \`${catalog[0].pending_human_review_is_failure}\`)`,
    `- **Assessment finding:** \`${catalog[0].assessment_finding}\``,
    "",
    `**Claim boundary:** ${packageEnvelope.claimBoundary}`,
    "",
    `**Machine receipt SHA-256:** \`${receiptSha256}\``,
    "",
  ].join("\n");
  const markdownRaw = Buffer.from(markdown, "utf8");
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, receiptRaw);
  fs.writeFileSync(markdownPath, markdownRaw);
  fs.writeFileSync(
    manifestPath,
    `${receiptSha256}  ${path.basename(full)}\n${sha256(markdownRaw)}  ${path.basename(markdownPath)}\n`,
    "utf8",
  );
}

console.log(`CMMC release evidence archived for ${releaseSha}.`);
console.log(`Archive ID: ${archived.archiveId}; artifact SHA-256: ${archived.artifactSha256}; chain SHA-256: ${archived.chainSha256}.`);
console.log(`Retention: indefinite; legal hold: active; idempotent replay: ${archived.idempotentReplay === true}; artifact/event chains: verified/verified.`);
