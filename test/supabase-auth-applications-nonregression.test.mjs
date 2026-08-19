import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const APPLICATION_ROOTS = [
  "app/api/apps",
  "app/apps",
  "app/portal/applications",
  "app/portal/enterprise",
  "app/portal/licenses",
  "app/portal/orders",
  "app/portal/success",
  "lib/app-entitlements.ts",
  "lib/license-repository.ts",
];
const APPLICATION_SOURCE_DIGEST = "3f9f438c958e7cb5814e68b5dc0e4ada63f5239d309c257578ec9c05af6e6d10";

function walk(entry) {
  const stat = fs.statSync(entry);
  if (stat.isFile()) return [entry];
  return fs.readdirSync(entry, { withFileTypes: true })
    .flatMap((item) => walk(path.join(entry, item.name)));
}

function applicationSourceDigest() {
  const hash = crypto.createHash("sha256");
  for (const file of APPLICATION_ROOTS.flatMap(walk).sort()) {
    hash.update(file).update("\0").update(fs.readFileSync(file)).update("\0");
  }
  return hash.digest("hex");
}

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

test("the Phase 2A Applications implementation surface is byte-for-byte unchanged except the retired route removal", () => {
  assert.equal(APPLICATION_ROOTS.flatMap(walk).length, 27);
  assert.equal(applicationSourceDigest(), APPLICATION_SOURCE_DIGEST);
});

test("Applications retain Clerk runtime and app.obserrallc.com contracts", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const layout = fs.readFileSync("app/layout.tsx", "utf8");
  const liveApplication = fs.readFileSync("app/apps/[slug]/page.tsx", "utf8");

  assert.ok(packageJson.dependencies?.["@clerk/nextjs"]);
  assert.match(layout, /<ClerkProvider/);
  assert.match(liveApplication, /"obserra-eios":\s*"https:\/\/app\.obserrallc\.com"/);
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
