import crypto from "node:crypto";
import fs from "node:fs";

const sourcePath = "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT-SOURCE.json";
const outputPath = "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.json";
const humanPath = "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.md";
const digestPath = "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.sha256";
const schemaPath = "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT.schema.json";
const generatorPath = "scripts/fdacs-pii-database-audit-record.mjs";
const gatePath = "scripts/fdacs-pii-database-audit-gate.mjs";
const cmmcMachinePath = "docs/compliance/CMMC-SYSTEM-EVIDENCE.json";
const cmmcHumanPath = "docs/compliance/CMMC-SYSTEM-EVIDENCE.md";
const cmmcDispositionPath = "docs/compliance/CMMC-TECHNICAL-HUMAN-DISPOSITION.json";
const mode = process.argv.includes("--write") ? "write" : "check";

function fail(message) {
  throw new Error(`FDACS PII database audit record failed: ${message}`);
}

function read(path) {
  if (!fs.existsSync(path)) fail(`missing ${path}`);
  return fs.readFileSync(path, "utf8");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function validateAgainstSchema(value, schema, location = "$") {
  if (Object.hasOwn(schema, "const") && JSON.stringify(value) !== JSON.stringify(schema.const)) fail(`${location} does not match its schema const`);
  if (schema.enum && !schema.enum.some((candidate) => JSON.stringify(candidate) === JSON.stringify(value))) fail(`${location} is outside its schema enum`);
  if (schema.type === "object" && (value === null || Array.isArray(value) || typeof value !== "object")) fail(`${location} must be an object`);
  if (schema.type === "array" && !Array.isArray(value)) fail(`${location} must be an array`);
  if (schema.type === "string" && typeof value !== "string") fail(`${location} must be a string`);
  if (schema.type === "integer" && !Number.isInteger(value)) fail(`${location} must be an integer`);
  if (schema.type === "number" && typeof value !== "number") fail(`${location} must be a number`);
  if (schema.type === "boolean" && typeof value !== "boolean") fail(`${location} must be a boolean`);
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) fail(`${location} is shorter than minLength`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(`${location} does not match ${schema.pattern}`);
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) fail(`${location} is below its minimum`);
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(`${location} has fewer than minItems`);
    if (schema.items) value.forEach((item, index) => validateAgainstSchema(item, schema.items, `${location}[${index}]`));
  }
  if (value !== null && !Array.isArray(value) && typeof value === "object") {
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) fail(`${location}.${required} is required by the evidence schema`);
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) validateAgainstSchema(value[key], childSchema, `${location}.${key}`);
    }
  }
}

