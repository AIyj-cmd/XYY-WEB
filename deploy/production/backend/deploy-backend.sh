#!/usr/bin/env bash
# Explicit entry point for Directus backend preparation, cutover, verification,
# and rollback. Run on the application server from the repository root.

set -euo pipefail

ACTION="${1:-}"
CONFIG_FILE="${2:-/etc/xyy/oracle19c.env}"
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
if [[ -f ${SCRIPT_DIR}/prepare-directus-oracle.sh ]]; then
  # Standalone handoff package layout.
  ORACLE_DIR=${SCRIPT_DIR}
else
  # Git repository layout.
  ORACLE_DIR=$(cd -- "${SCRIPT_DIR}/../../oracle19c" && pwd)
fi

usage() {
  cat <<'EOF'
Usage:
  sudo bash deploy/production/backend/deploy-backend.sh prepare [config]
  sudo CONFIRM_ORACLE_CUTOVER=YES bash deploy/production/backend/deploy-backend.sh cutover [config]
  sudo bash deploy/production/backend/deploy-backend.sh verify [config]
  sudo CONFIRM_POSTGRES_ROLLBACK=YES bash deploy/production/backend/deploy-backend.sh rollback [config]
EOF
}

[[ -n ${ACTION} ]] || { usage >&2; exit 1; }
[[ -f ${CONFIG_FILE} ]] || { echo "[error] missing ${CONFIG_FILE}" >&2; exit 1; }

case "${ACTION}" in
  prepare)
    exec bash "${ORACLE_DIR}/prepare-directus-oracle.sh" "${CONFIG_FILE}"
    ;;
  cutover)
    [[ ${CONFIRM_ORACLE_CUTOVER:-} == YES ]] || {
      echo "[error] set CONFIRM_ORACLE_CUTOVER=YES during the maintenance window" >&2
      exit 1
    }
    exec bash "${ORACLE_DIR}/migrate-and-cutover.sh" "${CONFIG_FILE}"
    ;;
  verify)
    # shellcheck disable=SC1090
    source "${CONFIG_FILE}"
    curl -fsS http://127.0.0.1:8055/server/ping
    echo
    curl -fsS http://127.0.0.1:50031/healthz
    echo
    pm2 describe xyy-cms >/dev/null
    pm2 describe "${WEB_PROCESS_NAME:-xyy-web}" >/dev/null
    echo "[ok] backend and web processes are healthy"
    ;;
  rollback)
    [[ ${CONFIRM_POSTGRES_ROLLBACK:-} == YES ]] || {
      echo "[error] set CONFIRM_POSTGRES_ROLLBACK=YES to restore PostgreSQL" >&2
      exit 1
    }
    exec bash "${ORACLE_DIR}/rollback-to-postgresql.sh" "${CONFIG_FILE}"
    ;;
  *)
    usage >&2
    exit 1
    ;;
esac
