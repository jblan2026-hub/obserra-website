import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const GOVERNANCE_MODULE = "lib/auth/identity-governance.ts";

function governanceModule() {
  assert.ok(
    fs.existsSync(GOVERNANCE_MODULE),
    `${GOVERNANCE_MODULE} must mediate legacy aliases and fresh roles before JWT claims can authorize durable or FDACS access`,
  );
  const output = ts.transpileModule(fs.readFileSync(GOVERNANCE_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, Set });
  return module.exports;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

const activeLink = {
  provider: "supabase",
  providerSubject: "11111111-1111-4111-8111-111111111111",
  principalId: "user_legacy-owner",
  status: "active",
  version: 1,
};

test("a signed legacy subject claim is only a hint until an active durable link matches", () => {
  const { resolveGovernedPrincipal } = governanceModule();
  const claim = {
    provider: "supabase",
    providerSubject: activeLink.providerSubject,
    claimedPrincipalId: activeLink.principalId,
  };

  assert.equal(resolveGovernedPrincipal(claim, null), null);
  assert.equal(resolveGovernedPrincipal(claim, { ...activeLink, status: "deprovisioned" }), null);
  assert.equal(resolveGovernedPrincipal(claim, { ...activeLink, principalId: "user_someone-else" }), null);
  assert.equal(resolveGovernedPrincipal(claim, activeLink), activeLink.principalId);
});

test("identity links are one-to-one per provider and immutable after creation", () => {
  const { evaluateIdentityLinkMutation } = governanceModule();

  assert.deepEqual(
    plain(evaluateIdentityLinkMutation({
      existingLink: activeLink,
      candidateLink: activeLink,
      providerPrincipalBoundToSubject: activeLink.providerSubject,
    })),
    { allowed: true, reason: "identity_link_unchanged" },
  );
  assert.deepEqual(
    plain(evaluateIdentityLinkMutation({
      existingLink: activeLink,
      candidateLink: { ...activeLink, principalId: "user_rebound-owner" },
      providerPrincipalBoundToSubject: null,
    })),
    { allowed: false, reason: "identity_link_immutable" },
  );
  assert.deepEqual(
    plain(evaluateIdentityLinkMutation({
      existingLink: null,
      candidateLink: { ...activeLink, providerSubject: "22222222-2222-4222-8222-222222222222" },
      providerPrincipalBoundToSubject: activeLink.providerSubject,
    })),
    { allowed: false, reason: "identity_link_not_unique" },
  );
});

test("stale, removed, deprovisioned, or revoked staff authority fails closed", () => {
  const { evaluateRoleAuthorization } = governanceModule();
  const fresh = {
    claimedRoles: ["instructor"],
    claimedRoleVersion: 4,
    authoritativeRoles: ["instructor"],
    authoritativeRoleVersion: 4,
    subjectStatus: "active",
    linkStatus: "active",
    sessionStatus: "active",
    requiredRoles: ["instructor"],
  };

  assert.deepEqual(plain(evaluateRoleAuthorization(fresh)), { authorized: true, reason: "role_authorized" });
  assert.deepEqual(
    plain(evaluateRoleAuthorization({ ...fresh, authoritativeRoleVersion: 5 })),
    { authorized: false, reason: "role_stale" },
  );
  assert.deepEqual(
    plain(evaluateRoleAuthorization({ ...fresh, authoritativeRoles: [] })),
    { authorized: false, reason: "role_not_granted" },
  );
  assert.deepEqual(
    plain(evaluateRoleAuthorization({ ...fresh, subjectStatus: "deprovisioned" })),
    { authorized: false, reason: "subject_deprovisioned" },
  );
  assert.deepEqual(
    plain(evaluateRoleAuthorization({ ...fresh, linkStatus: "deprovisioned" })),
    { authorized: false, reason: "identity_link_inactive" },
  );
  assert.deepEqual(
    plain(evaluateRoleAuthorization({ ...fresh, sessionStatus: "revoked" })),
    { authorized: false, reason: "session_revoked" },
  );
});

test("authorization decisions produce a secret-free correlated audit record", () => {
  const { authorizationAuditRecord } = governanceModule();
  const record = plain(authorizationAuditRecord({
    provider: "supabase",
    principalId: "user_legacy-owner",
    sessionId: "22222222-2222-4222-8222-222222222222",
    roleVersion: 4,
    decision: "denied",
    reason: "role_stale",
    correlationId: "33333333-3333-4333-8333-333333333333",
  }));

  assert.deepEqual(record, {
    provider: "supabase",
    principalId: "user_legacy-owner",
    sessionId: "22222222-2222-4222-8222-222222222222",
    roleVersion: 4,
    decision: "denied",
    reason: "role_stale",
    correlationId: "33333333-3333-4333-8333-333333333333",
  });
  assert.doesNotMatch(JSON.stringify(record), /accessToken|refreshToken|email|publishableKey/i);
});

test("the internal owner shell requires allowlist, owner role, AAL2, and fresh authority", () => {
  const { evaluateInternalOwnerAuthorization } = governanceModule();
  const ready = {
    roles: ["owner"],
    emailVerified: true,
    internalIdentityAuthorized: true,
    assuranceLevel: "aal2",
    protectedAuthorityReady: true,
    previewEnvironment: true,
    productionOwnerReviewAuthorized: false,
    productionAuthEnabled: false,
  };

  assert.deepEqual(plain(evaluateInternalOwnerAuthorization(ready)), {
    authorized: true,
    reason: "internal_owner_authorized",
  });
  for (const [field, value, reason] of [
    ["roles", [], "owner_role_required"],
    ["emailVerified", false, "verified_email_required"],
    ["internalIdentityAuthorized", false, "internal_identity_unverified"],
    ["assuranceLevel", "aal1", "aal2_required"],
    ["protectedAuthorityReady", false, "fresh_authority_unavailable"],
    ["previewEnvironment", false, "internal_uat_environment_invalid"],
    ["productionAuthEnabled", true, "production_auth_prohibited"],
  ]) {
    assert.deepEqual(
      plain(evaluateInternalOwnerAuthorization({ ...ready, [field]: value })),
      { authorized: false, reason },
      field,
    );
  }

  assert.deepEqual(
    plain(evaluateInternalOwnerAuthorization({
      ...ready,
      previewEnvironment: false,
      productionOwnerReviewAuthorized: true,
    })),
    { authorized: true, reason: "internal_owner_authorized" },
  );
});

test("first-time TOTP enrollment is limited to the exact durable owner at fresh AAL1", () => {
  const {
    INTERNAL_OWNER_PRINCIPAL_ID,
    evaluateInternalOwnerMfaEnrollment,
  } = governanceModule();
  const ready = {
    principalId: INTERNAL_OWNER_PRINCIPAL_ID,
    roles: ["owner"],
    emailVerified: true,
    internalIdentity: true,
    assuranceLevel: "aal1",
    protectedAuthorityReady: true,
    authorityReason: "aal2_required",
  };

  assert.equal(INTERNAL_OWNER_PRINCIPAL_ID, "obserra-owner-0001");
  assert.deepEqual(plain(evaluateInternalOwnerMfaEnrollment(ready)), {
    authorized: true,
    reason: "mfa_enrollment_authorized",
  });
  for (const [field, value, reason] of [
    ["principalId", "someone-else", "owner_principal_required"],
    ["roles", [], "owner_role_required"],
    ["emailVerified", false, "verified_email_required"],
    ["internalIdentity", false, "internal_identity_unverified"],
    ["assuranceLevel", "aal2", "aal1_enrollment_required"],
    ["protectedAuthorityReady", false, "fresh_authority_unavailable"],
    ["authorityReason", "session_revoked", "aal2_enrollment_not_required"],
  ]) {
    assert.deepEqual(
      plain(evaluateInternalOwnerMfaEnrollment({ ...ready, [field]: value })),
      { authorized: false, reason },
      field,
    );
  }
});
