import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const relative = (value) => path.relative(root, value).replaceAll(path.sep, "/");
const resolve = (value) => path.resolve(root, value);

const sourcePath = resolve("docs/compliance/CMMC-SYSTEM-SCOPE-SOURCE.json");
const outputPath = resolve("docs/compliance/CMMC-SYSTEM-EVIDENCE.json");
const reportPath = resolve("docs/compliance/CMMC-SYSTEM-EVIDENCE.md");
const digestPath = resolve("docs/compliance/CMMC-SYSTEM-EVIDENCE.sha256");
const generatorPath = resolve("scripts/cmmc-system-evidence.mjs");

const modes = process.argv.filter((value) => value === "--write" || value === "--check");
if (modes.length !== 1) fail("use exactly one of --write or --check");
const mode = modes[0].slice(2);
const releaseSha = argumentValue("--release");
const objectiveResultsPath = argumentValue("--objective-results");

const LEGAL_OWNER = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const PERMITTED_ORIGINS = [
  "product_supplied_evidence",
  "organization_evidence",
  "assessor_determination",
  "customer_responsibility",
];
const PERMITTED_METHODS = ["examine", "interview", "test"];
const PERMITTED_EVIDENCE_STATES = [
  "candidate_product_evidence",
  "candidate_organization_evidence",
  "organization_evidence_required",
  "customer_evidence_required",
  "assessor_determination_required",
  "scope_dependent",
];
const PERMITTED_RESPONSIBILITY_OWNERS = ["product_provider", "obserra_organization", "customer", "assessor"];
const PERMITTED_OPERATIONAL_DISPOSITIONS = [
  "operational_technical_controls_active",
  "operational_with_pending_human_review",
  "fail_closed_pending_mandatory_prerequisite",
  "not_operational",
  "scope_dependent",
];

function fail(message) {
  console.error(`CMMC system-evidence gate failed: ${message}`);
  process.exit(1);
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${name} requires a value`);
  return value;
}

function read(file, label = relative(file)) {
  if (!fs.existsSync(file)) fail(`required ${label} is missing at ${relative(file)}`);
  return fs.readFileSync(file);
}

function readText(file, label) {
  return read(file, label).toString("utf8");
}

function json(file, label) {
  try {
    return JSON.parse(readText(file, label));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function git(args, options = {}) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: options.encoding ?? "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 128 * 1024 * 1024,
    });
  } catch (error) {
    const detail = error?.stderr?.toString?.().trim() || error?.message || String(error);
    fail(`git ${args.join(" ")} failed: ${detail}`);
  }
}

function unique(values) {
  return new Set(values).size === values.length;
}

function nonEmptyString(value, label) {
  if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`);
  return value;
}

