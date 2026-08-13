export const FLORIDA_CLASS_D_ENROLLMENT_POLICY_VERSION = "2026-08-13-v1";

export type FloridaClassDAcknowledgmentCode =
  | "training-not-license"
  | "identity-accuracy"
  | "attendance-40-hours"
  | "exam-separate-controlled"
  | "records-privacy"
  | "academic-integrity";

export type FloridaClassDAcknowledgment = {
  code: FloridaClassDAcknowledgmentCode;
  label: string;
  statement: string;
};

export const floridaClassDRequiredAcknowledgments: readonly FloridaClassDAcknowledgment[] = [
  {
    code: "training-not-license",
    label: "Training and licensure are separate",
    statement:
      "I understand that completing the Obserra training program does not itself issue a Florida Class D Security Officer license and that applicable state licensing requirements remain separate.",
  },
  {
    code: "identity-accuracy",
    label: "Identity information is accurate",
    statement:
      "I certify that the legal name and date of birth I provide for the regulated training record are accurate and belong to me.",
  },
  {
    code: "attendance-40-hours",
    label: "Instructional attendance is controlled",
    statement:
      "I understand that the regulated training record must document the required instructional time and that I may not receive instructional credit for time I did not complete.",
  },
  {
    code: "exam-separate-controlled",
    label: "Certification examination is separately controlled",
    statement:
      "I understand that examination eligibility and examination records are controlled separately from instructional progress and are not unlocked merely by purchase or account creation.",
  },
  {
    code: "records-privacy",
    label: "Regulated training records will be retained",
    statement:
      "I understand that Obserra will maintain regulated training records needed for school administration, compliance, inspection readiness, and applicable legal or regulatory obligations.",
  },
  {
    code: "academic-integrity",
    label: "Assessment and examination integrity",
    statement:
      "I agree not to share protected assessment or examination content, impersonate another learner, or falsify attendance, instructional time, identity, or completion evidence.",
  },
] as const;

export const floridaClassDRequiredAcknowledgmentCodes = floridaClassDRequiredAcknowledgments.map(
  (item) => item.code,
);

export function validateFloridaClassDAcknowledgments(
  acceptedCodes: readonly string[],
): acceptedCodes is FloridaClassDAcknowledgmentCode[] {
  const accepted = new Set(acceptedCodes);
  return (
    accepted.size === floridaClassDRequiredAcknowledgmentCodes.length &&
    floridaClassDRequiredAcknowledgmentCodes.every((code) => accepted.has(code))
  );
}

export function floridaClassDPreEnrollmentEnabled() {
  return process.env.FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED?.trim().toLowerCase() === "true";
}
