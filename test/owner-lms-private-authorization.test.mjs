import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const MIGRATIONS = "supabase/identity/migrations";

function remediationSource() {
  const migration = fs
    .readdirSync(MIGRATIONS)
    .filter((name) => name.endsWith(".sql"))
    .find((name) => name.includes("owner_lms_private_authorization"));

  assert.ok(
    migration,
    "Owner LMS authorization must have a forward migration that removes the SECURITY DEFINER helper from the exposed public schema",
  );

  return fs.readFileSync(path.join(MIGRATIONS, migration), "utf8").toLowerCase();
}

test("owner LMS privileged authorization executes from an unexposed private schema", () => {
  const sql = remediationSource();

  assert.match(sql, /create schema if not exists owner_lms_private/);
  assert.match(sql, /create or replace function owner_lms_private\.obserra_owner_lms_authorized\(\)/);
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = ''/);
  assert.match(sql, /grant usage on schema owner_lms_private to authenticated/);
  assert.match(sql, /grant execute on function owner_lms_private\.obserra_owner_lms_authorized\(\) to authenticated/);
  assert.match(sql, /drop function public\.obserra_owner_lms_authorized\(\)/);
  assert.doesNotMatch(sql, /create or replace function public\.obserra_owner_lms_authorized\(\)/);
});

test("every owner LMS table and storage policy is rewired to the private authorization helper", () => {
  const sql = remediationSource();

  for (const policy of [
    "owner_lms_course_assets_owner_all",
    "owner_lms_sessions_owner_all",
    "owner_lms_notes_owner_all",
    "owner_lms_messages_owner_all",
    "owner_lms_participants_owner_all",
    "owner_lms_storage_select",
    "owner_lms_storage_insert",
    "owner_lms_storage_update",
    "owner_lms_storage_delete",
  ]) {
    assert.match(sql, new RegExp(`drop policy if exists ${policy}`));
    assert.match(sql, new RegExp(`create policy ${policy}`));
  }

  const privateCalls = sql.match(/owner_lms_private\.obserra_owner_lms_authorized\(\)/g) ?? [];
  assert.ok(privateCalls.length >= 10, "All USING and WITH CHECK paths must call the private helper");

  const policyStart = sql.indexOf("drop policy if exists owner_lms_course_assets_owner_all");
  const publicHelperDrop = sql.indexOf("drop function public.obserra_owner_lms_authorized()");
  assert.ok(policyStart >= 0 && publicHelperDrop > policyStart, "Policy rewiring must complete before the public helper is dropped");

  const policySql = sql.slice(policyStart, publicHelperDrop);
  assert.doesNotMatch(policySql, /\bpublic\.obserra_owner_lms_authorized\(\)/);
});
