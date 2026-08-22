import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const CANONICAL_PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC";
const CANONICAL_PROJECT_NAME = "obserra-website-live";
const DUPLICATE_PROJECT_ID = "prj_FfAnssVJU8pcJydGNJHmCliP6Yme";
const INTEGRATED_SERVICES_PROJECT_ID = "prj_v6Hb7FkpkUoLKlHkjzKJ5HVgYDaL";
const read = (path) => fs.readFileSync(path, "utf8");

test("production authority is single-sourced to the live canonical Vercel project", () => {
  const runtime = read("lib/auth/runtime-config.ts");
  const ignoreBuild = read("scripts/vercel-ignore-build.sh");
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  const operationalGate = read(".github/workflows/production-e2e-operational-gate.yml");
  const commerceGate = read("scripts/florida-class-d-website-academy-commerce-gate.mjs");
  const ignoreBuildTest = read("test/vercel-ignore-build.test.mjs");
  const readme = read("README.md");

  assert.match(runtime, new RegExp(`CANONICAL_PUBLIC_VERCEL_PROJECT_ID = ["']${CANONICAL_PROJECT_ID}["']`));
  assert.match(ignoreBuild, new RegExp(`PRODUCTION_PROJECT_ID=["']${CANONICAL_PROJECT_ID}["']`));
  assert.doesNotMatch(ignoreBuild, /DUPLICATE_PROJECT_ID|INTEGRATED_SERVICES_PROJECT_ID/);
  assert.match(ignoreBuild, /"\$PRODUCTION_PROJECT_ID"\)[\s\S]*exit 1/);
  assert.match(ignoreBuild, /\*\)[\s\S]*exit 0/);
  assert.match(cutover, new RegExp(`CANONICAL_PROJECT_ID:\\s*${CANONICAL_PROJECT_ID}`));
  assert.match(cutover, new RegExp(`DUPLICATE_PROJECT_ID:\\s*${DUPLICATE_PROJECT_ID}`));
  assert.match(
    cutover,
    new RegExp(`NON_CANONICAL_DOMAIN_PROJECT_IDS:.*${DUPLICATE_PROJECT_ID}.*${INTEGRATED_SERVICES_PROJECT_ID}`),
  );
  assert.doesNotMatch(cutover, /AUXILIARY_PROJECT_ID:/);
  assert.match(operationalGate, new RegExp(CANONICAL_PROJECT_ID, "g"));
  assert.match(commerceGate, new RegExp(CANONICAL_PROJECT_ID));
  assert.match(ignoreBuildTest, new RegExp(`PRODUCTION_PROJECT_ID = ["']${CANONICAL_PROJECT_ID}["']`));
  assert.match(ignoreBuildTest, /NON_CANONICAL_PROJECT_IDS/);
  assert.match(readme, new RegExp(CANONICAL_PROJECT_NAME));
  assert.match(readme, new RegExp(CANONICAL_PROJECT_ID));
  assert.doesNotMatch(readme, /authoritative production project is Vercel project `obserra-integrated-services`/i);
  assert.doesNotMatch(readme, /Deploy only[^\n]*`obserra-integrated-services` project/i);
});

test("automatic cutover discovers the actual noncanonical owner before moving to the canonical project", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  const moveStep = "Move canonical domains to production project";
  const smokeStep = "Verify canonical LMS and prelicense commerce lock";
  const moveIndex = cutover.indexOf(moveStep);
  const smokeIndex = cutover.indexOf(smokeStep);

  assert.ok(moveIndex >= 0, "cutover must contain the project-domain move step");
  assert.ok(smokeIndex > moveIndex, "project-domain ownership must move before live smoke validation");
  assert.match(cutover, /for project_id in \$\{NON_CANONICAL_DOMAIN_PROJECT_IDS\}; do/);
  assert.match(cutover, /source_projects\+\=\("\$\{project_id\}"\)/);
  assert.match(cutover, /if \[ "\$\{#source_projects\[@\]\}" -gt 1 \]; then/);
  assert.match(
    cutover,
    /https:\/\/api\.vercel\.com\/v1\/projects\/\$\{source_project\}\/domains\/\$\{domain\}\/move\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(cutover, /--data "\{\\"projectId\\":\\"\$\{CANONICAL_PROJECT_ID\}\\"\}"/);
});

