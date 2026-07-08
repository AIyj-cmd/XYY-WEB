#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DEPLOY_HOST:-}" ]]; then
  echo "Error: DEPLOY_HOST is not set. Usage: DEPLOY_HOST=root@<server> bash scripts/deploy.sh" >&2
  exit 1
fi
REMOTE_DIR="${REMOTE_DIR:-/var/www/xyy-web}"
NODE_BIN="${NODE_BIN:-/opt/node-v22/bin}"

ssh_cmd=(ssh -o StrictHostKeyChecking=no)
RSYNC_RSH="ssh -o StrictHostKeyChecking=no"

if [[ -n "${XYY_DEPLOY_PASSWORD:-}" ]]; then
  export SSHPASS="$XYY_DEPLOY_PASSWORD"
  ssh_cmd=(sshpass -e "${ssh_cmd[@]}")
  RSYNC_RSH="sshpass -e ssh -o StrictHostKeyChecking=no"
fi

npm run verify

# rsync: only transfer changed files — fonts/images skip if unchanged
rsync -az --delete -e "$RSYNC_RSH" \
  dist/ "$DEPLOY_HOST:$REMOTE_DIR/dist/"

rsync -az -e "$RSYNC_RSH" \
  package.json package-lock.json server.mjs ecosystem.config.cjs .env.production \
  "$DEPLOY_HOST:$REMOTE_DIR/"

"${ssh_cmd[@]}" "$DEPLOY_HOST" "set -euo pipefail
cd '$REMOTE_DIR'
cp .env.production .env
PATH='$NODE_BIN':\$PATH npm install --omit=dev
PATH='$NODE_BIN':\$PATH pm2 startOrReload ecosystem.config.cjs --update-env || PATH='$NODE_BIN':\$PATH pm2 start ecosystem.config.cjs --update-env
PATH='$NODE_BIN':\$PATH pm2 save"

SITE_URL="${SITE_URL:-https://wz.tomatopia.top}" node scripts/health-check.mjs
