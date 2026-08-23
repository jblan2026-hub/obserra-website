#!/usr/bin/env bash
set -euo pipefail

SUBSCRIPTION_ID="38d660ff-611e-4f6c-ad29-70f5cf118f52"
LOCATION="eastus"
RESOURCE_GROUP="rg-obserra-prod-eastus"
DEPLOY_IDENTITY="id-obserra-github-prod"
FEDERATED_CREDENTIAL="github-main"
# GitHub's repository custom subject template binds immutable owner/repository IDs.
# This exact value was observed from the main-branch OIDC assertion on 2026-08-23.
GITHUB_SUBJECT="repo:jblan2026-hub@309821056/obserra-website@1321156321:ref:refs/heads/main"
OIDC_ISSUER="https://token.actions.githubusercontent.com"
OIDC_AUDIENCE="api://AzureADTokenExchange"
EXPECTED_STORAGE_ACCOUNT="stobserraprod38d660"
EXPECTED_AUTOSCALE_NAME="autoscale-obserra-prod"
RUNTIME_KEYVAULT_ROLE="Key Vault Secrets User"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
BICEP_TEMPLATE="${REPO_ROOT}/infra/main.bicep"
STORAGE_BICEP_TEMPLATE="${REPO_ROOT}/infra/storage-gpv2.bicep"
AUTOSCALE_BICEP_TEMPLATE="${REPO_ROOT}/infra/autoscale.bicep"

for command_name in az jq grep git; do
  command -v "${command_name}" >/dev/null 2>&1 || {
    echo "Required command is unavailable: ${command_name}" >&2
    exit 1
  }
done

for template in "${BICEP_TEMPLATE}" "${STORAGE_BICEP_TEMPLATE}" "${AUTOSCALE_BICEP_TEMPLATE}"; do
  test -f "${template}" || {
    echo "Azure infrastructure template is missing: ${template}" >&2
    exit 1
  }
done

az account set --subscription "${SUBSCRIPTION_ID}"
ACCOUNT_JSON="$(az account show --subscription "${SUBSCRIPTION_ID}" --output json)"
ACTUAL_SUBSCRIPTION="$(jq -r '.id' <<<"${ACCOUNT_JSON}")"
TENANT_ID="$(jq -r '.tenantId' <<<"${ACCOUNT_JSON}")"
ACCOUNT_NAME="$(jq -r '.name' <<<"${ACCOUNT_JSON}")"

if [[ "${ACTUAL_SUBSCRIPTION}" != "${SUBSCRIPTION_ID}" ]]; then
  echo "Azure CLI is not operating in the approved subscription." >&2
  exit 1
fi
if [[ -z "${TENANT_ID}" || "${TENANT_ID}" == "null" ]]; then
  echo "Azure did not return a tenant for the approved subscription." >&2
  exit 1
fi

echo "Using subscription: ${ACCOUNT_NAME} (${SUBSCRIPTION_ID})"
echo "Using subscription current directory tenant: ${TENANT_ID}"

az account list-locations --query "[?name=='${LOCATION}'].name" -o tsv | grep -Fxq "${LOCATION}"

