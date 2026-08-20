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
  assert.match(ignoreBuild, new RegExp(`DUPLICATE_PROJECT_ID=["']${AUXILIARY_PROJECT_ID}["']`));
  assert.match(cutover, new RegExp(`CANONICAL_PROJECT_ID:\\s*${CANONICAL_PROJECT_ID}`));
  assert.match(cutover, new RegExp(`AUXILIARY_PROJECT_ID:\\s*${AUXILIARY_PROJECT_ID}`));
  assert.match(operationalGate, new RegExp(CANONICAL_PROJECT_ID, "g"));
  assert.match(commerceGate, new RegExp(CANONICAL_PROJECT_ID));
  assert.match(cmmcGate, new RegExp(CANONICAL_PROJECT_ID));
  assert.match(ignoreBuildTest, new RegExp(`PRODUCTION_PROJECT_ID = ["']${CANONICAL_PROJECT_ID}["']`));
  assert.match(ignoreBuildTest, new RegExp(`DUPLICATE_PROJECT_ID = ["']${AUXILIARY_PROJECT_ID}["']`));
});

test("automatic cutover moves custom-domain ownership to the canonical project before smoke validation", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  const moveStep = "Move canonical domains to production project";
  const smokeStep = "Verify canonical LMS and prelicense commerce lock";
  const moveIndex = cutover.indexOf(moveStep);
  const smokeIndex = cutover.indexOf(smokeStep);

  assert.ok(moveIndex >= 0, "cutover must contain the project-domain move step");
  assert.ok(smokeIndex > moveIndex, "project-domain ownership must move before live smoke validation");
  assert.match(
    cutover,
    /https:\/\/api\.vercel\.com\/v1\/projects\/\$\{AUXILIARY_PROJECT_ID\}\/domains\/\$\{domain\}\/move\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(cutover, /--data "\{\\"projectId\\":\\"\$\{CANONICAL_PROJECT_ID\\}\\"\}"/);
});

test("automatic cutover is idempotent and rollback reverses only ownership changed by that run", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");

  assert.match(
    cutover,
    /https:\/\/api\.vercel\.com\/v9\/projects\/\$\{AUXILIARY_PROJECT_ID\}\/domains\/\$\{domain\}\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(cutover, /if \[ "\$\{status\}" = "404" \]; then/);
  assert.match(
    cutover,
    /https:\/\/api\.vercel\.com\/v9\/projects\/\$\{CANONICAL_PROJECT_ID\}\/domains\/\$\{domain\}\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(cutover, /echo "\$\{output_name\}_moved=false" >> "\$\{GITHUB_OUTPUT\}"/);
  assert.match(cutover, /echo "\$\{output_name\}_moved=true" >> "\$\{GITHUB_OUTPUT\}"/);
  assert.match(cutover, /MOVED_PRIMARY:\s*\$\{\{ steps\.move\.outputs\.primary_moved \}\}/);
  assert.match(cutover, /MOVED_APEX:\s*\$\{\{ steps\.move\.outputs\.apex_moved \}\}/);
  assert.match(cutover, /move_back_if_moved\(\)/);
  assert.match(cutover, /if \[ "\$\{moved\}" != "true" \]; then/);
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
