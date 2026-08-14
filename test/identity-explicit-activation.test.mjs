import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const config = fs.readFileSync("lib/clerk-runtime-config.ts", "utf8");
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const proxy = fs.readFileSync("proxy.ts", "utf8");
const envExample = fs.readFileSync(".env.example", "utf8");

test("identity runtime requires an explicit server-side activation control", () => {
  assert.match(config, /OBSERRA_IDENTITY_RUNTIME_ENABLED/);
  assert.match(config, /=== "true"/);
  assert.match(config, /"runtime_disabled"/);
  assert.match(config, /const ready = runtimeEnabled && reasonCodes\.length === 0/);
  assert.match(config, /runtimeEnabled,/);
  assert.match(envExample, /OBSERRA_IDENTITY_RUNTIME_ENABLED=false/);
});

test("public application rendering does not require Clerk when identity is disabled", () => {
  assert.match(layout, /const clerkRuntime = prepareClerkRuntime\(\);/);
  assert.match(layout, /if \(!clerkRuntime\.ready \|\| !clerkRuntime\.publishableKey\) return application;/);
  assert.match(layout, /<ClerkProvider/);
});

test("protected identity paths remain fail closed while public traffic can degrade safely", () => {
  assert.match(proxy, /if \(!authenticationReady\(\)\)/);
  assert.match(proxy, /return identityConfigurationResponse\(request\);/);
  assert.match(proxy, /configuredClerkHandler = clerkMiddleware\(/);
  assert.match(proxy, /await auth\(\)/);
  assert.match(proxy, /return regulatedMutationBoundary\(request\);/);
});