providers=(
  Microsoft.Web
  Microsoft.KeyVault
  Microsoft.ManagedIdentity
  Microsoft.OperationalInsights
  Microsoft.Insights
  Microsoft.Authorization
  Microsoft.Storage
  Microsoft.CloudShell
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

POLICY_FILE="${HOME}/obserra-azure-policy-assignments.json"
az policy assignment list --scope "/subscriptions/${SUBSCRIPTION_ID}" -o json > "${POLICY_FILE}"
POLICY_COUNT="$(jq 'length' "${POLICY_FILE}")"

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
test -n "${CLIENT_ID}" && test "${CLIENT_ID}" != "null"
test -n "${PRINCIPAL_ID}" && test "${PRINCIPAL_ID}" != "null"

if FEDERATED_JSON="$(az identity federated-credential show \
  --resource-group "${RESOURCE_GROUP}" \
  --identity-name "${DEPLOY_IDENTITY}" \
  --name "${FEDERATED_CREDENTIAL}" \
  --output json 2>/dev/null)"; then
  if ! jq -e \
    --arg issuer "${OIDC_ISSUER}" \
    --arg subject "${GITHUB_SUBJECT}" \
    --arg audience "${OIDC_AUDIENCE}" '
      .issuer == $issuer and
      .subject == $subject and
      (.audiences | length) == 1 and
      .audiences[0] == $audience
    ' <<<"${FEDERATED_JSON}" >/dev/null; then
    az identity federated-credential update \
      --resource-group "${RESOURCE_GROUP}" \
      --identity-name "${DEPLOY_IDENTITY}" \
      --name "${FEDERATED_CREDENTIAL}" \
      --issuer "${OIDC_ISSUER}" \
      --subject "${GITHUB_SUBJECT}" \
      --audiences "${OIDC_AUDIENCE}" \
      --output none
  fi
else
  az identity federated-credential create \
    --resource-group "${RESOURCE_GROUP}" \
    --identity-name "${DEPLOY_IDENTITY}" \
    --name "${FEDERATED_CREDENTIAL}" \
    --issuer "${OIDC_ISSUER}" \
    --subject "${GITHUB_SUBJECT}" \
    --audiences "${OIDC_AUDIENCE}" \
    >/dev/null
fi

if ! az role assignment list \
  --assignee-object-id "${PRINCIPAL_ID}" \
  --scope "${RG_ID}" \
  --query "[?roleDefinitionName=='Contributor'] | [0].id" \
  -o tsv | grep -q .; then
  az role assignment create \
    --assignee-object-id "${PRINCIPAL_ID}" \
    --assignee-principal-type ServicePrincipal \
    --role "Contributor" \
    --scope "${RG_ID}" \
    >/dev/null
fi

# Governed least-privilege convergence: recurring GitHub deployment must not retain RBAC mutation authority.
while IFS= read -r assignment_id; do
  [[ -z "${assignment_id}" ]] && continue
  az role assignment delete --ids "${assignment_id}" >/dev/null
done < <(az role assignment list \
  --assignee-object-id "${PRINCIPAL_ID}" \
  --scope "${RG_ID}" \
  --query "[?roleDefinitionName=='User Access Administrator'].id" \
  -o tsv)

FEDERATED_JSON="$(az identity federated-credential show \
  --resource-group "${RESOURCE_GROUP}" \
  --identity-name "${DEPLOY_IDENTITY}" \
  --name "${FEDERATED_CREDENTIAL}" -o json)"
test "$(jq -r '.issuer' <<<"${FEDERATED_JSON}")" = "${OIDC_ISSUER}"
test "$(jq -r '.subject' <<<"${FEDERATED_JSON}")" = "${GITHUB_SUBJECT}"
jq -e --arg audience "${OIDC_AUDIENCE}" '(.audiences | length) == 1 and .audiences[0] == $audience' <<<"${FEDERATED_JSON}" >/dev/null

ROLE_JSON="$(az role assignment list --assignee-object-id "${PRINCIPAL_ID}" --scope "${RG_ID}" -o json)"
jq -e 'any(.[]; .roleDefinitionName == "Contributor")' <<<"${ROLE_JSON}" >/dev/null
if jq -e 'any(.[]; .roleDefinitionName == "User Access Administrator")' <<<"${ROLE_JSON}" >/dev/null; then
  echo "Deployment identity still has User Access Administrator at the production resource-group scope." >&2
  exit 1
fi

az bicep build --file "${BICEP_TEMPLATE}" --stdout >/dev/null
az bicep build --file "${STORAGE_BICEP_TEMPLATE}" --stdout >/dev/null
az bicep build --file "${AUTOSCALE_BICEP_TEMPLATE}" --stdout >/dev/null

az deployment group validate --resource-group "${RESOURCE_GROUP}" --template-file "${BICEP_TEMPLATE}" --parameters location="${LOCATION}" --only-show-errors >/dev/null
az deployment group validate --resource-group "${RESOURCE_GROUP}" --template-file "${STORAGE_BICEP_TEMPLATE}" --parameters location="${LOCATION}" --only-show-errors >/dev/null

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
KEY_VAULT_ID="$(jq -r '.properties.outputs.keyVaultId.value' "${DEPLOYMENT_FILE}")"
RUNTIME_IDENTITY_CLIENT_ID="$(jq -r '.properties.outputs.runtimeIdentityClientId.value' "${DEPLOYMENT_FILE}")"
RUNTIME_IDENTITY_PRINCIPAL_ID="$(jq -r '.properties.outputs.runtimeIdentityPrincipalId.value' "${DEPLOYMENT_FILE}")"
for value in "${WEB_APP_NAME}" "${PRODUCTION_HOST}" "${STAGING_HOST}" "${KEY_VAULT_NAME}" "${KEY_VAULT_ID}" "${RUNTIME_IDENTITY_CLIENT_ID}" "${RUNTIME_IDENTITY_PRINCIPAL_ID}"; do
  test -n "${value}" && test "${value}" != "null"
done

# Bootstrap-only privilege operation. The runtime identity gets read-only secret access; GitHub does not keep role-assignment authority.
if ! az role assignment list \
  --assignee-object-id "${RUNTIME_IDENTITY_PRINCIPAL_ID}" \
  --scope "${KEY_VAULT_ID}" \
  --query "[?roleDefinitionName=='${RUNTIME_KEYVAULT_ROLE}'] | [0].id" \
  -o tsv | grep -q .; then
  az role assignment create \
    --assignee-object-id "${RUNTIME_IDENTITY_PRINCIPAL_ID}" \
    --assignee-principal-type ServicePrincipal \
    --role "${RUNTIME_KEYVAULT_ROLE}" \
    --scope "${KEY_VAULT_ID}" \
    >/dev/null
fi

RUNTIME_ROLE_JSON="$(az role assignment list \
  --assignee-object-id "${RUNTIME_IDENTITY_PRINCIPAL_ID}" \
  --scope "${KEY_VAULT_ID}" -o json)"
jq -e --arg role "${RUNTIME_KEYVAULT_ROLE}" 'any(.[]; .roleDefinitionName == $role)' <<<"${RUNTIME_ROLE_JSON}" >/dev/null

az deployment group validate --resource-group "${RESOURCE_GROUP}" --template-file "${AUTOSCALE_BICEP_TEMPLATE}" --parameters location="${LOCATION}" --only-show-errors >/dev/null
AUTOSCALE_DEPLOYMENT_FILE="${HOME}/obserra-azure-autoscale-deployment.json"
az deployment group create \
  --resource-group "${RESOURCE_GROUP}" \
  --name "obserra-autoscale-$(date -u +%Y%m%d%H%M%S)" \
  --template-file "${AUTOSCALE_BICEP_TEMPLATE}" \
  --parameters location="${LOCATION}" \
  --mode Incremental \
  --only-show-errors \
  --output json > "${AUTOSCALE_DEPLOYMENT_FILE}"
test "$(jq -r '.properties.provisioningState' "${AUTOSCALE_DEPLOYMENT_FILE}")" = "Succeeded"
AUTOSCALE_NAME="$(jq -r '.properties.outputs.autoscaleSettingName.value' "${AUTOSCALE_DEPLOYMENT_FILE}")"
test "${AUTOSCALE_NAME}" = "${EXPECTED_AUTOSCALE_NAME}"
az monitor autoscale show --resource-group "${RESOURCE_GROUP}" --name "${AUTOSCALE_NAME}" --output json > "${HOME}/obserra-azure-autoscale-live.json"
jq -e '.enabled == true and .profiles[0].capacity.minimum == "2" and .profiles[0].capacity.default == "2" and .profiles[0].capacity.maximum == "4"' "${HOME}/obserra-azure-autoscale-live.json" >/dev/null

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
az storage account show --resource-group "${RESOURCE_GROUP}" --name "${STORAGE_ACCOUNT_NAME}" --output json > "${HOME}/obserra-azure-storage-gpv2-live.json"
jq -e '.kind == "StorageV2" and .sku.name == "Standard_GRS" and .allowBlobPublicAccess == false and .allowSharedKeyAccess == false and .defaultToOAuthAuthentication == true and .minimumTlsVersion == "TLS1_2" and .enableHttpsTrafficOnly == true and .networkRuleSet.defaultAction == "Deny"' "${HOME}/obserra-azure-storage-gpv2-live.json" >/dev/null

cat <<EOF
OBSERRA_AZURE_BOOTSTRAP=verified
AZURE_SUBSCRIPTION_ID=${SUBSCRIPTION_ID}
AZURE_TENANT_ID=${TENANT_ID}
AZURE_LOCATION=${LOCATION}
AZURE_RESOURCE_GROUP=${RESOURCE_GROUP}
AZURE_CLIENT_ID=${CLIENT_ID}
AZURE_DEPLOY_IDENTITY=${DEPLOY_IDENTITY}
AZURE_DEPLOY_IDENTITY_ROLE=Contributor
GITHUB_OIDC_SUBJECT=${GITHUB_SUBJECT}
POLICY_ASSIGNMENT_COUNT=${POLICY_COUNT}
AZURE_WEBAPP_NAME=${WEB_APP_NAME}
AZURE_PRODUCTION_HOST=https://${PRODUCTION_HOST}
AZURE_STAGING_HOST=https://${STAGING_HOST}
AZURE_KEY_VAULT_NAME=${KEY_VAULT_NAME}
AZURE_RUNTIME_IDENTITY_CLIENT_ID=${RUNTIME_IDENTITY_CLIENT_ID}
AZURE_RUNTIME_KEYVAULT_ROLE=${RUNTIME_KEYVAULT_ROLE}
AZURE_AUTOSCALE_NAME=${AUTOSCALE_NAME}
AZURE_AUTOSCALE_MIN=2
AZURE_AUTOSCALE_MAX=4
AZURE_STORAGE_ACCOUNT=${STORAGE_ACCOUNT_NAME}
AZURE_STORAGE_KIND=StorageV2
AZURE_STORAGE_SKU=Standard_GRS
AZURE_POLICY_RECORD=${POLICY_FILE}
AZURE_DEPLOYMENT_RECORD=${DEPLOYMENT_FILE}
AZURE_AUTOSCALE_DEPLOYMENT_RECORD=${AUTOSCALE_DEPLOYMENT_FILE}
AZURE_STORAGE_DEPLOYMENT_RECORD=${STORAGE_DEPLOYMENT_FILE}
EOF
