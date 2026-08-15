import { createHash } from "node:crypto";

const SHA40 = /^[0-9a-f]{40}$/i;
const FLORIDA_LICENSE_FORMATS = {
  DS: /^DS\d{7}$/,
  DI: /^DI\d{7}$/,
} as const;
const MAX_EVIDENCE_AGE_MS = 15 * 60 * 1000;

export type FloridaClassDLicenseType = keyof typeof FLORIDA_LICENSE_FORMATS;

export type FloridaClassDLicenseVerificationInput = {
  canonicalLicenseNumber: string;
  expectedType: FloridaClassDLicenseType;
  expectedSubjectSha256: string;
};

export type FloridaClassDLicenseVerificationEvidence = {
  verified: boolean;
  canonicalLicenseNumber: string;
  licenseType: FloridaClassDLicenseType;
  status: "LICENSE ISSUED" | "APPLICATION PENDING" | "EXPIRED" | "SUSPENDED" | "REVOKED" | "NOT FOUND" | "UNKNOWN" | string;
  expiresAt: string | null;
  verifiedAt: string;
  source: "fdacs_authoritative" | "self_attested" | "unknown";
  subjectKind: "school" | "instructor";
  subjectBindingSha256: string;
};

export interface FloridaClassDLicenseVerificationAdapter {
  verifyLicense(
    input: FloridaClassDLicenseVerificationInput,
  ): Promise<FloridaClassDLicenseVerificationEvidence>;
}

export type FloridaClassDActivationReadinessSnapshot = {
  checks: { key: string; ready: boolean }[];
  unauthorizedEnabledFeatureFlags: string[];
  productionRuntimeAuthorized: boolean;
};

export type FloridaClassDActivationRequestResult = {
  status: "denied" | "eligible_for_controlled_activation_review";
  blockingKeys: string[];
  evidenceSha256: string | null;
  evidenceVerifiedAt: string | null;
  releaseCommitSha: string | null;
  activationPerformed: false;
  productionRuntimeAuthorized: false;
  studentFrontendEnabled: false;
  studentBackendEnabled: false;
  paymentEnabled: false;
  trainingCreditEnabled: false;
  completionCertificateLiasEnabled: false;
  liasReportingPreflightEnabled: false;
  fdacsReportingPreflightEnabled: false;
  licenseValuesExposed: false;
};

export type FloridaClassDLicenseVerificationAdapterFailure = "unavailable" | "timeout" | "schema_change";

export class FloridaClassDLicenseVerificationAdapterError extends Error {
  readonly code: FloridaClassDLicenseVerificationAdapterFailure;

  constructor(code: FloridaClassDLicenseVerificationAdapterFailure) {
    super(`Authoritative FDACS license verification failed closed (${code}).`);
    this.name = "FloridaClassDLicenseVerificationAdapterError";
    this.code = code;
  }
}

export class FloridaClassDLicenseFormatError extends Error {
  readonly expectedType: FloridaClassDLicenseType;

  constructor(expectedType: FloridaClassDLicenseType) {
    super(`A valid Florida Class ${expectedType} license number is required.`);
    this.name = "FloridaClassDLicenseFormatError";
    this.expectedType = expectedType;
  }
}

export function normalizeFloridaLicenseNumber(
  input: string,
  expectedType: FloridaClassDLicenseType,
) {
  const canonical = input.trim().toUpperCase().replace(/[\s-]+/g, "");
  if (!FLORIDA_LICENSE_FORMATS[expectedType].test(canonical)) {
    throw new FloridaClassDLicenseFormatError(expectedType);
  }
  return canonical;
}

