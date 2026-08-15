import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadPureModule(path) {
  assert.ok(fs.existsSync(path), `${path} must exist before identity origins or cookies are production-wired`);
  const output = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, URL, Set, atob });
  return module.exports;
}

test("identity CSP uses exact configured Clerk and Supabase origins without a Supabase wildcard", () => {
  const { prepareIdentityOriginContract } = loadPureModule("lib/auth/identity-origin-contract.ts");
  const clerkPublishableKey = `pk_live_${Buffer.from("clerk.obserrallc.com$").toString("base64url")}`;
  const contract = prepareIdentityOriginContract({
    OBSERRA_IDENTITY_RUNTIME_ENABLED: "true",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKey,
    OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED: "true",
    NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL: "https://ftkjhmtfyfkartfsnkjb.supabase.co",
    OBSERRA_AUTH_SUPABASE_PROJECT_REF: "ftkjhmtfyfkartfsnkjb",
  });

  assert.equal(contract.ready, true);
  assert.deepEqual([...contract.scriptSources], ["https://clerk.obserrallc.com"]);
  assert.deepEqual([...contract.connectSources], [
    "https://clerk.obserrallc.com",
    "https://ftkjhmtfyfkartfsnkjb.supabase.co",
  ]);
  assert.ok(!contract.connectSources.some((origin) => origin.includes("*.supabase.co")));
});

test("identity CSP origin preparation rejects a mismatched project or non-origin URL", () => {
  const { prepareIdentityOriginContract } = loadPureModule("lib/auth/identity-origin-contract.ts");
  const mismatch = prepareIdentityOriginContract({
    OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED: "true",
    NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL: "https://differentprojectref.supabase.co/path",
    OBSERRA_AUTH_SUPABASE_PROJECT_REF: "ftkjhmtfyfkartfsnkjb",
  });

  assert.equal(mismatch.ready, false);
  assert.ok(mismatch.reasonCodes.includes("supabase_origin_invalid"));
});

test("Next CSP consumes the exact identity-origin contract", () => {
  const nextConfig = fs.readFileSync("next.config.ts", "utf8");
  assert.match(nextConfig, /prepareIdentityOriginContract/);
  assert.match(nextConfig, /identityOrigins\.scriptSources/);
  assert.match(nextConfig, /identityOrigins\.connectSources/);
  assert.doesNotMatch(nextConfig, /https:\/\/\*\.supabase\.co/);
});

test("Supabase Auth cookies are explicitly project-namespaced, secure, and host-only", () => {
  const { supabaseAuthCookieOptions } = loadPureModule("lib/auth/cookie-contract.ts");
  const options = supabaseAuthCookieOptions({
    projectRef: "ftkjhmtfyfkartfsnkjb",
    production: true,
  });

  assert.equal(options.name, "sb-obserra-auth-ftkjhmtfyfkartfsnkjb");
  assert.equal(options.path, "/");
  assert.equal(options.sameSite, "lax");
  assert.equal(options.secure, true);
  assert.equal(options.httpOnly, false);
  assert.equal(options.domain, undefined);
  assert.ok(!["__session", "__client_uat"].includes(options.name));
});

test("browser, server, and proxy clients share the explicit cookie contract", () => {
  for (const path of ["lib/supabase/client.ts", "lib/supabase/server.ts", "lib/supabase/proxy.ts"]) {
    const source = fs.readFileSync(path, "utf8");
    assert.match(source, /supabaseAuthCookieOptions/, path);
    assert.match(source, /cookieOptions\s*:/, path);
  }
});