function normalizeRepositoryPath(value, label) {
  nonEmptyString(value, label);
  const normalized = value.replaceAll("\\", "/").replace(/^\.\//, "");
  if (path.isAbsolute(normalized) || normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) {
    fail(`${label} must remain inside the repository: ${value}`);
  }
  return normalized;
}

function startsWithAny(value, prefixes) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

function buildScopePolicy(source) {
  const scope = source.scope ?? {};
  const includedPathPrefixes = (scope.includedPathPrefixes ?? []).map((value, index) =>
    normalizeRepositoryPath(value, `scope.includedPathPrefixes[${index}]`),
  );
  const includedRootFiles = (scope.includedRootFiles ?? []).map((value, index) =>
    normalizeRepositoryPath(value, `scope.includedRootFiles[${index}]`),
  );
  const excludedPathPrefixes = (scope.excludedPathPrefixes ?? []).map((value, index) =>
    normalizeRepositoryPath(value, `scope.excludedPathPrefixes[${index}]`),
  );
  const excludedExactPaths = (scope.excludedExactPaths ?? []).map((value, index) =>
    normalizeRepositoryPath(value, `scope.excludedExactPaths[${index}]`),
  );
  const generatedOutputPaths = (source.generatedOutputPaths ?? []).map((value, index) =>
    normalizeRepositoryPath(value, `generatedOutputPaths[${index}]`),
  );
  if (!includedPathPrefixes.length || !includedRootFiles.length || !excludedPathPrefixes.length || !generatedOutputPaths.length) {
    fail("scope include/exclude policy and generatedOutputPaths must be explicit and non-empty");
  }
  for (const required of ["app/apps/", "app/api/apps/", "app/portal/applications/", "lib/apps/"]) {
    if (!excludedPathPrefixes.includes(required)) fail(`Applications exclusion must include ${required}`);
  }
  return {
    includedPathPrefixes,
    includedRootFiles,
    excludedPathPrefixes,
    excludedExactPaths,
    generatedOutputPaths,
    isAllowedArtifact(value) {
      const file = value.replaceAll("\\", "/").replace(/^\.\//, "");
      if (excludedExactPaths.includes(file) || startsWithAny(file, excludedPathPrefixes)) return false;
      return includedRootFiles.includes(file) || startsWithAny(file, includedPathPrefixes);
    },
    isInScope(value) {
      const file = value.replaceAll("\\", "/").replace(/^\.\//, "");
      if (generatedOutputPaths.includes(file)) return false;
      if (excludedExactPaths.includes(file) || startsWithAny(file, excludedPathPrefixes)) return false;
      return includedRootFiles.includes(file) || startsWithAny(file, includedPathPrefixes);
    },
  };
}

function collectInScopeTree(scopePolicy) {
  const listed = git(["ls-files", "-co", "--exclude-standard", "-z"], { encoding: "buffer" });
  const deleted = git(["ls-files", "-d", "-z"], { encoding: "buffer" });
  const paths = new Set(
    Buffer.concat([listed, deleted])
      .toString("utf8")
      .split("\0")
      .filter(Boolean)
      .filter((value) => scopePolicy.isInScope(value)),
  );
  const entries = [];
  for (const file of [...paths].sort()) {
    const full = resolve(file);
    if (!fs.existsSync(full)) {
      entries.push({ path: file, kind: "deleted", size: 0, sha256: sha256("DELETED") });
      continue;
    }
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) continue;
    const payload = stat.isSymbolicLink() ? Buffer.from(fs.readlinkSync(full), "utf8") : fs.readFileSync(full);
    entries.push({
      path: file,
      kind: stat.isSymbolicLink() ? "symlink" : "file",
      size: payload.length,
      sha256: sha256(payload),
    });
  }
  if (!entries.length) fail("in-scope repository tree is empty");
  const manifest = entries.map((entry) => `${entry.path}\0${entry.kind}\0${entry.size}\0${entry.sha256}\n`).join("");
  return { entries, sha256: sha256(manifest) };
}

function scopedWorkingTreeDirty(scopePolicy) {
  const status = git(["status", "--porcelain=v1", "-z", "--untracked-files=all"], { encoding: "buffer" })
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
  for (let index = 0; index < status.length; index += 1) {
    const record = status[index];
    if (record.length < 4) continue;
    const code = record.slice(0, 2);
    const file = record.slice(3);
    if (scopePolicy.isInScope(file)) return true;
    if (code.includes("R") || code.includes("C")) {
      const previous = status[index + 1];
      if (previous && scopePolicy.isInScope(previous)) return true;
      index += 1;
    }
  }
  return false;
}

function validateAuthority(source, authority, rev2, rev3) {
  if (source.schemaVersion !== "2.0" || source.sourceState !== "final") fail("scope source must be schema 2.0 and final");
  if (source.legalOwner !== LEGAL_OWNER) fail(`scope source legalOwner must be ${LEGAL_OWNER}`);
  if (authority.schemaVersion !== "2.0" || authority.profileStatus !== "final") fail("authority profile must be schema 2.0 and final");
  if (authority.legalOwner !== LEGAL_OWNER) fail(`authority profile legalOwner must be ${LEGAL_OWNER}`);
  const requiredAuthorities = [
    "32-cfr-part-170-2026-08-12",
    "dod-cmmc-l2-assessment-guide-v2.13-2024-09",
    "nist-sp-800-171r2-upd1",
    "nist-sp-800-171a-june-2018",
    "nist-sp-800-171r3-2024-05",
    "nist-sp-800-171ar3-2024-05",
  ];
  const authorityIds = authority.authorities?.map((item) => item.authorityId) ?? [];
  if (!requiredAuthorities.every((id) => authorityIds.includes(id))) fail("authority profile is missing a required governing or supplemental publication");
  for (const item of authority.authorities ?? []) {
    if (!/^[0-9a-f]{64}$/.test(item.artifactSha256 ?? "")) fail(`authority ${item.authorityId} lacks a valid artifact SHA-256`);
    nonEmptyString(item.version, `authority ${item.authorityId} version`);
    nonEmptyString(item.officialUrl, `authority ${item.authorityId} officialUrl`);
  }
  if (authority.evidenceRule?.failClosed !== true) fail("authority profile evidence rule must fail closed");
  if (JSON.stringify(authority.evidenceRule?.permittedOrigins) !== JSON.stringify(PERMITTED_ORIGINS)) {
    fail("authority profile evidence origins must exactly match the controlled four-origin model");
  }
  if (rev2.sourceAuthorityId !== "nist-sp-800-171a-june-2018" || rev2.controlCount !== 110 || rev2.objectiveCount !== 320) {
    fail("governing objective catalog must be NIST SP 800-171A June 2018 with 110 requirements and 320 objectives");
  }
  if (rev3.sourceAuthorityId !== "nist-sp-800-171ar3-2024-05" || rev3.controlCount !== 97 || rev3.objectiveCount !== 510) {
    fail("supplemental objective catalog must be NIST SP 800-171A Revision 3 with 97 requirements and 510 objectives");
  }
  const authorityById = new Map(authority.authorities.map((item) => [item.authorityId, item]));
  if (rev2.sourceArtifactSha256 !== authorityById.get(rev2.sourceAuthorityId)?.artifactSha256) fail("Rev. 2 objective catalog source hash does not match the authority profile");
  if (rev3.sourceArtifactSha256 !== authorityById.get(rev3.sourceAuthorityId)?.artifactSha256) fail("Rev. 3 objective catalog source hash does not match the authority profile");
  validateCatalog(rev2, 110, 320, "governing Rev. 2");
  validateCatalog(rev3, 97, 510, "supplemental Rev. 3");
}

function validateCatalog(catalog, expectedControls, expectedObjectives, label) {
  if (!Array.isArray(catalog.controls) || catalog.controls.length !== expectedControls) fail(`${label} catalog control count is invalid`);
  const controlIds = catalog.controls.map((control) => control.controlId);
  if (!unique(controlIds)) fail(`${label} catalog has duplicate control identifiers`);
  const objectives = catalog.controls.flatMap((control) => control.objectives ?? []);
  if (objectives.length !== expectedObjectives || !unique(objectives.map((item) => item.objectiveId))) {
    fail(`${label} catalog objective count or uniqueness is invalid`);
  }
  for (const control of catalog.controls) {
    nonEmptyString(control.controlId, `${label} controlId`);
    if (!Array.isArray(control.objectives) || !control.objectives.length) fail(`${label} ${control.controlId} has no objectives`);
    for (const objective of control.objectives) {
      nonEmptyString(objective.objectiveId, `${label} ${control.controlId} objectiveId`);
      nonEmptyString(objective.statement, `${label} ${objective.objectiveId} statement`);
    }
  }
}

function schemaErrors(value, schema, rootSchema, instancePath = "$") {
  if (schema.$ref) {
    if (!schema.$ref.startsWith("#/")) return [`${instancePath}: unsupported external schema reference ${schema.$ref}`];
    let target = rootSchema;
    for (const part of schema.$ref.slice(2).split("/")) target = target?.[part.replaceAll("~1", "/").replaceAll("~0", "~")];
    if (!target) return [`${instancePath}: unresolved schema reference ${schema.$ref}`];
    return schemaErrors(value, target, rootSchema, instancePath);
  }
  if (schema.oneOf) {
    const outcomes = schema.oneOf.map((candidate) => schemaErrors(value, candidate, rootSchema, instancePath));
    const matches = outcomes.filter((errors) => errors.length === 0).length;
    return matches === 1 ? [] : [`${instancePath}: expected exactly one oneOf branch, matched ${matches}`];
  }
  const errors = [];
  const deepEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  if (Object.hasOwn(schema, "const") && !deepEqual(value, schema.const)) errors.push(`${instancePath}: value does not match const`);
  if (schema.enum && !schema.enum.some((candidate) => deepEqual(value, candidate))) errors.push(`${instancePath}: value is outside enum`);
  if (schema.type) {
    const validType =
      (schema.type === "object" && value !== null && typeof value === "object" && !Array.isArray(value)) ||
      (schema.type === "array" && Array.isArray(value)) ||
      (schema.type === "string" && typeof value === "string") ||
      (schema.type === "integer" && Number.isInteger(value)) ||
      (schema.type === "number" && typeof value === "number" && Number.isFinite(value)) ||
      (schema.type === "boolean" && typeof value === "boolean") ||
      (schema.type === "null" && value === null);
    if (!validType) return [...errors, `${instancePath}: expected type ${schema.type}`];
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${instancePath}: string is shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${instancePath}: string is longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${instancePath}: string does not match ${schema.pattern}`);
    if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) errors.push(`${instancePath}: value is not a date-time`);
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${instancePath}: number is below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${instancePath}: number is above ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${instancePath}: array has fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${instancePath}: array has more than ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${instancePath}: array items are not unique`);
    if (schema.items) value.forEach((item, index) => errors.push(...schemaErrors(item, schema.items, rootSchema, `${instancePath}[${index}]`)));
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required ?? []) if (!Object.hasOwn(value, required)) errors.push(`${instancePath}: missing required property ${required}`);
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (Object.hasOwn(value, key)) errors.push(...schemaErrors(value[key], child, rootSchema, `${instancePath}.${key}`));
    if (schema.additionalProperties === false) {
      const permitted = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) if (!permitted.has(key)) errors.push(`${instancePath}: additional property ${key} is not permitted`);
    }
  }
  return errors;
}

