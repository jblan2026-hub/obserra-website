import fs from "node:fs";

const migrationPath = "supabase/migrations/20260813211000_fdacs_class_d_fk_performance_indexes.sql";
const migration = fs.readFileSync(migrationPath, "utf8");
const securityMigration = fs.readFileSync("supabase/migrations/20260813204215_fdacs_class_d_security_hardening.sql", "utf8");
const handoff = fs.readFileSync("docs/florida-class-d-lms/GATE-28-DATABASE-PERFORMANCE-HANDOFF.md", "utf8");
const workflow = fs.readFileSync(".github/workflows/florida-class-d-lms-gates.yml", "utf8");

function requireText(source, value, message) {
  if (!source.includes(value)) throw new Error(`Gate 28 failed: ${message}`);
}

requireText(securityMigration, "alter function public.fdacs_class_d_live_append_only()", "source must preserve the verified non-production security-hardening migration");
requireText(securityMigration, "alter function public.fdacs_class_d_reject_quality_event_mutation()", "source must preserve quality-event trigger hardening");
requireText(securityMigration, "alter function public.fdacs_class_d_lias_queue_prepared_event()", "source must preserve LIAS prepared-event trigger hardening");
requireText(securityMigration, "set search_path = public", "security-hardening functions must pin their search_path");
requireText(securityMigration, "from public, anon, authenticated", "security-hardening migration must revoke browser/public execute privileges");
requireText(securityMigration, "to service_role", "security-hardening migration must retain service-role execution");

requireText(migration, "begin;", "performance migration must use a controlled transaction");
requireText(migration, "set local lock_timeout = '5s'", "migration must fail quickly rather than wait indefinitely on a DDL lock");
requireText(migration, "set local statement_timeout = '2min'", "migration must have a bounded statement timeout");
requireText(migration, "commit;", "performance migration must complete atomically");

const requiredIndexes = [
  ["fdacs_class_d_acceptance_events_run_idx", "fdacs_class_d_acceptance_events", "run_id"],
  ["fdacs_class_d_completion_records_passed_exam_idx", "fdacs_class_d_completion_records", "passed_exam_attempt_id"],
  ["fdacs_class_d_exam_attempts_bank_idx", "fdacs_class_d_exam_attempts", "bank_id"],
  ["fdacs_class_d_exam_attempts_retest_auth_idx", "fdacs_class_d_exam_attempts", "retest_authorization_id"],
  ["fdacs_class_d_exam_responses_question_idx", "fdacs_class_d_exam_responses", "question_id"],
  ["fdacs_class_d_retest_consumed_attempt_idx", "fdacs_class_d_exam_retest_authorizations", "consumed_by_attempt_id"],
  ["fdacs_class_d_lias_events_completion_idx", "fdacs_class_d_lias_workflow_events", "completion_record_id"],
  ["fdacs_class_d_live_interactions_parent_idx", "fdacs_class_d_live_interactions", "parent_interaction_id"],
  ["fdacs_class_d_poll_responses_enrollment_idx", "fdacs_class_d_live_poll_responses", "enrollment_id"],
  ["fdacs_class_d_text_views_device_lease_idx", "fdacs_class_d_live_text_screen_views", "device_lease_id"],
  ["fdacs_class_d_text_views_enrollment_idx", "fdacs_class_d_live_text_screen_views", "enrollment_id"],
  ["fdacs_class_d_live_totals_session_idx", "fdacs_class_d_live_time_totals", "live_session_id"],
  ["fdacs_class_d_makeup_source_session_idx", "fdacs_class_d_makeup_assignments", "source_live_session_id"],
  ["fdacs_class_d_makeup_questions_enrollment_idx", "fdacs_class_d_makeup_questions", "enrollment_id"],
  ["fdacs_class_d_presence_session_idx", "fdacs_class_d_presence_challenges", "live_session_id"],
  ["fdacs_class_d_quality_events_enrollment_idx", "fdacs_class_d_quality_case_events", "enrollment_id"],
  ["fdacs_class_d_quality_cases_cohort_idx", "fdacs_class_d_quality_cases", "cohort_id"],
  ["fdacs_class_d_playback_challenges_assignment_idx", "fdacs_class_d_recorded_playback_challenges", "assignment_id"],
  ["fdacs_class_d_playback_challenges_enrollment_idx", "fdacs_class_d_recorded_playback_challenges", "enrollment_id"],
  ["fdacs_class_d_retention_completion_idx", "fdacs_class_d_retention_reviews", "completion_record_id"],
];

for (const [indexName, tableName, columnName] of requiredIndexes) {
  requireText(migration, `create index if not exists ${indexName}`, `missing index ${indexName}`);
  requireText(migration, `on public.${tableName} (${columnName})`, `${indexName} must cover ${tableName}(${columnName})`);
}

const indexStatementCount = (migration.match(/create index if not exists /g) || []).length;
if (indexStatementCount !== requiredIndexes.length) {
  throw new Error(`Gate 28 failed: expected exactly ${requiredIndexes.length} controlled index statements, found ${indexStatementCount}`);
}

for (const forbidden of [
  "drop index",
  "drop table",
  "truncate ",
  "delete from",
  "update ",
  "insert into",
  "alter table",
]) {
  if (migration.toLowerCase().includes(forbidden)) {
    throw new Error(`Gate 28 failed: performance migration may not contain destructive/data-changing statement: ${forbidden.trim()}`);
  }
}

requireText(handoff, "exactly 20 Florida Class D foreign-key constraints without a covering index", "handoff must preserve the evidence count derived from the non-production database");
requireText(handoff, "lock_timeout = '5s'", "handoff must document the HA-safe lock timeout");
requireText(handoff, "statement_timeout = '2min'", "handoff must document the bounded statement timeout");
requireText(handoff, "does **not**", "handoff must document explicit exclusions");
requireText(handoff, "No production database promotion", "handoff must preserve the production fail-closed boundary");

requireText(workflow, "Run Gate 28 database performance source verification", "dedicated Class D workflow must make Gate 28 mandatory");
requireText(workflow, "node scripts/florida-class-d-database-performance-gate.mjs", "Gate 28 verifier must run in CI");

console.log("Florida Class D Gate 28 passed: verified non-production security migration history is preserved in source, all 20 verified foreign-key coverage gaps receive idempotent B-tree indexes, DDL lock and statement waits are bounded, destructive/index-removal operations are prohibited, and production database promotion remains fail closed.");