function evidenceBlockingKeys(
  scope: "school" | "instructor",
  expectedNumber: string,
  expectedType: FloridaClassDLicenseType,
  expectedSubjectKind: "school" | "instructor",
  expectedSubjectSha256: string,
  evidence: FloridaClassDLicenseVerificationEvidence,
  nowMs: number,
) {
  const keys: string[] = [];
  if (!evidence.verified) keys.push(`${scope}:license_unverified`);
  if (evidence.canonicalLicenseNumber !== expectedNumber) keys.push(`${scope}:license_number_mismatch`);
  if (evidence.licenseType !== expectedType) keys.push(`${scope}:license_type_mismatch`);
  if (evidence.subjectKind !== expectedSubjectKind) keys.push(`${scope}:subject_type_mismatch`);
  if (evidence.subjectBindingSha256 !== expectedSubjectSha256) keys.push(`${scope}:subject_binding_mismatch`);
  if (evidence.status !== "LICENSE ISSUED") keys.push(`${scope}:license_not_issued`);
  if (evidence.source !== "fdacs_authoritative") keys.push(`${scope}:evidence_source_not_authoritative`);

  const expiresAt = evidence.expiresAt ? Date.parse(evidence.expiresAt) : Number.NaN;
  if (!Number.isFinite(expiresAt) || expiresAt <= nowMs) keys.push(`${scope}:license_expired`);
  const verifiedAt = Date.parse(evidence.verifiedAt);
  const evidenceAge = nowMs - verifiedAt;
  if (!Number.isFinite(verifiedAt) || evidenceAge < 0 || evidenceAge > MAX_EVIDENCE_AGE_MS) {
    keys.push(`${scope}:evidence_stale`);
  }
  return keys;
}

