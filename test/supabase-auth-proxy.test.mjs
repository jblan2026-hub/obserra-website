import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

test("server and proxy clients are request-local and verify claims", () => {
  const server = read("lib/supabase/server.ts");
  const proxy = read("lib/supabase/proxy.ts");
  const identity = read("lib/auth/identity.ts");

  assert.match(server, /export async function createSupabaseServerClient/);
  assert.match(server, /const cookieStore = await cookies\(\)/);
  assert.match(proxy, /export async function updateSupabaseAuthSession/);
  assert.match(proxy, /const supabase = createServerClient/);
  assert.match(proxy, /await supabase\.auth\.getClaims\(\)/);
  assert.match(identity, /await supabase\.auth\.getClaims\(\)/);
  assert.match(identity, /isMissingSupabaseAuthSession\(error\) \? "signed_out" : "claims_unavailable"/);

  for (const source of [server, proxy, identity]) {
    assert.doesNotMatch(source, /getSession\s*\(/);
    assert.doesNotMatch(source, /SERVICE_ROLE|SECRET_KEY/);
  }
});

test("proxy refresh propagates cookies and anti-cache headers", () => {
  const proxy = read("lib/supabase/proxy.ts");

  assert.match(proxy, /request\.cookies\.set\(name, value\)/);
  assert.match(proxy, /supabaseResponse\.cookies\.set\(name, value, options\)/);
  assert.match(proxy, /Object\.entries\(headers\)/);
  assert.match(proxy, /supabaseResponse\.headers\.set\(key, value\)/);
});