function validateSource(source, catalogs, scopePolicy) {
  if (source.repository !== "jblan2026-hub/obserra-website") fail("repository identity is not canonical");
  if (source.assessmentDispositionPolicy?.technicalAndHumanResultsSeparated !== true || source.assessmentDispositionPolicy?.pendingHumanReviewIsFailure !== false) {
    fail("technical and human assessment outcomes must be separated and pending human review must remain non-failure");
  }
  if (source.approvedChangeAutomation?.failClosed !== true || source.approvedChangeAutomation?.trigger !== "push_to_main_after_approved_merge") {
    fail("approved-change automation must be explicit and fail closed");
  }
  if (source.scope?.cuiProcessingAuthorized !== false || source.scope?.formalAssessmentScopeEstablished !== false) {
    fail("CUI processing and a formal assessment scope must remain unauthorized/unestablished in this evidence source");
  }
  if (!Array.isArray(source.responsibilityTemplate) || source.responsibilityTemplate.length !== 4) fail("responsibility template must have exactly four entries");
  const origins = source.responsibilityTemplate.map((item) => item.evidenceOrigin);
  if (!unique(origins) || !PERMITTED_ORIGINS.every((origin) => origins.includes(origin))) fail("responsibility template must cover each permitted origin exactly once");
  if (!Array.isArray(source.systems) || source.systems.length < 10) fail("at least ten separate system records are required");
  const systemIds = source.systems.map((system) => system.systemId);
  if (!unique(systemIds)) fail("system identifiers must be unique");
  const globalArtifactIds = [];
  for (const system of source.systems) {
    if (!/^SYS-[A-Z0-9-]{2,40}$/.test(system.systemId ?? "")) fail(`invalid systemId ${system.systemId}`);
    nonEmptyString(system.systemName, `${system.systemId}.systemName`);
    nonEmptyString(system.systemType, `${system.systemId}.systemType`);
    nonEmptyString(system.provider, `${system.systemId}.provider`);
    nonEmptyString(system.accountableRole, `${system.systemId}.accountableRole`);
    if (!PERMITTED_OPERATIONAL_DISPOSITIONS.includes(system.operationalDisposition)) fail(`${system.systemId} has invalid operationalDisposition`);
    for (const key of ["included", "excluded", "dataClasses", "environments"]) {
      if (!Array.isArray(system.scope?.[key]) || !system.scope[key].length || !unique(system.scope[key])) fail(`${system.systemId}.scope.${key} must be a unique non-empty array`);
    }
    if (!Array.isArray(system.artifacts) || !system.artifacts.length) fail(`${system.systemId} must declare at least one artifact`);
    const localArtifactIds = [];
    for (const artifact of system.artifacts) {
      if (!/^EV-[A-Z0-9-]{3,60}$/.test(artifact.artifactId ?? "")) fail(`${system.systemId} has invalid artifactId ${artifact.artifactId}`);
      const artifactPath = normalizeRepositoryPath(artifact.path, `${artifact.artifactId}.path`);
      if (!scopePolicy.isAllowedArtifact(artifactPath)) fail(`${artifact.artifactId} path is outside the controlled scope or inside Applications: ${artifactPath}`);
      if (!fs.existsSync(resolve(artifactPath)) || !fs.lstatSync(resolve(artifactPath)).isFile()) fail(`${artifact.artifactId} references a missing non-file artifact: ${artifactPath}`);
      if (!PERMITTED_ORIGINS.includes(artifact.evidenceOrigin)) fail(`${artifact.artifactId} has an invalid evidence origin`);
      if (!PERMITTED_METHODS.includes(artifact.method)) fail(`${artifact.artifactId} has an invalid assessment method`);
      nonEmptyString(artifact.claimBoundary, `${artifact.artifactId}.claimBoundary`);
      localArtifactIds.push(artifact.artifactId);
      globalArtifactIds.push(artifact.artifactId);
    }
    if (!unique(localArtifactIds)) fail(`${system.systemId} has duplicate artifact identifiers`);
    if (!Array.isArray(system.controlMappings) || system.controlMappings.length < 2) fail(`${system.systemId} requires governing and supplemental control mappings`);
    const mappedObjectives = new Set();
    for (const mapping of system.controlMappings) {
      if (!(mapping.baseline in catalogs)) fail(`${system.systemId} has unsupported baseline ${mapping.baseline}`);
      if (!Array.isArray(mapping.controlIds) || !mapping.controlIds.length || !unique(mapping.controlIds)) fail(`${system.systemId} mapping controlIds must be unique and non-empty`);
      if (mapping.controlIds.includes("*") && mapping.controlIds.length !== 1) fail(`${system.systemId} wildcard mapping cannot be mixed with explicit controls`);
      const availableControls = new Set(catalogs[mapping.baseline].controls.map((control) => control.controlId));
      for (const controlId of mapping.controlIds) if (controlId !== "*" && !availableControls.has(controlId)) fail(`${system.systemId} maps unknown ${mapping.baseline} control ${controlId}`);
      if (!Array.isArray(mapping.methods) || !mapping.methods.length || !unique(mapping.methods) || mapping.methods.some((method) => !PERMITTED_METHODS.includes(method))) fail(`${system.systemId} mapping assessment methods are invalid`);
      if (!PERMITTED_RESPONSIBILITY_OWNERS.includes(mapping.responsibilityOwner)) fail(`${system.systemId} has invalid responsibilityOwner`);
      if (!PERMITTED_EVIDENCE_STATES.includes(mapping.evidenceState)) fail(`${system.systemId} has invalid evidenceState`);
      if (!Array.isArray(mapping.artifactIds) || !unique(mapping.artifactIds) || mapping.artifactIds.some((id) => !localArtifactIds.includes(id))) fail(`${system.systemId} mapping references an unknown or duplicate local artifact`);
      const controls = mapping.controlIds[0] === "*" ? catalogs[mapping.baseline].controls : mapping.controlIds.map((id) => catalogs[mapping.baseline].controlById.get(id));
      for (const control of controls) {
        for (const objective of control.objectives) {
          const key = `${mapping.baseline}|${objective.objectiveId}`;
          if (mappedObjectives.has(key)) fail(`${system.systemId} maps objective ${objective.objectiveId} more than once`);
          mappedObjectives.add(key);
        }
      }
    }
  }
  if (!unique(globalArtifactIds)) fail("artifact identifiers must be globally unique");
}

