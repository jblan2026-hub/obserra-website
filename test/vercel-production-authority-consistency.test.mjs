import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const CANONICAL_PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC";
const AUXILIARY_PROJECT_ID = "prj_FfAnssVJU8pcJydGNJHmCliP6Yme";
const read = (path) => fs.readFileSync(path, "utf8");

test("production authority is single-sourced to the live canonical Vercel project", () => {
  const runtime = read("lib/auth/runtime-config.ts");
  const ignoreBuild = read("scripts/vercel-ignore-build.sh");
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  const operationalGate = read(".github/workflows/production-e2e-operational-gate.yml");
  const commerceGate = read("scripts/florida-class-d-website-academy-commerce-gate.mjs");
  const cmmcGate = read("scripts/cmmc-level2-rev3-production-evidence.mjs");
  const ignoreBuildTest = read("test/vercel-ignore-build.test.mjs");

  assert.match(runtime, new RegExp(`CANONICAL_PUBLIC_VERCEL_PROJECT_ID = ["']${CANONICAL_PROJECT_ID}["']`));
  assert.match(ignoreBuild, new RegExp(`PRODUCTION_PROJECT_ID=["']${CANONICAL_PROJECT_ID}["']`));
  assert.match(ignoreBuild, new RegExp(`INTEGRATION_PROJECT_ID=["']${AUXILIARY_PROJECT_ID}["']`));
  assert.match(cutover, new RegExp(`CANONICAL_PROJECT_ID:\\s*${CANONICAL_PROJECT_ID}`));
  assert.match(cutover, new RegExp(`AUXILIARY_PROJECT_ID:\\s*${AUXILIARY_PROJECT_ID}`));
  assert.match(operationalGate, new RegExp(CANONICAL_PROJECT_ID, "g"));
  assert.match(commerceGate, new RegExp(CANONICAL_PROJECT_ID));
  assert.match(cmmcGate, new RegExp(CANONICAL_PROJECT_ID));
  assert.match(ignoreBuildTest, new RegExp(`PRODUCTION_PROJECT_ID = ["']${CANONICAL_PROJECT_ID}["']`));
  assert.match(ignoreBuildTest, new RegExp(`INTEGRATION_PROJECT_ID = ["']${AUXILIARY_PROJECT_ID}["']`));
});

test("automatic cutover quarantines duplicates without deleting Vercel projects", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  assert.doesNotMatch(cutover, /--request DELETE(?:(?!--request)[\s\S])*projects\/\$\{AUXILIARY_PROJECT_ID\}\?teamId=/);
  assert.doesNotMatch(cutover, /Retire obsolete auxiliary Vercel project/);
  assert.match(cutover, /commandForIgnoringBuildStep/);
});

test("authority reconciliation does not alter payment or LMS implementation surfaces", () => {
  for (const path of [
    "app/api/academy/checkout/route.ts",
    "app/api/webhook/stripe/route.ts",
    "app/api/apps/checkout/route.ts",
    "app/api/florida-class-d/enrollment/route.ts",
    "app/florida-security-training/page.tsx",
  ]) {
    assert.ok(fs.existsSync(path), `${path} must remain present`);
  }
});
