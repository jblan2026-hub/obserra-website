import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const CORRELATION_ID = "19b1194c-c9a0-4781-ad69-677468118616";
const AUTH_USER_ID = "f11bfa6e-cd9b-48d7-87a1-c62c4541650b";
const SESSION_ID = "3fa9db76-8e46-419a-ae37-b80f2916a09a";

function repositoryModule() {
  const output = ts.transpileModule(
    fs.readFileSync("lib/auth/authority-repository.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  const module = { exports: {} };
  const stubs = {
    "server-only": {},
    "node:crypto": { default: { randomUUID: () => CORRELATION_ID } },
    "./identity": { safeSupabaseIdentity: () => { throw new Error("proxy context must not read next/headers cookies"); } },
    "./jwks-readiness": { verifySupabaseJwksKey: async () => true },
    "./protected-readiness": {
      getProtectedSupabaseAuthReadiness: async (collect) => {
        const evidence = await collect();
        return evidence.runtimeReady && evidence.claimsVerified && evidence.jwksVerified
          && evidence.subjectFresh && evidence.identityLinkActive && evidence.sessionActive
          && evidence.roleFresh && evidence.assuranceLevel === "aal2"
          ? { ready: true, reason: "protected_auth_ready" }
          : { ready: false, reason: "not_ready" };
      },
    },
    "./identity-governance": {
      evaluateInternalOwnerMfaEnrollment: () => ({ authorized: false, reason: "aal1_enrollment_required" }),
    },
    "../supabase/server": { createSupabaseServerClient: () => { throw new Error("server cookie client is forbidden in Proxy"); } },
  };
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require: (specifier) => stubs[specifier],
  });
  return module.exports;
}

const identity = {
  authUserId: AUTH_USER_ID,
  principalId: "owner.primary",
  sessionId: SESSION_ID,
  email: "owner@example.invalid",
  emailVerified: true,
  assuranceLevel: "aal2",
  roles: ["owner"],
  roleVersion: 7,
};

function authorityRow(overrides = {}) {
  return {
    provider_subject: AUTH_USER_ID,
    principal_id: "owner.primary",
    session_id: SESSION_ID,
    roles: ["owner"],
    role_version: 7,
    subject_active: true,
    link_active: true,
    session_active: true,
    internal_identity: true,
    role_fresh: true,
    email_verified: true,
    aal2: true,
    authorized: true,
    reason: "internal_owner_authorized",
    ...overrides,
  };
}

test("Proxy authority uses only its request-local verified context and fresh RPC", async () => {
  const { getInternalOwnerAuthorityFromProxyContext } = repositoryModule();
  assert.equal(typeof getInternalOwnerAuthorityFromProxyContext, "function");
  let observedCorrelation = null;
  const result = await getInternalOwnerAuthorityFromProxyContext({
    identity,
    jwtKeyId: "identity-key-1",
    jwtAlgorithm: "ES256",
    queryCurrentAuthority: async (correlationId) => {
      observedCorrelation = correlationId;
      return { data: [authorityRow()], error: null };
    },
  });
  assert.equal(observedCorrelation, CORRELATION_ID);
  assert.equal(result.status, "ready");
  assert.equal(result.internalIdentityAuthorized, true);
  assert.equal(result.protectedReadiness.ready, true);
});

test("Proxy authority fails closed on request-local identity/session mismatch", async () => {
  const { getInternalOwnerAuthorityFromProxyContext } = repositoryModule();
  const result = await getInternalOwnerAuthorityFromProxyContext({
    identity,
    jwtKeyId: "identity-key-1",
    jwtAlgorithm: "ES256",
    queryCurrentAuthority: async () => ({
      data: authorityRow({ session_id: "6c7ab45a-1061-49a2-8c3f-63373c9fc94e" }),
      error: null,
    }),
  });
  assert.equal(result.status, "denied");
  assert.equal(result.reason, "authority_mismatch");
  assert.equal(result.internalIdentityAuthorized, false);
});

test("Supabase Proxy exposes verified header evidence and a request-local authority closure", () => {
  const proxyClient = fs.readFileSync("lib/supabase/proxy.ts", "utf8");
  const proxy = fs.readFileSync("proxy.ts", "utf8");
  assert.match(proxyClient, /queryCurrentAuthority/);
  assert.match(proxyClient, /data\?\.header/);
  assert.match(proxy, /getInternalOwnerAuthorityFromProxyContext/);
  assert.doesNotMatch(proxy, /getInternalOwnerAuthority\(\)/);
});
