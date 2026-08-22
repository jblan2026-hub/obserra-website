#!/usr/bin/env bash
set -euo pipefail

SUBSCRIPTION_ID="38d660ff-611e-4f6c-ad29-70f5cf118f52"
RESOURCE_GROUP="rg-obserra-prod-eastus"
WEB_APP_NAME="obserra-web-prod-38d660"
STAGING_SLOT="staging"
STORAGE_ACCOUNT="stobserraprod38d660"
AUTOSCALE_NAME="autoscale-obserra-prod"
DEPLOY_IDENTITY="id-obserra-github-prod"
FEDERATED_CREDENTIAL="github-main"
GITHUB_SUBJECT="repo:jblan2026-hub/obserra-website:ref:refs/heads/main"
OIDC_ISSUER="https://token.actions.githubusercontent.com"
OIDC_AUDIENCE="api://AzureADTokenExchange"
KEY_VAULT_NAME="kv-obserra-prod-38d660"
RUNTIME_IDENTITY_NAME="id-obserra-runtime-prod"
APP_INSIGHTS_NAME="appi-obserra-prod-eastus"
LOG_ANALYTICS_NAME="law-obserra-prod-eastus"
REPO="jblan2026-hub/obserra-website"
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

for command_name in az jq git node npm zip curl grep sha256sum; do
  command -v "${command_name}" >/dev/null 2>&1 || {
    echo "Required command is unavailable: ${command_name}" >&2
    exit 1
  }
done

cd "${REPO_ROOT}"
az account set --subscription "${SUBSCRIPTION_ID}"
ACCOUNT_JSON="$(az account show --subscription "${SUBSCRIPTION_ID}" -o json)"
ACTUAL_SUBSCRIPTION="$(jq -r '.id' <<<"${ACCOUNT_JSON}")"
TENANT_ID="$(jq -r '.tenantId' <<<"${ACCOUNT_JSON}")"
test "${ACTUAL_SUBSCRIPTION}" = "${SUBSCRIPTION_ID}"
test -n "${TENANT_ID}" && test "${TENANT_ID}" != "null"

echo "Governed release tenant: ${TENANT_ID}"

# Freeze exact source before any application mutation.
git fetch --prune origin main
git checkout main
git reset --hard origin/main
GIT_SHA="$(git rev-parse HEAD)"
test -n "${GIT_SHA}"

# ----- IAM / trust baseline -----
RG_ID="$(az group show --name "${RESOURCE_GROUP}" --query id -o tsv)"
test -n "${RG_ID}"

DEPLOY_IDENTITY_JSON="$(az identity show --resource-group "${RESOURCE_GROUP}" --name "${DEPLOY_IDENTITY}" -o json)"
CLIENT_ID="$(jq -r '.clientId' <<<"${DEPLOY_IDENTITY_JSON}")"
DEPLOY_PRINCIPAL_ID="$(jq -r '.principalId' <<<"${DEPLOY_IDENTITY_JSON}")"
test -n "${CLIENT_ID}" && test "${CLIENT_ID}" != "null"
test -n "${DEPLOY_PRINCIPAL_ID}" && test "${DEPLOY_PRINCIPAL_ID}" != "null"

FEDERATED_JSON="$(az identity federated-credential show \
  --resource-group "${RESOURCE_GROUP}" \
  --identity-name "${DEPLOY_IDENTITY}" \
  --name "${FEDERATED_CREDENTIAL}" -o json)"
test "$(jq -r '.issuer' <<<"${FEDERATED_JSON}")" = "${OIDC_ISSUER}"
test "$(jq -r '.subject' <<<"${FEDERATED_JSON}")" = "${GITHUB_SUBJECT}"
jq -e --arg audience "${OIDC_AUDIENCE}" '.audiences | index($audience) != null' <<<"${FEDERATED_JSON}" >/dev/null

