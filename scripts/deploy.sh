#!/usr/bin/env bash
set -euo pipefail
if ! git diff --quiet || ! git diff --cached --quiet || [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
  echo "deployment_requires_clean_worktree" >&2
  exit 1
fi
DEPLOY_ENVIRONMENT="${DEPLOY_ENVIRONMENT:-}"
[[ ${DEPLOY_ENVIRONMENT} =~ ^(staging|production)$ ]] || {
  echo "Error: DEPLOY_ENVIRONMENT must be staging or production" >&2
  exit 1
}
GIT_SHA="$(git rev-parse HEAD)"
GIT_SHORT_SHA="${GIT_SHA:0:7}"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
BUILD_STAMP="${BUILD_TIME//[-:]/}"
BUILD_STAMP="${BUILD_STAMP/.000Z/Z}"
RELEASE_ID="${RELEASE_ID:-$BUILD_STAMP-$GIT_SHORT_SHA}"
RELEASE_MANIFEST_DIR="$(mktemp -d)"; RELEASE_MANIFEST_FILE="$RELEASE_MANIFEST_DIR/release-manifest.json"
trap 'rm -rf "$RELEASE_MANIFEST_DIR"' EXIT
node scripts/create-release-manifest.mjs --output "$RELEASE_MANIFEST_FILE" \
  --git-sha "$GIT_SHA" --build-time "$BUILD_TIME" --environment "$DEPLOY_ENVIRONMENT" \
  --release-id "$RELEASE_ID"
if [[ ${DEPLOY_PREFLIGHT_ONLY:-false} == true ]]; then
  echo "deployment preflight ok: $RELEASE_ID"
  exit 0
fi
if [[ -z "${DEPLOY_HOST:-}" ]]; then
  echo "Error: DEPLOY_HOST is not set. Usage: DEPLOY_HOST=root@<server> bash scripts/deploy.sh" >&2
  exit 1
fi
REMOTE_DIR="${REMOTE_DIR:-/var/www/xyy-web}"
NODE_BIN="${NODE_BIN:-/opt/node-v22/bin}"
SITE_URL="${SITE_URL:-https://wz.tomatopia.top}"
PUBLIC_DIRECTUS_URL="${PUBLIC_DIRECTUS_URL:-$SITE_URL/cms}"
BUILD_DIRECTUS_URL="${BUILD_DIRECTUS_URL:-$PUBLIC_DIRECTUS_URL}"
HEALTHCHECK_SITE_URL="${HEALTHCHECK_SITE_URL:-$SITE_URL}"
RELEASE_KEEP="${RELEASE_KEEP:-5}"
WEB_PORT="${WEB_PORT:-50031}"
[[ ${RELEASE_ID} =~ ^[A-Za-z0-9._-]+$ ]] || { echo "Error: invalid RELEASE_ID" >&2; exit 1; }
[[ ${RELEASE_KEEP} =~ ^[1-9][0-9]*$ ]] || { echo "Error: RELEASE_KEEP must be a positive integer" >&2; exit 1; }
[[ ${WEB_PORT} =~ ^[1-9][0-9]{0,4}$ ]] || { echo "Error: WEB_PORT must be a valid TCP port" >&2; exit 1; }
[[ ${REMOTE_DIR} =~ ^/[A-Za-z0-9._/-]+$ ]] || { echo "Error: REMOTE_DIR must be a safe absolute path" >&2; exit 1; }
[[ ${NODE_BIN} =~ ^/[A-Za-z0-9._/-]+$ ]] || { echo "Error: NODE_BIN must be a safe absolute path" >&2; exit 1; }
RELEASES_DIR="$REMOTE_DIR/releases"; RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"
CURRENT_LINK="$REMOTE_DIR/current"
ssh_cmd=(ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
RSYNC_RSH="ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
DIRECTUS_URL="$BUILD_DIRECTUS_URL" \
  PUBLIC_SITE_URL="$SITE_URL" \
  PUBLIC_DIRECTUS_URL="$PUBLIC_DIRECTUS_URL" \
  npm run verify:release
"${ssh_cmd[@]}" "$DEPLOY_HOST" "set -euo pipefail
test -f '$REMOTE_DIR/.env'
grep -Eq '^DIRECTUS_URL=.+' '$REMOTE_DIR/.env'
if ! { grep -Eq '^DIRECTUS_CONTENT_TOKEN=.+' '$REMOTE_DIR/.env' && \
  grep -Eq '^DIRECTUS_CONTACT_TOKEN=.+' '$REMOTE_DIR/.env'; } && \
  ! grep -Eq '^DIRECTUS_TOKEN=.+' '$REMOTE_DIR/.env'; then
  echo '[error] Directus runtime tokens are missing' >&2
  exit 1
fi
mkdir -p '$RELEASES_DIR'
test ! -e '$RELEASE_DIR'
mkdir -p '$RELEASE_DIR/dist'
if [[ -d '$CURRENT_LINK/dist' ]]; then
  cp -al '$CURRENT_LINK/dist/.' '$RELEASE_DIR/dist/'
fi"
rsync -az --delete -e "$RSYNC_RSH" dist/ "$DEPLOY_HOST:$RELEASE_DIR/dist/"
rsync -az -e "$RSYNC_RSH" \
  package.json package-lock.json server.mjs ecosystem.config.cjs config server \
  "$DEPLOY_HOST:$RELEASE_DIR/"
rsync -az -e "$RSYNC_RSH" "$RELEASE_MANIFEST_FILE" "$DEPLOY_HOST:$RELEASE_DIR/release-manifest.json"
"${ssh_cmd[@]}" "$DEPLOY_HOST" "set -euo pipefail
release_dir='$RELEASE_DIR'
current_link='$CURRENT_LINK'
previous_target=''
if [[ -L \"\$current_link\" ]]; then
  previous_target=\$(readlink -f \"\$current_link\")
elif [[ -f '$REMOTE_DIR/ecosystem.config.cjs' && -d '$REMOTE_DIR/dist' ]]; then
  previous_target='$REMOTE_DIR'
fi
if [[ -n \"\$previous_target\" ]]; then
  printf '%s\\n' \"\$previous_target\" > \"\$release_dir/.previous_target\"
fi
verify_release_identity() {
  local manifest=\"\$1\"
  if [[ ! -f \"\$manifest\" ]]; then
    echo 'legacy_previous_release_identity_unavailable' >&2
    return 2
  fi
  RELEASE_MANIFEST=\"\$manifest\" WEB_PORT='$WEB_PORT' PATH='$NODE_BIN':\$PATH node -e \"
    const fs=require('node:fs'),expected=JSON.parse(fs.readFileSync(process.env.RELEASE_MANIFEST,'utf8'));
    fetch('http://127.0.0.1:' + process.env.WEB_PORT + '/version').then(async response=>{
      if(!response.ok) throw new Error('version HTTP ' + response.status);
      const actual=await response.json();
      for(const key of ['gitSha','releaseId','environment','cmsSchemaVersion'])
        if(actual[key]!==expected[key]) throw new Error('release identity mismatch: ' + key);
    }).catch(error=>{console.error(error.message);process.exit(1)});\"
}
restore_previous() {
  PATH='$NODE_BIN':\$PATH pm2 delete xyy-web >/dev/null 2>&1 || true
  if [[ -n \"\$previous_target\" ]]; then
    ln -sfn \"\$previous_target\" \"\$current_link.rollback\"
    mv -Tf \"\$current_link.rollback\" \"\$current_link\"
    PATH='$NODE_BIN':\$PATH pm2 start \"\$current_link/ecosystem.config.cjs\" --update-env
  else
    PATH='$NODE_BIN':\$PATH pm2 start '$REMOTE_DIR/ecosystem.config.cjs' --update-env
  fi
  PATH='$NODE_BIN':\$PATH pm2 save
  for _ in {1..30}; do
    if curl -fsS http://127.0.0.1:$WEB_PORT/healthz >/dev/null; then
      if [[ -f \"\$previous_target/release-manifest.json\" ]]; then
        verify_release_identity \"\$previous_target/release-manifest.json\"
      else
        echo 'legacy_previous_release_identity_unavailable' >&2
      fi
      return 0
    fi
    sleep 1
  done
  echo '[critical] previous web release failed health check' >&2
  return 1
}
ln -s '$REMOTE_DIR/.env' \"\$release_dir/.env\"
find \"\$release_dir/dist\" -type d -exec chmod 755 {} +
find \"\$release_dir/dist\" -type f -exec chmod 644 {} +
PATH='$NODE_BIN':\$PATH npm ci --omit=dev --prefix \"\$release_dir\"
PATH='$NODE_BIN':\$PATH node --check \"\$release_dir/server.mjs\"
test -f \"\$release_dir/dist/server/entry.mjs\"
ln -sfn \"\$release_dir\" \"\$current_link.next\"
mv -Tf \"\$current_link.next\" \"\$current_link\"
PATH='$NODE_BIN':\$PATH pm2 delete xyy-web >/dev/null 2>&1 || true
if ! PATH='$NODE_BIN':\$PATH pm2 start \"\$current_link/ecosystem.config.cjs\" --update-env; then
  restore_previous
  exit 1
fi
healthy=0
for _ in {1..30}; do
  if curl -fsS http://127.0.0.1:$WEB_PORT/healthz | grep -q '\"contactStorage\":\"ok\"'; then
    healthy=1
    break
  fi
  sleep 1
done
if [[ \$healthy -ne 1 ]]; then
  echo '[error] new web release failed health check; rolling back' >&2
  restore_previous
  exit 1
fi
if ! verify_release_identity \"\$release_dir/release-manifest.json\"; then
  echo '[error] new web release identity mismatch; rolling back' >&2
  restore_previous
  exit 1
fi
PATH='$NODE_BIN':\$PATH pm2 save"
if ! SITE_URL="$HEALTHCHECK_SITE_URL" EXPECTED_GIT_SHA="$GIT_SHA" \
  EXPECTED_RELEASE_ID="$RELEASE_ID" EXPECTED_ENVIRONMENT="$DEPLOY_ENVIRONMENT" \
  EXPECTED_CMS_SCHEMA_VERSION="$(node -e "import('./config/cms-contract.mjs').then(m=>process.stdout.write(m.CMS_SCHEMA_VERSION))")" \
  node scripts/health-check.mjs; then
  echo "[error] external release checks failed; restoring previous release" >&2
  "${ssh_cmd[@]}" "$DEPLOY_HOST" "set -euo pipefail
release_dir='$RELEASE_DIR'; current_link='$CURRENT_LINK'
releases_dir='$RELEASES_DIR'; legacy_dir='$REMOTE_DIR'
if [[ ! -f \"\$release_dir/.previous_target\" ]]; then
  echo '[critical] no previous release is available for rollback' >&2
  exit 1
fi
previous_target=\$(cat \"\$release_dir/.previous_target\")
case \"\$previous_target\" in
  \"\$releases_dir\"/*|\"\$legacy_dir\") ;;
  *) echo '[critical] refusing unsafe rollback target' >&2; exit 1 ;;
esac
test -d \"\$previous_target\"
ln -sfn \"\$previous_target\" \"\$current_link.rollback\"
mv -Tf \"\$current_link.rollback\" \"\$current_link\"
PATH='$NODE_BIN':\$PATH pm2 delete xyy-web >/dev/null 2>&1 || true
PATH='$NODE_BIN':\$PATH pm2 start \"\$current_link/ecosystem.config.cjs\" --update-env
PATH='$NODE_BIN':\$PATH pm2 save
for _ in {1..30}; do
  if curl -fsS http://127.0.0.1:$WEB_PORT/healthz >/dev/null; then
    if [[ -f \"\$previous_target/release-manifest.json\" ]]; then
      RELEASE_MANIFEST=\"\$previous_target/release-manifest.json\" WEB_PORT='$WEB_PORT' PATH='$NODE_BIN':\$PATH node -e \"
        const fs=require('node:fs');const e=JSON.parse(fs.readFileSync(process.env.RELEASE_MANIFEST));
        fetch('http://127.0.0.1:' + process.env.WEB_PORT + '/version').then(async r=>{const a=await r.json();
        if(!r.ok||['gitSha','releaseId','environment','cmsSchemaVersion'].some(k=>a[k]!==e[k]))process.exit(1)})\"
    else
      echo 'legacy_previous_release_identity_unavailable' >&2
    fi
    exit 0
  fi
  sleep 1
done
echo '[critical] rolled-back release failed health check' >&2
exit 1"
  exit 1
fi
"${ssh_cmd[@]}" "$DEPLOY_HOST" "set -euo pipefail
cd '$RELEASES_DIR'
ls -1dt -- */ 2>/dev/null | tail -n +$((RELEASE_KEEP + 1)) | xargs -r rm -rf --"
echo "Deployed release $RELEASE_ID to $HEALTHCHECK_SITE_URL"
