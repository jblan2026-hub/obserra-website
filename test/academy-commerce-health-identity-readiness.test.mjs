import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync("app/api/academy/commerce-health/route.ts", "utf8");

test("Academy commerce health checks Clerk configuration without requiring a user session", () => {
  assert.doesNotMatch(
    route,
    /safeIdentity/,
    "public commerce health must not call session-level Clerk auth() through safeIdentity",
  );
  assert.match(
    route,
    /prepareClerkRuntime/,
    "public commerce health must evaluate Clerk runtime configuration readiness directly",
  );
  assert.match(
    route,
    /identity\.ready\s*\?\s*["']available["']\s*:\s*["']degraded["']/,
    "identity availability must derive from Clerk runtime readiness",
  );
  assert.match(
    route,
    /identityEnvironment:\s*identity\.environment/,
    "commerce health must retain the Clerk runtime environment in the contract",
  );
});
