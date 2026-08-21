#!/usr/bin/env bash
set -euo pipefail

SUBSCRIPTION_ID="38d660ff-611e-4f6c-ad29-70f5cf118f52"
TENANT_ID="5a08a33a-d2b5-491d-ac6d-32f325138143"
LOCATION="eastus"
RESOURCE_GROUP="rg-obserra-prod-eastus"
DEPLOY_IDENTITY="id-obserra-github-prod"
FEDERATED_CREDENTIAL="github-main"
GITHUB_SUBJECT="repo:jblan2026-hub/obserra-website:ref:refs/heads/main"
OIDC_ISSUER="https://token.actions.githubusercontent.com"
OIDC_AUDIENCE="api://AzureADTokenExchange"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
BICEP_TEMPLATE="${REPO_ROOT}/infra/main.bicep"
STORAGE_BICEP_TEMPLATE="${REPO_ROOT}/infra/storage-gpv2.bicep"
EXPECTED_STORAGE_ACCOUNT="stobserraprod38d660"

required_commands=(az jq grep)
for command_name in "${required_commands[@]}"; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Required command is unavailable: ${command_name}" >&2
    exit 1
  fi
done

for template in "${BICEP_TEMPLATE}" "${STORAGE_BICEP_TEMPLATE}"; do
  if [[ ! -f "${template}" ]]; then
    echo "Azure infrastructure template is missing: ${template}" >&2
    echo "Run this script from a checkout of jblan2026-hub/obserra-website." >&2
    exit 1
  fi
done

az account set --subscription "${SUBSCRIPTION_ID}"
ACCOUNT_JSON="$(az account show --output json)"
ACTUAL_SUBSCRIPTION="$(jq -r '.id' <<<"${ACCOUNT_JSON}")"
ACTUAL_TENANT="$(jq -r '.tenantId' <<<"${ACCOUNT_JSON}")"

if [[ "${ACTUAL_SUBSCRIPTION}" != "${SUBSCRIPTION_ID}" ]]; then
  echo "Azure CLI is not operating in the approved subscription." >&2
  exit 1
fi
if [[ "${ACTUAL_TENANT}" != "${TENANT_ID}" ]]; then
  echo "Azure CLI is not operating in the approved Obserra tenant." >&2
  exit 1
fi

# Confirm the approved Azure region exists for this subscription context. Actual
# service/SKU capacity and policy enforcement are proven by the real deployments below.
az account list-locations --query "[?name=='${LOCATION}'].name" -o tsv | grep -Fxq "${LOCATION}"

# Register only providers required by the production plane.
providers=(
  Microsoft.Web
  Microsoft.KeyVault
  Microsoft.ManagedIdentity
  Microsoft.OperationalInsights
  Microsoft.Insights
  Microsoft.Authorization
  Microsoft.Storage
)
for provider in "${providers[@]}"; do
  echo "Registering ${provider}..."
  az provider register --namespace "${provider}" --wait >/dev/null
  state="$(az provider show --namespace "${provider}" --query registrationState -o tsv)"
  if [[ "${state}" != "Registered" ]]; then
    echo "Provider registration did not reach Registered: ${provider} (${state})" >&2
    exit 1
  fi
done

# Capture subscription policy assignments before mutation for an auditable bootstrap record.
POLICY_FILE="${HOME}/obserra-azure-policy-assignments.json"
az policy assignment list --scope "/subscriptions/${SUBSCRIPTION_ID}" -o json > "${POLICY_FILE}"
POLICY_COUNT="$(jq 'length' "${POLICY_FILE}")"
echo "Subscription policy assignments visible: ${POLICY_COUNT}"
echo "Policy inventory written to: ${POLICY_FILE}"

# The production resource group is the maximum scope granted to the GitHub deployment identity.
az group create \
  --name "${RESOURCE_GROUP}" \
  --location "${LOCATION}" \
  --tags workload=obserra-website environment=production managedBy=github-oidc \
  >/dev/null

RG_ID="$(az group show --name "${RESOURCE_GROUP}" --query id -o tsv)"

if ! az identity show --resource-group "${RESOURCE_GROUP}" --name "${DEPLOY_IDENTITY}" >/dev/null 2>&1; then
  az identity create \
    --resource-group "${RESOURCE_GROUP}" \
    --name "${DEPLOY_IDENTITY}" \
    --location "${LOCATION}" \
    --tags workload=obserra-website environment=production purpose=github-release \
    >/dev/null
fi

