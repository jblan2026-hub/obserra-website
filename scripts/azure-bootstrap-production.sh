#!/usr/bin/env bash
set -euo pipefail

# Compatibility entrypoint only. There is one governed Azure bootstrap baseline:
# the subscription's current directory is authoritative and recurring GitHub
# deployment authority is least-privilege.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/azure-bootstrap-current-directory.sh" "$@"
