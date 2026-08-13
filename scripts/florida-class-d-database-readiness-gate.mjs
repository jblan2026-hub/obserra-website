import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationDir = path.join(root, "supabase", "migrations");
const handoffPath = path.join(root, "docs", "florida-class-d-lms", "GATE-21-DATABASE-PROMOTION-READINESS-HANDOFF.md");

const migrationFiles = fs.readdirSync(migrationDir)
  .filter((name) => name.endsWith(".sql") && name.includes("fdacs_class_d"))
  .sort();

if (migrationFiles.length < 20) throw new Error("Gate 21 failed: expected the complete regulated Florida Class D migration inventory.");

const prefixes = migrationFiles.map((name) => name.split("_")[0]);
if (new Set(prefixes).size !== prefixes.length) throw new Error("Gate 21 failed: duplicate migration timestamp prefixes detected.");

for (let i = 1; i < migrationFiles.length; i += 1) {
  if (migrationFiles[i - 1] >= migrationFiles[i]) throw new Error("Gate 21 failed: migration order is not deterministic.");
}

const migrationSource = migrationFiles.map((name) => fs.readFileSync(path.join(migrationDir, name), "utf8")).join("\n");
const handoff = fs.readFileSync(handoffPath, "utf8");

const requireText = (source, value, message) => {
  if (!source.includes(value)) throw new Error(`Gate 21 failed: ${message}`);
};

requireText(migrationSource, "enable row level security", "regulated schema must contain RLS enablement controls");
requireText(migrationSource, "force row level security", "regulated schema must contain forced RLS controls");
requireText(migrationSource, "revoke all on table", "regulated schema must contain direct browser-access revocations");
requireText(migrationSource, "security definer", "regulated transactional RPC boundaries must remain present");
requireText(handoff, "does **not** apply migrations to production", "Gate 21 must remain readiness-only and non-deploying");
requireText(handoff, "backup or verified recovery point", "promotion standard must require backup/recovery evidence");
requireText(handoff, "feature flags remain disabled", "regulated runtime flags must stay disabled during migration verification");
requireText(handoff, "forward compensating migration", "non-destructive compensating change must be preferred where rollback risks regulated evidence");
requireText(handoff, "No production migration is executed", "Gate 21 must explicitly prohibit production execution from this source gate");
requireText(handoff, "no certificate can be generated for hours alone", "post-migration verification must preserve the passing-exam certificate boundary");

console.log(`Florida Class D Gate 21 passed: ${migrationFiles.length} regulated migrations are deterministically inventoried and the controlled backup, preflight, verification, rollback, evidence, and fail-closed promotion standard is present without executing production changes.`);
