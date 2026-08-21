import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync("app/api/florida-class-d/health/ready/route.ts", "utf8");

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
});
