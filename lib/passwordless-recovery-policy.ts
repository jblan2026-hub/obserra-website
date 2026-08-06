import "server-only";

export type RecoveryMethod = "verified_email" | "enterprise_idp" | "support_verified";

const SUPPORTED_RECOVERY_METHODS = new Set<RecoveryMethod>([
  "verified_email",
  "enterprise_idp",
  "support_verified",
]);

function parseRecoveryMethods(): RecoveryMethod[] {
  const configured = process.env.OBSERRA_PASSWORDLESS_RECOVERY_METHODS?.trim() || "verified_email,enterprise_idp";
  const methods = configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is RecoveryMethod => SUPPORTED_RECOVERY_METHODS.has(value as RecoveryMethod));
  return [...new Set(methods)];
}

export function passwordlessRecoveryPolicy() {
  const recoveryMethods = parseRecoveryMethods();
  const passwordResetDisabled = process.env.OBSERRA_PASSWORD_RESET_DISABLED?.trim().toLowerCase() === "true";
  const sessionRevocationRequired = process.env.OBSERRA_RECOVERY_REVOKE_SESSIONS?.trim().toLowerCase() === "true";
  const passkeyReenrollmentRequired = process.env.OBSERRA_RECOVERY_PASSKEY_REENROLLMENT?.trim().toLowerCase() === "true";
  const stepUpRequired = process.env.OBSERRA_HIGH_RISK_STEP_UP_REQUIRED?.trim().toLowerCase() === "true";
  const supportRecoveryEnabled = recoveryMethods.includes("support_verified");
  const supportDualApproval = !supportRecoveryEnabled || process.env.OBSERRA_SUPPORT_RECOVERY_DUAL_APPROVAL?.trim().toLowerCase() === "true";
  const hasVerifiedRecovery = recoveryMethods.includes("verified_email") || recoveryMethods.includes("enterprise_idp");

  return {
    recoveryMethods,
    passwordResetDisabled,
    sessionRevocationRequired,
    passkeyReenrollmentRequired,
    stepUpRequired,
    supportDualApproval,
    configured:
      passwordResetDisabled &&
      sessionRevocationRequired &&
      passkeyReenrollmentRequired &&
      stepUpRequired &&
      supportDualApproval &&
      hasVerifiedRecovery,
    protectedActions: [
      "billing-change",
      "owner-operation",
      "token-revocation",
      "organization-token-cutoff",
      "service-credential-change",
      "passkey-reenrollment",
    ],
    failClosed: true,
    provider: "clerk",
  } as const;
}

export function assertPasswordlessRecoveryConfigured() {
  const policy = passwordlessRecoveryPolicy();
  if (!policy.configured) {
    throw new Error(
      "Passwordless recovery is not fully configured. Disable password reset, require verified recovery, revoke existing sessions, require passkey re-enrollment, and enable step-up authentication for high-risk actions.",
    );
  }
  return policy;
}
