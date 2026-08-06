import "server-only";

export type PasswordlessMethod = "passkey" | "email_code" | "email_link" | "enterprise_sso";

const SUPPORTED_METHODS = new Set<PasswordlessMethod>([
  "passkey",
  "email_code",
  "email_link",
  "enterprise_sso",
]);

function parseMethods(): PasswordlessMethod[] {
  const configured = process.env.OBSERRA_PASSWORDLESS_METHODS?.trim() || "passkey,email_code";
  const methods = configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is PasswordlessMethod => SUPPORTED_METHODS.has(value as PasswordlessMethod));

  return [...new Set(methods)];
}

export function passwordlessAuthPolicy() {
  const methods = parseMethods();
  const required = process.env.OBSERRA_PASSWORDLESS_REQUIRED?.trim().toLowerCase() === "true";
  const passwordDisabled = process.env.OBSERRA_PASSWORD_AUTH_DISABLED?.trim().toLowerCase() === "true";
  const usernameDisabled = process.env.OBSERRA_USERNAME_AUTH_DISABLED?.trim().toLowerCase() === "true";
  const hasPrimaryMethod = methods.includes("passkey") || methods.includes("email_code") || methods.includes("email_link");

  return {
    required,
    passwordDisabled,
    usernameDisabled,
    methods,
    configured: required && passwordDisabled && usernameDisabled && hasPrimaryMethod,
    failClosed: true,
    provider: "clerk",
  } as const;
}

export function assertPasswordlessAuthConfigured() {
  const policy = passwordlessAuthPolicy();
  if (!policy.configured) {
    throw new Error(
      "Passwordless authentication is not fully configured. Require passwordless auth, disable password and username auth, and enable passkeys or verified email authentication in Clerk.",
    );
  }
  return policy;
}
