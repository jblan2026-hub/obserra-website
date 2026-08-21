import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync("app/api/academy/commerce-health/route.ts", "utf8");
const durableCommerceGate = fs.readFileSync("scripts/academy-durable-commerce-gate.mjs", "utf8");

test("Academy commerce health checks Supabase runtime readiness without requiring a learner session", () => {
  assert.doesNotMatch(
    route,
    /safeIdentity|safeAcademyIdentity/,
    "public commerce health must not require session-level learner authentication",
  );
  assert.match(
    route,
    /academyIdentityRuntimeReady/,
    "public commerce health must evaluate Supabase runtime configuration readiness directly",
  );
  assert.match(
    route,
    /academyIdentityEnvironment/,
    "public commerce health must report the Supabase identity environment",
  );
  assert.match(
    route,
    /identityReady\s*\?\s*["']available["']\s*:\s*["']degraded["']/,
    "identity availability must derive from Supabase runtime readiness",
  );
  assert.doesNotMatch(
    route,
    /prepareClerkRuntime/,
    "Academy commerce health must not use Clerk as learner identity authority",
  );
});

test("Gate 35 enforces the same Supabase runtime readiness contract as commerce health", () => {
  assert.match(
    durableCommerceGate,
    /academyIdentityRuntimeReady/,
    "Gate 35 must require the configuration-only Supabase readiness path",
  );
  assert.match(
    durableCommerceGate,
    /academyIdentityEnvironment/,
    "Gate 35 must require the Supabase identity environment contract",
  );
  assert.match(
    durableCommerceGate,
    /forbidText\(commerceHealthFile, commerceHealth, "prepareClerkRuntime"/,
    "Gate 35 must explicitly forbid Clerk learner readiness in public Academy commerce health",
  );
  assert.doesNotMatch(
    durableCommerceGate,
    /requireText\(commerceHealthFile, commerceHealth, "prepareClerkRuntime"/,
    "Gate 35 must not require Clerk learner readiness",
  );
});
