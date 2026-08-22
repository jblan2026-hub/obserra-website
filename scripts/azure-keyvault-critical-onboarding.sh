#!/usr/bin/env bash
set -euo pipefail

SUBSCRIPTION_ID="38d660ff-611e-4f6c-ad29-70f5cf118f52"
KEY_VAULT_NAME="kv-obserra-prod-38d660"

for command_name in az jq openssl; do
  command -v "${command_name}" >/dev/null 2>&1 || {
    echo "Required command is unavailable: ${command_name}" >&2
    exit 1
  }
done

az account set --subscription "${SUBSCRIPTION_ID}"
test "$(az account show --query id -o tsv)" = "${SUBSCRIPTION_ID}"
az keyvault show --name "${KEY_VAULT_NAME}" --query id -o tsv >/dev/null

secure_temp_dir="$(mktemp -d)"
chmod 700 "${secure_temp_dir}"
cleanup() {
  if command -v shred >/dev/null 2>&1; then
    find "${secure_temp_dir}" -type f -exec shred -u {} \; 2>/dev/null || true
  else
    find "${secure_temp_dir}" -type f -delete 2>/dev/null || true
  fi
  rmdir "${secure_temp_dir}" 2>/dev/null || true
}
trap cleanup EXIT

secret_exists() {
  az keyvault secret show --vault-name "${KEY_VAULT_NAME}" --name "$1" --query id -o tsv >/dev/null 2>&1
}

set_secret_file() {
  local secret_name="$1"
  local secret_value="$2"
  local secret_file="${secure_temp_dir}/${secret_name}"
  umask 077
  printf '%s' "${secret_value}" > "${secret_file}"
  az keyvault secret set \
    --vault-name "${KEY_VAULT_NAME}" \
    --name "${secret_name}" \
    --file "${secret_file}" \
    --output none
  if command -v shred >/dev/null 2>&1; then
    shred -u "${secret_file}"
  else
    rm -f -- "${secret_file}"
  fi
}

prompt_secret() {
  local secret_name="$1"
  local prompt="$2"
  local pattern="$3"
  if secret_exists "${secret_name}"; then
    echo "Verified existing Key Vault secret: ${secret_name}"
    return
  fi
  local secret_value=""
  read -r -s -p "${prompt}: " secret_value </dev/tty
  echo
  [[ "${secret_value}" =~ ${pattern} ]] || {
    echo "Value rejected for ${secret_name}; nothing was stored." >&2
    exit 1
  }
  set_secret_file "${secret_name}" "${secret_value}"
  unset secret_value
}

generated_secret() {
  local secret_name="$1"
  if secret_exists "${secret_name}"; then
    echo "Verified existing Key Vault secret: ${secret_name}"
    return
  fi
  local secret_value
  secret_value="$(openssl rand -base64 48 | tr -d '\n')"
  set_secret_file "${secret_name}" "${secret_value}"
  unset secret_value
}

prompt_json_catalog() {
  local secret_name="applications-stripe-price-catalog-json"
  if secret_exists "${secret_name}"; then
    echo "Verified existing Key Vault secret: ${secret_name}"
    return
  fi
  local secret_value=""
  read -r -s -p "Paste governed Applications price catalog JSON: " secret_value </dev/tty
  echo
  jq -e '
    type == "object" and length > 0 and
    all(to_entries[];
      (.key | test("^obserra-[a-z0-9]+(?:-[a-z0-9]+)*\\.(professional|enterprise)\\.(monthly|annual)$")) and
      (.value | type == "string" and test("^price_[A-Za-z0-9]+$"))
    )
  ' <<<"${secret_value}" >/dev/null || {
    echo "Applications price catalog rejected; nothing was stored." >&2
    exit 1
  }
  set_secret_file "${secret_name}" "${secret_value}"
  unset secret_value
}

prompt_secret "clerk-publishable-key" "Paste Clerk live publishable key" '^pk_live_[A-Za-z0-9_-]+$'
prompt_secret "clerk-secret-key" "Paste Clerk live secret key" '^sk_live_[A-Za-z0-9_-]+$'
prompt_secret "applications-stripe-secret-key" "Paste Applications Stripe live restricted or secret key" '^(rk|sk)_live_[A-Za-z0-9_]+$'
prompt_secret "applications-stripe-webhook-secret" "Paste Applications Stripe live webhook signing secret" '^whsec_[A-Za-z0-9_]+$'
prompt_secret "applications-supabase-service-role-key" "Paste Applications Release Authority Supabase service-role secret" '^(sb_secret_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9._-]+)$'
prompt_json_catalog
generated_secret "applications-commerce-hash-secret"
generated_secret "applications-license-signing-secret"

prompt_secret "academy-stripe-secret-key" "Paste Academy Stripe live restricted key" '^rk_live_[A-Za-z0-9_]+$'
prompt_secret "academy-stripe-webhook-secret" "Paste Academy Stripe live webhook signing secret" '^whsec_[A-Za-z0-9_]+$'
prompt_secret "academy-supabase-service-role-key" "Paste Academy Supabase service-role secret" '^(sb_secret_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9._-]+)$'
generated_secret "academy-email-hash-secret"

required=(
  clerk-publishable-key
  clerk-secret-key
  applications-stripe-secret-key
  applications-stripe-webhook-secret
  applications-supabase-service-role-key
  applications-stripe-price-catalog-json
  applications-commerce-hash-secret
  applications-license-signing-secret
  academy-stripe-secret-key
  academy-stripe-webhook-secret
  academy-supabase-service-role-key
  academy-email-hash-secret
)
for secret_name in "${required[@]}"; do
  secret_exists "${secret_name}" || {
    echo "Required Key Vault secret did not converge: ${secret_name}" >&2
    exit 1
  }
done

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  az keyvault secret show \
    --vault-name "${KEY_VAULT_NAME}" \
    --name clerk-publishable-key \
    --query value -o tsv |
    gh secret set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY --repo jblan2026-hub/obserra-website --body -
  echo "GitHub production build publishable key synchronized."
else
  echo "GitHub CLI is not authenticated; synchronize NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY before Azure deployment." >&2
fi

echo "OBSERRA_CRITICAL_KEYVAULT_ONBOARDING=verified"
echo "KEY_VAULT_NAME=${KEY_VAULT_NAME}"
echo "REQUIRED_SECRET_COUNT=${#required[@]}"
