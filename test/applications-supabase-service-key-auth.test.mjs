import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Applications uses modern Supabase secret keys as API keys, not invalid Bearer JWTs", async () => {
  const client = await readFile(new URL("../lib/applications-commerce.ts", import.meta.url), "utf8");

  assert.match(client, /value\.startsWith\("sb_secret_"\)/);
  assert.match(client, /legacyJwt: legacyJwtIsServiceRole\(serviceRoleKey\)/);
  assert.match(client, /apikey: config\.serviceRoleKey/);
  assert.match(client, /if \(config\.legacyJwt\) headers\.authorization = `Bearer \$\{config\.serviceRoleKey\}`/);
  assert.doesNotMatch(client, /authorization:\s*`Bearer \$\{config\.serviceRoleKey\}`/);
});
