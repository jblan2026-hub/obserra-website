import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const ROUTING_MODULE = "lib/auth/provider-routing.ts";

function routingModule() {
  const output = ts.transpileModule(fs.readFileSync(ROUTING_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, URL, Set, Map });
  return module.exports;
}

test("private AI Marketplace APIs that call Clerk auth are Clerk-owned", () => {
  const { identityProviderForRequest } = routingModule();

  for (const [pathname, method] of [
    ["/api/ai-marketplace/access", "GET"],
    ["/api/ai-marketplace/checkout", "POST"],
    ["/api/ai-marketplace/download", "GET"],
    ["/api/ai-marketplace/install-grant", "POST"],
    ["/ai-marketplace/hangar", "GET"],
  ]) {
    const ownership = identityProviderForRequest({ pathname, method });
    assert.equal(ownership.provider, "clerk", `${method} ${pathname}`);
    assert.equal(ownership.requiresAuthentication, true, `${method} ${pathname}`);
    assert.equal(ownership.accessPolicy, "applications_clerk", `${method} ${pathname}`);
  }
});

test("public AI Marketplace discovery APIs remain public", () => {
  const { identityProviderForRequest } = routingModule();

  for (const pathname of [
    "/api/ai-marketplace/commerce-health",
    "/api/ai-marketplace/facets",
    "/api/ai-marketplace/scene",
    "/api/ai-marketplace/search",
  ]) {
    const ownership = identityProviderForRequest({ pathname, method: "GET" });
    assert.equal(ownership.provider, "public", pathname);
    assert.equal(ownership.requiresAuthentication, false, pathname);
    assert.equal(ownership.accessPolicy, "public", pathname);
  }
});
