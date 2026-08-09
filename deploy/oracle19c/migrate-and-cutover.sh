#!/usr/bin/env bash
# Run on the application server after prepare-directus-oracle.sh.
# Exports custom collection data, imports it into Oracle, verifies hashes, then
# moves the already-tested Oracle instance from port 8056 to production 8055.

set -euo pipefail
umask 077

CONFIG_FILE="${1:-/etc/xyy/oracle19c.env}"
[[ -f ${CONFIG_FILE} ]] || { echo "[error] missing ${CONFIG_FILE}" >&2; exit 1; }
# shellcheck disable=SC1090
source "${CONFIG_FILE}"

WEB_PROCESS_NAME="${WEB_PROCESS_NAME:-xyy-web}"
[[ ${WEB_PROCESS_NAME} =~ ^[A-Za-z0-9._-]+$ ]] || {
  echo "[error] invalid WEB_PROCESS_NAME" >&2
  exit 1
}
web_quiesced=0

if [[ ${CONFIRM_ORACLE_CUTOVER:-} != "YES" ]]; then
  echo "[error] set CONFIRM_ORACLE_CUTOVER=YES for the planned maintenance window" >&2
  exit 1
fi

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
stamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_dir="/var/backups/xyy-directus/${stamp}"
install -d -m 700 "${backup_dir}"

wait_for_directus() {
  local url=$1
  for _ in {1..30}; do
    if curl -fsS "${url}" >/dev/null; then
      return 0
    fi
    sleep 1
  done
  return 1
}

resume_web() {
  if [[ ${web_quiesced} -eq 1 ]]; then
    pm2 restart "${WEB_PROCESS_NAME}" --update-env
    pm2 save
    web_quiesced=0
  fi
}

cleanup() {
  if [[ ${web_quiesced} -eq 1 ]]; then
    echo "[recovery] restarting the web process after interrupted cutover" >&2
    resume_web || true
  fi
}
trap cleanup EXIT

rollback_to_postgresql() {
  echo "[rollback] restoring PostgreSQL-backed Directus" >&2
  pm2 delete xyy-cms >/dev/null 2>&1 || true
  sed -i "s/^PORT=.*/PORT=${STAGING_PORT}/" "${TARGET_CMS_DIR}/.env"
  pm2 start "${SOURCE_CMS_DIR}/start-directus.sh" --name xyy-cms --cwd "${SOURCE_CMS_DIR}"
  resume_web

  if ! wait_for_directus http://127.0.0.1:8055/server/ping; then
    echo "[critical] PostgreSQL Directus rollback failed health check" >&2
    return 1
  fi
  if ! wait_for_directus http://127.0.0.1:4321/healthz; then
    echo "[critical] website did not recover after PostgreSQL rollback" >&2
    return 1
  fi

  pm2 save
  echo "[rollback] PostgreSQL Directus is healthy" >&2
}

echo "[maintenance] stopping ${WEB_PROCESS_NAME} to prevent contact writes during migration"
pm2 describe "${WEB_PROCESS_NAME}" >/dev/null
pm2 stop "${WEB_PROCESS_NAME}"
web_quiesced=1

echo "[backup] PostgreSQL rollback dump"
sudo -u postgres pg_dump -Fc directus > "${backup_dir}/directus-postgresql.dump"
chmod 600 "${backup_dir}/directus-postgresql.dump"

echo "[migrate] custom Directus collections to Oracle"
SOURCE_DIRECTUS_URL=http://127.0.0.1:8055 \
SOURCE_DIRECTUS_TOKEN="${DIRECTUS_STATIC_TOKEN}" \
TARGET_DIRECTUS_URL="http://127.0.0.1:${STAGING_PORT}" \
TARGET_DIRECTUS_TOKEN="${DIRECTUS_STATIC_TOKEN}" \
MIGRATION_BACKUP_DIR="${backup_dir}/content" \
  "${NODE_BIN}/node" "${SCRIPT_DIR}/migrate-directus-content.mjs"

echo "[cutover] replacing Directus process; nginx remains on 127.0.0.1:8055"
pm2 delete xyy-cms-oracle-stage >/dev/null 2>&1 || true
pm2 stop xyy-cms
sed -i "s/^PORT=.*/PORT=8055/" "${TARGET_CMS_DIR}/.env"
pm2 delete xyy-cms >/dev/null 2>&1 || true
if ! pm2 start "${TARGET_CMS_DIR}/ecosystem.production.cjs"; then
  echo "[error] Oracle Directus failed to start" >&2
  rollback_to_postgresql
  exit 1
fi

if ! wait_for_directus http://127.0.0.1:8055/server/ping; then
  echo "[error] Oracle Directus failed health check; rolling back to PostgreSQL" >&2
  rollback_to_postgresql
  exit 1
fi

resume_web
if ! wait_for_directus http://127.0.0.1:4321/healthz; then
  echo "[error] website failed health check after Oracle cutover; rolling back" >&2
  rollback_to_postgresql
  exit 1
fi

pm2 save
curl -fsS http://127.0.0.1:8055/server/ping
echo
echo "[ok] Directus now uses Oracle 19c. PostgreSQL and ${SOURCE_CMS_DIR} were retained for rollback."
echo "[backup] ${backup_dir}"
trap - EXIT
