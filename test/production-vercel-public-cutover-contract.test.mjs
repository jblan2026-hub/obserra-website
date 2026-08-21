import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workflow = fs.readFileSync(".github/workflows/production-vercel-public-cutover.yml", "utf8");

test("public cutover accepts only ready or explicitly fail-closed regulated modules", () => {
  assert.match(workflow, /if \[ "\$\{commerce_status\}" = "200" \]; then/);
  assert.match(workflow, /elif \[ "\$\{commerce_status\}" = "503" \]; then/);
  assert.match(workflow, /\.operational == false/);
  assert.match(workflow, /\.identity == "available"/);
  assert.match(workflow, /\.identityEnvironment == "live"/);
  assert.match(workflow, /candidate_checkout_status/);
  assert.match(workflow, /enrollment=licensing-pending/);
  assert.match(workflow, /x-obserra-sales-license: pending/);
  assert.match(workflow, /elif \[ "\$\{florida_ready_status\}" = "503" \]; then/);
  assert.match(workflow, /status == "not_ready"/);
  assert.match(workflow, /retry-after:/i);
});

test("domain move remains after exact deployment preflight and rollback remains mandatory", () => {
  const preflight = workflow.indexOf("- name: Preflight exact canonical deployment health");
  const move = workflow.indexOf("- name: Move canonical domains to production project");
  const rollback = workflow.indexOf("- name: Roll back canonical domains on failed cutover");
  assert.ok(preflight >= 0 && move > preflight, "domain move must follow preflight");
  assert.ok(rollback > move, "rollback must remain after the move/smoke phase");
});

test("release workflow never enables Academy sales or claims Florida readiness", () => {
  assert.doesNotMatch(workflow, /ACADEMY_SALES_LICENSED\s*=\s*true/);
  assert.doesNotMatch(workflow, /OBSERRA_FDACS_LIVE_READY\s*=\s*true/);
});
