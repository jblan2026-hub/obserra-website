import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const requiredFiles = [
  "app/api/health/route.ts",
  "app/api/obserrian/route.ts",
  "app/api/admin/obserrian/analytics/route.ts",
  "app/api/admin/maintenance/recommendations/route.ts",
  "app/admin/site-control/OwnerAiSiteControl.tsx",
  "app/ObserraGuide.tsx",
  "lib/platform-topology.ts",
  "lib/resilience.ts",
  "lib/obserrian-agent.ts",
  "lib/obserrian-review.ts",
  "lib/owner-maintenance-advisor.ts",
  "scripts/production-smoke.mjs",
  "scripts/cross-target-contract.mjs",
  ".github/workflows/branch-validation.yml",
];

const results = [];
function gate(name, operation) {
  try {
    operation();
    results.push({ name, status: "pass" });
  } catch (error) {
    results.push({ name, status: "fail", detail: error instanceof Error ? error.message : String(error) });
  }
}

gate("required-platform-files", () => {
  for (const path of requiredFiles) assert.ok(existsSync(join(root, path)), `Missing ${path}`);
});

gate("single-source-topology", () => {
  const source = read("lib/platform-topology.ts");
  assert.match(source, /single-source-shared-platform/);
  assert.match(source, /obserra-website-live/);
  assert.match(source, /obserra-website-lcn2/);
  assert.match(source, /obserra-integrated-services/);
  assert.match(source, /Build common capability once/);
});

gate("health-contract", () => {
  const source = read("app/api/health/route.ts");
  assert.match(source, /resolveDeploymentTarget/);
  assert.match(source, /sharedPlatformCapabilities/);
  assert.match(source, /platformDependencySummary/);
  assert.match(source, /cache-control.*no-store/s);
  assert.match(source, /503/);
});

gate("obserrian-global-guide", () => {
  const source = read("app/ObserraGuide.tsx");
  assert.match(source, /usePathname/);
  assert.match(source, /\/api\/obserrian/);
  assert.match(source, /academy/);
  assert.match(source, /apps/);
  assert.match(source, /protection-intelligence/);
  assert.doesNotMatch(source, /excludedPaths\s*=\s*\[[^\]]*academy/s);
});

gate("obserrian-degraded-mode", () => {
  const source = read("app/api/obserrian/route.ts");
  assert.match(source, /recordObserrianInteraction/);
  assert.match(source, /reviewRecorded/);
  assert.match(source, /catch/);
});

gate("owner-boundaries-fail-closed", () => {
  for (const path of [
    "app/api/admin/obserrian/analytics/route.ts",
    "app/api/admin/maintenance/recommendations/route.ts",
  ]) {
    const source = read(path);
    assert.match(source, /currentUser/);
    assert.match(source, /ownerEmailAllowed/);
    assert.match(source, /403/);
  }
});

gate("preview-first-change-control", () => {
  const source = read("app/admin/site-control/OwnerAiSiteControl.tsx");
  assert.match(source, /site-change\/plan/);
  assert.match(source, /site-change\/preview/);
  assert.match(source, /Production changed/);
  assert.match(source, /No/);
});

gate("credential-artwork-resilience", () => {
  const source = read("app/about/VerifiedCredentials.tsx");
  assert.doesNotMatch(source, /<img\s+src=\{image\}/);
  assert.match(source, /Verify credential/);
  assert.match(source, /EC-Council/);
});

gate("production-smoke-coverage", () => {
  const source = read("scripts/production-smoke.mjs");
  for (const signal of [
    "/api/health",
    "/api/obserrian",
    "/academy/verify",
    "/admin/site-control",
    "/protection-intelligence",
  ]) assert.ok(source.includes(signal), `Smoke coverage missing ${signal}`);
});

gate("cross-target-contract", () => {
  const source = read("scripts/cross-target-contract.mjs");
  assert.match(source, /website-live/);
  assert.match(source, /website-lcn2/);
  assert.match(source, /integrated-services/);
  assert.match(source, /capability contract mismatch/);
  assert.match(source, /target count mismatch/);
});

gate("no-placeholder-production-copy", () => {
  const files = ["app/ObserraGuide.tsx", "app/admin/site-control/OwnerAiSiteControl.tsx"];
  for (const path of files) assert.doesNotMatch(read(path), /lorem ipsum|replace me|todo:/i, `${path} contains placeholder copy`);
});

const failed = results.filter((result) => result.status === "fail");
console.log(JSON.stringify({ passed: failed.length === 0, gateCount: results.length, results }, null, 2));
assert.equal(failed.length, 0, `${failed.length} release-readiness gate(s) failed`);