DEPLOY_ROLE_JSON="$(az role assignment list --assignee-object-id "${DEPLOY_PRINCIPAL_ID}" --scope "${RG_ID}" -o json)"
jq -e 'any(.[]; .roleDefinitionName == "Contributor")' <<<"${DEPLOY_ROLE_JSON}" >/dev/null
if jq -e 'any(.[]; .roleDefinitionName == "User Access Administrator")' <<<"${DEPLOY_ROLE_JSON}" >/dev/null; then
  echo "Deployment identity violates least privilege: User Access Administrator remains assigned." >&2
  exit 1
fi

RUNTIME_IDENTITY_JSON="$(az identity show --resource-group "${RESOURCE_GROUP}" --name "${RUNTIME_IDENTITY_NAME}" -o json)"
RUNTIME_PRINCIPAL_ID="$(jq -r '.principalId' <<<"${RUNTIME_IDENTITY_JSON}")"
test -n "${RUNTIME_PRINCIPAL_ID}" && test "${RUNTIME_PRINCIPAL_ID}" != "null"
KEY_VAULT_ID="$(az keyvault show --resource-group "${RESOURCE_GROUP}" --name "${KEY_VAULT_NAME}" --query id -o tsv)"
test -n "${KEY_VAULT_ID}"
RUNTIME_KV_ROLE_JSON="$(az role assignment list --assignee-object-id "${RUNTIME_PRINCIPAL_ID}" --scope "${KEY_VAULT_ID}" -o json)"
jq -e 'any(.[]; .roleDefinitionName == "Key Vault Secrets User")' <<<"${RUNTIME_KV_ROLE_JSON}" >/dev/null

# ----- Compute / hardening / observability baseline -----
WEBAPP_JSON="$(az webapp show --resource-group "${RESOURCE_GROUP}" --name "${WEB_APP_NAME}" -o json)"
STAGING_JSON="$(az webapp show --resource-group "${RESOURCE_GROUP}" --name "${WEB_APP_NAME}" --slot "${STAGING_SLOT}" -o json)"
jq -e '.httpsOnly == true' <<<"${WEBAPP_JSON}" >/dev/null
jq -e '.httpsOnly == true' <<<"${STAGING_JSON}" >/dev/null

az webapp config show --resource-group "${RESOURCE_GROUP}" --name "${WEB_APP_NAME}" -o json > /tmp/obserra-web-config.json
az webapp config show --resource-group "${RESOURCE_GROUP}" --name "${WEB_APP_NAME}" --slot "${STAGING_SLOT}" -o json > /tmp/obserra-staging-config.json
for config_file in /tmp/obserra-web-config.json /tmp/obserra-staging-config.json; do
  jq -e '
    .alwaysOn == true and
    .http20Enabled == true and
    .ftpsState == "Disabled" and
    .minTlsVersion == "1.2" and
    .scmMinTlsVersion == "1.2" and
    .healthCheckPath == "/api/health"
  ' "${config_file}" >/dev/null
done

KEY_VAULT_JSON="$(az keyvault show --resource-group "${RESOURCE_GROUP}" --name "${KEY_VAULT_NAME}" -o json)"
jq -e '
  .properties.enableRbacAuthorization == true and
  .properties.enablePurgeProtection == true and
  .properties.softDeleteRetentionInDays == 90
' <<<"${KEY_VAULT_JSON}" >/dev/null

az resource show --resource-group "${RESOURCE_GROUP}" --name "${APP_INSIGHTS_NAME}" --resource-type "Microsoft.Insights/components" >/dev/null
az resource show --resource-group "${RESOURCE_GROUP}" --name "${LOG_ANALYTICS_NAME}" --resource-type "Microsoft.OperationalInsights/workspaces" >/dev/null

# ----- GPv2 storage / data recovery baseline -----
az storage account show --resource-group "${RESOURCE_GROUP}" --name "${STORAGE_ACCOUNT}" -o json > /tmp/obserra-storage-live.json
jq -e '
  .kind == "StorageV2" and
  .sku.name == "Standard_GRS" and
  .allowBlobPublicAccess == false and
  .allowCrossTenantReplication == false and
  .allowSharedKeyAccess == false and
  .defaultToOAuthAuthentication == true and
  .minimumTlsVersion == "TLS1_2" and
  .enableHttpsTrafficOnly == true and
  .networkRuleSet.defaultAction == "Deny"
