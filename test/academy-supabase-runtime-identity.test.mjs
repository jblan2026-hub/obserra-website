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

const clerkFreeRuntimeFiles = [
  "app/academy/learn/[courseId]/page.tsx",
  "app/academy/certificate/[courseId]/page.tsx",
  "app/api/academy/checkout/route.ts",
  "app/api/academy/redeem/route.ts",
  "app/api/academy/progress/route.ts",
  "app/api/academy/assessment/route.ts",
  "app/api/academy/enrollment-status/route.ts",
  "app/api/academy/media/route.ts",
  "app/api/academy/tutor/route.ts",
  "lib/academy.ts",
];

test("Academy learner runtime has one Supabase identity authority", () => {
  assert.ok(fs.existsSync("lib/academy-identity.ts"), "Academy Supabase identity adapter must exist");
  const adapter = fs.readFileSync("lib/academy-identity.ts", "utf8");
  assert.match(adapter, /safeSupabaseIdentity/);
  assert.match(adapter, /prepareSupabaseAuthRuntime/);
  assert.match(adapter, /principalId/);
  assert.match(adapter, /emailVerified/);

  for (const path of clerkFreeRuntimeFiles) {
    const source = fs.readFileSync(path, "utf8");
    assert.doesNotMatch(source, /@clerk\/nextjs\/server/, `${path} must not depend directly on Clerk`);
  }
});

test("Academy API ownership matches Supabase guest and authenticated flows", () => {
  const { identityProviderForRequest } = routingModule();

  for (const pathname of ["/api/academy/checkout", "/api/academy/enrollment-status"]) {
    const ownership = identityProviderForRequest({ pathname, method: pathname.endsWith("checkout") ? "POST" : "GET" });
    assert.equal(ownership.provider, "supabase", pathname);
    assert.equal(ownership.requiresAuthentication, false, pathname);
    assert.equal(ownership.accessPolicy, "standard_public", pathname);
  }

  for (const pathname of [
    "/api/academy/redeem",
    "/api/academy/progress",
    "/api/academy/assessment",
    "/api/academy/media",
    "/api/academy/tutor",
  ]) {
    const ownership = identityProviderForRequest({ pathname, method: pathname.endsWith("media") ? "GET" : "POST" });
    assert.equal(ownership.provider, "supabase", pathname);
    assert.equal(ownership.requiresAuthentication, true, pathname);
    assert.equal(ownership.accessPolicy, "standard_authenticated", pathname);
  }

  const health = identityProviderForRequest({ pathname: "/api/academy/commerce-health", method: "GET" });
  assert.equal(health.provider, "public");
  assert.equal(health.requiresAuthentication, false);
});

test("commerce health checks Supabase runtime readiness without requiring a learner session", () => {
  const health = fs.readFileSync("app/api/academy/commerce-health/route.ts", "utf8");
  assert.doesNotMatch(health, /safeIdentity/);
  assert.doesNotMatch(health, /auth\s*\(/);
  assert.match(health, /academyIdentityRuntimeReady/);
});

test("new Academy certificates bind learner display identity into the signed claim", () => {
  const signing = fs.readFileSync("lib/certificate-signing.ts", "utf8");
  assert.match(signing, /schemaVersion:\s*"1\.2"/);
  assert.match(signing, /learnerName:\s*string/);
  assert.match(signing, /claim\.learnerName/);

  const certificatePage = fs.readFileSync("app/academy/certificate/[courseId]/page.tsx", "utf8");
  assert.match(certificatePage, /signed\.learnerName/);
});

test("Academy runtime uses canonical principal IDs while legacy persistence naming remains isolated for later contraction", () => {
  const academy = fs.readFileSync("lib/academy.ts", "utf8");
  assert.match(academy, /principalId/);
  assert.doesNotMatch(academy, /clerkClient/);
  assert.doesNotMatch(academy, /ownerEmailAllowed/);

  const persistence = fs.readFileSync("lib/academy-persistence.ts", "utf8");
  assert.match(persistence, /legacy.*clerk_user_id|clerk_user_id.*legacy/is);
});