function loadObjectiveResults(file, exactReleaseSha, validObjectiveKeys, artifactIds) {
  if (!file) return { byKey: new Map(), artifactSha256: null, generatedAt: null, path: null };
  if (!exactReleaseSha) fail("--objective-results is permitted only with --release");
  const full = resolve(file);
  const raw = read(full, "objective-specific result artifact");
  const parsed = json(full, "objective-specific result artifact");
  if (parsed.schemaVersion !== "1.0" || parsed.targetGitCommitSha !== exactReleaseSha) fail("objective result artifact must use schema 1.0 and target the exact release SHA");
  if (!Number.isFinite(Date.parse(parsed.generatedAt ?? ""))) fail("objective result artifact generatedAt must be a date-time");
  if (!Array.isArray(parsed.results) || !parsed.results.length) fail("objective result artifact must contain at least one result");
  const byKey = new Map();
  for (const result of parsed.results) {
    const key = `${result.systemId}|${result.baselineAuthorityId}|${result.objectiveId}`;
    if (!validObjectiveKeys.has(key)) fail(`objective result references an unmapped objective: ${key}`);
    if (byKey.has(key)) fail(`objective result is duplicated: ${key}`);
    if (!PERMITTED_METHODS.includes(result.method)) fail(`objective result ${key} has an invalid method`);
    if (!["passed", "failed", "not_applicable"].includes(result.result)) fail(`objective result ${key} has an invalid result`);
    if (!Array.isArray(result.artifactIds) || !result.artifactIds.length || !unique(result.artifactIds) || result.artifactIds.some((id) => !artifactIds.has(id))) fail(`objective result ${key} must reference unique known artifacts`);
    nonEmptyString(result.claimBoundary, `objective result ${key} claimBoundary`);
    byKey.set(key, result);
  }
  return { byKey, artifactSha256: sha256(raw), generatedAt: parsed.generatedAt, path: relative(full) };
}

function technicalStatus(mappings) {
  const states = mappings.map((mapping) => mapping.technicalResult.state);
  if (states.includes("failed")) return "failed";
  const tested = states.filter((state) => state === "passed" || state === "not_applicable");
  if (!tested.length) return "not_tested";
  if (tested.length === states.length) return states.every((state) => state === "not_applicable") ? "not_applicable" : "passed";
  return "partially_passed";
}

