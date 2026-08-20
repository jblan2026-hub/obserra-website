#!/bin/sh
set -eu

DUPLICATE_PROJECT_ID="prj_FfAnssVJU8pcJydGNJHmCliP6Yme"
PRODUCTION_PROJECT_ID="prj_lxTKKDa9sbhht7FaigiaF1PONMiC"

# The repository is connected to more than one Vercel project. Only the
# canonical production project may build it. The duplicate project must never
# create a deployment because a later duplicate deployment can reclaim the
# public custom domains and defeat production routing authority.
#
# Vercel Ignore Command semantics:
#   exit 0 => skip/cancel the build
#   exit 1 => continue the build
case "${VERCEL_PROJECT_ID:-}" in
  "$DUPLICATE_PROJECT_ID")
    exit 0
    ;;
  "$PRODUCTION_PROJECT_ID")
    exit 1
    ;;
  *)
    # Fail open for unknown project IDs so an unexpected Vercel configuration
    # cannot silently suppress a release. Production authority verification
    # remains responsible for rejecting noncanonical live routing.
    exit 1
    ;;
esac
