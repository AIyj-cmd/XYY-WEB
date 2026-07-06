#!/usr/bin/env bash
set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-root@47.82.105.103}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/xyy-web}"
NODE_BIN="${NODE_BIN:-/opt/node-v22/bin}"
RELEASE_NAME="xyy-web-$(date +%Y%m%d%H%M%S)"
ARCHIVE="/tmp/${RELEASE_NAME}.tar.gz"

ssh_cmd=(ssh -o StrictHostKeyChecking=no)
scp_cmd=(scp -o StrictHostKeyChecking=no)

if [[ -n "${XYY_DEPLOY_PASSWORD:-}" ]]; then
  ssh_cmd=(sshpass -p "$XYY_DEPLOY_PASSWORD" "${ssh_cmd[@]}")
  scp_cmd=(sshpass -p "$XYY_DEPLOY_PASSWORD" "${scp_cmd[@]}")
fi

npm run verify

tar -czf "$ARCHIVE" \
  dist \
  package.json \
  package-lock.json \
  server.mjs \
  ecosystem.config.cjs \
  .env.production

"${ssh_cmd[@]}" "$DEPLOY_HOST" "mkdir -p /root/xyy-web-releases '$REMOTE_DIR' && \
  if [ -d '$REMOTE_DIR/dist' ]; then tar -C '$REMOTE_DIR' -czf '/root/xyy-web-releases/${RELEASE_NAME}-previous-dist.tar.gz' dist; fi"

"${scp_cmd[@]}" "$ARCHIVE" "$DEPLOY_HOST:/tmp/${RELEASE_NAME}.tar.gz"

"${ssh_cmd[@]}" "$DEPLOY_HOST" "set -euo pipefail
cd '$REMOTE_DIR'
rm -rf dist
tar -xzf '/tmp/${RELEASE_NAME}.tar.gz'
cp .env.production .env
PATH='$NODE_BIN':\$PATH npm install --omit=dev
PATH='$NODE_BIN':\$PATH pm2 startOrReload ecosystem.config.cjs --update-env || PATH='$NODE_BIN':\$PATH pm2 start ecosystem.config.cjs --update-env
PATH='$NODE_BIN':\$PATH pm2 save
rm -f '/tmp/${RELEASE_NAME}.tar.gz'"

rm -f "$ARCHIVE"
SITE_URL="${SITE_URL:-https://wz.tomatopia.top}" node scripts/health-check.mjs
