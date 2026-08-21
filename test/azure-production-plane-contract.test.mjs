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

test("Azure compute baseline is staged, hardened, observable, and fail closed", async () => {
  const bicep = await read("infra/main.bicep");

  assert.match(bicep, /Microsoft\.Web\/serverfarms/);
  assert.match(bicep, /Microsoft\.Web\/sites@/);
  assert.match(bicep, /Microsoft\.Web\/sites\/slots@/);
  assert.match(bicep, /NODE\|22-lts/);
  assert.match(bicep, /healthCheckPath:\s*'\/api\/health'/);
  assert.match(bicep, /httpsOnly:\s*true/);
  assert.match(bicep, /ftpsState:\s*'Disabled'/);
  assert.match(bicep, /minTlsVersion:\s*'1\.2'/);
  assert.match(bicep, /scmMinTlsVersion:\s*'1\.2'/);
  assert.match(bicep, /alwaysOn:\s*true/);
  assert.match(bicep, /http20Enabled:\s*true/);
  assert.match(bicep, /UserAssigned/);
  assert.match(bicep, /enableRbacAuthorization:\s*true/);
  assert.match(bicep, /enablePurgeProtection:\s*true/);
  assert.match(bicep, /softDeleteRetentionInDays:\s*90/);
  assert.match(bicep, /Microsoft\.OperationalInsights\/workspaces/);
  assert.match(bicep, /Microsoft\.Insights\/components/);
  assert.match(bicep, /APPLICATIONINSIGHTS_CONNECTION_STRING/);
  assert.match(bicep, /OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED/);
  assert.match(bicep, /value:\s*'disabled'/);
  assert.match(bicep, /FLORIDA_CLASS_D_PRE_ENROLLMENT_ENABLED/);
  assert.match(bicep, /value:\s*'false'/);
});

test("recurring Azure IaC does not retain RBAC assignment mutation", async () => {
  const bicep = await read("infra/main.bicep");

  assert.doesNotMatch(bicep, /Microsoft\.Authorization\/roleAssignments/);
  assert.match(bicep, /output keyVaultId string = keyVault\.id/);
  assert.match(bicep, /output runtimeIdentityPrincipalId string = runtimeIdentity\.properties\.principalId/);
});

test("Azure production storage is hardened GPv2 with recoverability and rejects legacy storage kinds", async () => {
  const storage = await read("infra/storage-gpv2.bicep");
  const workflow = await read(".github/workflows/azure-production-deploy.yml");
  const bootstrap = await read("scripts/azure-bootstrap-current-directory.sh");

  assert.match(storage, /Microsoft\.Storage\/storageAccounts/);
  assert.match(storage, /kind:\s*'StorageV2'/);
  assert.match(storage, /name:\s*'Standard_GRS'/);
  assert.match(storage, /allowBlobPublicAccess:\s*false/);
  assert.match(storage, /allowCrossTenantReplication:\s*false/);
  assert.match(storage, /allowSharedKeyAccess:\s*false/);
  assert.match(storage, /defaultToOAuthAuthentication:\s*true/);
  assert.match(storage, /minimumTlsVersion:\s*'TLS1_2'/);
  assert.match(storage, /supportsHttpsTrafficOnly:\s*true/);
  assert.match(storage, /defaultAction:\s*'Deny'/);
  assert.match(storage, /isVersioningEnabled:\s*true/);
  assert.match(storage, /containerDeleteRetentionPolicy/);
  assert.match(storage, /deleteRetentionPolicy/);
  assert.match(storage, /days:\s*30/);
  assert.doesNotMatch(storage, /kind:\s*'BlobStorage'/);
  assert.doesNotMatch(storage, /kind:\s*'Storage'\s*$/m);

  assert.match(workflow, /infra\/storage-gpv2\.bicep/);
  assert.match(workflow, /az storage account show/);
  assert.match(workflow, /StorageV2/);
  assert.match(bootstrap, /Microsoft\.Storage/);
  assert.match(bootstrap, /infra\/storage-gpv2\.bicep|STORAGE_BICEP_TEMPLATE/);
  assert.match(bootstrap, /az storage account show/);
});

