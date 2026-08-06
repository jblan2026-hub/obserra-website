import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [policy, signIn, signUp] = await Promise.all([
  readFile(new URL("../lib/passwordless-auth-policy.ts", import.meta.url), "utf8"),
  readFile(new URL("../app/sign-in/[[...sign-in]]/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/sign-up/[[...sign-up]]/page.tsx", import.meta.url), "utf8"),
]);

const combined = `${signIn}\n${signUp}`;
const checks = [
  [policy.includes("OBSERRA_PASSWORDLESS_REQUIRED"), "requires an explicit passwordless policy declaration"],
  [policy.includes("OBSERRA_PASSWORD_AUTH_DISABLED"), "requires password authentication to be disabled"],
  [policy.includes("OBSERRA_USERNAME_AUTH_DISABLED"), "requires username authentication to be disabled"],
  [policy.includes('"passkey"'), "supports passkeys"],
  [policy.includes('"email_code"'), "supports verified email codes"],
  [policy.includes('"email_link"'), "supports secure email links"],
  [policy.includes('"enterprise_sso"'), "supports enterprise federation"],
  [policy.includes("required && passwordDisabled && usernameDisabled && hasPrimaryMethod"), "fails closed unless the complete passwordless policy is configured"],
  [policy.includes("assertPasswordlessAuthConfigured"), "provides a server-side enforcement assertion"],
  [signIn.includes("<SignIn"), "uses the Clerk sign-in provider"],
  [signUp.includes("<SignUp"), "uses the Clerk sign-up provider"],
  [signIn.includes("Sign in without a password"), "clearly presents passwordless sign-in"],
  [signUp.includes("without a password"), "clearly presents passwordless enrollment"],
  [combined.includes("Passkey ready"), "advertises passkey capability"],
  [combined.includes("Verified email"), "advertises verified email authentication"],
  [!combined.includes('type="password"'), "does not render a custom password field"],
  [!combined.includes('name="password"'), "does not collect a password in application code"],
  [!combined.includes('name="username"'), "does not collect a username in application code"],
  [!combined.includes("forgot password"), "does not retain password-recovery messaging"],
  [signIn.includes('robots: { index: false, follow: false }'), "keeps sign-in out of search indexing"],
  [signUp.includes('robots: { index: false, follow: false }'), "keeps sign-up out of search indexing"],
];

for (const [condition, description] of checks) {
  assert.ok(condition, `Passwordless authentication readiness failed: ${description}`);
}

console.log(`Passwordless authentication readiness passed (${checks.length} controls).`);