' /tmp/obserra-storage-live.json >/dev/null

az storage account blob-service-properties show \
  --resource-group "${RESOURCE_GROUP}" \
  --account-name "${STORAGE_ACCOUNT}" \
  -o json > /tmp/obserra-blob-service-live.json
jq -e '
  .isVersioningEnabled == true and
  .deleteRetentionPolicy.enabled == true and
  .deleteRetentionPolicy.days >= 30 and
  .containerDeleteRetentionPolicy.enabled == true and
  .containerDeleteRetentionPolicy.days >= 30
' /tmp/obserra-blob-service-live.json >/dev/null

# ----- Capacity / failure-headroom baseline -----
az monitor autoscale show --resource-group "${RESOURCE_GROUP}" --name "${AUTOSCALE_NAME}" -o json > /tmp/obserra-autoscale-live.json
jq -e '
  .enabled == true and
  .profiles[0].capacity.minimum == "2" and
  .profiles[0].capacity.default == "2" and
  .profiles[0].capacity.maximum == "4"
' /tmp/obserra-autoscale-live.json >/dev/null

# ----- Secret delivery baseline: inventory names only; never retrieve or print values -----
required_secret_names=(
  clerk-secret-key
  clerk-publishable-key
  applications-stripe-secret-key
  applications-stripe-webhook-secret
  applications-supabase-service-role-key
  applications-commerce-hash-secret
  applications-stripe-price-catalog-json
  applications-license-signing-secret
  stripe-secret-key
  stripe-webhook-secret
  academy-stripe-secret-key
  academy-stripe-webhook-secret
  academy-supabase-service-role-key
  academy-email-hash-secret
  fdacs-supabase-service-role-key
  fdacs-record-encryption-key-base64
  fdacs-daily-api-key
  stripe-identity-webhook-secret
  openai-api-key
)
MISSING_SECRETS=()
for secret_name in "${required_secret_names[@]}"; do
  if ! az keyvault secret show --vault-name "${KEY_VAULT_NAME}" --name "${secret_name}" --query id -o tsv >/dev/null 2>&1; then
    MISSING_SECRETS+=("${secret_name}")
  fi