const sourceRaw = read(sourcePath);
const schemaRaw = read(schemaPath);
const generatorRaw = read(generatorPath);
const gateRaw = read(gatePath);
const cmmcMachineRaw = read(cmmcMachinePath);
const cmmcHumanRaw = read(cmmcHumanPath);
const cmmcDispositionRaw = read(cmmcDispositionPath);
let source;
let evidenceSchema;
let cmmcMachine;
let cmmcDisposition;
try {
  source = JSON.parse(sourceRaw);
  evidenceSchema = JSON.parse(schemaRaw);
  cmmcMachine = JSON.parse(cmmcMachineRaw);
  cmmcDisposition = JSON.parse(cmmcDispositionRaw);
} catch (error) {
  fail(`invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

if (source.legalOwner !== "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC") fail("legal owner mismatch");
if (source.providerProjectRef !== "ggkxgjhsbgbifiqrhavr" || source.systemId !== "SYS-FDACS-DATABASE") fail("isolated project or system identity mismatch");
if (source.scopeBoundary.nonFdacsTableCount !== 2 || source.liveVerification.nonFdacsTableCount !== 2) fail("governed non-FDACS table count mismatch");
if (source.scopeBoundary.governedCmmcEvidenceTableCount !== 2 || source.liveVerification.governedCmmcEvidenceTableCount !== 2) fail("governed CMMC archive table count mismatch");
if (source.scopeBoundary.unauthorizedNonFdacsTableCount !== 0 || source.liveVerification.unauthorizedNonFdacsTableCount !== 0) fail("unauthorized non-FDACS tables are present in the isolated boundary");
if (source.liveVerification.anonOrAuthenticatedTablePrivilegeCount !== 0 || source.liveVerification.fdacsTablesWithoutForcedRls !== 0) fail("browser privileges or non-forced RLS detected");
if (source.liveVerification.anonOrAuthenticatedFunctionExecutePrivilegeCount !== 0) fail("browser execute privilege detected on an FDACS routine");
if (source.liveVerification.anonCreatePrivilegeOnPublicSchema !== false || source.liveVerification.authenticatedCreatePrivilegeOnPublicSchema !== false) fail("browser role can create an object in the fixed security-definer search path");
if (source.liveVerification.securityAdvisorErrorOrWarningCount !== 0 || source.liveVerification.unindexedForeignKeyFindingCount !== 0) fail("unresolved provider security severity or foreign-key indexing finding");
if (source.liveVerification.securityAdvisorFindingCount !== 2) fail("expected two INFO-only RPC archive policy notices");
const cmmcArchive = source.liveVerification.cmmcEvidenceArchive;
if (cmmcArchive?.retentionMode !== "indefinite" || cmmcArchive?.legalHoldEnforced !== true || cmmcArchive?.automaticDeletionEnabled !== false || cmmcArchive?.cuiAccepted !== false) fail("CMMC archive retention or CUI boundary mismatch");
if (cmmcArchive?.archiveChainVerified !== true || cmmcArchive?.eventChainVerified !== true || cmmcArchive?.humanPendingRecordCount !== 1 || cmmcArchive?.findingEligibleRecordCount !== 0) fail("CMMC archive chain or human/finding boundary mismatch");
if (source.retention.minimumYears !== 2 || source.retention.automaticDeletionEnabled !== false) fail("retention contract mismatch");
if (source.liveVerification.chainVerification.some((chain) => chain.valid !== true || chain.failureCount !== 0)) fail("live chain verification failed");
if (source.liveAuditPackageTest.payloadSha256 !== source.liveAuditPackageTest.payloadDigestRecomputed) fail("live export payload digest mismatch");
if (source.liveAuditPackageTest.eligibleAsFinalFdacsRecordEvidence !== false || source.liveAuditPackageTest.artifactState !== "generated_unarchived") fail("unfinalized live export was mislabeled as final evidence");
if (!source.liveAuditPackageTest.negativeTests?.unauthorizedActorRejected || !source.liveAuditPackageTest.negativeTests?.finalizationWithoutMatchingProtectedArtifactRejected || !source.liveAuditPackageTest.negativeTests?.deliveryBeforeFinalizationRejected) fail("one or more fail-closed investigator-export tests did not pass");
if (source.liveAuditPackageTest.negativeTests.finalizedEventCountAfterTests !== 0 || source.liveAuditPackageTest.negativeTests.deliveredEventCountAfterTests !== 0) fail("negative tests created an invalid finalization or delivery event");
if (source.humanReview.state !== "pending" || source.humanReview.pendingIsTechnicalFailure !== false || source.humanReview.assessmentFinding !== "not_assessed") fail("human/technical separation mismatch");
if (source.activationState.productionRuntimeAuthorized !== false) fail("source unexpectedly claims production authorization");
if (source.ownerUatControlVerification?.productionRuntimeAuthorized !== false || source.ownerUatControlVerification?.trainingCreditEligible !== false) fail("owner UAT must remain non-credit with production authorization false");
if (source.ownerUatControlVerification?.deploymentEnvironment !== "preview" || source.ownerUatControlVerification?.maximumValidityDays !== 14 || source.ownerUatControlVerification?.capacity !== 1) fail("owner UAT preview, expiry, or capacity boundary mismatch");
if (source.ownerUatControlVerification?.instructionSafetyMigrationApplied !== true || source.ownerUatControlVerification?.verifiedActiveAssignedDiRequired !== true || source.ownerUatControlVerification?.liveScheduleFunctionRestrictedToServiceRole !== true || source.ownerUatControlVerification?.noSchoolLicenseClaimForOwnerUat !== true) fail("owner UAT instruction-safety boundary mismatch");
if (!source.ownerUatControlVerification?.transactionalNegativeTests?.wrongReleaseScheduleRejected || !source.ownerUatControlVerification?.transactionalNegativeTests?.missingVerifiedDiScheduleRejected) fail("owner UAT scheduling negative tests did not pass");
if (source.ownerUatControlVerification?.liveCohortRowsCreated !== 0 || source.ownerUatControlVerification?.liveEnrollmentRowsCreated !== 0 || source.ownerUatControlVerification?.liveSessionRowsCreated !== 0) fail("owner UAT control tests left live records behind");

const cmmcSystem = cmmcMachine.systems.find((system) => system.systemId === source.systemId);
if (!cmmcSystem) fail("central CMMC machine record does not contain SYS-FDACS-DATABASE");
const disposition = cmmcDisposition.systemDispositions.find((system) => system.systemId === source.systemId);
if (!disposition || disposition.humanDisposition !== "pending") fail("central disposition record does not preserve pending human review for SYS-FDACS-DATABASE");

const migrationEvidence = source.sourceMigrations.map((migration) => {
  const bytes = read(migration.path);
  if (migration.liveApplied !== true) fail(`${migration.path} is not marked live-applied`);
  return { ...migration, sha256: sha256(bytes) };
});

const record = {
  ...source,
  generatedFrom: {
    source: { path: sourcePath, sha256: sha256(sourceRaw) },
    evidenceSchema: { path: schemaPath, sha256: sha256(schemaRaw) },
    generator: { path: generatorPath, sha256: sha256(generatorRaw) },
    sourceGate: { path: gatePath, sha256: sha256(gateRaw) },
  },
  sourceMigrations: migrationEvidence,
  cmmcSecurityProtocolProof: {
    ...source.cmmcSecurityProtocolProof,
    centralMachineSha256: sha256(cmmcMachineRaw),
    centralHumanSha256: sha256(cmmcHumanRaw),
    separateDispositionSha256: sha256(cmmcDispositionRaw),
    mappedObjectiveCount: cmmcSystem.objectiveMappings.length,
    centralTechnicalDisposition: disposition.technicalDisposition,
    centralHumanDisposition: disposition.humanDisposition,
  },
  summary: {
    liveMigrationsApplied: migrationEvidence.length,
    liveTechnicalChecksPassed: source.technicalChecks.filter((check) => check.state === "passed").length,
    liveTechnicalChecksFailed: source.technicalChecks.filter((check) => check.state === "failed").length,
    liveTechnicalChecksNotTested: source.technicalChecks.filter((check) => check.state === "not_tested").length,
    allLiveChainsValid: source.liveVerification.chainVerification.every((chain) => chain.valid && chain.failureCount === 0),
    productionRuntimeAuthorized: source.activationState.productionRuntimeAuthorized,
    humanReview: source.humanReview.state,
    assessmentFinding: source.humanReview.assessmentFinding,
  },
};

validateAgainstSchema(record, evidenceSchema);

const lines = [
  "# FDACS Student-PII Database Audit Record",
  "",
  "> GENERATED FROM THE MACHINE-READABLE SOURCE AND LIVE-VERIFICATION RECEIPT. DO NOT EDIT MANUALLY.",
  "",
  `- **Legal owner:** ${record.legalOwner}`,
  `- **System:** \`${record.systemId}\` — ${record.systemName}`,
  `- **Live project:** \`${record.providerProjectName}\` (\`${record.providerProjectRef}\`, \`${record.region}\`)`,
  `- **Observed:** \`${record.observedAt}\``,
  `- **State:** \`${record.recordState}\``,
  `- **Production runtime authorized:** \`${record.activationState.productionRuntimeAuthorized}\``,
  `- **Evidence schema:** \`${schemaPath}\` (SHA-256 \`${record.generatedFrom.evidenceSchema.sha256}\`)`,
  "",
  "## Live result",
  "",
  `${record.sourceMigrations.length} forward FDACS migrations are live. The isolated project contains ${record.liveVerification.fdacsTableCount} FDACS tables, ${record.liveVerification.governedCmmcEvidenceTableCount} governed CMMC evidence tables, ${record.liveVerification.unauthorizedNonFdacsTableCount} unauthorized non-FDACS tables, ${record.liveVerification.explicitBrowserDenyPolicyCount} explicit restrictive browser-deny policies, ${record.liveVerification.anonOrAuthenticatedTablePrivilegeCount} browser table privileges, ${record.liveVerification.anonOrAuthenticatedFunctionExecutePrivilegeCount} browser execute privileges across ${record.liveVerification.fdacsFunctionCount} FDACS routines, and ${record.liveVerification.fdacsTablesWithoutForcedRls} FDACS tables without forced RLS.`,
  "",
  `Supabase security advisor findings: ${record.liveVerification.securityAdvisorFindingCount}, both INFO-only notices for deliberate forced-RLS, no-policy, RPC-only CMMC archive tables. Error or warning findings: ${record.liveVerification.securityAdvisorErrorOrWarningCount}. Unindexed foreign-key findings: ${record.liveVerification.unindexedForeignKeyFindingCount}. Remaining performance observations are informational: ${record.liveVerification.unusedIndexInfoCount} unused-index notices on the empty/pre-production workload and ${record.liveVerification.authConnectionAllocationInfoCount} Auth allocation notice.`,
  "",
  "## Exact-release owner UAT boundary",
  "",
  `Provider migrations \`${record.ownerUatControlVerification.providerMigrationVersion}\` and \`${record.ownerUatControlVerification.instructionSafetyProviderMigrationVersion}\` establish a capacity-${record.ownerUatControlVerification.capacity}, Preview-only, non-credit \`${record.ownerUatControlVerification.executionProfile}\` profile. It is bound to an exact release and authorization-evidence digest, expires within ${record.ownerUatControlVerification.maximumValidityDays} days, requires live hosted identity plus a distinct assigned verified-active Class DI instructor, records no Class DS school-license claim for UAT, and cannot coexist with database production authorization.`,
  "",
  `Transactional live negative tests passed and were rolled back: expiry beyond 14 days rejected \`${record.ownerUatControlVerification.transactionalNegativeTests.expirationBeyond14DaysRejected}\`; production authorization with unverified gates rejected \`${record.ownerUatControlVerification.transactionalNegativeTests.productionAuthorizationWithUnverifiedGatesRejected}\`; wrong-release schedule rejected \`${record.ownerUatControlVerification.transactionalNegativeTests.wrongReleaseScheduleRejected}\`; schedule without a verified-active assigned DI rejected \`${record.ownerUatControlVerification.transactionalNegativeTests.missingVerifiedDiScheduleRejected}\`; valid UAT cohort created then rolled back \`${record.ownerUatControlVerification.transactionalNegativeTests.validCohortCreatedAndRolledBack}\`. Live cohort, enrollment, and session counts remain ${record.ownerUatControlVerification.liveCohortRowsCreated}, ${record.ownerUatControlVerification.liveEnrollmentRowsCreated}, and ${record.ownerUatControlVerification.liveSessionRowsCreated}.`,
  "",
  "## Governing FDACS requirements",
  "",
  "| Source | Exact version | Controlled requirements |",
  "| --- | --- | --- |",
  ...record.governingSources.map((source) => `| [${escapeCell(source.authorityId)}](${source.officialUrl}) | ${escapeCell(source.exactVersion)} | ${source.requirements.map(escapeCell).join("<br>")} |`),
  "",
  "## Technical and human disposition",
  "",
  "| Check | Technical state | Result |",
  "| --- | --- | --- |",
  ...record.technicalChecks.map((check) => `| \`${escapeCell(check.checkId)}\` | \`${check.state}\` | ${escapeCell(check.result)} |`),
  "",
  `Human review is \`${record.humanReview.state}\`. Pending human review is not a technical failure. Assessment finding remains \`${record.humanReview.assessmentFinding}\`.`,
  "",
  "## Investigator audit trail",
  "",
  `A real non-PII preflight export was generated as \`${record.liveAuditPackageTest.exportId}\`. Payload SHA-256 \`${record.liveAuditPackageTest.payloadSha256}\` matched the independently recomputed digest. Event SHA-256: \`${record.liveAuditPackageTest.exportEventSha256}\`.`,
  "",
  `The export is correctly \`${record.liveAuditPackageTest.artifactState}\` and **not final evidence**. Finality requires exact-payload application-envelope encryption, protected archival, digest matching, and a finalization event.`,
  "",
  `Fail-closed negative tests passed: unauthorized actor rejected \`${record.liveAuditPackageTest.negativeTests.unauthorizedActorRejected}\`; finalization without a matching protected artifact rejected \`${record.liveAuditPackageTest.negativeTests.finalizationWithoutMatchingProtectedArtifactRejected}\`; delivery before finalization rejected \`${record.liveAuditPackageTest.negativeTests.deliveryBeforeFinalizationRejected}\`. Finalized and delivered event counts remained ${record.liveAuditPackageTest.negativeTests.finalizedEventCountAfterTests} and ${record.liveAuditPackageTest.negativeTests.deliveredEventCountAfterTests}.`,
  "",
  "| Chain | Records | Failures | Valid | Head SHA-256 |",
  "| --- | ---: | ---: | --- | --- |",
  ...record.liveVerification.chainVerification.map((chain) => `| \`${chain.chain}\` | ${chain.recordCount} | ${chain.failureCount} | \`${chain.valid}\` | \`${chain.headSha256 ?? "GENESIS"}\` |`),
  "",
  "## CMMC security-protocol proof",
  "",
  `FDACS proof of security protocols is bound to \`${record.cmmcSecurityProtocolProof.systemId}\`. Its objective-level mapping contains ${record.cmmcSecurityProtocolProof.mappedObjectiveCount} system-objective rows. Current technical disposition is \`${record.cmmcSecurityProtocolProof.centralTechnicalDisposition}\`; human disposition is \`${record.cmmcSecurityProtocolProof.centralHumanDisposition}\`.`,
  "",
  "Only an exact-release, hashed protected `security_protocol_evidence` package can be registered live. This database never creates an assessor finding or CMMC certification claim.",
  "",
  "## Open blockers",
  "",
  ...record.openBlockers.map((blocker) => `- ${blocker}`),
  "",
  "## Claim boundary",
  "",
  record.claimBoundary,
  "",
  `Machine-readable record: \`${outputPath}\`. Paired digest: \`${digestPath}\`.`,
  "",
];

const expectedJson = `${JSON.stringify(record, null, 2)}\n`;
const expectedHuman = `${lines.join("\n").trimEnd()}\n`;
const expectedDigest = [
  `${sha256(expectedJson)}  FDACS-PII-DATABASE-AUDIT.json`,
  `${sha256(expectedHuman)}  FDACS-PII-DATABASE-AUDIT.md`,
  `${sha256(sourceRaw)}  FDACS-PII-DATABASE-AUDIT-SOURCE.json`,
  `${sha256(schemaRaw)}  FDACS-PII-DATABASE-AUDIT.schema.json`,
  `${sha256(generatorRaw)}  fdacs-pii-database-audit-record.mjs`,
  `${sha256(gateRaw)}  fdacs-pii-database-audit-gate.mjs`,
  `${sha256(cmmcMachineRaw)}  CMMC-SYSTEM-EVIDENCE.json`,
  `${sha256(cmmcHumanRaw)}  CMMC-SYSTEM-EVIDENCE.md`,
  `${sha256(cmmcDispositionRaw)}  CMMC-TECHNICAL-HUMAN-DISPOSITION.json`,
  ...migrationEvidence.map((migration) => `${migration.sha256}  ${migration.path.split("/").at(-1)}`),
  "",
].join("\n");

if (mode === "write") {
  fs.writeFileSync(outputPath, expectedJson, "utf8");
  fs.writeFileSync(humanPath, expectedHuman, "utf8");
  fs.writeFileSync(digestPath, expectedDigest, "utf8");
} else {
  if (read(outputPath) !== expectedJson) fail("machine-readable audit record drifted");
  if (read(humanPath) !== expectedHuman) fail("human-readable audit extract drifted");
  if (read(digestPath) !== expectedDigest) fail("audit digest manifest drifted");
}

console.log(`FDACS PII database audit record ${mode === "write" ? "generated" : "verified"}: ${record.summary.liveTechnicalChecksPassed} passed, ${record.summary.liveTechnicalChecksFailed} failed, ${record.summary.liveTechnicalChecksNotTested} not tested; production authorization ${record.summary.productionRuntimeAuthorized}.`);
