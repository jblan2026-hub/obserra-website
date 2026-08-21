#!/bin/sh
set -eu

PRODUCTION_PROJECT_ID="prj_lxTKKDa9sbhht7FaigiaF1PONMiC"

# This repository is connected to multiple Vercel projects, but only the
# canonical production project is authorized to build it. Any noncanonical,
# unknown, or missing project identity is suppressed so a second deployment
# cannot reclaim canonical domains or become an accidental release authority.
#
# Vercel Ignore Command semantics:
#   exit 0 => skip/cancel the build
#   exit 1 => continue the build
case "${VERCEL_PROJECT_ID:-}" in
  "$PRODUCTION_PROJECT_ID")
    exit 1
    ;;
  *)
    exit 0
    ;;
esac
