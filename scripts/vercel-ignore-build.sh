#!/bin/sh
set -eu

INTEGRATION_PROJECT_ID="prj_FfAnssVJU8pcJydGNJHmCliP6Yme"
PRODUCTION_PROJECT_ID="prj_lxTKKDa9sbhht7FaigiaF1PONMiC"
RELEVANT_PATHS='^(app/|components/|lib/|public/|styles/|test/|package.json$|package-lock.json$|next.config\.|middleware\.|proxy\.ts$|tsconfig.json$|vercel.json$|scripts/vercel-ignore-build\.sh$)'

# The production project is the canonical public deployment target. Never let an
# optimization cancel its build. If Vercel does not expose a recognized project
# ID during the ignored-build phase, fail open and build rather than silently
# suppressing a release.
case "${VERCEL_PROJECT_ID:-}" in
  "$PRODUCTION_PROJECT_ID")
    exit 1
    ;;
  "$INTEGRATION_PROJECT_ID")
    ;;
  *)
    exit 1
    ;;
esac

if [ "${VERCEL_ENV:-}" != "production" ] && [ "${VERCEL_ENV:-}" != "preview" ]; then
  exit 1
fi

BASE_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"

if [ -n "$BASE_SHA" ] && git cat-file -e "${BASE_SHA}^{commit}" 2>/dev/null; then
  CHANGED_FILES=$(git diff --name-only "$BASE_SHA" HEAD)
elif git rev-parse HEAD^ >/dev/null 2>&1; then
  CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)
else
  exit 1
fi

if printf '%s\n' "$CHANGED_FILES" | grep -Eq "$RELEVANT_PATHS"; then
  exit 1
fi

exit 0
