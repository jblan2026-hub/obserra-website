import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workflow = fs.readFileSync(".github/workflows/production-vercel-public-cutover.yml", "utf8");

test("public cutover keeps candidate preflight read-only and verifies locked commerce after alias assignment", () => {
  const preflightStart = workflow.indexOf("- name: Preflight exact canonical deployment health");
  const moveStart = workflow.indexOf("- name: Move canonical domains to production project");
  const smokeStart = workflow.indexOf("- name: Verify canonical LMS and prelicense commerce lock");
  const quarantineStart = workflow.indexOf("- name: Quarantine duplicate project and verify canonical domain ownership");

  assert.ok(preflightStart >= 0, "candidate preflight must exist");
  assert.ok(moveStart > preflightStart, "domain movement must follow candidate preflight");
  assert.ok(smokeStart > moveStart, "canonical smoke must follow alias assignment");
  assert.ok(quarantineStart > smokeStart, "quarantine must follow canonical smoke");

  const preflight = workflow.slice(preflightStart, moveStart);
  const canonicalSmoke = workflow.slice(smokeStart, quarantineStart);

  assert.match(preflight, /if \[ "\$\{applications_status\}" = "200" \]; then/);
  assert.match(preflight, /elif \[ "\$\{applications_status\}" = "503" \]; then/);
  assert.match(preflight, /\/api\/apps\/commerce-health/);
  assert.match(preflight, /applications-commerce-health-v1/);
  assert.match(preflight, /if \[ "\$\{commerce_status\}" = "200" \]; then/);
  assert.match(preflight, /elif \[ "\$\{commerce_status\}" = "503" \]; then/);
  assert.match(preflight, /\.operational == false/);
  assert.match(preflight, /\.identity == "available"/);
  assert.match(preflight, /\.identityEnvironment == "live"/);
  assert.doesNotMatch(preflight, /candidate_checkout_status/);
  assert.doesNotMatch(preflight, /\/api\/academy\/checkout/);
  assert.doesNotMatch(preflight, /--request POST/);
  assert.match(preflight, /elif \[ "\$\{florida_ready_status\}" = "503" \]; then/);
  assert.match(preflight, /status == "not_ready"/);
  assert.match(preflight, /retry-after:/i);

  assert.match(canonicalSmoke, /\/api\/apps\/commerce-health/);
  assert.match(canonicalSmoke, /applications-commerce-health-v1/);
  assert.ok(canonicalSmoke.includes("https://${PRIMARY_DOMAIN}/api/academy/checkout"));
  assert.ok(canonicalSmoke.includes('test "${status}" = "307"'));
  assert.ok(canonicalSmoke.includes("enrollment=licensing-pending"));
  assert.ok(canonicalSmoke.includes("x-obserra-sales-license: pending"));
  assert.ok(canonicalSmoke.includes("if: steps.alias.outcome == 'success'"));
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
