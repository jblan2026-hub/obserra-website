#!/bin/sh
set -eu

CANONICAL_PROJECT_ID="prj_FfAnssVJU8pcJydGNJHmCliP6Yme"
RELEVANT_PATHS='^(app/|components/|lib/|public/|styles/|package.json$|package-lock.json$|next.config\.|middleware\.|proxy\.ts$|tsconfig.json$|vercel.json$|scripts/vercel-ignore-build\.sh$)'

if [ "${VERCEL_PROJECT_ID:-}" != "$CANONICAL_PROJECT_ID" ]; then
  exit 0
fi

if [ "${VERCEL_ENV:-}" != "production" ] && [ "${VERCEL_ENV:-}" != "preview" ]; then
  exit 0
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