IDENTITY_JSON="$(az identity show --resource-group "${RESOURCE_GROUP}" --name "${DEPLOY_IDENTITY}" -o json)"
CLIENT_ID="$(jq -r '.clientId' <<<"${IDENTITY_JSON}")"
PRINCIPAL_ID="$(jq -r '.principalId' <<<"${IDENTITY_JSON}")"

if [[ -z "${CLIENT_ID}" || "${CLIENT_ID}" == "null" || -z "${PRINCIPAL_ID}" || "${PRINCIPAL_ID}" == "null" ]]; then
  echo "Azure did not return a usable managed-identity client/principal ID." >&2
  exit 1
fi

if ! az identity federated-credential show \
  --resource-group "${RESOURCE_GROUP}" \
  --identity-name "${DEPLOY_IDENTITY}" \
  --name "${FEDERATED_CREDENTIAL}" >/dev/null 2>&1; then
  az identity federated-credential create \
    --resource-group "${RESOURCE_GROUP}" \
    --identity-name "${DEPLOY_IDENTITY}" \
    --name "${FEDERATED_CREDENTIAL}" \
    --issuer "${OIDC_ISSUER}" \
    --subject "${GITHUB_SUBJECT}" \
    --audiences "${OIDC_AUDIENCE}" \
    >/dev/null
fi

# Contributor deploys resources. User Access Administrator is required only so the Bicep
# deployment can grant the runtime managed identity read-only Key Vault secret access.
for role in "Contributor" "User Access Administrator"; do
  if ! az role assignment list \
    --assignee-object-id "${PRINCIPAL_ID}" \
    --scope "${RG_ID}" \
    --query "[?roleDefinitionName=='${role}'] | [0].id" \
    -o tsv | grep -q .; then
    az role assignment create \
      --assignee-object-id "${PRINCIPAL_ID}" \
      --assignee-principal-type ServicePrincipal \
      --role "${role}" \
      --scope "${RG_ID}" \
      >/dev/null
  fi
done

# Verify the exact GitHub federation and resource-group-only deployment authority.
FEDERATED_JSON="$(az identity federated-credential show \
  --resource-group "${RESOURCE_GROUP}" \
  --identity-name "${DEPLOY_IDENTITY}" \
  --name "${FEDERATED_CREDENTIAL}" \
  -o json)"

test "$(jq -r '.issuer' <<<"${FEDERATED_JSON}")" = "${OIDC_ISSUER}"
test "$(jq -r '.subject' <<<"${FEDERATED_JSON}")" = "${GITHUB_SUBJECT}"
jq -e --arg audience "${OIDC_AUDIENCE}" '.audiences | index($audience) != null' <<<"${FEDERATED_JSON}" >/dev/null

ROLE_JSON="$(az role assignment list --assignee-object-id "${PRINCIPAL_ID}" --scope "${RG_ID}" -o json)"
jq -e 'any(.[]; .roleDefinitionName == "Contributor")' <<<"${ROLE_JSON}" >/dev/null
jq -e 'any(.[]; .roleDefinitionName == "User Access Administrator")' <<<"${ROLE_JSON}" >/dev/null

# Compile and validate IaC before resource mutation.
az bicep build --file "${BICEP_TEMPLATE}" --stdout >/dev/null
az bicep build --file "${STORAGE_BICEP_TEMPLATE}" --stdout >/dev/null
az deployment group validate \
  --resource-group "${RESOURCE_GROUP}" \
  --template-file "${BICEP_TEMPLATE}" \
  --parameters location="${LOCATION}" \
  --only-show-errors >/dev/null
az deployment group validate \
  --resource-group "${RESOURCE_GROUP}" \
  --template-file "${STORAGE_BICEP_TEMPLATE}" \
  --parameters location="${LOCATION}" \
  --only-show-errors >/dev/null

# Provision the actual Azure plane under the interactive Owner session. This is the live
# policy/SKU/capacity preflight: any Azure Policy, provider, quota, or SKU restriction fails
# the bootstrap rather than being papered over by a source-only readiness claim.
DEPLOYMENT_FILE="${HOME}/obserra-azure-bootstrap-deployment.json"
az deployment group create \
  --resource-group "${RESOURCE_GROUP}" \
  --name "obserra-bootstrap-$(date -u +%Y%m%d%H%M%S)" \
  --template-file "${BICEP_TEMPLATE}" \
  --parameters location="${LOCATION}" \
  --mode Incremental \
  --only-show-errors \
  --output json > "${DEPLOYMENT_FILE}"

