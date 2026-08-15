import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const APPLIED_MIGRATION = "supabase/identity/migrations/20260815220000_obserra_identity_authority.sql";
const FORWARD_MIGRATION = "supabase/identity/migrations/20260815233000_identity_provider_subject_fk_index.sql";
const REHEARSAL = "supabase/identity/tests/identity_provider_subject_index_rollback.sql";
const APPLIED_HASH = "6c27f61ddd2f86f886cd68fa01dff74e31fee1e25e5136ce748b4ef78337e976";

function read(path) {
  assert.ok(fs.existsSync(path), `${path} must exist`);
  return fs.readFileSync(path, "utf8").toLowerCase();
}

test("the applied authority migration remains byte-for-byte frozen", () => {
  const digest = crypto.createHash("sha256").update(fs.readFileSync(APPLIED_MIGRATION)).digest("hex");
  assert.equal(digest, APPLIED_HASH);
});

test("a bounded forward migration indexes the provider subject foreign key exactly", () => {
  const sql = read(FORWARD_MIGRATION);
  assert.match(sql, /^begin;/);
  assert.match(sql, /set local lock_timeout = '5s'/);
  assert.match(sql, /set local statement_timeout = '2min'/);
  assert.match(sql, /create index identity_provider_links_provider_subject_idx\s+on identity_private\.provider_links using btree \(provider_subject\)/s);
  assert.match(sql, /pg_catalog\.pg_index/);
  assert.match(sql, /indisvalid/);
  assert.match(sql, /raise exception 'identity provider subject index assertion failed'/);
  assert.match(sql, /commit;\s*$/);
  assert.doesNotMatch(sql, /(?:insert|update|delete|truncate|drop|alter table|create table|create function|grant|revoke)\s/i);
});

test("rollback rehearsal uses the exact index and advisor warnings are dispositioned", () => {
  const rehearsal = read(REHEARSAL);
  const readme = read("supabase/identity/README.md");
  assert.match(rehearsal, /^begin;/);
  assert.match(rehearsal, /identity_provider_links_provider_subject_idx/);
  assert.match(rehearsal, /rollback;\s*$/);
  assert.match(readme, /0001_unindexed_foreign_keys/);
  assert.match(readme, /0029_authenticated_security_definer_function_executable/);
  assert.match(readme, /intentional per-user privileged operation/);
  assert.match(readme, /do not rewrite.*20260815220000_obserra_identity_authority\.sql/s);
});
