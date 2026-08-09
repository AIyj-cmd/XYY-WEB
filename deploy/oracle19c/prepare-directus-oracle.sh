#!/usr/bin/env bash
# Run on the application server. Creates a parallel Directus instance on 8056,
# bootstraps Oracle, and applies the current PostgreSQL schema snapshot.

set -euo pipefail
umask 077

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CONFIG_FILE="${1:-/etc/xyy/oracle19c.env}"
[[ -f ${CONFIG_FILE} ]] || { echo "[error] missing ${CONFIG_FILE}" >&2; exit 1; }
# shellcheck disable=SC1090
source "${CONFIG_FILE}"
# shellcheck source=lib/prepare-runtime.sh
source "${SCRIPT_DIR}/lib/prepare-runtime.sh"

validate_prepare_environment
verify_oracle_port
install_oracle_directus
verify_oracle_connection
write_oracle_directus_env

echo "[prepare] bootstrapping Directus system tables in Oracle"
cd "${TARGET_CMS_DIR}"
"${NODE_BIN}/npm" exec directus -- bootstrap

stamp=$(date -u +%Y%m%dT%H%M%SZ)
snapshot="/var/backups/xyy-directus/schema-${stamp}.yaml"
echo "[prepare] snapshotting current PostgreSQL-backed Directus schema"
cd "${SOURCE_CMS_DIR}"
"${NODE_BIN}/npm" exec directus -- schema snapshot --yes "${snapshot}"
chmod 600 "${snapshot}"

echo "[prepare] applying database-agnostic schema snapshot to Oracle"
cd "${TARGET_CMS_DIR}"
"${NODE_BIN}/npm" exec directus -- schema apply --yes --dry-run "${snapshot}"
"${NODE_BIN}/npm" exec directus -- schema apply --yes "${snapshot}"

rsync -a "${SOURCE_CMS_DIR}/uploads/" "${TARGET_CMS_DIR}/uploads/"
write_oracle_pm2_configs

pm2 delete xyy-cms-oracle-stage >/dev/null 2>&1 || true
pm2 start "${TARGET_CMS_DIR}/ecosystem.stage.cjs"

for _ in {1..30}; do
  if curl -fsS "http://127.0.0.1:${STAGING_PORT}/server/health" >/dev/null; then
    echo "[ok] Oracle-backed Directus is ready on 127.0.0.1:${STAGING_PORT}"
    echo "[next] run migrate-and-cutover.sh ${CONFIG_FILE} during a maintenance window"
    exit 0
  fi
  sleep 1
done

pm2 logs xyy-cms-oracle-stage --lines 80 --nostream || true
echo "[error] Oracle-backed Directus did not become healthy" >&2
exit 1