function escapeCell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function renderMarkdown(bundle, authority) {
  const lines = [
    "# CMMC System Evidence Register",
    "",
    "> GENERATED FILE. DO NOT EDIT MANUALLY. Update the controlled source records and run `npm run generate:cmmc-system-evidence`.",
    "",
    `- **Legal owner:** ${bundle.legalOwner}`,
    `- **Bundle:** \`${bundle.bundleId}\``,
    `- **Bundle state:** \`${bundle.bundleState}\``,
    `- **Generated at:** \`${bundle.generatedAt}\``,
    `- **Git base/HEAD reference:** \`${bundle.repositoryRevision.headCommitSha}\``,
    `- **Revision binding:** \`${bundle.repositoryRevision.revisionBinding}\``,
    `- **Exact release:** ${bundle.repositoryRevision.exactReleaseCommitSha ? `\`${bundle.repositoryRevision.exactReleaseCommitSha}\`` : "not assigned; working evidence inventory"}`,
    `- **In-scope tree SHA-256:** \`${bundle.repositoryRevision.workingTreeSha256}\` (${bundle.repositoryRevision.workingTreePathCount} paths)`,
    "",
    "## Paired audit views",
    "",
    `- **Machine-readable canonical record:** \`${bundle.auditViews.machineReadable.path}\` (${bundle.auditViews.machineReadable.mediaType})`,
    `- **Human-readable derived extract:** \`${bundle.auditViews.humanReadableExtract.path}\` (${bundle.auditViews.humanReadableExtract.mediaType})`,
    `- **Paired SHA-256 manifest:** \`${bundle.auditViews.pairedDigestManifest.path}\``,
    `- **Verification:** \`${bundle.auditViews.verifyCommand}\``,
    "",
    "Both views are generated from the same in-memory bundle. The digest manifest binds both artifacts; a missing, edited, stale, or mismatched view fails verification.",
    "",
    "## Governing sources and exact revisions",
    "",
    "| Role | Authority | Version | Incorporated by reference | Official source artifact SHA-256 |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const item of authority.authorities) {
    lines.push(`| ${escapeCell(item.role)} | ${escapeCell(item.title)} | ${escapeCell(item.version)} | ${item.incorporatedByReference ? escapeCell(item.incorporationCitation) : "no"} | \`${item.artifactSha256}\` |`);
  }
  lines.push(
    "",
    "The governing CMMC Level 2 assessment baseline is 32 CFR Part 170, the September 2024 CMMC Level 2 Assessment Guide version 2.13, NIST SP 800-171 Revision 2, and NIST SP 800-171A June 2018 as incorporated by reference. Revision 3 publications are a separately labeled supplemental engineering crosswalk and do not replace the governing baseline.",
    "",
    "## Technical result versus human disposition",
    "",
    "| Field | Meaning | Failure effect |",
    "| --- | --- | --- |",
    "| Technical `passed` | Objective-specific, hashed evidence passed at the exact revision | Green technical result |",
    "| Technical `not_tested` | Candidate evidence exists but no objective-specific result was supplied | Not green; not automatically failed |",
    "| Human `pending` | Organization or assessor reconciliation has not occurred | No effect on the technical gate; finding remains `not_assessed` |",
    "| Mandatory prerequisite pending | Licensing, legal, security, or explicit activation approval is required first | Protected function remains fail closed |",
    "",
    `**Technical pass criteria:** ${bundle.assessmentDispositionPolicy.technicalGateCriteria.pass}`,
    "",
    `**Technical fail criteria:** ${bundle.assessmentDispositionPolicy.technicalGateCriteria.fail}`,
    "",
    `**Human completion criteria:** ${bundle.assessmentDispositionPolicy.humanReviewCriteria.completion}`,
    "",
    `**Separation invariant:** ${bundle.assessmentDispositionPolicy.humanPendingRule}`,
    "",
    "## Scope and claim boundary",
    "",
    `Included systems: ${bundle.scope.includedSystems.map((id) => `\`${id}\``).join(", ")}.`,
    "",
    `Excluded workstreams: ${bundle.scope.excludedWorkstreams.join("; ")}.`,
    "",
    `Excluded paths: ${bundle.scope.excludedPathPrefixes.map((value) => `\`${value}\``).join(", ")}.`,
    "",
    ...bundle.claimBoundary.permittedClaims.map((value) => `- Permitted: ${value}`),
    ...bundle.claimBoundary.prohibitedClaims.map((value) => `- Prohibited: ${value}`),
    "",
    "## System status",
    "",
    "| System | Rev. 2 objectives | Rev. 3 objectives | Artifacts | Technical | Human | Operational disposition | Finding eligible |",
    "| --- | ---: | ---: | ---: | --- | --- | --- | --- |",
  );
  for (const system of bundle.systems) {
    const rev2Count = system.objectiveMappings.filter((item) => item.baselineAuthorityId === "nist-sp-800-171r2-upd1").length;
    const rev3Count = system.objectiveMappings.length - rev2Count;
    lines.push(`| ${escapeCell(system.systemName)} (\`${system.systemId}\`) | ${rev2Count} | ${rev3Count} | ${system.artifacts.length} | ${system.findingEligibility.technicalStatus} | ${system.findingEligibility.humanAssessmentState} | ${system.findingEligibility.operationalDisposition} | ${system.findingEligibility.eligible ? "yes" : "no"} |`);
  }
  for (const system of bundle.systems) {
    lines.push(
      "",
      `## ${system.systemName} (\`${system.systemId}\`)`,
      "",
      `Provider/boundary: ${system.provider}`,
      "",
      `Accountable owner: ${system.owner.legalName} — ${system.owner.accountableRole}`,
      "",
      `Claim boundary: ${system.claimBoundary.permittedClaims[0]} ${system.claimBoundary.prohibitedClaims[0]}`,
      "",
      `Finding eligibility: **${system.findingEligibility.eligible ? "eligible" : "not eligible"}** — ${system.findingEligibility.reason}`,
      "",
      "### Responsibility record",
      "",
      "| Evidence origin | Owner | Responsibility | Required state |",
      "| --- | --- | --- | --- |",
      ...system.responsibilities.map((item) => `| ${item.evidenceOrigin} | ${escapeCell(item.owner)} | ${escapeCell(item.responsibility)} | ${item.requiredEvidenceState} |`),
      "",
      "### Hashed artifacts",
      "",
      "| Artifact | Origin | State | Method/result | SHA-256 | Finding eligible | Claim boundary |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      ...system.artifacts.map((artifact) => `| \`${artifact.artifactId}\` — ${escapeCell(artifact.title)}<br>\`${escapeCell(artifact.path)}\` | ${artifact.evidenceOrigin} | ${artifact.artifactState} | ${artifact.testResult.method}/${artifact.testResult.result} | \`${artifact.sha256}\` | ${artifact.findingEligible ? "yes" : "no"} | ${escapeCell(artifact.claimBoundary)} |`),
      "",
      "### Objective-level CMMC evidence mapping",
      "",
      "| Baseline | Control | Objective | Assessment methods | Evidence artifacts | Technical | Human | Finding | Operational | Objective statement |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      ...system.objectiveMappings.map((mapping) => `| ${mapping.baselineAuthorityId}<br>${mapping.assessmentAuthorityId} | ${mapping.controlId} | ${escapeCell(mapping.objectiveId)} | ${mapping.methods.join(", ")} | ${mapping.artifactIds.map((id) => `\`${id}\``).join(", ") || "organization/assessor evidence required"} | ${mapping.technicalResult.state} | ${mapping.humanAssessmentState} | ${mapping.finding} | ${mapping.operationalDisposition} | ${escapeCell(mapping.objectiveStatement)} |`),
    );
  }
  lines.push(
    "",
    "## Approved-change automation",
    "",
    `- Trigger: \`${bundle.approvedChangeAutomation.trigger}\`` ,
    `- Workflow: \`${bundle.approvedChangeAutomation.workflowPath}\`` ,
    `- Generate: \`${bundle.approvedChangeAutomation.generateCommand}\`` ,
    `- Verify: \`${bundle.approvedChangeAutomation.verifyCommand}\`` ,
    `- Authority drift: \`${bundle.approvedChangeAutomation.sourceDriftCommand}\`` ,
    `- Retention: \`${bundle.approvedChangeAutomation.retentionMode}\`` ,
    `- Fail closed: **${bundle.approvedChangeAutomation.failClosed ? "yes" : "no"}**`,
    "",
    bundle.approvedChangeAutomation.rule,
    "",
    "## Summary",
    "",
    `- Systems: ${bundle.summary.systemCount}`,
    `- Governing controls/objectives: ${bundle.summary.governingControlCount}/${bundle.summary.governingObjectiveCount}`,
    `- Supplemental Revision 3 controls/objectives: ${bundle.summary.rev3ControlCount}/${bundle.summary.rev3ObjectiveCount}`,
    `- Objective mapping rows across separated systems: ${bundle.summary.objectiveMappingCount}`,
    `- Technical passed/failed/not tested objective rows: ${bundle.summary.technicalPassedObjectiveCount}/${bundle.summary.technicalFailedObjectiveCount}/${bundle.summary.technicalNotTestedObjectiveCount}`,
    `- Human-pending objective rows: ${bundle.summary.humanPendingObjectiveCount}`,
    `- Unmapped required objectives: ${bundle.summary.unmappedRequiredObjectiveCount}`,
    `- Fail closed: **${bundle.summary.failClosed ? "yes" : "no"}**`,
    "",
  );
  return lines.join("\n");
}

