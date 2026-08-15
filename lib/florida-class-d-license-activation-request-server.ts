import "server-only";

import {
  evaluateFloridaClassDActivationRequest,
  type FloridaClassDLicenseVerificationAdapter,
} from "./florida-class-d-license-activation-request";
import { getFloridaClassDProductionActivationReport } from "./florida-class-d-production-activation";

export class FloridaClassDLicenseVerificationProviderUnavailableError extends Error {
  readonly code = "FDACS_LICENSE_VERIFICATION_PROVIDER_UNAVAILABLE";

  constructor() {
    super("Authoritative FDACS license verification is not configured; activation request remains denied.");
    this.name = "FloridaClassDLicenseVerificationProviderUnavailableError";
  }
}

const unavailableAdapter: FloridaClassDLicenseVerificationAdapter = {
  async verifyLicense() {
    // No network fallback or self-attestation is allowed. A separately reviewed
    // authoritative FDACS adapter must replace this fail-closed implementation.
    throw new FloridaClassDLicenseVerificationProviderUnavailableError();
  },
};

export function requestFloridaClassDControlledActivation(input: {
  schoolLicenseNumber: string;
  instructorLicenseNumber: string;
  releaseCommitSha: string;
}) {
  const report = getFloridaClassDProductionActivationReport();
  const nonLicenseChecks = report.checks
    .filter((check) => check.key !== "ds_license" && check.key !== "di_license")
    .map((check) => ({ key: check.key, ready: check.ready }));

  return evaluateFloridaClassDActivationRequest({
    ...input,
    adapter: unavailableAdapter,
    expectedSchoolSubjectSha256: process.env.OBSERRA_FDACS_DS_BUSINESS_ENTITY_SHA256?.trim() || "",
    expectedInstructorSubjectSha256: process.env.OBSERRA_FDACS_DI_INSTRUCTOR_SUBJECT_SHA256?.trim() || "",
    readiness: {
      checks: nonLicenseChecks,
      unauthorizedEnabledFeatureFlags: report.unauthorizedEnabledFeatureFlags,
      productionRuntimeAuthorized: report.productionActivationAuthorized,
    },
  });
}
