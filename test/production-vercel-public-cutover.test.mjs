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

test("auxiliary Vercel project is configured to ignore duplicate builds", () => {
  assert.match(workflow, /commandForIgnoringBuildStep\":\"exit 0\"/);
  assert.doesNotMatch(workflow, /commandForIgnoringBuildStep\":\"exit 1\"/);
});

test("partial alias attachment or smoke failure triggers rollback only after rollback state is captured", () => {
  assert.match(workflow, /id:\s*attach/);
  assert.match(workflow, /continue-on-error:\s*true/);
  assert.match(workflow, /if:\s*steps\.attach\.outcome == 'success'/);
  assert.match(
    workflow,
    /always\(\) && steps\.rollback\.outcome == 'success' && steps\.rollback\.outputs\.primary != '' && steps\.rollback\.outputs\.apex != '' && \(steps\.attach\.outcome == 'failure' \|\| steps\.smoke\.outcome == 'failure'\)/,
  );
  assert.match(workflow, /if \[ -z "\$\{ROLLBACK_PRIMARY\}" \] \|\| \[ -z "\$\{ROLLBACK_APEX\}" \]/);
  assert.match(workflow, /Rollback deployment IDs were not captured/);
});