const sourceRaw = read(sourcePath, "system scope source");
const source = json(sourcePath, "system scope source");
const schemaPath = resolve(source.schemaPath ?? "missing");
const authorityPath = resolve(source.authorityProfilePath ?? "missing");
const catalogPaths = (source.objectiveCatalogPaths ?? []).map(resolve);
if (catalogPaths.length !== 2) fail("exactly two objective catalogs are required");
const schemaRaw = read(schemaPath, "evidence schema");
const evidenceSchema = json(schemaPath, "evidence schema");
const authorityRaw = read(authorityPath, "authority profile");
const authority = json(authorityPath, "authority profile");
const rev2Raw = read(catalogPaths[0], "governing objective catalog");
const rev3Raw = read(catalogPaths[1], "supplemental objective catalog");
const rev2 = json(catalogPaths[0], "governing objective catalog");
const rev3 = json(catalogPaths[1], "supplemental objective catalog");
validateAuthority(source, authority, rev2, rev3);

const scopePolicy = buildScopePolicy(source);
const catalogs = {
  governing_rev2: {
    ...rev2,
    baselineAuthorityId: "nist-sp-800-171r2-upd1",
    assessmentAuthorityId: "nist-sp-800-171a-june-2018",
    controlById: new Map(rev2.controls.map((control) => [control.controlId, control])),
  },
  supplemental_rev3: {
    ...rev3,
    baselineAuthorityId: "nist-sp-800-171r3-2024-05",
    assessmentAuthorityId: "nist-sp-800-171ar3-2024-05",
    controlById: new Map(rev3.controls.map((control) => [control.controlId, control])),
  },
};
validateSource(source, catalogs, scopePolicy);

const currentHeadCommitSha = git(["rev-parse", "HEAD"]).trim();
if (!/^[0-9a-f]{40}$/.test(currentHeadCommitSha)) fail("HEAD is not an exact Git commit SHA");
let headCommitSha = source.workingBaseCommitSha;
let branch = source.workingBranch;
let revisionBinding = "working_tree_digest";
if (!/^[0-9a-f]{40}$/.test(headCommitSha ?? "") || git(["rev-parse", `${headCommitSha}^{commit}`]).trim() !== headCommitSha) {
  fail("workingBaseCommitSha must identify an existing exact Git commit");
}
nonEmptyString(branch, "workingBranch");
let exactReleaseCommitSha = null;
if (releaseSha) {
  if (!/^[0-9a-f]{40}$/.test(releaseSha)) fail("--release must be a complete 40-character lowercase Git SHA");
  const resolvedRelease = git(["rev-parse", `${releaseSha}^{commit}`]).trim();
  if (resolvedRelease !== releaseSha || currentHeadCommitSha !== releaseSha) fail("release generation requires the exact release commit to be checked out at HEAD");
  exactReleaseCommitSha = releaseSha;
  headCommitSha = releaseSha;
  branch = git(["branch", "--show-current"]).trim() || "detached";
  revisionBinding = "exact_release_commit";
}
const inScopeTree = collectInScopeTree(scopePolicy);
const inScopeDirty = scopedWorkingTreeDirty(scopePolicy);
if (exactReleaseCommitSha && inScopeDirty) fail("final release evidence requires a clean in-scope source tree; generated evidence outputs are excluded from this check");

const sourceHash = sha256(sourceRaw);
const schemaHash = sha256(schemaRaw);
const authorityHash = sha256(authorityRaw);
const rev2Hash = sha256(rev2Raw);
const rev3Hash = sha256(rev3Raw);
const generatorHash = sha256(read(generatorPath, "system evidence generator"));
const allArtifactIds = new Set(source.systems.flatMap((system) => system.artifacts.map((artifact) => artifact.artifactId)));

const validObjectiveKeys = new Set();
for (const system of source.systems) {
  for (const mapping of system.controlMappings) {
    const catalog = catalogs[mapping.baseline];
    const controls = mapping.controlIds[0] === "*" ? catalog.controls : mapping.controlIds.map((id) => catalog.controlById.get(id));
    for (const control of controls) for (const objective of control.objectives) validObjectiveKeys.add(`${system.systemId}|${catalog.baselineAuthorityId}|${objective.objectiveId}`);
  }
}
const objectiveResults = loadObjectiveResults(objectiveResultsPath, exactReleaseCommitSha, validObjectiveKeys, allArtifactIds);
const generatedAt = exactReleaseCommitSha
  ? git(["show", "-s", "--format=%cI", exactReleaseCommitSha]).trim()
  : source.workingSnapshotAt;
if (!Number.isFinite(Date.parse(generatedAt ?? ""))) fail("generatedAt source is not a valid date-time");