test("Azure production capacity keeps failure headroom and controlled autoscale", async () => {
  const autoscale = await read("infra/autoscale.bicep");
  const workflow = await read(".github/workflows/azure-production-deploy.yml");
  const bootstrap = await read("scripts/azure-bootstrap-current-directory.sh");

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

test("GitHub deployment uses current-directory OIDC, immutable artifact, staged verification, promotion, and rollback", async () => {
  const workflow = await read(".github/workflows/azure-production-deploy.yml");

  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /vars\.AZURE_CLIENT_ID/);
  assert.match(workflow, /vars\.AZURE_TENANT_ID/);
  assert.doesNotMatch(workflow, /5a08a33a-d2b5-491d-ac6d-32f325138143/);
  assert.match(workflow, /azure\/login@v2/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run typecheck/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /release\/OBSERRA_RELEASE_SHA/);
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

test("governed bootstrap discovers the subscription tenant and converges least privilege", async () => {
  const bootstrap = await read("scripts/azure-bootstrap-current-directory.sh");
  const compatibilityBootstrap = await read("scripts/azure-bootstrap-production.sh");

  assert.match(bootstrap, /az account show --subscription "\$\{SUBSCRIPTION_ID\}"/);
  assert.match(bootstrap, /TENANT_ID="\$\(jq -r '\.tenantId'/);
  assert.match(bootstrap, /Using subscription current directory tenant/);
  assert.match(bootstrap, /repo:jblan2026-hub\/obserra-website:ref:refs\/heads\/main/);
  assert.match(bootstrap, /id-obserra-github-prod/);
  assert.match(bootstrap, /--role "Contributor"/);
  assert.match(bootstrap, /User Access Administrator/);
  assert.match(bootstrap, /az role assignment delete/);
  assert.match(bootstrap, /still has User Access Administrator/);
  assert.match(bootstrap, /Key Vault Secrets User/);
  assert.match(bootstrap, /RUNTIME_IDENTITY_PRINCIPAL_ID/);
  assert.match(bootstrap, /KEY_VAULT_ID/);
  assert.match(bootstrap, /--scope "\$\{RG_ID\}"/);
  assert.match(bootstrap, /StorageV2/);
  assert.match(bootstrap, /az storage account show/);
  assert.match(bootstrap, /az monitor autoscale show/);
  assert.doesNotMatch(bootstrap, /5a08a33a-d2b5-491d-ac6d-32f325138143/);
  assert.doesNotMatch(bootstrap, /password/i);
  assert.doesNotMatch(bootstrap, /client[_-]?secret/i);

  assert.match(compatibilityBootstrap, /azure-bootstrap-current-directory\.sh/);
  assert.doesNotMatch(compatibilityBootstrap, /5a08a33a-d2b5-491d-ac6d-32f325138143/);
  assert.doesNotMatch(compatibilityBootstrap, /User Access Administrator/);
});

test("Azure secret delivery remains Key Vault referenced and does not embed secret values in IaC", async () => {
  const bicep = await read("infra/main.bicep");

  for (const secretName of [
    "clerk-secret-key",
    "stripe-secret-key",
    "stripe-webhook-secret",
    "academy-stripe-secret-key",
    "academy-stripe-webhook-secret",
    "academy-supabase-service-role-key",
    "academy-email-hash-secret",
    "fdacs-supabase-service-role-key",
    "fdacs-record-encryption-key-base64",
    "fdacs-daily-api-key",
    "stripe-identity-webhook-secret",
    "openai-api-key",
  ]) {
    assert.match(bicep, new RegExp(`@Microsoft\\.KeyVault\\(VaultName=\\$\\{keyVault\\.name\\};SecretName=${secretName}\\)`));
  }

  assert.doesNotMatch(bicep, /sk_live_[A-Za-z0-9]/);
  assert.doesNotMatch(bicep, /rk_live_[A-Za-z0-9]/);
  assert.doesNotMatch(bicep, /sb_secret_[A-Za-z0-9]/);
});

test("Next.js produces a standalone artifact for App Service", async () => {
  const config = await read("next.config.ts");
  assert.match(config, /output:\s*"standalone"/);
  assert.match(config, /isProductionRuntime/);
});
