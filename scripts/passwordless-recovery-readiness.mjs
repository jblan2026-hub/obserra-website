import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [policy, signIn, signUp] = await Promise.all([
  readFile(new URL("../lib/passwordless-recovery-policy.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/sign-in/[[...sign-in]]/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/sign-up/[[...sign-up]]/page.tsx", import.meta.url), "utf8"),
]);

const authPages = `${signIn}\n${signUp}`.toLowerCase();
const checks = [
  [policy.includes("OBSERRA_PASSWORD_RESET_DISABLED"), "requires password-reset disablement"],
  [policy.includes("OBSERRA_PASSWORDLESS_RECOVERY_METHODS"), "requires explicit recovery methods"],
  [policy.includes("verified_email"), "supports verified email recovery"],
  [policy.includes("enterprise_idp"), "supports enterprise identity-provider recovery"],
  [policy.includes("OBSERRA_RECOVERY_REVOKE_SESSIONS"), "requires existing-session revocation"],
  [policy.includes("OBSERRA_RECOVERY_PASSKEY_REENROLLMENT"), "requires passkey re-enrollment after recovery"],
  [policy.includes("OBSERRA_HIGH_RISK_STEP_UP_REQUIRED"), "requires step-up authentication for high-risk actions"],
  [policy.includes("OBSERRA_SUPPORT_RECOVERY_DUAL_APPROVAL"), "requires dual approval for support-assisted recovery"],
  [policy.includes('"billing-change"'), "protects billing changes"],
  [policy.includes('"owner-operation"'), "protects owner operations"],
  [policy.includes('"token-revocation"'), "protects token revocation"],
  [policy.includes('"organization-token-cutoff"'), "protects organization containment"],
  [policy.includes('"service-credential-change"'), "protects service credential changes"],
  [policy.includes('"passkey-reenrollment"'), "protects passkey re-enrollment"],
  [policy.includes("failClosed: true"), "fails closed on incomplete recovery policy"],
  [!authPages.includes("forgot password"), "removes forgot-password messaging"],
  [!authPages.includes("reset password"), "removes password-reset messaging"],
  [!authPages.includes('type="password"'), "does not render password fields"],
];

for (const [condition, description] of checks) {
  assert.ok(condition, `Passwordless recovery readiness failed: ${description}`);
}

console.log(`Passwordless recovery readiness passed (${checks.length} controls).`);
