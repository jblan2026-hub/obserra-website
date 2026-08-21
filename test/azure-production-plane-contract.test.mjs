import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("Azure production plane uses provider-neutral exact-release authority", async () => {
  const health = await read("app/api/health/route.ts");
  const runtime = await read("lib/runtime-environment.ts");

  assert.match(health, /OBSERRA_HOSTING_PROVIDER/);
  assert.match(health, /OBSERRA_EXPECTED_HOSTING_PROVIDER/);
  assert.match(health, /OBSERRA_RELEASE_SHA/);
  assert.match(health, /hostingAuthority/);
  assert.match(runtime, /OBSERRA_RUNTIME_ENVIRONMENT/);
  assert.match(runtime, /VERCEL_ENV/);
  assert.match(runtime, /isProductionRuntime/);
});

test("Azure infrastructure is App Service with a staging slot and managed identity", async () => {
  const bicep = await read("infra/main.bicep");

  assert.match(bicep, /Microsoft\.Web\/serverfarms/);
  assert.match(bicep, /Microsoft\.Web\/sites@/);
  assert.match(bicep, /Microsoft\.Web\/sites\/slots@/);
  assert.match(bicep, /NODE\|22-lts/);
  assert.match(bicep, /healthCheckPath:\s*'\/api\/health'/);
  assert.match(bicep, /UserAssigned/);
  assert.match(bicep, /enableRbacAuthorization:\s*true/);
  assert.match(bicep, /enablePurgeProtection:\s*true/);
  assert.match(bicep, /OBSERRA_RUNTIME_ENVIRONMENT/);
  assert.match(bicep, /OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED/);
  assert.match(bicep, /value:\s*'disabled'/);
});

test("GitHub deployment uses OIDC, staging verification, slot swap, and rollback", async () => {
  const workflow = await read(".github/workflows/azure-production-deploy.yml");

  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /azure\/login@v2/);
  assert.match(workflow, /azure\/webapps-deploy@v3/);
  assert.match(workflow, /slot-name:/);
  assert.match(workflow, /api\/health/);
  assert.match(workflow, /hosting\.provider == "azure-app-service"/);
  assert.match(workflow, /gitCommitSha == \$sha/);
  assert.match(workflow, /az webapp deployment slot swap/);
  assert.match(workflow, /Reversing the slot swap/);
  assert.doesNotMatch(workflow, /publish-profile/i);
  assert.doesNotMatch(workflow, /AZURE_CREDENTIALS/);
  assert.doesNotMatch(workflow, /client-secret/i);
});

test("Azure bootstrap scopes GitHub OIDC to the production resource group", async () => {
  const bootstrap = await read("scripts/azure-bootstrap-production.sh");

  assert.match(bootstrap, /repo:jblan2026-hub\/obserra-website:ref:refs\/heads\/main/);
  assert.match(bootstrap, /id-obserra-github-prod/);
  assert.match(bootstrap, /Contributor/);
  assert.match(bootstrap, /User Access Administrator/);
  assert.match(bootstrap, /--scope "\$\{RG_ID\}"/);
  assert.doesNotMatch(bootstrap, /password/i);
  assert.doesNotMatch(bootstrap, /client[_-]?secret/i);
});

test("Next.js produces a standalone artifact for App Service", async () => {
  const config = await read("next.config.ts");
  assert.match(config, /output:\s*"standalone"/);
  assert.match(config, /isProductionRuntime/);
});
