import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const MIGRATIONS_DIR = path.join(ROOT, "supabase", "migrations");

export const EXPECTED_FLORIDA_CLASS_D_MIGRATIONS = [
  "20260813033000_fdacs_class_d_regulated_records.sql",
  "20260813040000_fdacs_class_d_enrollment_workflow.sql",
  "20260813043000_fdacs_class_d_live_classroom.sql",
  "20260813044000_fdacs_class_d_daily_attendance_reconciliation.sql",
  "20260813045000_fdacs_class_d_observer_access.sql",
  "20260813050000_fdacs_class_d_cohort_scheduling.sql",
  "20260813051000_fdacs_class_d_live_polls.sql",
  "20260813052000_fdacs_class_d_makeup_records.sql",
  "20260813052100_fdacs_class_d_makeup_access.sql",
  "20260813052200_fdacs_class_d_makeup_constraints.sql",
  "20260813052400_fdacs_class_d_makeup_certification.sql",
  "20260813052500_fdacs_class_d_makeup_security.sql",
  "20260813053000_fdacs_class_d_recorded_makeup_playback.sql",
  "20260813060000_fdacs_class_d_final_exam.sql",
  "20260813061000_fdacs_class_d_exam_bank_admin.sql",
  "20260813064500_fdacs_class_d_exam_monitoring.sql",
  "20260813070000_fdacs_class_d_exam_retest_governance.sql",
  "20260813073000_fdacs_class_d_completion_review.sql",
  "20260813074500_fdacs_class_d_lias_workflow.sql",
  "20260813075000_fdacs_class_d_completion_documents.sql",
  "20260813075100_fdacs_class_d_lias_document_hardening.sql",
  "20260813080000_fdacs_class_d_auto_completion_certificate.sql",
  "20260813083000_fdacs_class_d_quality_retention.sql",
  "20260813090000_fdacs_class_d_nonproduction_acceptance.sql",
  "20260813105000_fdacs_class_d_acceptance_event_permissions.sql",
  "20260813110000_fdacs_class_d_text_screen_timing.sql",
  "20260813111000_fdacs_class_d_text_screen_completion_guard.sql",
  "20260813204215_fdacs_class_d_security_hardening.sql",
  "20260814011203_fdacs_class_d_fk_performance_indexes.sql",
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function regulatedMigrationFiles() {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter((name) => /^\d{14}_fdacs_class_d_[a-z0-9_]+\.sql$/.test(name))
    .sort();
}

function assertExactLineage(actual) {
  const expected = [...EXPECTED_FLORIDA_CLASS_D_MIGRATIONS];
  if (actual.length !== expected.length) {
    throw new Error(`Expected ${expected.length} regulated Class D migrations, found ${actual.length}.`);
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) {
      throw new Error(`Migration lineage mismatch at position ${index + 1}: expected ${expected[index]}, found ${actual[index] ?? "missing"}.`);
    }
  }
}

export function buildFloridaClassDMigrationManifest() {
  const files = regulatedMigrationFiles();
  assertExactLineage(files);

  const migrations = files.map((filename) => {
    const absolutePath = path.join(MIGRATIONS_DIR, filename);
    const bytes = fs.readFileSync(absolutePath);
    const [version, ...nameParts] = filename.replace(/\.sql$/, "").split("_");
    return {
      version,
      name: nameParts.join("_"),
      path: `supabase/migrations/${filename}`,
      sha256: sha256(bytes),
    };
  });

  const manifest = {
    schema: "obserra.fdacs.class-d.migration-manifest.v1",
    migrationCount: migrations.length,
    firstVersion: migrations[0].version,
    latestVersion: migrations[migrations.length - 1].version,
    migrations,
  };
  const canonicalJson = JSON.stringify(manifest);
  return {
    manifest,
    canonicalJson,
    sha256: sha256(Buffer.from(canonicalJson, "utf8")),
  };
}

function writeManifest(outputPath, result) {
  const target = path.resolve(ROOT, outputPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify({ ...result.manifest, manifestSha256: result.sha256 }, null, 2)}\n`, "utf8");
}

function main() {
  const result = buildFloridaClassDMigrationManifest();
  const writeIndex = process.argv.indexOf("--write");
  if (writeIndex >= 0) {
    const outputPath = process.argv[writeIndex + 1];
    if (!outputPath) throw new Error("--write requires an output path.");
    writeManifest(outputPath, result);
  }
  console.log(`FLORIDA_CLASS_D_MIGRATION_COUNT=${result.manifest.migrationCount}`);
  console.log(`FLORIDA_CLASS_D_LATEST_MIGRATION_VERSION=${result.manifest.latestVersion}`);
  console.log(`FLORIDA_CLASS_D_MIGRATION_MANIFEST_SHA256=${result.sha256}`);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) main();