const baselineAuthorityIds = authority.authorities.map((item) => item.authorityId);
const governingCoverage = new Set();
const rev3Coverage = new Set();
const systems = source.systems.map((system) => {
  const objectiveMappings = [];
  for (const mapping of system.controlMappings) {
    const catalog = catalogs[mapping.baseline];
    const controls = mapping.controlIds[0] === "*" ? catalog.controls : mapping.controlIds.map((id) => catalog.controlById.get(id));
    for (const control of controls) {
      for (const objective of control.objectives) {
        const resultKey = `${system.systemId}|${catalog.baselineAuthorityId}|${objective.objectiveId}`;
        const result = objectiveResults.byKey.get(resultKey) ?? null;
        const technicalResult = result
          ? {
              state: result.result,
              basis: result.result === "not_applicable" ? "not_applicable" : "objective_specific_result",
              exactRevision: exactReleaseCommitSha,
              resultArtifactSha256: objectiveResults.artifactSha256,
            }
          : { state: "not_tested", basis: "candidate_evidence_only", exactRevision: null, resultArtifactSha256: null };
        objectiveMappings.push({
          baselineAuthorityId: catalog.baselineAuthorityId,
          assessmentAuthorityId: catalog.assessmentAuthorityId,
          controlId: control.controlId,
          objectiveId: objective.objectiveId,
          objectiveStatement: objective.statement,
          methods: mapping.methods,
          responsibilityOwner: mapping.responsibilityOwner,
          evidenceState: mapping.evidenceState,
          artifactIds: result?.artifactIds ?? mapping.artifactIds,
          finding: "not_assessed",
          technicalResult,
          humanAssessmentState: "pending",
          pendingHumanReviewIsFailure: false,
          operationalDisposition: system.operationalDisposition,
          claimBoundary: result?.claimBoundary ?? mapping.claimBoundary,
        });
        if (mapping.baseline === "governing_rev2") governingCoverage.add(objective.objectiveId);
        else rev3Coverage.add(objective.objectiveId);
      }
    }
  }
  const objectiveResultArtifactIds = new Set(
    objectiveMappings
      .filter((mapping) => mapping.technicalResult.state === "passed")
      .flatMap((mapping) => mapping.artifactIds),
  );
  const artifacts = system.artifacts.map((artifact) => {
    const raw = read(resolve(artifact.path), artifact.artifactId);
    const hasPassedObjectiveResult = objectiveResultArtifactIds.has(artifact.artifactId);
    const artifactState = exactReleaseCommitSha ? "final" : "working";
    const findingEligible = Boolean(
      exactReleaseCommitSha &&
      artifactState === "final" &&
      hasPassedObjectiveResult &&
      objectiveResults.artifactSha256,
    );
    return {
      artifactId: artifact.artifactId,
      title: artifact.title,
      path: artifact.path,
      artifactState,
      sha256: sha256(raw),
      hashVerified: true,
      evidenceOrigin: artifact.evidenceOrigin,
      owner: { legalName: LEGAL_OWNER, accountableRole: artifact.accountableRole },
      exactRevision: {
        authorityProfileSha256: authorityHash,
        baselineAuthorityIds,
        targetGitCommitSha: exactReleaseCommitSha,
        workingTreeSha256: inScopeTree.sha256,
      },
      testResult: {
        method: artifact.method,
        result: hasPassedObjectiveResult ? "passed" : "not_run",
        executedAt: hasPassedObjectiveResult ? objectiveResults.generatedAt : null,
        targetRevision: hasPassedObjectiveResult ? exactReleaseCommitSha : null,
        resultArtifactSha256: hasPassedObjectiveResult ? objectiveResults.artifactSha256 : null,
      },
      claimBoundary: artifact.claimBoundary,
      findingEligible,
    };
  });
  const status = technicalStatus(objectiveMappings);
  return {
    systemId: system.systemId,
    systemName: system.systemName,
    systemType: system.systemType,
    provider: system.provider,
    owner: { legalName: LEGAL_OWNER, accountableRole: system.accountableRole },
    scope: system.scope,
    responsibilities: source.responsibilityTemplate,
    claimBoundary: {
      permittedClaims: [system.claimBoundary],
      prohibitedClaims: ["No product, organization, customer, or provider artifact in this record is an assessor determination or CMMC certification."],
    },
    artifacts,
    objectiveMappings,
    findingEligibility: {
      eligible: false,
      reason: status === "failed"
        ? "At least one objective-specific technical result failed; remediation and a new exact-revision result are required."
        : "Human assessment remains pending and no signed assessor determination is present. Pending human review is not a technical failure.",
      technicalStatus: status,
      humanAssessmentState: "pending",
      operationalDisposition: system.operationalDisposition,
    },
  };
});

if (governingCoverage.size !== 320) fail(`governing objective coverage is ${governingCoverage.size}; expected 320`);
if (rev3Coverage.size !== 510) fail(`supplemental Revision 3 objective coverage is ${rev3Coverage.size}; expected 510`);
const allMappings = systems.flatMap((system) => system.objectiveMappings);
const artifactCount = systems.reduce((sum, system) => sum + system.artifacts.length, 0);
const assessorDeterminationCount = systems.flatMap((system) => system.artifacts).filter((artifact) => artifact.evidenceOrigin === "assessor_determination").length;
const bundleState = exactReleaseCommitSha ? "final_release_evidence" : "working_evidence_inventory";
const bundleId = exactReleaseCommitSha
  ? `obserra-cmmc-release-${exactReleaseCommitSha}`
  : `obserra-cmmc-working-${inScopeTree.sha256.slice(0, 24)}`;
