import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const MIGRATION = "supabase/identity/migrations/20260815220000_obserra_identity_authority.sql";
const ROLLBACK_ASSERTIONS = "supabase/identity/tests/identity_authority_rollback.sql";

function source() {
  assert.ok(fs.existsSync(MIGRATION), "Identity authority must have a project-isolated migration");
  return fs.readFileSync(MIGRATION, "utf8").toLowerCase();
}

test("the Identity migration is isolated from Academy and FDACS promotion roots", () => {
  const readme = fs.readFileSync("supabase/identity/README.md", "utf8");
  assert.match(readme, /ftkjhmtfyfkartfsnkjb/);
  assert.match(readme, /do not run.*supabase db push/is);
  assert.ok(!fs.existsSync("supabase/migrations/20260815220000_obserra_identity_authority.sql"));
});

test("durable identity links are private, one-to-one, immutable, and owner-singleton", () => {
  const sql = source();
  assert.match(sql, /create schema if not exists identity_private/);
  for (const table of ["subjects", "provider_links", "authorization_audit_events"]) {
    assert.match(sql, new RegExp(`create table identity_private\\.${table}`));
    assert.match(sql, new RegExp(`alter table identity_private\\.${table} enable row level security`));
    assert.match(sql, new RegExp(`alter table identity_private\\.${table} force row level security`));
    assert.match(sql, new RegExp(`revoke all on table identity_private\\.${table} from public, anon, authenticated`));
  }
  assert.match(sql, /unique \(provider, principal_id\)/);
  assert.match(sql, /identity_subjects_single_active_owner_idx/);
  assert.match(sql, /identity_links_immutable/);
  assert.match(sql, /authorization_audit_append_only/);
});

test("current authority verifies app metadata, AAL2, durable session, and audits the decision", () => {
  const sql = source();
  assert.match(sql, /obserra_current_identity_authority/);
  assert.match(sql, /select auth\.uid\(\)/);
  assert.match(sql, /auth\.sessions/);
  assert.match(sql, /session_id/);
  assert.match(sql, /app_metadata/);
  assert.match(sql, /role_version/);
  assert.match(sql, /'aal2'/);
  assert.match(sql, /insert into identity_private\.authorization_audit_events/);
  assert.match(sql, /grant execute on function public\.obserra_current_identity_authority\(uuid\) to authenticated/);
});

test("owner activation requests reuse fresh authority and append an actor/session/correlation audit only", () => {
  const sql = source();
  assert.match(sql, /obserra_request_owner_activation/);
  assert.match(sql, /obserra_current_identity_authority\(p_correlation_id\)/);
  assert.match(sql, /owner_activation_requested/);
  assert.match(sql, /provider_subject.*principal_id.*session_id.*correlation_id/is);
  assert.match(sql, /grant execute on function public\.obserra_request_owner_activation\(uuid\) to authenticated/);
  assert.doesNotMatch(sql, /update\s+(?:public\.)?(?:florida|fdacs|license|provider)/i);
});

test("identity administration is service-only, bounded, and non-destructive", () => {
  const sql = source();
  assert.match(sql, /set local lock_timeout = '5s'/);
  assert.match(sql, /set local statement_timeout = '2min'/);
  for (const fn of ["obserra_bind_identity", "obserra_set_subject_roles", "obserra_deprovision_subject"]) {
    assert.match(sql, new RegExp(`grant execute on function public\\.${fn}`));
  }
  assert.match(sql, /to service_role/);
  assert.doesNotMatch(sql, /grant execute[^;]+to (?:public|anon)/);
  assert.doesNotMatch(sql, /\b(?:drop table|truncate table)\b/);
  assert.doesNotMatch(sql, /service_role_key|sb_secret_|eyj[a-z0-9_-]+\./);
});

test("service role can inspect authority but cannot bypass governed administration RPCs", () => {
  const sql = source();
  assert.match(sql, /revoke all on schema identity_private from public, anon, authenticated, service_role/);
  assert.match(sql, /grant usage on schema identity_private to service_role/);
  for (const table of ["subjects", "provider_links", "authorization_audit_events"]) {
    assert.match(sql, new RegExp(`revoke all on table identity_private\\.${table} from public, anon, authenticated, service_role`));
    assert.match(sql, new RegExp(`grant select on table identity_private\\.${table} to service_role`));
  }
  assert.match(sql, /revoke all on sequence identity_private\.authorization_audit_events_id_seq from public, anon, authenticated, service_role/);
  assert.doesNotMatch(sql, /grant (?:insert|update|delete|all)[^;]+identity_private\./);
  assert.match(sql, /has_schema_privilege\('service_role', 'identity_private', 'usage'\)/);
  assert.match(sql, /has_table_privilege\('service_role', 'identity_private\.subjects', 'insert,update,delete'\)/);
  assert.match(sql, /raise exception 'identity authority privilege assertion failed'/);
});

test("governed identity changes atomically update app metadata before revoking sessions", () => {
  const sql = source();
  for (const claim of ["raw_app_meta_data", "obserra_subject_id", "role_version", "roles", "identity_status"]) {
    assert.match(sql, new RegExp(claim));
  }
  const bind = sql.slice(sql.indexOf("create or replace function public.obserra_bind_identity"), sql.indexOf("create or replace function public.obserra_request_owner_activation"));
  const roles = sql.slice(sql.indexOf("create or replace function public.obserra_set_subject_roles"), sql.indexOf("create or replace function public.obserra_deprovision_subject"));
  const deprovision = sql.slice(sql.indexOf("create or replace function public.obserra_deprovision_subject"), sql.indexOf("revoke all on function public.obserra_current_identity_authority"));
  for (const fn of [bind, roles, deprovision]) {
    assert.match(fn, /update auth\.users/);
    assert.match(fn, /delete from auth\.sessions/);
    assert.ok(fn.indexOf("update auth.users") < fn.indexOf("delete from auth.sessions"));
  }
  assert.match(deprovision, /'roles', '\[\]'::jsonb/);
});

test("authoritative verified email comes from auth.users, never user metadata", () => {
  const sql = source();
  const repository = fs.readFileSync("lib/auth/authority-repository.ts", "utf8");
  const proxy = fs.readFileSync("proxy.ts", "utf8");
  assert.match(sql, /auth\.users/);
  assert.match(sql, /email_confirmed_at is not null/);
  assert.match(sql, /email_verified boolean/);
  assert.match(repository, /email_verified/);
  assert.match(repository, /emailVerified/);
  assert.match(proxy, /emailVerified:\s*authority\.emailVerified/);
});

test("post-apply SQL assertions verify effective privileges and claims ordering under rollback", () => {
  assert.ok(fs.existsSync(ROLLBACK_ASSERTIONS));
  const assertions = fs.readFileSync(ROLLBACK_ASSERTIONS, "utf8").toLowerCase();
  assert.match(assertions, /^begin;/);
  assert.match(assertions, /pg_get_functiondef/);
  assert.match(assertions, /has_table_privilege/);
  assert.match(assertions, /has_function_privilege/);
  assert.match(assertions, /update auth\.users/);
  assert.match(assertions, /delete from auth\.sessions/);
  assert.match(assertions, /rollback;\s*$/);
});
