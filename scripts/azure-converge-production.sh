#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"
git fetch --prune origin main
git checkout main
git reset --hard origin/main

# Phase 1: converge the governed Azure infrastructure/IAM/storage/capacity baseline.
bash "${SCRIPT_DIR}/azure-bootstrap-current-directory.sh"

# Phase 2: build, stage, verify, promote, and independently verify the exact release.
bash "${SCRIPT_DIR}/azure-first-release-current-directory.sh"
