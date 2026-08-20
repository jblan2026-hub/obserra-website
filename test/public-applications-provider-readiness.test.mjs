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

test("Applications storefront routes are public while protected Applications operations remain Clerk-owned", () => {
  const { identityProviderForRequest } = routingModule();

  for (const pathname of [
    "/apps",
    "/apps/obserra-eios",
    "/apps/obserra-eios/subscribe",
  ]) {
    const ownership = identityProviderForRequest({ pathname, method: "GET" });
    assert.equal(ownership.provider, "public", pathname);
    assert.equal(ownership.requiresAuthentication, false, pathname);
    assert.equal(ownership.accessPolicy, "public", pathname);
  }

  for (const pathname of [
    "/api/apps",
    "/api/apps/access",
    "/api/apps/billing-portal",
    "/api/apps/checkout",
    "/api/apps/download",
    "/api/apps/license",
    "/portal/applications",
    "/portal/enterprise",
    "/portal/licenses",
    "/portal/orders",
    "/portal/success",
  ]) {
    const ownership = identityProviderForRequest({ pathname, method: "GET" });
    assert.equal(ownership.provider, "clerk", pathname);
    assert.equal(ownership.requiresAuthentication, true, pathname);
    assert.equal(ownership.accessPolicy, "applications_clerk", pathname);
  }
});
