import fs from "node:fs";
import {
  buildFloridaClassDMigrationManifest,
  EXPECTED_FLORIDA_CLASS_D_MIGRATIONS,
} from "./florida-class-d-migration-manifest.mjs";

const activation = fs.readFileSync("lib/florida-class-d-production-activation.ts", "utf8");
const handoff = fs.readFileSync("docs/florida-class-d-lms/GATE-29-MIGRATION-PARITY-HANDOFF.md", "utf8");
const workflow = fs.readFileSync(".github/workflows/florida-class-d-lms-gates.yml", "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(`Gate 29 failed: ${message}`);
}

const result = buildFloridaClassDMigrationManifest();
const expectedCount = 35;
const latestVersion = "20260814175000";

if (result.manifest.migrationCount !== expectedCount) {
  throw new Error(`Gate 29 failed: expected ${expectedCount} regulated migrations, found ${result.manifest.migrationCount}.`);
}
if (EXPECTED_FLORIDA_CLASS_D_MIGRATIONS.length !== expectedCount) {
  throw new Error(`Gate 29 failed: expected lineage constant must contain exactly ${expectedCount} migrations.`);
}
if (result.manifest.latestVersion !== latestVersion) {
  throw new Error(`Gate 29 failed: latest regulated migration must be ${latestVersion}, found ${result.manifest.latestVersion}.`);
}
if (!/^[0-9a-f]{64}$/.test(result.sha256)) {
  throw new Error("Gate 29 failed: deterministic migration manifest digest must be a SHA-256 hex value.");
}

const expectedDigestMatch = activation.match(/EXPECTED_FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256\s*=\s*"([0-9a-f]{64})"/i);
if (!expectedDigestMatch) {
  throw new Error("Gate 29 failed: Gate 26 must embed EXPECTED_FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256.");
}
if (expectedDigestMatch[1].toLowerCase() !== result.sha256) {
  throw new Error(`Gate 29 failed: embedded manifest digest ${expectedDigestMatch[1]} does not match generated digest ${result.sha256}.`);
}

for (const [value, message] of [
  ["EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION", "Gate 26 must define the exact latest regulated migration version"],
  [latestVersion, "Gate 26 must bind to the Gate 28 applied migration version"],
  ["OBSERRA_FDACS_DB_PROMOTION_SOURCE_SHA", "Gate 26 must require production database promotion evidence bound to a Git SHA"],
  ["OBSERRA_FDACS_DB_APPLIED_MIGRATION_VERSION", "Gate 26 must require the exact applied migration version"],
  ["OBSERRA_FDACS_DB_MIGRATION_MANIFEST_SHA256", "Gate 26 must require the exact migration manifest digest"],
  ["dbPromotionSourceSha.toLowerCase() === candidate.toLowerCase()", "database promotion source SHA must exactly match the frozen candidate"],
  ["appliedMigrationVersion === EXPECTED_FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION", "applied migration version must equal the source-controlled latest version"],
  ["migrationManifestSha256 === EXPECTED_FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256", "runtime promotion manifest digest must exactly match the source-controlled digest"],
  ["migrationManifestRequired: true", "Gate 26 policy must require the migration manifest"],
  ["databasePromotionSourceMustMatchCandidate: true", "Gate 26 policy must require database promotion source/candidate binding"],
  ["databaseAppliedMigrationVersionRequired: true", "Gate 26 policy must require the applied migration version"],
]) requireText(activation, value, message);

requireText(handoff, "exactly 35 regulated migrations", "Gate 29 handoff must preserve the controlled migration count");
requireText(handoff, latestVersion, "Gate 29 handoff must preserve the latest regulated migration version");
requireText(handoff, "deterministic SHA-256 promotion manifest", "Gate 29 handoff must document deterministic promotion evidence");
requireText(handoff, "No production migration is executed by Gate 29 CI", "Gate 29 handoff must preserve the production fail-closed database boundary");

for (const value of [
  "Generate Gate 29 regulated migration manifest",
  "Run Gate 29 migration parity and promotion-manifest verification",
  "Upload Gate 29 migration manifest evidence",
  "node scripts/florida-class-d-migration-manifest.mjs --write",
  "node scripts/florida-class-d-migration-parity-gate.mjs",
]) requireText(workflow, value, `dedicated Class D workflow is missing Gate 29 control: ${value}`);

console.log(`Florida Class D Gate 29 passed: exact ${expectedCount}-migration lineage, latest version ${latestVersion}, deterministic manifest SHA-256 ${result.sha256}, candidate-bound database promotion evidence, and mandatory CI artifact retention are validated in source.`);
