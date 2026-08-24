import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const config = fs.readFileSync("lib/clerk-runtime-config.ts", "utf8");
const ownerUat = fs.readFileSync("lib/florida-class-d-owner-uat.ts", "utf8");
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const signInLayout = fs.readFileSync("app/sign-in/layout.tsx", "utf8");
const signUpLayout = fs.readFileSync("app/sign-up/layout.tsx", "utf8");
const authLayout = fs.readFileSync("app/auth/layout.tsx", "utf8");
const portalLayout = fs.readFileSync("app/portal/layout.tsx", "utf8");
const portalPage = fs.readFileSync("app/portal/page.tsx", "utf8");
const proxy = fs.readFileSync("proxy.ts", "utf8");
const envExample = fs.readFileSync(".env.example", "utf8");

test("identity runtime requires an explicit server-side activation control", () => {
  assert.match(config, /OBSERRA_IDENTITY_RUNTIME_ENABLED/);
  assert.match(config, /=== "true"/);
  assert.match(config, /"runtime_disabled"/);
  assert.match(config, /const ready = runtimeEnabled && reasonCodes\.length === 0/);
  assert.match(config, /runtimeEnabled,/);
  assert.match(ownerUat, /trueFlag\("OBSERRA_IDENTITY_RUNTIME_ENABLED"\)/);
  assert.doesNotMatch(ownerUat, /enabled\("OBSERRA_IDENTITY_RUNTIME_ENABLED"\)/);
  assert.match(envExample, /OBSERRA_IDENTITY_RUNTIME_ENABLED=false/);
});

test("public root rendering does not load Clerk browser or auth-only styles", () => {
  assert.doesNotMatch(layout, /@clerk\/nextjs/);
  assert.doesNotMatch(layout, /prepareClerkRuntime/);
  assert.doesNotMatch(layout, /<ClerkProvider/);
  assert.doesNotMatch(layout, /\.\/auth\.css/);
  assert.match(signInLayout, /<ClerkProvider/);
  assert.match(signInLayout, /\.\.\/auth\.css/);
  assert.match(signUpLayout, /<ClerkProvider/);
  assert.match(signUpLayout, /\.\.\/auth\.css/);
  assert.match(authLayout, /\.\.\/auth\.css/);
});

test("portal scopes Clerk context above every client-side UserButton", () => {
  assert.match(portalPage, /<UserButton/);
  assert.match(portalLayout, /<ClerkProvider/);
  assert.match(portalLayout, /signInUrl="\/sign-in"/);
  assert.match(portalLayout, /signInFallbackRedirectUrl="\/portal"/);
  assert.match(portalLayout, /\.\.\/auth\.css/);
});

test("protected identity paths remain fail closed while public traffic can degrade safely", () => {
  assert.match(proxy, /if \(!authenticationReady\(\)\)/);
  assert.match(proxy, /return identityConfigurationResponse\(request\);/);
  assert.match(proxy, /configuredClerkHandler = clerkMiddleware\(/);
  assert.match(proxy, /await auth\(\)/);
  assert.match(proxy, /return regulatedMutationBoundary\(request\);/);
});

test("the protected marketplace hangar and private APIs are Clerk-owned before server auth", () => {
  assert.match(proxy, /"\/ai-marketplace\/hangar"/);
  assert.match(config, /OBSERRA_IDENTITY_RUNTIME_ENABLED/);
  const routing = fs.readFileSync("lib/auth/provider-routing.ts", "utf8");
  for (const path of [
    "/ai-marketplace/hangar",
    "/api/ai-marketplace/access",
    "/api/ai-marketplace/checkout",
    "/api/ai-marketplace/download",
    "/api/ai-marketplace/install-grant",
  ]) {
    assert.match(routing, new RegExp(path.replaceAll("/", "\\/")));
  }
});