done
if (( ${#MISSING_SECRETS[@]} > 0 )); then
  echo "Dependent-module Key Vault secret names not yet present: ${MISSING_SECRETS[*]}"
  echo "Those modules must remain fail-closed; the core website release will not fake readiness."
else
  echo "All governed integration secret names are present in Key Vault."
fi

# ----- Build / test / immutable artifact baseline -----
echo "Building exact Git release ${GIT_SHA}"
npm ci
npm run typecheck
npm run lint
npm test
OBSERRA_IDENTITY_RUNTIME_ENABLED=true npm run build

test -f .next/standalone/server.js
rm -rf release obserra-release.zip
mkdir -p release/.next
cp -R .next/standalone/. release/
cp -R .next/static release/.next/static
cp -R public release/public
printf '%s\n' "${GIT_SHA}" > release/OBSERRA_RELEASE_SHA
(
  cd release
  zip -qr ../obserra-release.zip .
)
test -s obserra-release.zip
ARTIFACT_SHA256="$(sha256sum obserra-release.zip | awk '{print $1}')"
test -n "${ARTIFACT_SHA256}"

# ----- Staged release baseline -----
DEPLOYMENT_ID="azapp-${GIT_SHA:0:12}"
az webapp config appsettings set \
  --resource-group "${RESOURCE_GROUP}" \
  --name "${WEB_APP_NAME}" \
  --slot "${STAGING_SLOT}" \
  --settings \
    OBSERRA_RELEASE_SHA="${GIT_SHA}" \
    OBSERRA_DEPLOYMENT_ID="${DEPLOYMENT_ID}" \
  --only-show-errors >/dev/null

az webapp deploy \
  --resource-group "${RESOURCE_GROUP}" \
  --name "${WEB_APP_NAME}" \
  --slot "${STAGING_SLOT}" \
  --src-path obserra-release.zip \
  --type zip \
  --clean true \
  --restart true \
  --only-show-errors >/dev/null

STAGING_HOST="$(az webapp show --resource-group "${RESOURCE_GROUP}" --name "${WEB_APP_NAME}" --slot "${STAGING_SLOT}" --query defaultHostName -o tsv)"
PRODUCTION_HOST="$(az webapp show --resource-group "${RESOURCE_GROUP}" --name "${WEB_APP_NAME}" --query defaultHostName -o tsv)"
test -n "${STAGING_HOST}" && test -n "${PRODUCTION_HOST}"
STAGING_URL="https://${STAGING_HOST}"
PRODUCTION_URL="https://${PRODUCTION_HOST}"

verify_release() {
  local base_url="$1"
  local output_file="$2"
  local attempts="$3"
  local status=""

  for attempt in $(seq 1 "${attempts}"); do
    status="$(curl --silent --show-error --max-time 20 --output "${output_file}" --write-out '%{http_code}' "${base_url}/api/health" || true)"
    if [[ "${status}" == "200" ]] && jq -e --arg sha "${GIT_SHA}" '
      .service == "obserra-website" and
      .status == "live" and
      .contract == "website-liveness-v1" and
      .hosting.provider == "azure-app-service" and
      .hosting.authority == "verified" and
      .hosting.verified == true and
      .hosting.gitCommitSha == $sha
    ' "${output_file}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 10
  done
  return 1
}

if ! verify_release "${STAGING_URL}" /tmp/obserra-staging-health.json 24; then
  echo "Azure staging failed exact-release verification; production was not changed." >&2
  cat /tmp/obserra-staging-health.json 2>/dev/null || true
  exit 1
fi

curl --fail --silent --show-error --location --max-time 30 "${STAGING_URL}/" -o /tmp/obserra-staging-home.html
grep -Eqi 'Obserra' /tmp/obserra-staging-home.html

ACADEMY_STATUS="$(curl --silent --show-error --max-time 30 --output /tmp/obserra-academy-health.json --write-out '%{http_code}' "${STAGING_URL}/api/academy/commerce-health" || true)"
test "${ACADEMY_STATUS}" = "200"
jq -e '.operational == true' /tmp/obserra-academy-health.json >/dev/null

APPLICATIONS_COMMERCE_STATUS="$(curl --silent --show-error --max-time 30 --output /tmp/obserra-applications-commerce-health.json --write-out '%{http_code}' "${STAGING_URL}/api/apps/commerce-health" || true)"
test "${APPLICATIONS_COMMERCE_STATUS}" = "200"
jq -e '
  .operational == true and
  .schemaVersion == "applications-commerce-v1" and
  .eventLedger == "append-only" and
  .entitlementAuthority == "durable-subscription-snapshot-v1" and
  .stripeConfigured == true and
  .stripeLivemode == true and
  .providerConnected == true and
  .chargesEnabled == true and
  .identityReady == true
' /tmp/obserra-applications-commerce-health.json >/dev/null

FLORIDA_LIVE_STATUS="$(curl --silent --show-error --max-time 30 --output /tmp/obserra-florida-live.json --write-out '%{http_code}' "${STAGING_URL}/api/florida-class-d/health/live" || true)"
test "${FLORIDA_LIVE_STATUS}" = "200"
jq -e '.service == "florida-class-d-lms" and .status == "live"' /tmp/obserra-florida-live.json >/dev/null

FLORIDA_READY_HEADERS="$(mktemp)"
FLORIDA_READY_STATUS="$(curl --silent --show-error --max-time 30 \
  --dump-header "${FLORIDA_READY_HEADERS}" \
  --output /tmp/obserra-florida-ready.json \
  --write-out '%{http_code}' \
  "${STAGING_URL}/api/florida-class-d/health/ready" || true)"
if [[ "${FLORIDA_READY_STATUS}" == "200" ]]; then
  jq -e '.service == "florida-class-d-lms" and .status == "ready"' /tmp/obserra-florida-ready.json >/dev/null
elif [[ "${FLORIDA_READY_STATUS}" == "503" ]]; then
  jq -e '.service == "florida-class-d-lms" and .status == "not_ready"' /tmp/obserra-florida-ready.json >/dev/null
  grep -Eqi '^retry-after:[[:space:]]*[0-9]+' "${FLORIDA_READY_HEADERS}"
else
  echo "Unexpected Florida readiness HTTP ${FLORIDA_READY_STATUS}; production was not changed." >&2
  exit 1
fi

# ----- Controlled promotion with automatic recovery -----
az webapp deployment slot swap \
  --resource-group "${RESOURCE_GROUP}" \
  --name "${WEB_APP_NAME}" \
  --slot "${STAGING_SLOT}" \
  --target-slot production \
  --only-show-errors >/dev/null

if ! verify_release "${PRODUCTION_URL}" /tmp/obserra-production-health.json 18; then
  echo "Azure production failed exact-release verification; reversing slot swap." >&2
  az webapp deployment slot swap \
    --resource-group "${RESOURCE_GROUP}" \
    --name "${WEB_APP_NAME}" \
    --slot "${STAGING_SLOT}" \
    --target-slot production \
    --only-show-errors >/dev/null || true
  exit 1
fi

curl --fail --silent --show-error --location --max-time 30 "${PRODUCTION_URL}/" -o /tmp/obserra-production-home.html
grep -Eqi 'Obserra' /tmp/obserra-production-home.html

# Persist only non-secret OIDC identifiers when GitHub CLI is already authenticated.
GITHUB_VARIABLES_CONFIGURED=false
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  if gh variable set AZURE_CLIENT_ID --repo "${REPO}" --body "${CLIENT_ID}" >/dev/null 2>&1 && \
     gh variable set AZURE_TENANT_ID --repo "${REPO}" --body "${TENANT_ID}" >/dev/null 2>&1; then
    GITHUB_VARIABLES_CONFIGURED=true
  fi
fi

cat <<EOF
OBSERRA_AZURE_RELEASE=verified
AZURE_SUBSCRIPTION_ID=${SUBSCRIPTION_ID}
AZURE_TENANT_ID=${TENANT_ID}
AZURE_RESOURCE_GROUP=${RESOURCE_GROUP}
AZURE_CLIENT_ID=${CLIENT_ID}
AZURE_DEPLOY_IDENTITY_ROLE=Contributor
AZURE_RUNTIME_KEYVAULT_ROLE=Key Vault Secrets User
AZURE_STORAGE_KIND=StorageV2
AZURE_STORAGE_SKU=Standard_GRS
AZURE_AUTOSCALE_MIN=2
AZURE_AUTOSCALE_MAX=4
GIT_SHA=${GIT_SHA}
ARTIFACT_SHA256=${ARTIFACT_SHA256}
AZURE_STAGING_URL=${STAGING_URL}
AZURE_PRODUCTION_URL=${PRODUCTION_URL}
ACADEMY_COMMERCE_HTTP=${ACADEMY_STATUS}
APPLICATIONS_COMMERCE_HTTP=${APPLICATIONS_COMMERCE_STATUS}
FLORIDA_LIVE_HTTP=${FLORIDA_LIVE_STATUS}
FLORIDA_READY_HTTP=${FLORIDA_READY_STATUS}
GITHUB_OIDC_VARIABLES_CONFIGURED=${GITHUB_VARIABLES_CONFIGURED}
MISSING_KEYVAULT_SECRET_COUNT=${#MISSING_SECRETS[@]}
EOF
