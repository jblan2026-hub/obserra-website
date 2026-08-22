import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const REQUIRED_OPERATIONS = [
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

test("Academy Vercel production persistence uses workload identity instead of a database admin secret", async () => {
  const client = await read("lib/academy-persistence.ts");

  assert.match(client, /EXPECTED_ACADEMY_SUPABASE_ORIGIN = "https:\/\/nwxnyqlyzyufgoadtqxs\.supabase\.co"/);
  assert.match(client, /process\.env\.VERCEL_OIDC_TOKEN/);
  assert.match(client, /process\.env\.VERCEL === "1" && process\.env\.VERCEL_ENV === "production"/);
  assert.match(client, /if \(vercelProduction\) \{[\s\S]*mode: "workload"[\s\S]*oidcToken/s);
  assert.doesNotMatch(client, /if \(vercelProduction\) \{[\s\S]*mode: "direct"/s);
  assert.match(client, /\/functions\/v1\/academy-persistence-gateway/);
  assert.match(client, /requestBody = \{ operation: name, body \}/);
  assert.match(client, /authorization = `Bearer \$\{config\.oidcToken\}`/);
});

test("Academy self-hosted direct mode treats modern Supabase secret keys as API keys, not JWTs", async () => {
  const client = await read("lib/academy-persistence.ts");

  assert.match(client, /value\.startsWith\("sb_secret_"\)/);
  assert.match(client, /directHeaders\.apikey = config\.serviceRoleKey/);
  assert.match(client, /if \(config\.legacyJwt\) directHeaders\.authorization = `Bearer \$\{config\.serviceRoleKey\}`/);
  assert.doesNotMatch(client, /authorization:\s*`Bearer \$\{config\.serviceRoleKey\}`/);
});

test("Academy gateway binds the exact Vercel production workload and rejects generic project identity", async () => {
  const gateway = await read("supabase/functions/academy-persistence-gateway/index.ts");
  const config = await read("supabase/config.toml");

  assert.match(gateway, /ISSUER = "https:\/\/oidc\.vercel\.com\/obserra"/);
  assert.match(gateway, /AUDIENCE = "https:\/\/vercel\.com\/obserra"/);
  assert.match(gateway, /SUBJECT = "owner:obserra:project:obserra-website-live:environment:production"/);
  assert.match(gateway, /OWNER_ID = "team_xpUE1GefY2JHuFFCqbAdnZAj"/);
  assert.match(gateway, /PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC"/);
  assert.match(gateway, /algorithms: \["RS256"\]/);
  assert.match(gateway, /payload\.environment !== "production"/);
  assert.match(gateway, /MAX_TOKEN_AGE_SECONDS/);
  assert.match(gateway, /MAX_BODY_BYTES = 64 \* 1024/);
  assert.match(gateway, /if \(!ALLOWED_OPERATIONS\.has\(operation\)/);
  assert.doesNotMatch(gateway, /Access-Control-Allow-Origin/i);
  assert.doesNotMatch(gateway, /anon[_ -]?key/i);
  assert.match(config, /\[functions\.academy-persistence-gateway\][\s\S]*verify_jwt = false/);
});

test("Academy client RPC surface and gateway allowlist remain synchronized", async () => {
  const client = await read("lib/academy-persistence.ts");
  const gateway = await read("supabase/functions/academy-persistence-gateway/index.ts");

  for (const operation of REQUIRED_OPERATIONS) {
    assert.match(client, new RegExp(`"${operation}"`), `client must use ${operation}`);
    assert.match(gateway, new RegExp(`"${operation}"`), `gateway must allow ${operation}`);
  }

  const gatewayOperations = [...gateway.matchAll(/"(academy_[a-z0-9_]+)"/g)].map((match) => match[1]);
  const uniqueGatewayOperations = [...new Set(gatewayOperations)].filter((name) => REQUIRED_OPERATIONS.includes(name));
  assert.deepEqual(uniqueGatewayOperations.sort(), [...REQUIRED_OPERATIONS].sort());
});
