import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--check") ? "check" : null;
if (!mode) fail("use exactly one of --write or --check");

const LEGAL_ENTITY_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const LEGAL_ENTITY_HTML = "OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC";
const CANONICAL_PUBLIC_ORIGIN = "https://www.obserrallc.com";
const schemaPath = "docs/compliance/LEGAL-IDENTITY-AUDIT.schema.json";
const outputPath = "docs/compliance/LEGAL-IDENTITY-AUDIT.json";
const humanPath = "docs/compliance/LEGAL-IDENTITY-AUDIT.md";
const digestPath = "docs/compliance/LEGAL-IDENTITY-AUDIT.sha256";

const includedRoots = ["app", "lib", "scripts", "supabase/migrations", ".github/workflows"];
const includedExactPaths = [
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "proxy.ts",
  schemaPath,
  "docs/compliance/CMMC-SYSTEM-SCOPE-SOURCE.json",
  "docs/florida-class-d-lms/FDACS-PII-DATABASE-AUDIT-SOURCE.json",
];
const excludedPathPrefixes = [
  "app/apps/",
  "app/api/apps/",
  "app/portal/applications/",
  "lib/apps/",
  "release/application-production/",
  ".github/workflows/application-",
  "scripts/application-",
];
const excludedExactPaths = new Set([
  "scripts/generate-app-release-bundle.mjs",
  "scripts/sync-final-apps.mjs",
  "scripts/validate-application-staging.mjs",
  "scripts/watch-final-apps.ps1",
  outputPath,
  humanPath,
  digestPath,
]);
const textExtensions = new Set([".cjs", ".html", ".js", ".json", ".jsx", ".md", ".mjs", ".ps1", ".ts", ".tsx", ".txt", ".yaml", ".yml"]);
const permittedProductBrands = [
  "Obserra EPI Academy",
  "Obserra EPI EIOS",
  "Obserra EPI Applications",
  "Obserra EPI Products",
  "Obserra Certificate of Training",
  "Obserra Certificates of Training",
  "Obserra Cloud",
  "Obserrian",
];

