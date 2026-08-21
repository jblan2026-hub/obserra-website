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

test("Azure production storage is hardened GPv2 and rejects legacy storage kinds", async () => {
  const storage = await read("infra/storage-gpv2.bicep");
  const workflow = await read(".github/workflows/azure-production-deploy.yml");
  const bootstrap = await read("scripts/azure-bootstrap-production.sh");

  assert.match(storage, /Microsoft\.Storage\/storageAccounts/);
  assert.match(storage, /kind:\s*'StorageV2'/);
  assert.match(storage, /name:\s*'Standard_GRS'/);
  assert.match(storage, /allowBlobPublicAccess:\s*false/);
  assert.match(storage, /allowSharedKeyAccess:\s*false/);
  assert.match(storage, /defaultToOAuthAuthentication:\s*true/);
  assert.match(storage, /minimumTlsVersion:\s*'TLS1_2'/);
  assert.match(storage, /supportsHttpsTrafficOnly:\s*true/);
  assert.match(storage, /defaultAction:\s*'Deny'/);
  assert.match(storage, /isVersioningEnabled:\s*true/);
  assert.doesNotMatch(storage, /kind:\s*'BlobStorage'/);
  assert.doesNotMatch(storage, /kind:\s*'Storage'\s*$/m);

  assert.match(workflow, /infra\/storage-gpv2\.bicep/);
  assert.match(workflow, /az storage account show/);
  assert.match(workflow, /StorageV2/);
  assert.match(bootstrap, /Microsoft\.Storage/);
  assert.match(bootstrap, /infra\/storage-gpv2\.bicep|STORAGE_BICEP_TEMPLATE/);
  assert.match(bootstrap, /az storage account show/);
});

test("Azure production capacity keeps two-instance headroom and controlled autoscale", async () => {
  const autoscale = await read("infra/autoscale.bicep");
  const workflow = await read(".github/workflows/azure-production-deploy.yml");
  const bootstrap = await read("scripts/azure-bootstrap-production.sh");

  assert.match(autoscale, /Microsoft\.Insights\/autoscaleSettings/);
  assert.match(autoscale, /minimum:\s*'2'/);
  assert.match(autoscale, /default:\s*'2'/);
  assert.match(autoscale, /maximum:\s*'4'/);
  assert.match(autoscale, /metricName:\s*'CpuPercentage'/);
  assert.match(autoscale, /threshold:\s*70/);
  assert.match(autoscale, /direction:\s*'Increase'/);
  assert.match(autoscale, /direction:\s*'Decrease'/);
  assert.match(workflow, /infra\/autoscale\.bicep/);
  assert.match(workflow, /az monitor autoscale show/);
  assert.match(bootstrap, /infra\/autoscale\.bicep|AUTOSCALE_BICEP_TEMPLATE/);
  assert.match(bootstrap, /az monitor autoscale show/);
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

test("current-directory bootstrap trusts the subscription tenant and preserves hardened controls", async () => {
  const bootstrap = await read("scripts/azure-bootstrap-current-directory.sh");

  assert.match(bootstrap, /az account show --subscription "\$\{SUBSCRIPTION_ID\}"/);
  assert.match(bootstrap, /TENANT_ID="\$\(jq -r '\.tenantId'/);
  assert.match(bootstrap, /Using subscription current directory tenant/);
  assert.match(bootstrap, /repo:jblan2026-hub\/obserra-website:ref:refs\/heads\/main/);
  assert.match(bootstrap, /--scope "\$\{RG_ID\}"/);
  assert.match(bootstrap, /Microsoft\.Storage/);
  assert.match(bootstrap, /StorageV2/);
  assert.match(bootstrap, /az storage account show/);
  assert.match(bootstrap, /az monitor autoscale show/);
  assert.doesNotMatch(bootstrap, /5a08a33a-d2b5-491d-ac6d-32f325138143/);
  assert.doesNotMatch(bootstrap, /password/i);
  assert.doesNotMatch(bootstrap, /client[_-]?secret/i);
});

test("Next.js produces a standalone artifact for App Service", async () => {
  const config = await read("next.config.ts");
  assert.match(config, /output:\s*"standalone"/);
  assert.match(config, /isProductionRuntime/);
});
