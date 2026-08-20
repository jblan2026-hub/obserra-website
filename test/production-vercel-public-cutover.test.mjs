import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workflow = fs.readFileSync(".github/workflows/production-vercel-public-cutover.yml", "utf8");

test("production Vercel cutover reserves enough time for readiness polling, smoke verification, and rollback", () => {
  assert.match(workflow, /timeout-minutes:\s*30/);
  assert.match(workflow, /for attempt in \$\(seq 1 60\)/);
  assert.match(workflow, /Roll back canonical domains on failed cutover/);
});

test("deployment polling retries bounded transport and response failures", () => {
  assert.match(workflow, /--connect-timeout 10/);
  assert.match(workflow, /--max-time 20/);
  assert.match(workflow, /Vercel deployment lookup failed on attempt \$\{attempt\}\/60; retrying/);
  assert.match(workflow, /Vercel deployment lookup returned an unreadable response on attempt \$\{attempt\}\/60; retrying/);
  assert.match(workflow, /No exact READY canonical deployment appeared/);
});

test("rollback alias capture fails closed and distinguishes missing aliases from other API failures", () => {
  assert.match(workflow, /--write-out '%\{http_code\}'/);
  assert.match(workflow, /if \[ "\$\{status\}" = "404" \]/);
  assert.match(workflow, /Required rollback alias \$\{alias\} is not configured/);
  assert.match(workflow, /if \[ "\$\{status\}" != "200" \]/);
  assert.match(workflow, /Vercel rollback-alias lookup failed for \$\{alias\}/);
  assert.match(workflow, /Vercel returned no deployment ID for required rollback alias/);
});

test("cutover distinguishes the duplicate build project from every known noncanonical domain claimant", () => {
  assert.match(workflow, /DUPLICATE_PROJECT_ID:\s*prj_FfAnssVJU8pcJydGNJHmCliP6Yme/);
  assert.match(
    workflow,
    /NON_CANONICAL_DOMAIN_PROJECT_IDS:\s*"?prj_FfAnssVJU8pcJydGNJHmCliP6Yme prj_v6Hb7FkpkUoLKlHkjzKJ5HVgYDaL"?/,
  );
  assert.doesNotMatch(workflow, /AUXILIARY_PROJECT_ID:/);
  assert.match(workflow, /for project_id in \$\{NON_CANONICAL_DOMAIN_PROJECT_IDS\}; do/);
});

test("only the proven duplicate project is configured to ignore duplicate builds", () => {
  assert.match(workflow, /commandForIgnoringBuildStep\":\"exit 0\"/);
  assert.doesNotMatch(workflow, /commandForIgnoringBuildStep\":\"exit 1\"/);
  assert.match(workflow, /projects\/\$\{DUPLICATE_PROJECT_ID\}\?teamId=\$\{TEAM_ID\}/);
  assert.doesNotMatch(workflow, /projects\/\$\{project_id\}\?teamId=\$\{TEAM_ID\}[\s\S]*commandForIgnoringBuildStep/);
});

test("domain move discovers the actual source owner and fails closed on ambiguous ownership", () => {
  assert.match(workflow, /source_projects=\(\)/);
  assert.match(workflow, /source_projects\+\=\("\$\{project_id\}"\)/);
  assert.match(workflow, /if \[ "\$\{#source_projects\[@\]\}" -gt 1 \]/);
  assert.match(workflow, /Ambiguous noncanonical ownership for \$\{domain\}/);
  assert.match(
    workflow,
    /https:\/\/api\.vercel\.com\/v1\/projects\/\$\{source_project\}\/domains\/\$\{domain\}\/move\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(workflow, /echo "\$\{output_name\}_source_project=\$\{source_project\}" >> "\$\{GITHUB_OUTPUT\}"/);
});

test("post-cutover verification rejects canonical domains on every noncanonical project", () => {
  assert.match(workflow, /for project_id in \$\{NON_CANONICAL_DOMAIN_PROJECT_IDS\}; do/);
  assert.match(workflow, /Noncanonical Vercel project \$\{project_id\} still owns a canonical production domain after move/);
});

test("partial project-domain move or smoke failure restores each domain to its actual prior source", () => {
  assert.match(workflow, /id:\s*move/);
  assert.match(workflow, /continue-on-error:\s*true/);
  assert.match(workflow, /if:\s*steps\.move\.outcome == 'success'/);
  assert.match(
    workflow,
    /always\(\) && steps\.rollback\.outcome == 'success' && steps\.rollback\.outputs\.primary != '' && steps\.rollback\.outputs\.apex != '' && \(steps\.move\.outcome == 'failure' \|\| steps\.smoke\.outcome == 'failure'\)/,
  );
  assert.match(workflow, /ROLLBACK_PRIMARY_PROJECT:\s*\$\{\{ steps\.move\.outputs\.primary_source_project \}\}/);
  assert.match(workflow, /ROLLBACK_APEX_PROJECT:\s*\$\{\{ steps\.move\.outputs\.apex_source_project \}\}/);
  assert.match(workflow, /local source_project="\$3"/);
  assert.match(workflow, /--data "\{\\"projectId\\":\\"\$\{source_project\}\\"\}"/);
  assert.match(workflow, /if \[ -z "\$\{ROLLBACK_PRIMARY\}" \] \|\| \[ -z "\$\{ROLLBACK_APEX\}" \]/);
  assert.match(workflow, /Rollback deployment IDs were not captured/);
});
