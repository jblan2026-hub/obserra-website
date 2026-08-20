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

test("public routes are explicitly identity-independent before provider readiness checks", () => {
  const { identityProviderForRequest } = routingModule();
  for (const pathname of ["/", "/api/health", "/florida-security-training"]) {
    const ownership = identityProviderForRequest({ pathname, method: "GET" });
    assert.equal(ownership.provider, "public", pathname);
    assert.equal(ownership.requiresAuthentication, false, pathname);
  }

  const proxy = fs.readFileSync(PROXY_MODULE, "utf8");
  const publicBoundary = proxy.indexOf('if (ownership.provider === "public")');
  const clerkReadinessBoundary = proxy.indexOf("if (!authenticationReady())");

  assert.ok(publicBoundary >= 0, "proxy must handle public-owned routes explicitly");
  assert.ok(
    publicBoundary < clerkReadinessBoundary,
    "public routes must bypass Clerk readiness before any Clerk configuration failure can affect them",
  );
  assert.match(proxy, /X-Obserra-Identity-Provider", "public"/);
  assert.match(proxy, /X-Obserra-Identity-Status", "not-required"/);
});

test("protected Supabase and owner authorization boundaries remain fail closed", () => {
  const proxy = fs.readFileSync(PROXY_MODULE, "utf8");
  assert.match(proxy, /ownership\.provider === "supabase"/);
  assert.match(proxy, /!supabaseRuntime\.ready/);
  assert.match(proxy, /ownership\.accessPolicy === "internal_owner_read_only"/);
  assert.match(proxy, /authority\.emailVerified/);
  assert.match(proxy, /authority\.internalIdentityAuthorized/);
  assert.match(proxy, /identity\.assuranceLevel/);
  assert.match(proxy, /authority\.protectedReadiness\.ready/);
});
