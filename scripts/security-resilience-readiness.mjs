import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const results = [];

function gate(name, operation) {
  try {
    operation();
    results.push({ name, status: "pass" });
  } catch (error) {
    results.push({ name, status: "fail", detail: error instanceof Error ? error.message : String(error) });
  }
}

const securityFiles = [
  "lib/resilience.ts",
  "lib/platform-topology.ts",
  "app/api/health/route.ts",
  "app/api/obserrian/route.ts",
  "app/api/admin/obserrian/analytics/route.ts",
  "app/api/admin/maintenance/recommendations/route.ts",
  "scripts/cross-target-contract.mjs",
  "scripts/customer-journey-gate.mjs",
  ".github/workflows/branch-validation.yml",
];

gate("security-resilience-files", () => {
  for (const path of securityFiles) assert.ok(existsSync(join(root, path)), `Missing ${path}`);
});

gate("bounded-retry-and-timeout", () => {
  const source = read("lib/resilience.ts");
  assert.match(source, /Math\.min\(options\.attempts \?\? 3, 5\)/);
  assert.match(source, /AbortController/);
  assert.match(source, /setTimeout\(\(\) => controller\.abort\(\), timeoutMs\)/);
  assert.match(source, /baseDelayMs \* 2 \*\* \(attempt - 1\)/);
  assert.match(source, /Math\.random\(\) \* 75/);
});

gate("structured-recovery-observability", () => {
  const source = read("lib/resilience.ts");
  for (const signal of ["operation_succeeded", "operation_retry", "operation_failed", "fallback_activated"]) {
    assert.ok(source.includes(signal), `Missing resilience event ${signal}`);
  }
  assert.match(source, /timestamp: new Date\(\)\.toISOString\(\)/);
});

gate("fail-closed-owner-security", () => {
  for (const path of [
    "app/api/admin/obserrian/analytics/route.ts",
    "app/api/admin/maintenance/recommendations/route.ts",
  ]) {
    const source = read(path);
    assert.match(source, /currentUser/);
    assert.match(source, /ownerEmailAllowed/);
    assert.match(source, /status: 403/);
    assert.doesNotMatch(source, /status: 200[^]*Owner access required/);
  }
});

gate("health-does-not-leak-secrets", () => {
  const source = read("app/api/health/route.ts");
  assert.doesNotMatch(source, /AI_GATEWAY_API_KEY\s*[,}]/);
  assert.doesNotMatch(source, /CLERK_SECRET_KEY\s*[,}]/);
  assert.doesNotMatch(source, /OBSERRA_GITHUB_PUBLISH_TOKEN\s*[,}]/);
  assert.match(source, /Configured|Fallback mode available/);
  assert.match(source, /cache-control.*no-store/s);
});

gate("degraded-ai-continuity", () => {
  const source = read("app/api/obserrian/route.ts");
  assert.match(source, /catch/);
  assert.match(source, /reviewRecorded/);
  assert.match(source, /recordObserrianInteraction/);
});

gate("three-target-release-parity", () => {
  const topology = read("lib/platform-topology.ts");
  const contract = read("scripts/cross-target-contract.mjs");
  for (const target of ["obserra-website-live", "obserra-website-lcn2", "obserra-integrated-services"]) {
    assert.ok(topology.includes(target), `Topology missing ${target}`);
  }
  for (const key of ["website-live", "website-lcn2", "integrated-services"]) {
    assert.ok(contract.includes(key), `Contract missing ${key}`);
  }
  assert.match(contract, /health\.ready/);
  assert.match(contract, /capability contract mismatch/);
});

gate("rollback-candidate-and-drift-controls", () => {
  const workflow = read(".github/workflows/branch-validation.yml");
  assert.match(workflow, /git diff --exit-code/);
  assert.match(workflow, /Production build/);
  assert.match(workflow, /Macro platform readiness gate/);
  assert.match(workflow, /End-to-end customer and owner journey gate/);
});

gate("abuse-and-invalid-input-coverage", () => {
  const journey = read("scripts/customer-journey-gate.mjs");
  for (const signal of [
    "/api/admin/obserrian/analytics",
    "/api/admin/maintenance/recommendations",
    "/academy/verify",
    "/api/academy/checkout",
    "invalid",
    "403",
  ]) assert.ok(journey.includes(signal), `Journey gate missing abuse signal ${signal}`);
});

gate("production-branch-protection-by-process", () => {
  const workflow = read(".github/workflows/branch-validation.yml");
  assert.match(workflow, /pull_request:[^]*main/s);
  assert.match(workflow, /agent\/catalog-subscription-foundation/);
  assert.match(workflow, /cancel-in-progress: true/);
});

const failed = results.filter((result) => result.status === "fail");
console.log(JSON.stringify({ passed: failed.length === 0, macroGate: "security-resilience-rollback", gateCount: results.length, results }, null, 2));
assert.equal(failed.length, 0, `${failed.length} security/resilience/rollback gate(s) failed`);
