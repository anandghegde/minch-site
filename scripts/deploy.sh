#!/usr/bin/env bash
# Build the static site and rsync it to the Linode box.
# Requires three env vars:
#   MINCH_DEPLOY_USER  — ssh user on the Linode (e.g. deploy)
#   MINCH_DEPLOY_HOST  — hostname or IP (e.g. minch.app or 1.2.3.4)
#   MINCH_DEPLOY_PATH  — server-side document root (e.g. /var/www/minch.app)
#
# Pass --dry-run as the first arg to preview without uploading.

set -euo pipefail

cd "$(dirname "$0")/.."

: "${MINCH_DEPLOY_USER:?Set MINCH_DEPLOY_USER (ssh user on the Linode box)}"
: "${MINCH_DEPLOY_HOST:?Set MINCH_DEPLOY_HOST (hostname or IP)}"
: "${MINCH_DEPLOY_PATH:?Set MINCH_DEPLOY_PATH (server-side document root)}"

DRY_RUN=""
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN="--dry-run"
  echo "==> Dry-run mode: no files will be transferred"
fi

echo "==> Building static site"
npm run build

echo "==> Syncing dist/ to ${MINCH_DEPLOY_USER}@${MINCH_DEPLOY_HOST}:${MINCH_DEPLOY_PATH}"
rsync -avz --delete ${DRY_RUN} \
  --exclude='.DS_Store' \
  dist/ "${MINCH_DEPLOY_USER}@${MINCH_DEPLOY_HOST}:${MINCH_DEPLOY_PATH}/"

if [[ -z "$DRY_RUN" ]]; then
  echo "==> Done. https://${MINCH_DEPLOY_HOST}/"
fi
