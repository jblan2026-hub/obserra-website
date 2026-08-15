import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const NOW = Date.parse("2026-08-15T21:00:00.000Z");
const ACTIVE_EXPIRY = "2027-08-15T00:00:00.000Z";
const SCHOOL_SUBJECT_SHA256 = "a".repeat(64);
const INSTRUCTOR_SUBJECT_SHA256 = "b".repeat(64);

async function activationModule() {
  return import("../lib/florida-class-d-license-activation-request.ts");
}

function readySnapshot(overrides = {}) {
  return {
    checks: [
      { key: "database", ready: true },
      { key: "providers", ready: true },
      { key: "backup_restore", ready: true },
      { key: "security_acceptance", ready: true },
    ],
    unauthorizedEnabledFeatureFlags: [],
    productionRuntimeAuthorized: false,
    ...overrides,
  };
}

function evidence(input, overrides = {}) {
  return {
    verified: true,
    canonicalLicenseNumber: input.canonicalLicenseNumber,
    licenseType: input.expectedType,
    status: "LICENSE ISSUED",
    expiresAt: ACTIVE_EXPIRY,
    verifiedAt: new Date(NOW).toISOString(),
    source: "fdacs_authoritative",
    subjectKind: input.expectedType === "DS" ? "school" : "instructor",
    subjectBindingSha256: input.expectedSubjectSha256,
    ...overrides,
  };
}

test("license numbers are normalized and class-format validated without source persistence", async () => {
  const { normalizeFloridaLicenseNumber } = await activationModule();
  assert.equal(normalizeFloridaLicenseNumber(" ds 12-34-567 ", "DS"), "DS1234567");
  assert.equal(normalizeFloridaLicenseNumber("di 7654321", "DI"), "DI7654321");
  assert.throws(() => normalizeFloridaLicenseNumber("D1234567", "DS"), /Class DS/);
  assert.throws(() => normalizeFloridaLicenseNumber("DS12345", "DS"), /Class DS/);
  assert.throws(() => normalizeFloridaLicenseNumber("DI1234567", "DS"), /Class DS/);
});

test("verified active DS and DI evidence produces only a controlled activation request candidate", async () => {
  const { evaluateFloridaClassDActivationRequest } = await activationModule();
  const calls = [];
  const adapter = {
    async verifyLicense(input) {
      calls.push(input);
      return evidence(input);
    },
  };
  const result = await evaluateFloridaClassDActivationRequest({
    schoolLicenseNumber: "DS 1234567",
    instructorLicenseNumber: "DI-7654321",
    adapter,
    readiness: readySnapshot(),
    releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
    expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
    nowMs: NOW,
  });

  assert.equal(calls.length, 2);
  assert.equal(result.status, "eligible_for_controlled_activation_review");
  assert.match(result.evidenceSha256, /^[0-9a-f]{64}$/);
  assert.equal(result.evidenceVerifiedAt, new Date(NOW).toISOString());
  assert.equal(result.activationPerformed, false);
  assert.equal(result.productionRuntimeAuthorized, false);
  assert.equal(result.studentFrontendEnabled, false);
  assert.equal(result.studentBackendEnabled, false);
  assert.equal(result.paymentEnabled, false);
  assert.equal(result.liasReportingPreflightEnabled, false);
  assert.equal(result.fdacsReportingPreflightEnabled, false);
  assert.doesNotMatch(JSON.stringify(result), /DS1234567|DI7654321/);
});

test("wrong or unverified license evidence is denied", async () => {
  const { evaluateFloridaClassDActivationRequest } = await activationModule();
  for (const override of [
    { verified: false, status: "not_found" },
    { canonicalLicenseNumber: "DS9999999" },
    { source: "self_attested" },
  ]) {
    const adapter = { async verifyLicense(input) { return evidence(input, override); } };
    const result = await evaluateFloridaClassDActivationRequest({
      schoolLicenseNumber: "DS1234567",
      instructorLicenseNumber: "DI7654321",
      adapter,
      readiness: readySnapshot(),
      releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
      expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
      expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
      nowMs: NOW,
    });
    assert.equal(result.status, "denied");
    assert.equal(result.activationPerformed, false);
  }
});

