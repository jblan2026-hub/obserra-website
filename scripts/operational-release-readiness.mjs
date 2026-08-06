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

const required = [
  "app/api/academy/checkout/route.ts",
  "app/api/academy/certificate/verify/route.ts",
  "app/academy/verify/page.tsx",
  "app/admin/site-control/page.tsx",
  "app/admin/site-control/OwnerAiSiteControl.tsx",
  "app/api/admin/site-change/plan/route.ts",
  "app/api/admin/site-change/preview/route.ts",
  "app/api/admin/operations/live/route.ts",
  "app/api/cron/control-room-health/route.ts",
  "app/api/health/route.ts",
  "app/api/obserrian/route.ts",
  "lib/control-room-monitor.ts",
  "scripts/customer-journey-gate.mjs",
  "scripts/cross-target-contract.mjs",
  "scripts/security-resilience-readiness.mjs",
  "vercel.json",
];

gate("required-operational-surfaces", () => {
  for (const path of required) assert.ok(existsSync(join(root, path)), `Missing ${path}`);
});

gate("academy-checkout-safe-by-default", () => {
  const source = read("app/api/academy/checkout/route.ts");
  assert.match(source, /Stripe|stripe/i);
  assert.match(source, /course/i);
  assert.match(source, /not-ready|invalid|redirect/i);
  assert.doesNotMatch(source, /sk_live_[A-Za-z0-9]+/);
});

gate("certificate-verification-lifecycle", () => {
  const api = read("app/api/academy/certificate/verify/route.ts");
  const page = read("app/academy/verify/page.tsx");
  assert.match(api, /certificate/i);
  assert.match(api, /400/);
  assert.match(page, /Verify/i);
  assert.doesNotMatch(api, /private[_-]?key|secret\s*:/i);
});

gate("owner-change-control-is-preview-first", () => {
  const control = read("app/admin/site-control/OwnerAiSiteControl.tsx");
  const plan = read("app/api/admin/site-change/plan/route.ts");
  const preview = read("app/api/admin/site-change/preview/route.ts");
  assert.match(control, /preview/i);
  assert.match(control, /Production changed/i);
  assert.match(plan, /currentUser|ownerEmailAllowed/);
  assert.match(preview, /currentUser|ownerEmailAllowed/);
  assert.doesNotMatch(control, /auto.?publish|publish.?without.?approval/i);
});

gate("persistent-live-control-room", () => {
  const control = read("app/admin/site-control/OwnerAiSiteControl.tsx");
  const monitor = read("lib/control-room-monitor.ts");
  const liveApi = read("app/api/admin/operations/live/route.ts");
  const cronApi = read("app/api/cron/control-room-health/route.ts");
  const vercel = read("vercel.json");
  assert.match(control, /setInterval\([^]*15_000/s);
  assert.match(control, /visibilitychange/);
  assert.match(control, /Pause live updates/);
  assert.match(control, /api\/admin\/operations\/live/);
  assert.match(monitor, /Promise\.all\(deploymentTargets\.map/);
  assert.match(monitor, /withResilience/);
  assert.match(monitor, /identityValid/);
  assert.match(liveApi, /currentUser/);
  assert.match(liveApi, /ownerEmailAllowed/);
  assert.match(cronApi, /CRON_SECRET/);
  assert.match(cronApi, /persistent_control_room_check/);
  assert.match(vercel, /api\/cron\/control-room-health/);
  assert.match(vercel, /\*\/5 \* \* \* \*/);
});

gate("operational-health-and-ai-continuity", () => {
  const health = read("app/api/health/route.ts");
  const ai = read("app/api/obserrian/route.ts");
  assert.match(health, /ready/);
  assert.match(health, /503/);
  assert.match(health, /no-store/);
  assert.match(ai, /catch/);
  assert.match(ai, /reviewRecorded/);
});

gate("deployed-journey-coverage", () => {
  const journey = read("scripts/customer-journey-gate.mjs");
  for (const signal of [
    "/apps",
    "/academy",
    "/academy/verify",
    "/api/academy/certificate/verify",
    "/api/academy/checkout",
    "/api/obserrian",
    "/api/health",
    "/admin/site-control",
    "/api/admin/site-change/plan",
  ]) assert.ok(journey.includes(signal), `Missing deployed journey signal ${signal}`);
});

gate("three-target-operational-parity", () => {
  const contract = read("scripts/cross-target-contract.mjs");
  const monitor = read("lib/control-room-monitor.ts");
  for (const key of ["website-live", "website-lcn2", "integrated-services"]) {
    assert.ok(contract.includes(key), `Missing target ${key}`);
    assert.ok(monitor.includes(key), `Live monitor missing ${key}`);
  }
  assert.match(contract, /ready/);
  assert.match(contract, /capabilities/);
});

gate("release-process-blocks-drift", () => {
  const workflow = read(".github/workflows/branch-validation.yml");
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /git diff --exit-code/);
  assert.match(workflow, /deployed-system-gates/);
  assert.match(workflow, /workflow_dispatch/);
});

const failed = results.filter((result) => result.status === "fail");
console.log(JSON.stringify({ passed: failed.length === 0, macroGate: "operational-commerce-lifecycle-live-control-room", gateCount: results.length, results }, null, 2));
assert.equal(failed.length, 0, `${failed.length} operational release gate(s) failed`);
