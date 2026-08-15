import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

test("the server authority repository combines verified claims, JWKS, and durable authority", () => {
  const repository = read("lib/auth/authority-repository.ts");
  const jwks = read("lib/auth/jwks-readiness.ts");

  assert.match(repository, /safeSupabaseIdentity/);
  assert.match(repository, /verifySupabaseJwksKey/);
  assert.match(repository, /obserra_current_identity_authority/);
  assert.match(repository, /getProtectedSupabaseAuthReadiness/);
  assert.match(repository, /crypto\.randomUUID\(\)/);
  assert.match(repository, /providerSubject === identity\.authUserId/);
  assert.match(repository, /sessionId === identity\.sessionId/);
  assert.match(repository, /roleVersion === identity\.roleVersion/);
  assert.match(repository, /email_verified/);
  assert.match(repository, /evaluateInternalOwnerMfaEnrollment/);
  assert.match(repository, /mfaEnrollmentReady/);
  assert.match(jwks, /\.well-known\/jwks\.json/);
  assert.match(jwks, /cache:\s*"no-store"/);
  assert.match(jwks, /AbortSignal\.timeout/);
  for (const source of [repository, jwks]) {
    assert.doesNotMatch(source, /getSession\s*\(/);
    assert.doesNotMatch(source, /SERVICE_ROLE|SECRET_KEY|serviceRole/i);
  }
});

test("the proxy uses fresh authority and retains every internal write lock", () => {
  const proxy = read("proxy.ts");
  assert.match(proxy, /getInternalOwnerAuthority/);
  assert.doesNotMatch(proxy, /internalIdentityAuthorized:\s*false/);
  assert.match(proxy, /!ownership\.mutationAllowed/);
  assert.match(proxy, /FDACS_INTERNAL_OWNER_WRITE_LOCKED/);
});

test("protected FDACS readiness consumes the same authoritative adapter", () => {
  const readiness = read("lib/florida-class-d-provider-readiness.ts");
  assert.match(readiness, /getInternalOwnerAuthority/);
  assert.match(readiness, /authority\.protectedReadiness/);
});

test("activation request audit requires the same fresh internal owner authority and correlation", () => {
  const repository = read("lib/auth/authority-repository.ts");
  assert.match(repository, /requestOwnerActivationAudit/);
  assert.match(repository, /getInternalOwnerAuthority/);
  assert.match(repository, /authority\.status !== "ready"/);
  assert.match(repository, /obserra_request_owner_activation/);
  assert.match(repository, /p_correlation_id:\s*authority\.correlationId/);
  assert.doesNotMatch(repository, /activate|license.*update|provider.*update/i);
});