test("wrong license type is denied", async () => {
  const { evaluateFloridaClassDActivationRequest } = await activationModule();
  const adapter = {
    async verifyLicense(input) {
      return evidence(input, { licenseType: input.expectedType === "DS" ? "DI" : "DS" });
    },
  };
  const result = await evaluateFloridaClassDActivationRequest({
    schoolLicenseNumber: "DS1234567",
    instructorLicenseNumber: "DI7654321",
    adapter,
    readiness: readySnapshot(),
    releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
    expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
    nowMs: NOW,
  });
  assert.equal(result.status, "denied");
  assert.ok(result.blockingKeys.some((key) => key.includes("license_type")));
});

test("expired license evidence is denied", async () => {
  const { evaluateFloridaClassDActivationRequest } = await activationModule();
  const adapter = {
    async verifyLicense(input) {
      return evidence(input, { expiresAt: "2026-08-14T00:00:00.000Z" });
    },
  };
  const result = await evaluateFloridaClassDActivationRequest({
    schoolLicenseNumber: "DS1234567",
    instructorLicenseNumber: "DI7654321",
    adapter,
    readiness: readySnapshot(),
    releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
    expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
    nowMs: NOW,
  });
  assert.equal(result.status, "denied");
  assert.ok(result.blockingKeys.some((key) => key.includes("license_expired")));
});

test("stale evidence or any technical readiness blocker denies the request", async () => {
  const { evaluateFloridaClassDActivationRequest } = await activationModule();
  const staleAdapter = {
    async verifyLicense(input) {
      return evidence(input, { verifiedAt: "2026-08-15T20:00:00.000Z" });
    },
  };
  const stale = await evaluateFloridaClassDActivationRequest({
    schoolLicenseNumber: "DS1234567",
    instructorLicenseNumber: "DI7654321",
    adapter: staleAdapter,
    readiness: readySnapshot(),
    releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
    expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
    nowMs: NOW,
  });
  assert.equal(stale.status, "denied");
  assert.ok(stale.blockingKeys.some((key) => key.includes("evidence_stale")));

  const readyAdapter = { async verifyLicense(input) { return evidence(input); } };
  const blocked = await evaluateFloridaClassDActivationRequest({
    schoolLicenseNumber: "DS1234567",
    instructorLicenseNumber: "DI7654321",
    adapter: readyAdapter,
    readiness: readySnapshot({ checks: [{ key: "backup_restore", ready: false }] }),
    releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
    expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
    nowMs: NOW,
  });
  assert.equal(blocked.status, "denied");
  assert.ok(blocked.blockingKeys.includes("readiness:backup_restore"));
});

test("pending, expired, revoked, suspended, or generic active status is not LICENSE ISSUED", async () => {
  const { evaluateFloridaClassDActivationRequest } = await activationModule();
  for (const status of ["APPLICATION PENDING", "EXPIRED", "REVOKED", "SUSPENDED", "active"]) {
    const adapter = { async verifyLicense(input) { return evidence(input, { status }); } };
    const result = await evaluateFloridaClassDActivationRequest({
      schoolLicenseNumber: "DS1234567",
      instructorLicenseNumber: "DI7654321",
      adapter,
      readiness: readySnapshot(),
      releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
      expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
      expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
      nowMs: NOW,
    });
    assert.equal(result.status, "denied");
    assert.ok(result.blockingKeys.some((key) => key.includes("license_not_issued")));
    assert.equal(result.studentFrontendEnabled, false);
    assert.equal(result.studentBackendEnabled, false);
  }
});

test("school business or instructor subject mismatch is denied", async () => {
  const { evaluateFloridaClassDActivationRequest } = await activationModule();
  const adapter = {
    async verifyLicense(input) {
      return evidence(input, { subjectBindingSha256: "c".repeat(64) });
    },
  };
  const result = await evaluateFloridaClassDActivationRequest({
    schoolLicenseNumber: "DS1234567",
    instructorLicenseNumber: "DI7654321",
    adapter,
    readiness: readySnapshot(),
    releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
    expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
    nowMs: NOW,
  });
  assert.equal(result.status, "denied");
  assert.ok(result.blockingKeys.some((key) => key.includes("subject_binding_mismatch")));
});

