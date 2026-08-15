import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import ts from "typescript";

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

function claimsModule() {
  const output = ts.transpileModule(read("lib/auth/claims.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, Set });
  return module.exports;
}

function redirectsModule() {
  const output = ts.transpileModule(read("lib/auth/redirects.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, URL });
  return module.exports;
}

test("authorization roles come only from trusted app_metadata", () => {
  const claims = read("lib/auth/claims.ts");

  assert.match(claims, /app_metadata/);
  assert.match(claims, /obserra_subject_id/);
  assert.match(claims, /fdacsClassD/);
  assert.match(claims, /session_id/);
  assert.match(claims, /emailVerified: claims\.email_verified === true/);
  assert.match(claims, /const principalId = subjectIdFromAppMetadata\(appMetadata\) \?\? authUserId/);
  assert.doesNotMatch(claims, /user_metadata/);
});

test("claim parsing preserves legacy principals without trusting unverified fields", () => {
  const { identityFromVerifiedClaims } = claimsModule();
  const identity = identityFromVerifiedClaims({
    sub: "11111111-1111-4111-8111-111111111111",
    session_id: "22222222-2222-4222-8222-222222222222",
    email: "Owner@Example.com",
    email_verified: false,
    app_metadata: {
      obserra_subject_id: "user_legacy-owner",
      roles: ["owner"],
    },
    user_metadata: { roles: ["compliance_admin"] },
  });

  assert.equal(identity.principalId, "user_legacy-owner");
  assert.equal(identity.sessionId, "22222222-2222-4222-8222-222222222222");
  assert.equal(identity.email, "owner@example.com");
  assert.equal(identity.emailVerified, false);
  assert.deepEqual([...identity.roles], ["owner"]);
});

test("the installed SDK signed-out error shape maps narrowly to signed out", () => {
  const { isMissingSupabaseAuthSession } = claimsModule();

  assert.equal(isMissingSupabaseAuthSession(new AuthSessionMissingError()), true);
  assert.equal(isMissingSupabaseAuthSession(new Error("network unavailable")), false);
});

test("redirect handling accepts only bounded same-origin relative paths", () => {
  const redirects = read("lib/auth/redirects.ts");

  assert.match(redirects, /candidate\.length > MAX_REDIRECT_LENGTH/);
  assert.match(redirects, /parsed\.origin !== REDIRECT_BASE\.origin/);
  assert.match(redirects, /candidate\.includes\("\\\\"\)/);
  assert.match(redirects, /candidate\.startsWith\("\/\/"\)/);

  const { safeRelativeRedirect } = redirectsModule();
  assert.equal(safeRelativeRedirect("/academy?course=1#start"), "/academy?course=1#start");
  for (const unsafe of [
    "https://evil.example/steal",
    "//evil.example/steal",
    "/\\evil.example/steal",
    "/portal\u0000/steal",
    `/${"x".repeat(2_001)}`,
  ]) {
    assert.equal(safeRelativeRedirect(unsafe), "/portal");
  }
});
