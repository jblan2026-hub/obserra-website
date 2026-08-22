#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

for command_name in az jq git pwsh gh; do
  command -v "${command_name}" >/dev/null 2>&1 || {
    echo "Required command is unavailable: ${command_name}" >&2
    exit 1
  }
done
gh auth status >/dev/null 2>&1 || {
  echo "GitHub CLI authentication is required to launch and watch the exact-SHA Azure deployment." >&2
  exit 1
}

cd "${REPO_ROOT}"
test -z "$(git status --porcelain)" || {
  echo "The repository has uncommitted changes. Commit them before the production owner bootstrap." >&2
  exit 1
}
test "$(git branch --show-current)" = "main" || {
  echo "The owner bootstrap must run from the reviewed main branch." >&2
  exit 1
}
git fetch --prune origin main
approved_release_sha="$(git rev-parse HEAD)"
test "${approved_release_sha}" = "$(git rev-parse origin/main)" || {
  echo "Local main is not the current reviewed origin/main. Pull the reviewed main branch and rerun." >&2
  exit 1
}

echo "Phase 1/4: Azure production resource, OIDC, managed identity, storage, and observability convergence"
bash "${SCRIPT_DIR}/azure-bootstrap-current-directory.sh"

echo "Phase 2/4: Secure critical provider onboarding into Azure Key Vault"
bash "${SCRIPT_DIR}/azure-keyvault-critical-onboarding.sh"

echo "Phase 3/4: Exact one-owner Entra P2 and Intune baseline in workforce tenant 5a08a33a-d2b5-491d-ac6d-32f325138143"
pwsh -NoProfile -File "${SCRIPT_DIR}/entra-intune-owner-baseline.ps1" \
  -DisableNonOwnerIntuneServicePlans \
  -EvidencePath "${REPO_ROOT}/obserra-entra-intune-owner-evidence.json"

echo "Phase 4/4: Launch exact-main Azure staging verification and controlled production-slot promotion"
gh workflow run azure-production-deploy.yml \
  --repo jblan2026-hub/obserra-website \
  --ref main \
  --field expected_release_sha="${approved_release_sha}" \
  --field promote_to_azure_production=true
sleep 5
run_id="$(gh run list --repo jblan2026-hub/obserra-website --workflow azure-production-deploy.yml --branch main --limit 1 --json databaseId --jq '.[0].databaseId')"
test -n "${run_id}"
gh run watch "${run_id}" --repo jblan2026-hub/obserra-website --exit-status

cat <<'EOF'
OBSERRA_OWNER_BOOTSTRAP=azure-production-verified
NEXT_OWNER_ACTION=Run scripts/intune-enroll-owner-device.ps1 on the owner Windows device, then rerun the Entra/Intune baseline with enforcement switches only after the device reports compliant.
EOF
