#!/bin/sh
set -eu

CANONICAL_PROJECT_ID="prj_FfAnssVJU8pcJydGNJHmCliP6Yme"

if [ "${VERCEL_PROJECT_ID:-}" != "$CANONICAL_PROJECT_ID" ]; then
  exit 0
fi

if [ "${VERCEL_ENV:-}" != "production" ]; then
  exit 0
fi

if git diff --name-only HEAD^ HEAD | grep -Eq '^(app/|components/|lib/|public/|styles/|package.json$|package-lock.json$|next.config\.|middleware\.|proxy\.ts$|tsconfig.json$|vercel.json$|scripts/vercel-ignore-build\.sh$)'; then
  exit 1
fi

exit 0
