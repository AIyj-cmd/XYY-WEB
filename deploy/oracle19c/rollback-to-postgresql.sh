#!/usr/bin/env bash
# Emergency rollback on the application server. Does not delete Oracle data.

set -euo pipefail

CONFIG_FILE="${1:-/etc/xyy/oracle19c.env}"
[[ -f ${CONFIG_FILE} ]] || { echo "[error] missing ${CONFIG_FILE}" >&2; exit 1; }
# shellcheck disable=SC1090
source "${CONFIG_FILE}"

[[ ${CONFIRM_POSTGRES_ROLLBACK:-} == "YES" ]] || {
  echo "[error] set CONFIRM_POSTGRES_ROLLBACK=YES to continue" >&2
  exit 1
}

pm2 delete xyy-cms >/dev/null 2>&1 || true
pm2 start "${SOURCE_CMS_DIR}/start-directus.sh" --name xyy-cms --cwd "${SOURCE_CMS_DIR}"

for _ in {1..30}; do
  if curl -fsS http://127.0.0.1:8055/server/ping >/dev/null; then
    sed -i "s/^PORT=.*/PORT=${STAGING_PORT}/" "${TARGET_CMS_DIR}/.env"
    pm2 save
    echo "[ok] Directus rolled back to PostgreSQL; Oracle files and data were retained."
    exit 0
  fi
  sleep 1
done

pm2 logs xyy-cms --lines 80 --nostream || true
echo "[error] PostgreSQL Directus did not recover" >&2
exit 1