function fail(message) {
  throw new Error(`Legal identity audit failed: ${message}`);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalize(value) {
  return value.replaceAll(path.sep, "/").replace(/^\.\//, "");
}

function isExcluded(relativePath) {
  return excludedExactPaths.has(relativePath) || excludedPathPrefixes.some((prefix) => relativePath.startsWith(prefix));
}

function collectDirectory(relativeDirectory, files) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) fail(`required scan root is missing: ${relativeDirectory}`);
  for (const entry of fs.readdirSync(absoluteDirectory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relativePath = normalize(path.join(relativeDirectory, entry.name));
    if (isExcluded(relativePath)) continue;
    if (entry.isDirectory()) collectDirectory(relativePath, files);
    else if (entry.isFile() && textExtensions.has(path.extname(entry.name).toLowerCase())) files.add(relativePath);
  }
}

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

function recordMatches(violations, file, text, regex, ruleId, message, allow = () => false) {
  regex.lastIndex = 0;
  for (const match of text.matchAll(regex)) {
    if (allow(match[0], match)) continue;
    violations.push({
      ruleId,
      path: file,
      line: lineNumber(text, match.index ?? 0),
      matchedText: match[0].replaceAll("\n", " ").slice(0, 240),
      message,
    });
  }
}

const files = new Set();
for (const directory of includedRoots) collectDirectory(directory, files);
for (const file of includedExactPaths) {
  if (!fs.existsSync(path.join(root, file))) fail(`required scan file is missing: ${file}`);
  files.add(file);
}

const sortedFiles = [...files].filter((file) => !isExcluded(file)).sort();
const violations = [];
const sourceDigests = [];

for (const file of sortedFiles) {
  const payload = fs.readFileSync(path.join(root, file));
  const text = payload.toString("utf8");
  sourceDigests.push(`${file}\0${sha256(payload)}\0`);

  recordMatches(
    violations,
    file,
    text,
    /obserra executive protection (?:&|&amp;|and) intelligence,? llc/gi,
    "LEGAL-001",
    "A full legal-name reference does not exactly match the authoritative legal entity.",
    (matched) => matched === LEGAL_ENTITY_NAME || matched === LEGAL_ENTITY_HTML,
  );
  recordMatches(
    violations,
    file,
    text,
    /https?:\/\/(?:www\.)?obserra\.com\b/gi,
    "LEGAL-002",
    "The retired obserra.com origin is not an authorized public origin.",
  );

  if (file.startsWith("app/") || file.startsWith("lib/")) {
    recordMatches(
      violations,
      file,
      text,
      /\bObserra\b(?!\s+(?:EPI\s+(?:Academy|EIOS|Applications|Products)|Certificate(?:s)? of Training|Cloud))\s+(?:applications?|is|will|may|can|uses|provides|supports|applies|processes|helps|connects|delivers|aligns|scopes|serves|follows|works|targets|engagements|clients|identity|account|team|relationship|platform|website|company|merchant|provider|employer|owner|school|records?|certificates?|training)\b/gi,
      "LEGAL-003",
      "A company/provider reference uses the short brand instead of the full legal name.",
    );
    for (const [ruleId, regex, message] of [
      ["LEGAL-004", /\b(?:Contact|About)\s+Obserra\b(?!\s+EPI\s+(?:Academy|EIOS|Applications|Products))/gi, "A contact/about label uses the short brand as the company name."],
      ["LEGAL-005", /\|\s*Obserra\b(?!\s+(?:EPI\s+(?:Academy|EIOS|Applications|Products)|EXECUTIVE PROTECTION))(?=[\s"'`]|$)/gim, "A page title uses the short brand as the owning entity."],
      ["LEGAL-006", /aria-label\s*=\s*["']Obserra home["']/gi, "A home-link label uses the short brand as the owning entity."],
      ["LEGAL-007", /alt\s*=\s*["']Obserra["']/gi, "A company logo alt label omits the legal entity name."],
      ["LEGAL-008", /\b(?:PROPERTY OF|OWNED BY|THE BUSINESS CASE FOR)\s+OBSERRA\b(?!\s+EXECUTIVE)/g, "An ownership statement uses the short brand instead of the legal entity."],
      ["LEGAL-009", /\bObserra Technologies\b/gi, "The retired Obserra Technologies label is not an authorized product brand."],
      ["LEGAL-010", /\bOBSERRA\s+(?:CUSTOMER|COMMERCIAL|ENTERPRISE|TRUST|DESIGN|SITE)\b/g, "A named company surface omits the full legal entity name."],
      ["LEGAL-013", /\bObserra\s+(?:Academy|EIOS|Applications|Products)\b/g, "A product name omits the required EPI designation."],
    ]) recordMatches(violations, file, text, regex, ruleId, message);
  }
}

const legalIdentitySource = fs.readFileSync(path.join(root, "lib/legal-identity.ts"), "utf8");
if (!legalIdentitySource.includes(`export const LEGAL_ENTITY_NAME = "${LEGAL_ENTITY_NAME}" as const;`)) {
  violations.push({ ruleId: "LEGAL-011", path: "lib/legal-identity.ts", line: 1, matchedText: "LEGAL_ENTITY_NAME", message: "The authoritative legal-name constant is missing or drifted." });
}
if (!legalIdentitySource.includes(`export const CANONICAL_PUBLIC_ORIGIN = "${CANONICAL_PUBLIC_ORIGIN}" as const;`)) {
  violations.push({ ruleId: "LEGAL-012", path: "lib/legal-identity.ts", line: 1, matchedText: "CANONICAL_PUBLIC_ORIGIN", message: "The canonical public-origin constant is missing or drifted." });
}

let schema;
try {
  schema = JSON.parse(fs.readFileSync(path.join(root, schemaPath), "utf8"));
} catch (error) {
  fail(`machine schema is missing or invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
}
const requiredSchemaFields = ["legalEntityName", "canonicalPublicOrigin", "sourceRevision", "scope", "cmmcEvidenceMapping", "candidateValidation", "authoritativeTechnicalResult", "releaseFinalization", "humanReview", "assessorDetermination", "eligibleAsFinalEvidence", "claimBoundary"];
if (schema.$id !== "https://www.obserrallc.com/schemas/legal-identity-audit-v2.json" || schema.additionalProperties !== false || requiredSchemaFields.some((field) => !schema.required?.includes(field))) {
  fail("machine schema no longer requires the authoritative identity, revision, scope, CMMC mapping, disposition, and claim-boundary fields");
}
if (schema.properties?.legalEntityName?.const !== LEGAL_ENTITY_NAME || schema.properties?.canonicalPublicOrigin?.const !== CANONICAL_PUBLIC_ORIGIN || schema.properties?.authoritativeTechnicalResult?.properties?.failClosed?.const !== true || schema.properties?.humanReview?.properties?.pendingIsTechnicalFailure?.const !== false) {
  fail("machine schema legal identity or fail-closed disposition contract drifted");
}

if (violations.length) {
  for (const violation of violations) console.error(`${violation.ruleId} ${violation.path}:${violation.line} ${violation.message} [${violation.matchedText}]`);
  fail(`${violations.length} legal-identity violation(s) detected`);
}

const sourceTreeSha256 = sha256(sourceDigests.join(""));
const audit = {
  schemaVersion: "obserra.legal-identity-audit.v2",
  schemaPath,
  legalEntityName: LEGAL_ENTITY_NAME,
  canonicalPublicOrigin: CANONICAL_PUBLIC_ORIGIN,
  sourceRevision: {
    kind: "working_tree_content_digest",
    sourceTreeSha256,
    checkedFileCount: sortedFiles.length,
  },
  scope: {
    includedRoots,
    includedExactPaths,
    excludedWorkstream: "Applications product workstream",
    excludedPathPrefixes,
    excludedExactPaths: [...excludedExactPaths].sort(),
  },
  permittedProductBrands,
  identifierBoundary: {
    stableTechnicalIdentifiersMayRetainObserraToken: true,
    examples: ["environment variables", "HTTP headers", "schema identifiers", "database enum values", "asset paths", "CSS classes", "download filenames"],
    rule: "A technical identifier is not a legal-entity claim. Human-visible owner, provider, merchant, employer, issuer, school, policy, service, and company wording must use the exact legal name unless it is one of the enumerated product brands.",
  },
  cmmcEvidenceMapping: {
    systems: ["SYS-ORG-GOVERNANCE", "SYS-WEBSITE", "SYS-ACADEMY-LMS", "SYS-STRIPE-PAYMENTS", "SYS-FDACS-DATABASE"],
    governingAuthorities: ["32 CFR Part 170", "CMMC Level 2 Assessment Guide v2.13 (September 2024)", "NIST SP 800-171 Revision 2", "NIST SP 800-171A (June 2018)"],
    supplementalAuthorities: ["NIST SP 800-171 Revision 3", "NIST SP 800-171A Revision 3"],
    governingRev2Controls: ["3.3.1", "3.4.1", "3.4.2", "3.4.3", "3.4.4", "3.4.5"],
    supplementalRev3Controls: ["03.03.01", "03.04.01", "03.04.02", "03.04.03", "03.04.04", "03.04.05"],
    claimBoundary: "This source audit supports configuration identification, controlled change, and evidence integrity. It is not an assessor determination and does not establish CMMC certification.",
  },
  candidateValidation: {
    method: "source_scan",
    gatePath: "scripts/legal-identity-audit.mjs",
    outcome: "satisfied_locally_non_authoritative",
    findingCount: 0,
  },
  authoritativeTechnicalResult: {
    state: "not_tested",
    authority: "final_approved_production_release",
    failClosed: true,
    reason: "The inspected source is an unpublished working-tree candidate. No exact approved commit, READY production deployment, canonical production verification result, or hashed final result artifact is bound to this record.",
  },
  releaseFinalization: {
    exactReleaseCommitSha: null,
    approvalState: "pending",
    publicationState: "not_published",
    productionDeploymentId: null,
    canonicalProductionVerificationState: "not_executed",
    finalResultArtifactSha256: null,
  },
  humanReview: { state: "pending", pendingIsTechnicalFailure: false },
  assessorDetermination: "not_assessed",
  eligibleAsFinalEvidence: false,
  claimBoundary: "The audit proves only that the inspected working-tree candidate satisfied the legal-name source policy. Its authoritative technical state remains not_tested. Live rendering, external provider configuration, an exact approved release, canonical production verification, and a hashed final result artifact must be bound before this artifact can become green or final evidence.",
};

const jsonPayload = `${JSON.stringify(audit, null, 2)}\n`;
const markdownPayload = `# Legal Identity Audit\n\n> GENERATED FILE. DO NOT EDIT MANUALLY. Run \`npm run generate:legal-identity-audit\`.\n\n- **Legal entity:** ${LEGAL_ENTITY_NAME}\n- **Canonical public origin:** ${CANONICAL_PUBLIC_ORIGIN}\n- **Source-tree SHA-256:** \`${sourceTreeSha256}\`\n- **Files inspected:** ${sortedFiles.length}\n- **Authoritative technical result:** \`not_tested\` — unpublished candidate; not green\n- **Candidate validation:** \`satisfied_locally_non_authoritative\` (0 findings)\n- **Human review:** \`pending\` — pending is not a technical failure\n- **Assessor determination:** \`not_assessed\`\n- **Final-evidence eligible:** \`false\`\n\n## Final-release rule\n\nA technical result may become \`passed\` only after the exact commit is approved, published, deployed READY to production, verified on the canonical production endpoint, and bound to a SHA-256 final result artifact. A local or unpublished result is never green.\n\n## Scope\n\nThe public website, LMS/Academy, payment-facing source, FDACS source, database migrations, CI workflows, controlled evidence sources, and governance scripts are inspected. The Applications product workstream remains excluded at the explicit path boundary recorded in the machine-readable artifact.\n\n## Permitted product brands\n\n${permittedProductBrands.map((brand) => `- ${brand}`).join("\n")}\n\n## CMMC evidence mapping\n\nThis artifact supports configuration identification, controlled change, and evidence integrity for the systems named in the machine-readable mapping. Governing authority remains 32 CFR Part 170, CMMC Level 2 Assessment Guide v2.13 (September 2024), NIST SP 800-171 Revision 2, and NIST SP 800-171A (June 2018). Revision 3 sources remain supplemental.\n\n## Claim boundary\n\n${audit.claimBoundary}\n`;
const digestPayload = `${sha256(jsonPayload)}  LEGAL-IDENTITY-AUDIT.json\n${sha256(markdownPayload)}  LEGAL-IDENTITY-AUDIT.md\n`;

if (mode === "write") {
  fs.writeFileSync(path.join(root, outputPath), jsonPayload, "utf8");
  fs.writeFileSync(path.join(root, humanPath), markdownPayload, "utf8");
  fs.writeFileSync(path.join(root, digestPath), digestPayload, "utf8");
} else {
  for (const [file, expected] of [[outputPath, jsonPayload], [humanPath, markdownPayload], [digestPath, digestPayload]]) {
    if (!fs.existsSync(path.join(root, file))) fail(`required generated artifact is missing: ${file}`);
    if (fs.readFileSync(path.join(root, file), "utf8") !== expected) fail(`generated artifact drifted from inspected source: ${file}`);
  }
}

console.log(JSON.stringify({ gate: "legal-identity-audit-v2", authoritativeTechnicalState: "not_tested", candidateValidation: "satisfied_locally_non_authoritative", checkedFileCount: sortedFiles.length, sourceTreeSha256 }));