test("automatic cutover assigns both canonical aliases to the approved deployment", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  const moveIndex = cutover.indexOf("Move canonical domains to production project");
  const aliasIndex = cutover.indexOf("Assign canonical domains to exact candidate deployment");
  const smokeIndex = cutover.indexOf("Verify canonical LMS and prelicense commerce lock");

  assert.ok(aliasIndex > moveIndex, "candidate alias assignment must happen after ownership reconciliation");
  assert.ok(smokeIndex > aliasIndex, "live smoke validation must use the newly assigned candidate aliases");
  assert.match(cutover, /id: alias/);
  assert.match(cutover, /if: steps\.move\.outcome == 'success'/);
  assert.match(cutover, /CANDIDATE_DEPLOYMENT:\s*\$\{\{ steps\.candidate\.outputs\.deployment_id \}\}/);
  assert.match(
    cutover,
    /https:\/\/api\.vercel\.com\/v2\/deployments\/\$\{CANDIDATE_DEPLOYMENT\}\/aliases\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(cutover, /assign_alias "\$\{PRIMARY_DOMAIN\}"/);
  assert.match(cutover, /assign_alias "\$\{APEX_DOMAIN\}"/);
  assert.match(cutover, /if: steps\.alias\.outcome == 'success'/);
});

test("automatic cutover restores aliases even when a domain was already canonical", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");

  assert.match(
    cutover,
    /https:\/\/api\.vercel\.com\/v9\/projects\/\$\{project_id\}\/domains\/\$\{domain\}\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(cutover, /echo "\$\{output_name\}_moved=false" >> "\$\{GITHUB_OUTPUT\}"/);
  assert.match(cutover, /echo "\$\{output_name\}_moved=true" >> "\$\{GITHUB_OUTPUT\}"/);
  assert.match(cutover, /restore_domain\(\)/);
  assert.match(cutover, /if \[ "\$\{moved\}" = "true" \]; then/);
  assert.match(cutover, /--data "\{\\"projectId\\":\\"\$\{source_project\}\\"\}"/);
  assert.match(cutover, /--data "\{\\"alias\\":\\"\$\{domain\}\\"\}"/);
  assert.match(
    cutover,
    /steps\.move\.outcome == 'failure' \|\| steps\.alias\.outcome == 'failure' \|\| steps\.smoke\.outcome == 'failure'/,
  );
});

test("automatic cutover quarantines only the proven duplicate and preserves legitimate projects", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  assert.doesNotMatch(cutover, /--request DELETE(?:(?!--request)[\s\S])*projects\/\$\{DUPLICATE_PROJECT_ID\}\?teamId=/);
  assert.doesNotMatch(cutover, /Retire obsolete auxiliary Vercel project/);
  assert.match(cutover, /commandForIgnoringBuildStep/);
  assert.match(cutover, /projects\/\$\{DUPLICATE_PROJECT_ID\}\?teamId=\$\{TEAM_ID\}/);
  assert.doesNotMatch(
    cutover,
    new RegExp(`projects/${INTEGRATED_SERVICES_PROJECT_ID}\\?teamId=\\$\\{TEAM_ID\\}[\\s\\S]*commandForIgnoringBuildStep`),
  );
});

test("post-cutover ownership verification covers every known noncanonical claimant", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  assert.match(cutover, /for project_id in \$\{NON_CANONICAL_DOMAIN_PROJECT_IDS\}; do/);
  assert.match(
    cutover,
    /Noncanonical Vercel project \$\{project_id\} still owns a canonical production domain after move/,
  );
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