test "$(jq -r '.properties.provisioningState' "${DEPLOYMENT_FILE}")" = "Succeeded"
WEB_APP_NAME="$(jq -r '.properties.outputs.webAppName.value' "${DEPLOYMENT_FILE}")"
PRODUCTION_HOST="$(jq -r '.properties.outputs.productionHostName.value' "${DEPLOYMENT_FILE}")"
STAGING_HOST="$(jq -r '.properties.outputs.stagingHostName.value' "${DEPLOYMENT_FILE}")"
KEY_VAULT_NAME="$(jq -r '.properties.outputs.keyVaultName.value' "${DEPLOYMENT_FILE}")"
RUNTIME_IDENTITY_CLIENT_ID="$(jq -r '.properties.outputs.runtimeIdentityClientId.value' "${DEPLOYMENT_FILE}")"

test -n "${WEB_APP_NAME}" && test "${WEB_APP_NAME}" != "null"
test -n "${PRODUCTION_HOST}" && test "${PRODUCTION_HOST}" != "null"
test -n "${STAGING_HOST}" && test "${STAGING_HOST}" != "null"
test -n "${KEY_VAULT_NAME}" && test "${KEY_VAULT_NAME}" != "null"

# Build GPv2 from day one. No GPv1 or Blob Only account is accepted.
STORAGE_DEPLOYMENT_FILE="${HOME}/obserra-azure-storage-gpv2-deployment.json"
az deployment group create \
  --resource-group "${RESOURCE_GROUP}" \
  --name "obserra-storage-gpv2-$(date -u +%Y%m%d%H%M%S)" \
  --template-file "${STORAGE_BICEP_TEMPLATE}" \
  --parameters location="${LOCATION}" \
  --mode Incremental \
  --only-show-errors \
  --output json > "${STORAGE_DEPLOYMENT_FILE}"

test "$(jq -r '.properties.provisioningState' "${STORAGE_DEPLOYMENT_FILE}")" = "Succeeded"
STORAGE_ACCOUNT_NAME="$(jq -r '.properties.outputs.storageAccountName.value' "${STORAGE_DEPLOYMENT_FILE}")"
test "${STORAGE_ACCOUNT_NAME}" = "${EXPECTED_STORAGE_ACCOUNT}"

az storage account show \
  --resource-group "${RESOURCE_GROUP}" \
  --name "${STORAGE_ACCOUNT_NAME}" \
  --output json > "${HOME}/obserra-azure-storage-gpv2-live.json"

jq -e '
  .kind == "StorageV2" and
  .sku.name == "Standard_GRS" and
  .allowBlobPublicAccess == false and
  .allowSharedKeyAccess == false and
  .defaultToOAuthAuthentication == true and
  .minimumTlsVersion == "TLS1_2" and
  .enableHttpsTrafficOnly == true and
  .networkRuleSet.defaultAction == "Deny"
' "${HOME}/obserra-azure-storage-gpv2-live.json" >/dev/null

cat <<EOF
OBSERRA_AZURE_BOOTSTRAP=verified
AZURE_SUBSCRIPTION_ID=${SUBSCRIPTION_ID}
AZURE_TENANT_ID=${TENANT_ID}
AZURE_LOCATION=${LOCATION}
AZURE_RESOURCE_GROUP=${RESOURCE_GROUP}
AZURE_CLIENT_ID=${CLIENT_ID}
AZURE_DEPLOY_IDENTITY=${DEPLOY_IDENTITY}
GITHUB_OIDC_SUBJECT=${GITHUB_SUBJECT}
POLICY_ASSIGNMENT_COUNT=${POLICY_COUNT}
AZURE_WEBAPP_NAME=${WEB_APP_NAME}
AZURE_PRODUCTION_HOST=https://${PRODUCTION_HOST}
AZURE_STAGING_HOST=https://${STAGING_HOST}
AZURE_KEY_VAULT_NAME=${KEY_VAULT_NAME}
AZURE_RUNTIME_IDENTITY_CLIENT_ID=${RUNTIME_IDENTITY_CLIENT_ID}
AZURE_STORAGE_ACCOUNT=${STORAGE_ACCOUNT_NAME}
AZURE_STORAGE_KIND=StorageV2
AZURE_STORAGE_SKU=Standard_GRS
AZURE_POLICY_RECORD=${POLICY_FILE}
AZURE_DEPLOYMENT_RECORD=${DEPLOYMENT_FILE}
AZURE_STORAGE_DEPLOYMENT_RECORD=${STORAGE_DEPLOYMENT_FILE}
EOF
