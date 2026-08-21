import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync("app/api/florida-class-d/health/ready/route.ts", "utf8");
const gate27 = fs.readFileSync("scripts/florida-class-d-resilience-observability-gate.mjs", "utf8");

test("Florida readiness logs only internal failing-check identifiers while public payload stays minimal", () => {
  assert.match(route, /getFloridaClassDResilienceSnapshot/);
  assert.match(route, /nonLicenseBlockingKeys/);
  assert.match(route, /failingCheckKeys/);
  assert.match(route, /console\.warn/);
  assert.match(route, /service:\s*["']florida-class-d-lms["']/);
  assert.match(route, /status:\s*ready\s*\?\s*["']ready["']\s*:\s*["']not_ready["']/);

  assert.doesNotMatch(route, /process\.env/);
  assert.doesNotMatch(route, /serviceRole/i);
  assert.doesNotMatch(route, /secret/i);
  assert.doesNotMatch(route, /apiKey/i);
  assert.doesNotMatch(route, /nonLicenseBlockingKeys\s*:/, "public response must not serialize internal readiness keys");
  assert.doesNotMatch(route, /failingCheckKeys\s*:/, "public response must not serialize internal HA keys");
  assert.doesNotMatch(route, /NextResponse\.json\(\s*snapshot/, "public response must not serialize the detailed snapshot");
});

test("Gate 27 permits sanitized server diagnostics without weakening the public health boundary", () => {
  assert.match(gate27, /getFloridaClassDResilienceSnapshot/);
  assert.match(gate27, /technicalFailureKeys/);
  assert.match(gate27, /highAvailabilityFailureKeys/);
  assert.match(gate27, /NextResponse\.json/);
  assert.match(gate27, /public readiness/i);
  assert.doesNotMatch(
    gate27,
    /public readiness may not expose the detailed resilience snapshot/,
    "Gate 27 must distinguish internal snapshot inspection from public snapshot serialization",
  );
});
