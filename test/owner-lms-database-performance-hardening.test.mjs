import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const MIGRATIONS = "supabase/identity/migrations";

function hardeningSource() {
  const migration = fs
    .readdirSync(MIGRATIONS)
    .filter((name) => name.endsWith(".sql"))
    .find((name) => name.includes("connector_owner_lms_performance_hardening"));

  assert.ok(
    migration,
    "A forward migration must harden connector foreign-key indexes and owner LMS RLS performance",
  );

  return fs.readFileSync(path.join(MIGRATIONS, migration), "utf8").toLowerCase();
}

test("connector secret foreign keys are backed by explicit indexes and exposed connector tables remain explicitly deny-by-default", () => {
  const sql = hardeningSource();

  assert.match(
    sql,
    /create index if not exists connector_secrets_connector_owner_tenant_idx\s+on connector_private\.connector_secrets\s*\(connector_id, owner_user_id, tenant_key\)/,
  );
  assert.match(
    sql,
    /create index if not exists connector_secrets_owner_user_idx\s+on connector_private\.connector_secrets\s*\(owner_user_id\)/,
  );

  for (const table of [
    "integration_connectors",
    "integration_connector_health_events",
    "integration_connector_failures",
  ]) {
    assert.ok(sql.includes(`'${table}'`), `${table} must remain in the explicit deny-policy table set`);
  }

  assert.match(
    sql,
    /execute format\('drop policy if exists %i_external_deny on public\.%i', table_name, table_name\)/,
  );
  assert.match(
    sql,
    /'create policy %i_external_deny on public\.%i for all to anon, authenticated using \(false\) with check \(false\)'/,
  );
});

test("owner LMS foreign-key access paths are indexed for delete, join, and session workflows", () => {
  const sql = hardeningSource();

  for (const expected of [
    /create index if not exists owner_lms_messages_owner_user_idx\s+on public\.owner_lms_messages\s*\(owner_user_id\)/,
    /create index if not exists owner_lms_notes_session_id_idx\s+on public\.owner_lms_notes\s*\(session_id\)/,
    /create index if not exists owner_lms_participants_owner_user_idx\s+on public\.owner_lms_participants\s*\(owner_user_id\)/,
    /create index if not exists owner_lms_sessions_active_course_asset_idx\s+on public\.owner_lms_sessions\s*\(active_course_asset_id\)/,
  ]) {
    assert.match(sql, expected);
  }
});

test("owner LMS RLS policies cache auth.uid once per statement and preserve private authorization", () => {
  const sql = hardeningSource();

  for (const policy of [
    "owner_lms_course_assets_owner_all",
    "owner_lms_sessions_owner_all",
    "owner_lms_notes_owner_all",
    "owner_lms_messages_owner_all",
    "owner_lms_participants_owner_all",
  ]) {
    assert.match(sql, new RegExp(`drop policy if exists ${policy}`));
    assert.match(sql, new RegExp(`create policy ${policy}`));
  }

  const cachedAuthCalls = sql.match(/\(select auth\.uid\(\)\)/g) ?? [];
  assert.ok(cachedAuthCalls.length >= 10, "Every owner policy USING and WITH CHECK path must cache auth.uid once per statement");
  assert.doesNotMatch(sql, /owner_user_id\s*=\s*auth\.uid\(\)/);

  const privateCalls = sql.match(/owner_lms_private\.obserra_owner_lms_authorized\(\)/g) ?? [];
  assert.ok(privateCalls.length >= 10, "Every owner policy path must preserve the private authorization helper");
});
