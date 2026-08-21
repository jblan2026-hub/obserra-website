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

required_commands=(az jq grep)
for command_name in "${required_commands[@]}"; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Required command is unavailable: ${command_name}" >&2
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

# Confirm the approved region exists and the selected Linux Standard App Service SKU is offered there.
az account list-locations --query "[?name=='${LOCATION}'].name" -o tsv | grep -Fxq "${LOCATION}"
APP_SERVICE_LOCATIONS="$(az appservice list-locations --sku S1 --linux-workers-enabled true -o json)"
if ! jq -e 'any(.[]; ((.name // "") | ascii_downcase) == "east us" or ((.name // "") | ascii_downcase) == "eastus")' <<<"${APP_SERVICE_LOCATIONS}" >/dev/null; then
  echo "Standard S1 Linux App Service is not reported as available in East US for this subscription." >&2
  exit 1
fi

# Register only the providers required by this production plane.
providers=(
  Microsoft.Web
  Microsoft.KeyVault
  Microsoft.ManagedIdentity
  Microsoft.OperationalInsights
  Microsoft.Insights
  Microsoft.Authorization
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

# Capture policy assignments before mutation for an auditable bootstrap record.
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

# Contributor deploys the resources. User Access Administrator is required only so the
# Bicep deployment can grant the runtime identity Key Vault data-plane access.
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

# Verify the exact federation and least-privilege resource-group scope before returning success.
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
EOF
