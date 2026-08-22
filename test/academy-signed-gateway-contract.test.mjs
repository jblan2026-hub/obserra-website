import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const expectedOperations = [
  "academy_storage_health",
  "academy_aggregate_metrics",
  "academy_get_learner_state",
  "academy_reserve_checkout_attempt",
  "academy_bind_checkout_attempt",
  "academy_record_checkout_session",
  "academy_record_paid_checkout",
  "academy_record_payment_reversal",
  "academy_claim_paid_checkout",
  "academy_import_legacy_state",
  "academy_complete_lesson",
  "academy_record_assessment",
  "academy_find_certificate",
];

test("Academy persistence prefers the signed gateway and fails closed on malformed gateway configuration", async () => {
  const source = await read("lib/academy-persistence.ts");

  assert.match(source, /OBSERRA_ACADEMY_GATEWAY_URL/);
  assert.match(source, /OBSERRA_ACADEMY_GATEWAY_PRIVATE_KEY_B64/);
  assert.match(source, /OBSERRA_ACADEMY_SUPABASE_URL/);
  assert.match(source, /academy-gateway-v1/);
  assert.match(source, /ACADEMY_GATEWAY_PATH = "\/functions\/v1\/academy-internal-rpc"/);
  assert.match(source, /gatewayUrl\.origin !== supabaseUrl\.origin/);
  assert.equal(
    source.includes('gatewayUrl.pathname.replace(/\\/$/, "") !== ACADEMY_GATEWAY_PATH'),
    true,
  );
  assert.doesNotMatch(source, /supabase\.co/);
  assert.match(source, /asymmetricKeyType !== "ed25519"/);
  assert.match(source, /if \(academyGatewayRequested\(\)\) return gatewayRpc/);
  assert.match(source, /if \(academyGatewayRequested\(\)\) academyGatewayConfig\(\)/);
  assert.match(source, /x-obserra-academy-gateway"\) !== "verified"/);
  assert.doesNotMatch(source, /x-obserra-signature["']:\s*config\.serviceRoleKey/);
});

test("Academy signed request canonicalization uses a fresh nonce and SHA-256 body binding", async () => {
  const source = await read("lib/academy-persistence.ts");

  assert.match(source, /randomUUID\(\)/);
  assert.match(source, /createHash\("sha256"\)\.update\(requestBody\)\.digest\("hex"\)/);
  assert.match(source, /const canonical = `\$\{timestamp\}\\n\$\{nonce\}\\n\$\{name\}\\n\$\{bodyDigest\}`/);
  assert.match(source, /sign\(null, Buffer\.from\(canonical, "utf8"\), config\.privateKey\)\.toString\("base64url"\)/);
  for (const header of [
    "x-obserra-key-id",
    "x-obserra-timestamp",
    "x-obserra-nonce",
    "x-obserra-signature",
  ]) assert.match(source, new RegExp(header));

  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const timestamp = "1787413000";
  const nonce = "ef8ec44d-4f30-4a3e-a123-87ff4ed9a377";
  const operation = "academy_storage_health";
  const requestBody = JSON.stringify({ operation, payload: {} });
  const digest = createHash("sha256").update(requestBody).digest("hex");
  const canonical = `${timestamp}\n${nonce}\n${operation}\n${digest}`;
  const signature = sign(null, Buffer.from(canonical, "utf8"), privateKey);
  assert.equal(verify(null, Buffer.from(canonical, "utf8"), publicKey, signature), true);
  assert.equal(verify(null, Buffer.from(`${canonical}x`, "utf8"), publicKey, signature), false);
});

test("Supabase Academy gateway exposes only the governed RPC allowlist and anti-replay controls", async () => {
  const source = await read("supabase/functions/academy-internal-rpc/index.ts");

  for (const operation of expectedOperations) assert.match(source, new RegExp(`"${operation}"`));
  assert.match(source, /ALLOWED_OPERATIONS\.has\(parsed\.operation\)/);
  assert.match(source, /MAX_CLOCK_SKEW_SECONDS = 90/);
  assert.match(source, /MAX_BODY_BYTES = 65_536/);
  assert.match(source, /academy_internal_gateway_nonces/);
  assert.match(source, /return claimNonce\(keyId, nonce, timestampSeconds\)/);
  assert.match(source, /x-obserra-academy-gateway": "verified"/);
  assert.doesNotMatch(source, /\/rest\/v1\/rpc\/\$\{request|req\.url|parsed\.path/);
});

test("Academy gateway database boundary is forced-RLS and browser-deny by default", async () => {
  const migration = await read("supabase/migrations/20260822152700_academy_internal_gateway_auth.sql");

  for (const table of ["academy_internal_gateway_keys", "academy_internal_gateway_nonces"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(migration, new RegExp(`alter table public\\.${table} force row level security`, "i"));
    assert.match(migration, new RegExp(`revoke all on table public\\.${table} from anon, authenticated`, "i"));
  }
  assert.match(migration, /unique index if not exists academy_internal_gateway_one_active_key/i);
  assert.match(migration, /primary key \(key_id, nonce\)/i);
});

test("Academy internal gateway is explicitly custom-authenticated in Supabase config", async () => {
  const config = await read("supabase/config.toml");
  assert.match(config, /\[functions\.academy-internal-rpc\]\s*\nverify_jwt = false/);
});
