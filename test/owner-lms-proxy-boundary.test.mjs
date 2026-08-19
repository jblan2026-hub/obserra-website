import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const ROUTING_MODULE = "lib/auth/provider-routing.ts";
const PROXY_MODULE = "proxy.ts";

function routingModule() {
  const output = ts.transpileModule(fs.readFileSync(ROUTING_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, URL, Set, Map });
  return module.exports;
}

test("owner validation LMS and APIs are owner AAL2 controlled at the first routing boundary", () => {
  const { identityProviderForRequest } = routingModule();
  for (const [pathname, method] of [
    ["/florida-security-training/owner-validation", "GET"],
    ["/florida-security-training/owner-validation/lms", "GET"],
    ["/florida-security-training/owner-validation/lms/learner/learner_1", "GET"],
    ["/api/florida-class-d/owner-validation/identity", "POST"],
    ["/api/florida-class-d/owner-validation/daily", "POST"],
    ["/api/florida-class-d/owner-validation/courseware", "POST"],
  ]) {
    const ownership = identityProviderForRequest({ pathname, method });
    assert.equal(ownership.provider, "supabase", pathname);
    assert.equal(ownership.requiresAuthentication, true, pathname);
    assert.equal(ownership.accessPolicy, "internal_owner_aal2", pathname);
  }
});

test("proxy enforces fresh owner authority and AAL2 for owner controlled routes", () => {
  const proxy = fs.readFileSync(PROXY_MODULE, "utf8");
  assert.match(proxy, /ownership\.accessPolicy === "internal_owner_aal2"/);
  assert.match(proxy, /authority\.internalIdentityAuthorized/);
  assert.match(proxy, /authority\.emailVerified/);
  assert.match(proxy, /authority\.protectedReadiness\.ready/);
  assert.match(proxy, /identity\.roles\.includes\("owner"\)/);
  assert.match(proxy, /identity\.assuranceLevel !== "aal2"/);
});

test("Supabase owned routes fail closed when Supabase auth is disabled or not ready", () => {
  const proxy = fs.readFileSync(PROXY_MODULE, "utf8");
  assert.match(proxy, /if \(ownership\.provider === "supabase"\)/);
  assert.match(proxy, /!supabaseRuntime\.runtimeEnabled \|\| !supabaseRuntime\.ready/);
});

test("public routes bypass identity provider readiness and are explicitly marked not required", () => {
  const proxy = fs.readFileSync(PROXY_MODULE, "utf8");
  assert.match(proxy, /if \(ownership\.provider === "public"\)/);
  assert.match(proxy, /X-Obserra-Identity-Status", "not-required"/);
  assert.match(proxy, /X-Obserra-Identity-Provider", "public"/);
});
