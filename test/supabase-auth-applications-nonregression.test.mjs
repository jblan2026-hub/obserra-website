import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function routingModule() {
  const modulePath = "lib/auth/provider-routing.ts";
  assert.ok(fs.existsSync(modulePath), `${modulePath} must reserve every Applications path for Clerk`);
  const output = ts.transpileModule(fs.readFileSync(modulePath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, URL, Set });
  return module.exports;
}

test("Applications retain Clerk runtime without a frozen source digest", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const layout = fs.readFileSync("app/layout.tsx", "utf8");
  const detail = fs.readFileSync("app/apps/[slug]/page.tsx", "utf8");

  assert.ok(packageJson.dependencies?.["@clerk/nextjs"]);
  assert.match(layout, /<ClerkProvider/);
  assert.doesNotMatch(detail, /liveApplicationUrls/);
  assert.doesNotMatch(detail, /Subscribe & Launch/);
  assert.doesNotMatch(detail, /manage billing in Stripe/);
  assert.match(detail, /Request enterprise demo/);
  assert.match(detail, /Request deployment assessment/);
});

test("the route owner keeps all protected Applications contracts on Clerk", () => {
  const { identityProviderForRequest } = routingModule();
  for (const pathname of [
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
    assert.equal(identityProviderForRequest({ pathname }).provider, "clerk", pathname);
  }
});