const bundle = {
  schemaVersion: "2.0",
  bundleId,
  bundleState,
  generatedAt,
  legalOwner: LEGAL_OWNER,
  sourceDefinition: { path: relative(sourcePath), sha256: sourceHash, state: "final" },
  schemaReference: { path: relative(schemaPath), sha256: schemaHash, state: "final" },
  generatorReference: { path: relative(generatorPath), sha256: generatorHash, state: "final" },
  authorityProfile: { path: relative(authorityPath), sha256: authorityHash, state: "final" },
  objectiveCatalogs: [
    { path: relative(catalogPaths[0]), sha256: rev2Hash, state: "final" },
    { path: relative(catalogPaths[1]), sha256: rev3Hash, state: "final" },
  ],
  auditViews: {
    machineReadable: {
      path: relative(outputPath),
      mediaType: "application/json",
      role: "canonical_machine_readable_record",
    },
    humanReadableExtract: {
      path: relative(reportPath),
      mediaType: "text/markdown",
      role: "derived_human_readable_extract",
    },
    pairedDigestManifest: {
      path: relative(digestPath),
      algorithm: "sha256",
      coversBothViews: true,
    },
    derivation: "human_readable_extract_generated_from_same_in_memory_canonical_bundle",
    verifyCommand: "npm run verify:cmmc-system-evidence",
  },
  repositoryRevision: {
    repository: source.repository,
    branch,
    headCommitSha,
    revisionBinding,
    workingTreeState: inScopeDirty ? "dirty" : "clean",
    workingTreeSha256: inScopeTree.sha256,
    workingTreePathCount: inScopeTree.entries.length,
    digestPolicy: {
      algorithm: "sha256",
      scope: "all_in_scope_source_files_at_working_revision",
      generatedOutputsExcluded: true,
      excludedWorkstreamPathsExcluded: true,
    },
    exactReleaseCommitSha,
  },
  scope: {
    includedSystems: systems.map((system) => system.systemId),
    excludedWorkstreams: source.scope.excludedWorkstreams,
    excludedPathPrefixes: [...source.scope.excludedPathPrefixes, ...source.scope.excludedExactPaths],
    cuiProcessingAuthorized: false,
    formalAssessmentScopeEstablished: false,
  },
  claimBoundary: source.claimBoundary,
  assessmentDispositionPolicy: source.assessmentDispositionPolicy,
  approvedChangeAutomation: source.approvedChangeAutomation,
  systems,
  summary: {
    systemCount: systems.length,
    governingControlCount: 110,
    governingObjectiveCount: 320,
    rev3ControlCount: 97,
    rev3ObjectiveCount: 510,
    artifactCount,
    findingEligibleArtifactCount: systems.flatMap((system) => system.artifacts).filter((artifact) => artifact.findingEligible).length,
    assessorDeterminationCount,
    objectiveMappingCount: allMappings.length,
    technicalPassedObjectiveCount: allMappings.filter((mapping) => mapping.technicalResult.state === "passed").length,
    technicalFailedObjectiveCount: allMappings.filter((mapping) => mapping.technicalResult.state === "failed").length,
    technicalNotTestedObjectiveCount: allMappings.filter((mapping) => mapping.technicalResult.state === "not_tested").length,
    humanPendingObjectiveCount: allMappings.filter((mapping) => mapping.humanAssessmentState === "pending").length,
    humanCompletedObjectiveCount: 0,
    humanNotRequiredObjectiveCount: 0,
    technicalGateDisposition: allMappings.some((mapping) => mapping.technicalResult.state === "failed")
      ? "failed"
      : allMappings.every((mapping) => ["passed", "not_applicable"].includes(mapping.technicalResult.state))
        ? "passed"
        : "pending_evidence",
    humanReviewDisposition: "pending",
    technicalGatePassRequiresHumanCompletion: false,
    unmappedRequiredObjectiveCount: 0,
    failClosed: true,
  },
};

if (bundle.summary.objectiveMappingCount < 830) fail("separated per-system mapping must include at least the complete 830-objective aggregate baseline");
if (bundle.summary.technicalPassedObjectiveCount && !exactReleaseCommitSha) fail("working evidence cannot claim technically passed objectives");
if (allMappings.some((mapping) => mapping.humanAssessmentState !== "pending" || mapping.pendingHumanReviewIsFailure !== false)) fail("all organization-generated human review states must remain pending and non-failing");
if (bundle.systems.some((system) => system.responsibilities.length !== 4)) fail("every system must retain all four responsibility origins");
if (bundle.systems.some((system) => system.objectiveMappings.some((mapping) => mapping.finding !== "not_assessed"))) fail("a non-assessor generator cannot create an assessment finding");
const validationErrors = schemaErrors(bundle, evidenceSchema, evidenceSchema);
if (validationErrors.length) fail(`generated bundle violates its JSON Schema:\n${validationErrors.slice(0, 25).join("\n")}`);

const expectedJson = `${JSON.stringify(bundle, null, 2)}\n`;
const expectedReport = `${renderMarkdown(bundle, authority).trimEnd()}\n`;
const jsonHash = sha256(expectedJson);
const reportHash = sha256(expectedReport);
const expectedDigest = [
  `${jsonHash}  ${path.basename(outputPath)}`,
  `${reportHash}  ${path.basename(reportPath)}`,
  `${sourceHash}  ${path.basename(sourcePath)}`,
  `${schemaHash}  ${path.basename(schemaPath)}`,
  `${generatorHash}  ${path.basename(generatorPath)}`,
  `${authorityHash}  ${path.basename(authorityPath)}`,
  `${rev2Hash}  ${path.basename(catalogPaths[0])}`,
  `${rev3Hash}  ${path.basename(catalogPaths[1])}`,
  "",
].join("\n");

if (mode === "write") {
  fs.writeFileSync(outputPath, expectedJson, "utf8");
  fs.writeFileSync(reportPath, expectedReport, "utf8");
  fs.writeFileSync(digestPath, expectedDigest, "utf8");
  console.log(`Generated ${bundle.bundleState} for ${systems.length} separated systems and ${allMappings.length} objective mapping rows.`);
  console.log(`Governing coverage: ${governingCoverage.size}/320 objectives; supplemental Revision 3 coverage: ${rev3Coverage.size}/510 objectives.`);
  console.log(`Technical passed/failed/not tested: ${bundle.summary.technicalPassedObjectiveCount}/${bundle.summary.technicalFailedObjectiveCount}/${bundle.summary.technicalNotTestedObjectiveCount}; human pending is non-failure.`);
  console.log(`Evidence register SHA-256: ${jsonHash}`);
  process.exit(0);
}

for (const file of [outputPath, reportPath, digestPath]) if (!fs.existsSync(file)) fail(`generated artifact is missing: ${relative(file)}`);
if (readText(outputPath) !== expectedJson) fail("machine-readable evidence register has drifted from its controlled sources");
if (readText(reportPath) !== expectedReport) fail("human-readable evidence register has drifted from its controlled sources");
if (readText(digestPath) !== expectedDigest) fail("evidence digest manifest has drifted from its controlled sources");

console.log(`CMMC system-evidence gate passed for ${systems.length} systems and ${allMappings.length} objective mapping rows.`);
console.log(`Governing coverage: ${governingCoverage.size}/320 objectives; supplemental Revision 3 coverage: ${rev3Coverage.size}/510 objectives.`);
console.log(`Evidence register SHA-256: ${jsonHash}`);
