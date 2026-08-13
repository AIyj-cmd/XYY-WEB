#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)

[[ ${EUID} -eq 0 ]] || { echo "[error] run as root" >&2; exit 1; }

install -d -m 750 /etc/xyy
if [[ ! -f /etc/xyy/uploads-backup.env ]]; then
  install -m 600 "${SCRIPT_DIR}/uploads-backup.env.example" /etc/xyy/uploads-backup.env
  echo "[action] review /etc/xyy/uploads-backup.env before the first backup"
fi
install -m 700 "${SCRIPT_DIR}/backup-directus-uploads.sh" \
  /usr/local/sbin/xyy-backup-directus-uploads
install -m 700 "${SCRIPT_DIR}/restore-test-directus-uploads.sh" \
  /usr/local/sbin/xyy-restore-test-directus-uploads
install -m 644 "${SCRIPT_DIR}/xyy-directus-uploads-backup.service" /etc/systemd/system/
install -m 644 "${SCRIPT_DIR}/xyy-directus-uploads-backup.timer" /etc/systemd/system/

systemctl daemon-reload
if [[ ${CONFIRM_BACKUP_JOB_ACTIVATION:-} == "YES" ]]; then
  systemctl enable --now xyy-directus-uploads-backup.timer
else
  echo "[action] review the config and run a restore test, then rerun with CONFIRM_BACKUP_JOB_ACTIVATION=YES"
fi
