import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const READINESS_MODULE = "lib/auth/protected-readiness.ts";

function readinessModule() {
  assert.ok(
    fs.existsSync(READINESS_MODULE),
    `${READINESS_MODULE} must distinguish JWT/JWKS verification from current subject, session, role, and AAL authorization`,
  );
  const output = ts.transpileModule(fs.readFileSync(READINESS_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module });
  return module.exports;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

const readyEvidence = {
  runtimeReady: true,
  claimsVerified: true,
  jwksVerified: true,
  subjectFresh: true,
  identityLinkActive: true,
  sessionActive: true,
  roleFresh: true,
  assuranceLevel: "aal2",
  requiredAssuranceLevel: "aal2",
};

test("protected Auth readiness requires every fresh authoritative check", () => {
  const { evaluateProtectedAuthReadiness } = readinessModule();
  assert.deepEqual(plain(evaluateProtectedAuthReadiness(readyEvidence)), {
    ready: true,
    reason: "protected_auth_ready",
  });

  for (const [field, value, reason] of [
    ["runtimeReady", false, "configuration_unavailable"],
    ["claimsVerified", false, "claims_unverified"],
    ["jwksVerified", false, "jwks_unavailable"],
    ["subjectFresh", false, "subject_stale"],
    ["identityLinkActive", false, "identity_link_inactive"],
    ["sessionActive", false, "session_revoked"],
    ["roleFresh", false, "role_stale"],
    ["assuranceLevel", "aal1", "assurance_insufficient"],
  ]) {
    assert.deepEqual(
      plain(evaluateProtectedAuthReadiness({ ...readyEvidence, [field]: value })),
      { ready: false, reason },
      field,
    );
  }
});

test("FDACS protected provider readiness includes live Auth readiness as a distinct provider", () => {
  const providerReadiness = fs.readFileSync("lib/florida-class-d-provider-readiness.ts", "utf8");
  const protectedRoute = fs.readFileSync(
    "app/api/florida-class-d/admin/provider-readiness/route.ts",
    "utf8",
  );

  assert.match(providerReadiness, /getInternalOwnerAuthority/);
  assert.match(providerReadiness, /authority\.protectedReadiness/);
  assert.match(providerReadiness, /provider:\s*"identity_provider"/);
  assert.match(protectedRoute, /status:\s*report\.ready \? 200 : 503/);
});

test("public FDACS readiness remains detail-free", () => {
  const resilience = fs.readFileSync("lib/florida-class-d-resilience.ts", "utf8");
  const publicRoute = fs.readFileSync("app/api/florida-class-d/health/ready/route.ts", "utf8");

  assert.match(resilience, /return \{\s*service: snapshot\.service,\s*status:/s);
  assert.doesNotMatch(publicRoute, /checks|reasonCodes|session|jwks|roles/i);
});
