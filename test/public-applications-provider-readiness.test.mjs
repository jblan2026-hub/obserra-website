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

test("Applications commerce health is public only for exact read methods and keeps all other operations Clerk-owned", () => {
  const { identityProviderForRequest } = routingModule();

  for (const method of ["GET", "HEAD"]) {
    const ownership = identityProviderForRequest({ pathname: "/api/apps/commerce-health", method });
    assert.equal(ownership.provider, "public", method);
    assert.equal(ownership.requiresAuthentication, false, method);
    assert.equal(ownership.accessPolicy, "public", method);
  }

  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const ownership = identityProviderForRequest({ pathname: "/api/apps/commerce-health", method });
    assert.equal(ownership.provider, "clerk", method);
    assert.equal(ownership.requiresAuthentication, true, method);
    assert.equal(ownership.accessPolicy, "applications_clerk", method);
  }

  for (const pathname of ["/api/apps/commerce-health/", "/api/apps/commerce-health/extra"]) {
    const ownership = identityProviderForRequest({ pathname, method: "GET" });
    assert.equal(ownership.provider, "clerk", pathname);
    assert.equal(ownership.requiresAuthentication, true, pathname);
  }

  const healthRoute = fs.readFileSync("app/api/apps/commerce-health/route.ts", "utf8");
  assert.match(healthRoute, /contract:\s*"applications-commerce-health-v1"/);
  assert.match(healthRoute, /catch\s*\{\s*return NextResponse\.json\(\{\s*contract:\s*"applications-commerce-health-v1"/s);
  assert.match(healthRoute, /"cache-control":\s*"no-store"/);
});
