#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)

[[ ${EUID} -eq 0 ]] || { echo "[error] run as root" >&2; exit 1; }

install -d -m 750 /etc/xyy
if [[ ! -f /etc/xyy/postgresql-backup.env ]]; then
  install -m 600 "${SCRIPT_DIR}/postgresql-backup.env.example" \
    /etc/xyy/postgresql-backup.env
  echo "[action] configure /etc/xyy/postgresql-backup.env before the first backup"
fi
install -m 700 "${SCRIPT_DIR}/backup-directus.sh" \
  /usr/local/sbin/xyy-backup-directus-postgresql
install -m 700 "${SCRIPT_DIR}/restore-test-directus.sh" \
  /usr/local/sbin/xyy-restore-test-directus-postgresql
install -m 644 "${SCRIPT_DIR}/xyy-postgresql-backup.service" /etc/systemd/system/
install -m 644 "${SCRIPT_DIR}/xyy-postgresql-backup.timer" /etc/systemd/system/

systemctl daemon-reload
if [[ ${CONFIRM_BACKUP_JOB_ACTIVATION:-} == "YES" ]]; then
  systemctl enable --now xyy-postgresql-backup.timer
else
  echo "[action] run a manual backup and restore test, then rerun with CONFIRM_BACKUP_JOB_ACTIVATION=YES"
fi
