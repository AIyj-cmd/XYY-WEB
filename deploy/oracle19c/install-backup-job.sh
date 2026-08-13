#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)

[[ ${EUID} -eq 0 ]] || { echo "[error] run as root" >&2; exit 1; }
[[ -f /etc/xyy/oracle-database.env ]] || {
  echo "[error] configure /etc/xyy/oracle-database.env first" >&2
  exit 1
}

install -m 700 "${SCRIPT_DIR}/backup-oracle.sh" /usr/local/sbin/xyy-backup-directus-oracle
install -m 644 "${SCRIPT_DIR}/xyy-oracle-backup.service" /etc/systemd/system/
install -m 644 "${SCRIPT_DIR}/xyy-oracle-backup.timer" /etc/systemd/system/

systemctl daemon-reload
if [[ ${CONFIRM_BACKUP_JOB_ACTIVATION:-} == "YES" ]]; then
  systemctl enable --now xyy-oracle-backup.timer
else
  echo "[action] run a Data Pump backup and import test, then rerun with CONFIRM_BACKUP_JOB_ACTIVATION=YES"
fi
