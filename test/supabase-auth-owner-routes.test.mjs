import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function read(path) {
  assert.ok(fs.existsSync(path), `${path} must exist`);
  return fs.readFileSync(path, "utf8");
}

test("shared sign-in preserves Clerk Applications and enables Supabase only behind its flag", () => {
  const signIn = read("app/sign-in/[[...sign-in]]/page.tsx");
  assert.match(signIn, /identityProviderForRequest/);
  assert.match(signIn, /prepareSupabaseAuthRuntime/);
  assert.match(signIn, /supabaseRuntime\.runtimeEnabled/);
  assert.match(signIn, /<SignIn/);
  assert.match(signIn, /<SupabaseSignInForm/);
});

test("Supabase account creation is invitation-only while Clerk Applications retain sign-up", () => {
  const signUp = read("app/sign-up/[[...sign-up]]/page.tsx");
  assert.match(signUp, /identityProviderForRequest/);
  assert.match(signUp, /<SignUp/);
  assert.match(signUp, /Invitation required/);
  assert.doesNotMatch(signUp, /supabase\.auth\.signUp/);
});

test("Supabase identity screens render the full governed legal entity name", () => {
  const signInForm = read("app/sign-in/[[...sign-in]]/SupabaseSignInForm.tsx");
  const signUp = read("app/sign-up/[[...sign-up]]/page.tsx");

  for (const source of [signInForm, signUp]) {
    assert.match(source, /LEGAL_ENTITY_NAME/);
    assert.doesNotMatch(source, /Obserra identity/);
  }
  assert.match(signInForm, /approved \{LEGAL_ENTITY_NAME\} identity/);
  assert.match(signUp, /\{LEGAL_ENTITY_NAME\} identity accounts/);
});

test("callback exchanges PKCE code, preserves safe redirects, and routes AAL2 challenge", () => {
  const callback = read("app/auth/callback/route.ts");
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /safeRelativeRedirect/);
  assert.match(callback, /getAuthenticatorAssuranceLevel/);
  assert.match(callback, /\/auth\/mfa/);
  assert.match(callback, /cache-control.*no-store/is);
});

test("sign-out is same-origin POST and MFA verifies an existing factor", () => {
  const signOut = read("app/sign-out/route.ts");
  const mfa = read("app/auth/mfa/MfaChallenge.tsx");
  assert.match(signOut, /export async function POST/);
  assert.match(signOut, /request\.headers\.get\("origin"\)/);
  assert.match(signOut, /supabase\.auth\.signOut/);
  assert.doesNotMatch(signOut, /export async function GET/);
  assert.match(mfa, /challengeAndVerify/);
  assert.match(mfa, /totp/);
  assert.doesNotMatch(mfa, /\.enroll\(/);
});
