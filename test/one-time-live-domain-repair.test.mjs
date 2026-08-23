import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const WORKFLOW = path.resolve(".github/workflows/one-time-live-domain-repair.yml");

test("live-domain repair is an explicit, pinned, rollback-safe alias operation", () => {
  const workflow = fs.readFileSync(WORKFLOW, "utf8");

  assert.match(workflow, /^on:\n  workflow_dispatch:/m);
  assert.match(workflow, /expected_commit:\n\s+description: "Exact 40-character SHA currently at main/);
  assert.match(workflow, /confirmation:\n\s+description: "Type repair-live-domains/);
  assert.match(workflow, /EXPECTED_MAIN_SHA: \$\{\{ inputs\.expected_commit \}\}/);
  assert.match(workflow, /actual_main=.*commits\/main/);
  assert.match(workflow, /actual_main}" != "\$\{EXPECTED_MAIN_SHA\}"/);
  assert.match(workflow, /Attach canonical domains to the exact verified production deployment/);
  assert.match(workflow, /v2\/deployments\/\$\{CANDIDATE_DEPLOYMENT\}\/aliases/);
  assert.match(workflow, /v4\/aliases\/\$\{alias\}/);
  assert.match(workflow, /steps\.attach\.outcome == 'failure'/);
  assert.match(workflow, /Attach ".*\$\{ROLLBACK_PRIMARY\}".*"\$\{PRIMARY_DOMAIN\}"/s);
  assert.doesNotMatch(workflow, /\/api\/academy\/checkout/);
});
