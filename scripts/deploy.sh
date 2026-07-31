#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DEPLOY_HOST:-}" ]]; then
  echo "Error: DEPLOY_HOST is not set. Usage: DEPLOY_HOST=root@<server> bash scripts/deploy.sh" >&2
  exit 1
fi
REMOTE_DIR="${REMOTE_DIR:-/var/www/xyy-web}"
NODE_BIN="${NODE_BIN:-/opt/node-v22/bin}"
SITE_URL="${SITE_URL:-https://wz.tomatopia.top}"
PUBLIC_DIRECTUS_URL="${PUBLIC_DIRECTUS_URL:-$SITE_URL/cms}"
BUILD_DIRECTUS_URL="${BUILD_DIRECTUS_URL:-$PUBLIC_DIRECTUS_URL}"

ssh_cmd=(ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
RSYNC_RSH="ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

DIRECTUS_URL="$BUILD_DIRECTUS_URL" \
  PUBLIC_SITE_URL="$SITE_URL" \
  PUBLIC_DIRECTUS_URL="$PUBLIC_DIRECTUS_URL" \
  npm run verify

# rsync: only transfer changed files — fonts/images skip if unchanged
rsync -az --delete -e "$RSYNC_RSH" \
  dist/ "$DEPLOY_HOST:$REMOTE_DIR/dist/"

rsync -az -e "$RSYNC_RSH" \
  package.json package-lock.json server.mjs ecosystem.config.cjs \
  "$DEPLOY_HOST:$REMOTE_DIR/"

"${ssh_cmd[@]}" "$DEPLOY_HOST" "set -euo pipefail
cd '$REMOTE_DIR'
test -f .env
PATH='$NODE_BIN':\$PATH npm install --omit=dev
PATH='$NODE_BIN':\$PATH pm2 restart xyy-web --update-env || PATH='$NODE_BIN':\$PATH pm2 start ecosystem.config.cjs --update-env
PATH='$NODE_BIN':\$PATH pm2 save"

SITE_URL="$SITE_URL" node scripts/health-check.mjs
