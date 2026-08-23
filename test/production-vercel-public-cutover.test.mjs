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

test("workflow dispatch can pin cutover to the exact preflighted deployment while push remains SHA-based", () => {
  assert.match(
    workflow,
    /workflow_dispatch:\s*\n\s*inputs:\s*\n\s*expected_deployment_id:/,
  );
  assert.match(workflow, /EXPECTED_DEPLOYMENT_ID:\s*\$\{\{ inputs\.expected_deployment_id \|\| '' \}\}/);
  assert.match(workflow, /--arg expected "\$\{EXPECTED_DEPLOYMENT_ID\}"/);
  assert.match(
    workflow,
    /select\(\(\$expected == ""\) or \(\(\.uid \/\/ \.id \/\/ ""\) == \$expected\)\)/,
  );
  assert.match(
    workflow,
    /if \[ -n "\$\{EXPECTED_DEPLOYMENT_ID\}" \] && \[ "\$\{candidate\}" != "\$\{EXPECTED_DEPLOYMENT_ID\}" \]/,
  );
});

test("cutover records redacted Check-v2 evidence only for the exact candidate without changing release authority", () => {
  const candidateStart = workflow.indexOf("- name: Wait for exact canonical READY deployment");
  const evidenceStart = workflow.indexOf("- name: Record exact Vercel deployment-check evidence");
  const preflightStart = workflow.indexOf("- name: Preflight exact canonical deployment health");

  assert.ok(candidateStart >= 0, "exact candidate selection must exist");
  assert.ok(evidenceStart > candidateStart, "check evidence must follow exact candidate selection");
  assert.ok(preflightStart > evidenceStart, "public preflight must remain the next release-authority phase");

  const evidence = workflow.slice(evidenceStart, preflightStart);
  assert.ok(
    evidence.includes(
      "https://api.vercel.com/v2/deployments/${CANDIDATE_DEPLOYMENT}/check-runs?teamId=${TEAM_ID}",
    ),
    "Check-v2 query must be scoped to the exact candidate deployment",
  );
  assert.match(evidence, /all\(\.runs\[\]; \.deploymentId == \$deployment\)/);
  assert.match(evidence, /deploymentId:\s*\$deployment/);
  assert.match(evidence, /checkId:/);
  assert.match(evidence, /name,/);
  assert.match(evidence, /status,/);
  assert.match(evidence, /conclusion:/);
  assert.match(evidence, /blocks:/);
  assert.match(evidence, /source:/);
  assert.match(evidence, /exit 0/);
  assert.doesNotMatch(evidence, /conclusionText|externalUrl|\.output\b|\bcat\b/);
  assert.doesNotMatch(workflow, /steps\.deployment_checks/);
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

test("failed Clerk DNS check is re-requested only after exact canonical proof without weakening release controls", () => {
  const quarantineStart = workflow.indexOf("- name: Quarantine duplicate project and verify canonical domain ownership");
  const reconcileStart = workflow.indexOf("- name: Reconcile exact Clerk DNS check after canonical proof");
  const rollbackStart = workflow.indexOf("- name: Roll back canonical domains on failed cutover");
  assert.ok(quarantineStart >= 0, "canonical ownership verification must exist");
  assert.ok(reconcileStart > quarantineStart, "Clerk reconciliation must follow exact canonical proof");
  assert.ok(rollbackStart > reconcileStart, "rollback control must remain after reconciliation");

  const reconcile = workflow.slice(reconcileStart, rollbackStart);
  assert.match(reconcile, /if: steps\.quarantine\.outcome == 'success'/);
  assert.match(reconcile, /continue-on-error:\s*true/);
  assert.match(reconcile, /verify_cname "clerk\.obserrallc\.com" "frontend-api\.clerk\.services\."/);
  assert.match(reconcile, /verify_cname "accounts\.obserrallc\.com" "accounts\.clerk\.services\."/);
  assert.ok(reconcile.includes('"https://${PRIMARY_DOMAIN}/sign-in"'));
  assert.match(reconcile, /pk_live_/);
  assert.match(reconcile, /clerk\\\.accounts\\\.dev/);
  assert.ok(
    reconcile.includes(
      "https://api.vercel.com/v2/deployments/${CANDIDATE_DEPLOYMENT}/check-runs?teamId=${TEAM_ID}",
    ),
    "Clerk reconciliation must inspect only the exact candidate",
  );
  assert.match(reconcile, /\.name == "Clerk DNS Configuration"/);
  assert.match(reconcile, /\.conclusion == "failed"/);
  assert.match(reconcile, /\.blocks == "deployment-alias"/);
  assert.match(reconcile, /\.requires == "deployment-url"/);
  assert.match(reconcile, /\.source\.kind == "integration"/);
  assert.match(reconcile, /\.isRerequestable == true/);
  assert.ok(
    reconcile.includes(
      "https://api.vercel.com/v1/deployments/${CANDIDATE_DEPLOYMENT}/checks/${check_id}/rerequest?autoUpdate=true&teamId=${TEAM_ID}",
    ),
    "only the exact proven check may be re-requested",
  );
  assert.match(reconcile, /for attempt in \$\(seq 1 12\)/);
  assert.doesNotMatch(reconcile, /--request DELETE|project checks remove|conclusionText|externalUrl|\.output\b|\bcat\b/);
  assert.doesNotMatch(workflow, /ACADEMY_SALES_LICENSED\s*=\s*true/);
  assert.doesNotMatch(workflow, /OBSERRA_FDACS_LIVE_READY\s*=\s*true/);
});

test("alias assignment verifies both canonical aliases converge to the exact candidate before smoke", () => {
  const aliasStart = workflow.indexOf("- name: Assign canonical domains to exact candidate deployment");
  const smokeStart = workflow.indexOf("- name: Verify canonical LMS and prelicense commerce lock");
  assert.ok(aliasStart >= 0 && smokeStart > aliasStart, "alias verification must precede canonical smoke");

  const aliasStep = workflow.slice(aliasStart, smokeStart);
  assert.match(aliasStep, /verify_alias\(\)/);
  assert.match(
    aliasStep,
    /https:\/\/api\.vercel\.com\/v4\/aliases\/\$\{domain\}\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(aliasStep, /observed=.*\.deploymentId \/\/ \.deployment\.id \/\/ empty/);
  assert.match(aliasStep, /if \[ "\$\{observed\}" = "\$\{CANDIDATE_DEPLOYMENT\}" \]; then/);
  assert.match(aliasStep, /verify_alias "\$\{PRIMARY_DOMAIN\}"/);
  assert.match(aliasStep, /verify_alias "\$\{APEX_DOMAIN\}"/);
  assert.match(aliasStep, /did not converge to the exact approved deployment/);
});

test("partial project-domain move, alias assignment, or smoke failure restores each domain to its captured prior state", () => {
  assert.match(workflow, /id:\s*move/);
  assert.match(workflow, /id:\s*alias/);
  assert.match(workflow, /continue-on-error:\s*true/);
  assert.match(workflow, /if:\s*steps\.move\.outcome == 'success'/);
  assert.match(workflow, /if:\s*steps\.alias\.outcome == 'success'/);
  assert.match(
    workflow,
    /always\(\) && steps\.rollback\.outcome == 'success' && steps\.rollback\.outputs\.primary != '' && steps\.rollback\.outputs\.apex != '' && \(steps\.move\.outcome == 'failure' \|\| steps\.alias\.outcome == 'failure' \|\| steps\.smoke\.outcome == 'failure'\)/,
  );
  assert.match(workflow, /ROLLBACK_PRIMARY_PROJECT:\s*\$\{\{ steps\.move\.outputs\.primary_source_project \}\}/);
  assert.match(workflow, /ROLLBACK_APEX_PROJECT:\s*\$\{\{ steps\.move\.outputs\.apex_source_project \}\}/);
  assert.match(workflow, /restore_domain\(\)/);
  assert.match(workflow, /local source_project="\$3"/);
  assert.match(workflow, /if \[ "\$\{moved\}" = "true" \] \|\| \[ -n "\$\{source_project\}" \]; then/);
  assert.match(workflow, /--data "\{\\"projectId\\":\\"\$\{source_project\}\\"\}"/);
  assert.match(workflow, /--data "\{\\"alias\\":\\"\$\{domain\}\\"\}"/);
  assert.match(
    workflow,
    /https:\/\/api\.vercel\.com\/v2\/deployments\/\$\{deployment\}\/aliases\?teamId=\$\{TEAM_ID\}/,
  );
  assert.match(workflow, /if \[ -z "\$\{ROLLBACK_PRIMARY\}" \] \|\| \[ -z "\$\{ROLLBACK_APEX\}" \]/);
  assert.match(workflow, /Rollback deployment IDs were not captured/);
});

test("rollback journals prior ownership before mutation and verifies restoration without masking the original failure", () => {
  const moveStart = workflow.indexOf("- name: Move canonical domains to production project");
  const aliasStart = workflow.indexOf("- name: Assign canonical domains to exact candidate deployment");
  const recoveryStart = workflow.indexOf("- name: Roll back canonical domains on failed cutover");
  const outcomeStart = workflow.indexOf("- name: Publish safe cutover control-plane outcome");
  const enforcementStart = workflow.indexOf("- name: Enforce fail-closed cutover result");
  assert.ok(moveStart >= 0 && aliasStart > moveStart);
  assert.ok(recoveryStart > aliasStart && outcomeStart > recoveryStart && enforcementStart > outcomeStart);

  const move = workflow.slice(moveStart, aliasStart);
  const recovery = workflow.slice(recoveryStart, outcomeStart);
  const enforcement = workflow.slice(enforcementStart);
  const journalIndex = move.indexOf('echo "${output_name}_source_project=${source_project}"');
  const mutationIndex = move.indexOf('https://api.vercel.com/v1/projects/${source_project}/domains/${domain}/move');
  assert.ok(journalIndex >= 0 && mutationIndex > journalIndex, "prior owner must be journaled before mutation");

  assert.match(recovery, /projects\/\$\{CANONICAL_PROJECT_ID\}\/domains\/\$\{domain\}/);
  assert.match(recovery, /projects\/\$\{source_project\}\/domains\/\$\{domain\}/);
  assert.match(recovery, /verify_restored_alias "\$\{PRIMARY_DOMAIN\}" "\$\{ROLLBACK_PRIMARY\}"/);
  assert.match(recovery, /verify_restored_alias "\$\{APEX_DOMAIN\}" "\$\{ROLLBACK_APEX\}"/);
  assert.match(recovery, /::notice::Production cutover failed/);
  assert.doesNotMatch(
    recovery,
    /::error::Production cutover failed; every canonical alias was restored[^\n]*\n\s*exit 1/,
  );

  assert.match(enforcement, /RECOVERY_OUTCOME/);
  assert.match(enforcement, /canonical rollback completed and was verified/);
  assert.match(enforcement, /exit 1/);
});
