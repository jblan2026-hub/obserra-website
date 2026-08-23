import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("first Azure release independently proves the governed live baseline", async () => {
  const release = await read("scripts/azure-first-release-current-directory.sh");

  // Provenance and deterministic source/artifact.
  assert.match(release, /git fetch --prune origin main/);
  assert.match(release, /git reset --hard origin\/main/);
  assert.match(release, /GIT_SHA=.*git rev-parse HEAD/);
  assert.match(release, /sha256sum obserra-release\.zip/);
  assert.match(release, /release\/OBSERRA_RELEASE_SHA/);

  // IAM/federation and least privilege.
  assert.match(release, /id-obserra-github-prod/);
  assert.match(
    release,
    /repo:jblan2026-hub@309821056\/obserra-website@1321156321:ref:refs\/heads\/main/,
  );
  assert.doesNotMatch(
    release,
    /repo:jblan2026-hub\/obserra-website:ref:refs\/heads\/main/,
  );
  assert.match(release, /token\.actions\.githubusercontent\.com/);
  assert.match(release, /roleDefinitionName == "Contributor"/);
  assert.match(release, /User Access Administrator/);
  assert.match(release, /violates least privilege/);
  assert.match(release, /Key Vault Secrets User/);
  assert.doesNotMatch(release, /5a08a33a-d2b5-491d-ac6d-32f325138143/);

  // Compute and hardening validation against Azure management-plane state.
  assert.match(release, /az webapp config show/);
  assert.match(release, /\.httpsOnly == true/);
  assert.match(release, /\.ftpsState == "Disabled"/);
  assert.match(release, /\.minTlsVersion == "1\.2"/);
  assert.match(release, /\.healthCheckPath == "\/api\/health"/);
  assert.match(release, /enableRbacAuthorization == true/);
  assert.match(release, /enablePurgeProtection == true/);
  assert.match(release, /softDeleteRetentionInDays == 90/);

  // Observability must exist before promotion.
  assert.match(release, /Microsoft\.Insights\/components/);
  assert.match(release, /Microsoft\.OperationalInsights\/workspaces/);

  // GPv2 security and recovery controls are live checks, not source-only checks.
  assert.match(release, /az storage account show/);
  assert.match(release, /\.kind == "StorageV2"/);
  assert.match(release, /\.sku\.name == "Standard_GRS"/);
  assert.match(release, /\.allowBlobPublicAccess == false/);
  assert.match(release, /\.allowCrossTenantReplication == false/);
  assert.match(release, /\.allowSharedKeyAccess == false/);
  assert.match(release, /\.networkRuleSet\.defaultAction == "Deny"/);
  assert.match(release, /az storage account blob-service-properties show/);
  assert.match(release, /\.isVersioningEnabled == true/);
  assert.match(release, /deleteRetentionPolicy\.enabled == true/);
  assert.match(release, /containerDeleteRetentionPolicy\.enabled == true/);

  // Capacity/failure headroom is also proved live.
  assert.match(release, /az monitor autoscale show/);
  assert.match(release, /capacity\.minimum == "2"/);
  assert.match(release, /capacity\.maximum == "4"/);

  // Secret handling inventories IDs/names only; it never requests or prints secret values.
  assert.match(release, /az keyvault secret show/);
  assert.match(release, /--query id/);
  assert.doesNotMatch(release, /--query value/);
  assert.doesNotMatch(release, /sk_live_[A-Za-z0-9]/);
  assert.doesNotMatch(release, /rk_live_[A-Za-z0-9]/);
  assert.doesNotMatch(release, /sb_secret_[A-Za-z0-9]/);

  // Backend quality gates are mandatory before staging mutation.
  assert.match(release, /npm ci/);
  assert.match(release, /npm run typecheck/);
  assert.match(release, /npm run lint/);
  assert.match(release, /npm test/);
  assert.match(release, /npm run build/);

  // API/integration behavior and fail-closed regulated modules are tested on staging.
  assert.match(release, /api\/health/);
  assert.match(release, /api\/academy\/commerce-health/);
  assert.match(release, /ACADEMY_STATUS.*200/);
  assert.doesNotMatch(release, /ACADEMY_STATUS.*503/);
  assert.match(release, /api\/apps\/commerce-health/);
  assert.match(release, /APPLICATIONS_COMMERCE_STATUS.*200/);
  assert.match(release, /stripeLivemode.*true/);
  assert.match(release, /api\/florida-class-d\/health\/live/);
  assert.match(release, /api\/florida-class-d\/health\/ready/);
  assert.match(release, /FLORIDA_READY_STATUS.*503/);
  assert.match(release, /retry-after/);

  // Controlled migration: staging first, exact-SHA proof, swap, independent production proof, reverse swap on failure.
  assert.match(release, /--slot "\$\{STAGING_SLOT\}"/);
  assert.match(release, /hosting\.provider == "azure-app-service"/);
  assert.match(release, /hosting\.gitCommitSha == \$sha/);
  assert.match(release, /az webapp deployment slot swap/);
  assert.match(release, /reversing slot swap/i);
  assert.match(release, /OBSERRA_AZURE_RELEASE=verified/);
});

test("one-command production convergence always converges infrastructure before release", async () => {
  const convergence = await read("scripts/azure-converge-production.sh");

  assert.match(convergence, /git fetch --prune origin main/);
  assert.match(convergence, /git reset --hard origin\/main/);
  const bootstrapIndex = convergence.indexOf("azure-bootstrap-current-directory.sh");
  const releaseIndex = convergence.indexOf("azure-first-release-current-directory.sh");
  assert.ok(bootstrapIndex >= 0, "governed bootstrap must be called");
  assert.ok(releaseIndex > bootstrapIndex, "release must run only after governed bootstrap convergence");
});