function digestEvidence(input: {
  releaseCommitSha: string;
  school: FloridaClassDLicenseVerificationEvidence;
  instructor: FloridaClassDLicenseVerificationEvidence;
  boundAt: string;
}) {
  const canonical = JSON.stringify({
    releaseCommitSha: input.releaseCommitSha,
    boundAt: input.boundAt,
    school: {
      canonicalLicenseNumber: input.school.canonicalLicenseNumber,
      licenseType: input.school.licenseType,
      status: input.school.status,
      expiresAt: input.school.expiresAt,
      verifiedAt: input.school.verifiedAt,
      source: input.school.source,
      subjectKind: input.school.subjectKind,
      subjectBindingSha256: input.school.subjectBindingSha256,
      verified: input.school.verified,
    },
    instructor: {
      canonicalLicenseNumber: input.instructor.canonicalLicenseNumber,
      licenseType: input.instructor.licenseType,
      status: input.instructor.status,
      expiresAt: input.instructor.expiresAt,
      verifiedAt: input.instructor.verifiedAt,
      source: input.instructor.source,
      subjectKind: input.instructor.subjectKind,
      subjectBindingSha256: input.instructor.subjectBindingSha256,
      verified: input.instructor.verified,
    },
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function failClosedResult(
  blockingKeys: string[],
  releaseCommitSha: string | null,
  evidenceSha256: string | null = null,
  evidenceVerifiedAt: string | null = null,
): FloridaClassDActivationRequestResult {
  return {
    status: blockingKeys.length === 0 ? "eligible_for_controlled_activation_review" : "denied",
    blockingKeys,
    evidenceSha256,
    evidenceVerifiedAt,
    releaseCommitSha,
    activationPerformed: false,
    productionRuntimeAuthorized: false,
    studentFrontendEnabled: false,
    studentBackendEnabled: false,
    paymentEnabled: false,
    trainingCreditEnabled: false,
    completionCertificateLiasEnabled: false,
    liasReportingPreflightEnabled: false,
    fdacsReportingPreflightEnabled: false,
    licenseValuesExposed: false,
  };
}

export function validateFloridaClassDActivationEvidenceBinding(input: {
  presentedEvidenceSha256: string | null;
  authoritativeEvidenceSha256: string | null;
  evidenceVerifiedAt: string | null;
  releaseCommitSha: string | null;
  expectedReleaseCommitSha: string;
  consumedEvidenceSha256s: ReadonlySet<string>;
  nowMs?: number;
}) {
  const blockingKeys: string[] = [];
  const nowMs = input.nowMs ?? Date.now();
  const presented = input.presentedEvidenceSha256?.toLowerCase() ?? "";
  const authoritative = input.authoritativeEvidenceSha256?.toLowerCase() ?? "";
  const release = input.releaseCommitSha?.toLowerCase() ?? "";
  const expectedRelease = input.expectedReleaseCommitSha.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(presented) || !/^[0-9a-f]{64}$/.test(authoritative) || presented !== authoritative) {
    blockingKeys.push("evidence_digest_mismatch");
  }
  if (!SHA40.test(release) || !SHA40.test(expectedRelease) || release !== expectedRelease) {
    blockingKeys.push("evidence_release_mismatch");
  }
  const verifiedAt = input.evidenceVerifiedAt ? Date.parse(input.evidenceVerifiedAt) : Number.NaN;
  const evidenceAge = nowMs - verifiedAt;
  if (!Number.isFinite(verifiedAt) || evidenceAge < 0 || evidenceAge > MAX_EVIDENCE_AGE_MS) {
    blockingKeys.push("evidence_binding_stale");
  }
  if (presented && input.consumedEvidenceSha256s.has(presented)) {
    blockingKeys.push("evidence_replay_detected");
  }
  return { valid: blockingKeys.length === 0, blockingKeys };
}

export async function evaluateFloridaClassDActivationRequest(input: {
  schoolLicenseNumber: string;
  instructorLicenseNumber: string;
  adapter: FloridaClassDLicenseVerificationAdapter;
  readiness: FloridaClassDActivationReadinessSnapshot;
  releaseCommitSha: string;
  expectedSchoolSubjectSha256: string;
  expectedInstructorSubjectSha256: string;
  nowMs?: number;
}): Promise<FloridaClassDActivationRequestResult> {
  const nowMs = input.nowMs ?? Date.now();
  const releaseCommitSha = input.releaseCommitSha.trim().toLowerCase();
  const schoolLicenseNumber = normalizeFloridaLicenseNumber(input.schoolLicenseNumber, "DS");
  const instructorLicenseNumber = normalizeFloridaLicenseNumber(input.instructorLicenseNumber, "DI");
  const readinessBlockingKeys = [
    ...input.readiness.checks.filter((check) => !check.ready).map((check) => `readiness:${check.key}`),
    ...(input.readiness.unauthorizedEnabledFeatureFlags.length ? ["readiness:regulated_feature_flags_must_remain_disabled"] : []),
    ...(input.readiness.productionRuntimeAuthorized ? ["readiness:production_runtime_already_authorized"] : []),
    ...(!SHA40.test(releaseCommitSha) ? ["readiness:exact_release_required"] : []),
    ...(!/^[0-9a-f]{64}$/i.test(input.expectedSchoolSubjectSha256) ? ["readiness:school_subject_binding_required"] : []),
    ...(!/^[0-9a-f]{64}$/i.test(input.expectedInstructorSubjectSha256) ? ["readiness:instructor_subject_binding_required"] : []),
  ];

  let school: FloridaClassDLicenseVerificationEvidence;
  let instructor: FloridaClassDLicenseVerificationEvidence;
  try {
    [school, instructor] = await Promise.all([
      input.adapter.verifyLicense({
        canonicalLicenseNumber: schoolLicenseNumber,
        expectedType: "DS",
        expectedSubjectSha256: input.expectedSchoolSubjectSha256.toLowerCase(),
      }),
      input.adapter.verifyLicense({
        canonicalLicenseNumber: instructorLicenseNumber,
        expectedType: "DI",
        expectedSubjectSha256: input.expectedInstructorSubjectSha256.toLowerCase(),
      }),
    ]);
  } catch (error) {
    const providerFailure = error instanceof FloridaClassDLicenseVerificationAdapterError
      ? error.code
      : "unavailable";
    return failClosedResult(
      [...new Set([...readinessBlockingKeys, `license_verification_provider:${providerFailure}`])],
      SHA40.test(releaseCommitSha) ? releaseCommitSha : null,
    );
  }

  const blockingKeys = [
    ...evidenceBlockingKeys("school", schoolLicenseNumber, "DS", "school", input.expectedSchoolSubjectSha256.toLowerCase(), school, nowMs),
    ...evidenceBlockingKeys("instructor", instructorLicenseNumber, "DI", "instructor", input.expectedInstructorSubjectSha256.toLowerCase(), instructor, nowMs),
    ...readinessBlockingKeys,
  ];

  if (blockingKeys.length || !SHA40.test(releaseCommitSha)) {
    return failClosedResult([...new Set(blockingKeys)], SHA40.test(releaseCommitSha) ? releaseCommitSha : null);
  }

  const boundAt = new Date(nowMs).toISOString();
  const evidenceSha256 = digestEvidence({ releaseCommitSha, school, instructor, boundAt });
  return failClosedResult([], releaseCommitSha, evidenceSha256, boundAt);
}
