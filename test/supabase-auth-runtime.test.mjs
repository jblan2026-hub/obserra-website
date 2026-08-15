import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

function runtimeModule() {
  const source = read("lib/auth/runtime-config.ts");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, process: { env: {} }, URL });
  return module.exports;
}

test("Supabase Auth runtime is explicit, project-bound, and disabled by default", () => {
  const runtime = read("lib/auth/runtime-config.ts");
  const browserClient = read("lib/supabase/client.ts");
  const environment = read(".env.example");

  assert.match(runtime, /OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED/);
  assert.match(runtime, /NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL/);
  assert.match(runtime, /NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(runtime, /OBSERRA_AUTH_SUPABASE_PROJECT_REF/);
  assert.match(runtime, /url_project_mismatch/);
  assert.match(runtime, /runtimeEnabled && reasonCodes\.length === 0/);
  assert.doesNotMatch(runtime, /SERVICE_ROLE|SECRET_KEY/);

  assert.match(environment, /OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED=false/);
  assert.match(environment, /NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL=/);
  assert.match(environment, /NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY=/);
  assert.match(environment, /OBSERRA_AUTH_SUPABASE_PROJECT_REF=/);
  assert.doesNotMatch(environment, /NEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE_ROLE|SECRET_KEY)/);
  assert.doesNotMatch(runtime, /OBSERRA_(?:ACADEMY|FDACS)_SUPABASE/);
  assert.doesNotMatch(runtime, /environment\.NEXT_PUBLIC_SUPABASE_(?:URL|PUBLISHABLE_KEY)/);
  assert.match(browserClient, /!runtime\.ready \|\| !runtime\.url \|\| !runtime\.publishableKey/);
  assert.doesNotMatch(browserClient, /process\.env/);
});

test("live Clerk configuration cannot activate the Supabase runtime", () => {
  const { prepareSupabaseAuthRuntime } = runtimeModule();
  const supabaseConfig = {
    OBSERRA_IDENTITY_RUNTIME_ENABLED: "true",
    NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
    NEXT_PUBLIC_OBSERRA_AUTH_SUPABASE_PUBLISHABLE_KEY:
      "sb_publishable_0123456789abcdefghijklmnop",
    OBSERRA_AUTH_SUPABASE_PROJECT_REF: "abcdefghijklmnopqrst",
  };

  const inert = prepareSupabaseAuthRuntime(supabaseConfig);
  assert.equal(inert.ready, false);
  assert.equal(inert.runtimeEnabled, false);
  assert.deepEqual([...inert.reasonCodes], ["runtime_disabled"]);

  const explicitlyEnabled = prepareSupabaseAuthRuntime({
    ...supabaseConfig,
    OBSERRA_SUPABASE_AUTH_RUNTIME_ENABLED: "true",
  });
  assert.equal(explicitlyEnabled.ready, true);
});

test("Supabase packages are pinned to the reviewed versions", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(packageJson.dependencies?.["@supabase/ssr"], "0.12.4");
  assert.equal(packageJson.dependencies?.["@supabase/supabase-js"], "2.112.3");
});