test("authoritative lookup unavailable, timeout, or schema change has no fallback", async () => {
  const {
    evaluateFloridaClassDActivationRequest,
    FloridaClassDLicenseVerificationAdapterError,
  } = await activationModule();
  for (const code of ["unavailable", "timeout", "schema_change"]) {
    const adapter = {
      async verifyLicense() {
        throw new FloridaClassDLicenseVerificationAdapterError(code);
      },
    };
    const result = await evaluateFloridaClassDActivationRequest({
      schoolLicenseNumber: "DS1234567",
      instructorLicenseNumber: "DI7654321",
      adapter,
      readiness: readySnapshot(),
      releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
      expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
      expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
      nowMs: NOW,
    });
    assert.equal(result.status, "denied");
    assert.ok(result.blockingKeys.includes(`license_verification_provider:${code}`));
    assert.equal(result.activationPerformed, false);
    assert.equal(result.studentFrontendEnabled, false);
    assert.equal(result.studentBackendEnabled, false);
  }
});

test("evidence binding rejects tampering and replay but accepts current exact-release evidence", async () => {
  const {
    evaluateFloridaClassDActivationRequest,
    validateFloridaClassDActivationEvidenceBinding,
  } = await activationModule();
  const adapter = { async verifyLicense(input) { return evidence(input); } };
  const result = await evaluateFloridaClassDActivationRequest({
    schoolLicenseNumber: "DS1234567",
    instructorLicenseNumber: "DI7654321",
    adapter,
    readiness: readySnapshot(),
    releaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    expectedSchoolSubjectSha256: SCHOOL_SUBJECT_SHA256,
    expectedInstructorSubjectSha256: INSTRUCTOR_SUBJECT_SHA256,
    nowMs: NOW,
  });
  const valid = validateFloridaClassDActivationEvidenceBinding({
    presentedEvidenceSha256: result.evidenceSha256,
    authoritativeEvidenceSha256: result.evidenceSha256,
    evidenceVerifiedAt: result.evidenceVerifiedAt,
    releaseCommitSha: result.releaseCommitSha,
    expectedReleaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    consumedEvidenceSha256s: new Set(),
    nowMs: NOW + 60_000,
  });
  assert.equal(valid.valid, true);

  const tampered = validateFloridaClassDActivationEvidenceBinding({
    presentedEvidenceSha256: "f".repeat(64),
    authoritativeEvidenceSha256: result.evidenceSha256,
    evidenceVerifiedAt: result.evidenceVerifiedAt,
    releaseCommitSha: result.releaseCommitSha,
    expectedReleaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    consumedEvidenceSha256s: new Set(),
    nowMs: NOW + 60_000,
  });
  assert.equal(tampered.valid, false);
  assert.ok(tampered.blockingKeys.includes("evidence_digest_mismatch"));

  const replayed = validateFloridaClassDActivationEvidenceBinding({
    presentedEvidenceSha256: result.evidenceSha256,
    authoritativeEvidenceSha256: result.evidenceSha256,
    evidenceVerifiedAt: result.evidenceVerifiedAt,
    releaseCommitSha: result.releaseCommitSha,
    expectedReleaseCommitSha: "c1bcbf308e73b398cfcfc72519e41c9b68408f82",
    consumedEvidenceSha256s: new Set([result.evidenceSha256]),
    nowMs: NOW + 60_000,
  });
  assert.equal(replayed.valid, false);
  assert.ok(replayed.blockingKeys.includes("evidence_replay_detected"));
});

test("owner activation API and UI remain request-only and provider-fail-closed", async () => {
  const [api, server, consoleSource, boundary] = await Promise.all([
    readFile(new URL("../app/api/florida-class-d/owner-preview/activation-request/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/florida-class-d-license-activation-request-server.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/florida-security-training/owner-preview/OwnerPreviewConsole.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/florida-class-d-mutation-boundary.ts", import.meta.url), "utf8"),
  ]);
  assert.match(api, /requireFloridaClassDOwnerPreviewPrincipal/);
  assert.match(api, /activationPerformed:\s*false/);
  assert.doesNotMatch(api, /process\.env\[[^\]]*PRODUCTION_ACTIVATION|update|insert|supabase/i);
  assert.match(server, /FDACS_LICENSE_VERIFICATION_PROVIDER_UNAVAILABLE/);
  assert.doesNotMatch(server, /fetch\(/);
  assert.match(consoleSource, /Class DS school license/);
  assert.match(consoleSource, /Class DI instructor license/);
  assert.match(consoleSource, /Request governed verification/);
  assert.match(consoleSource, /No activation is performed/);
  assert.match(consoleSource, /FDACS\/LIAS reporting preflight remains disabled/i);
  assert.match(boundary, /OWNER_PREVIEW_ACTIVATION_REQUEST_PATH/);
  assert.match(boundary, /owner_preview_activation_request/);
});
