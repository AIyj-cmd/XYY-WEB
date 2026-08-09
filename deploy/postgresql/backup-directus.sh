#!/usr/bin/env bash
# Consistent PostgreSQL backup for the current Directus database.

set -euo pipefail
umask 077

CONFIG_FILE="${1:-/var/www/xyy-cms/.env}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/xyy-postgresql}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

[[ -f ${CONFIG_FILE} ]] || { echo "[error] missing ${CONFIG_FILE}" >&2; exit 1; }
[[ ${RETENTION_DAYS} =~ ^[1-9][0-9]*$ ]] || { echo "[error] invalid RETENTION_DAYS" >&2; exit 1; }

# shellcheck disable=SC1090
set -a
source "${CONFIG_FILE}"
set +a

for variable in DB_HOST DB_PORT DB_USER DB_PASSWORD DB_DATABASE; do
  [[ -n ${!variable:-} ]] || { echo "[error] ${variable} is required" >&2; exit 1; }
done

install -d -m 700 "${BACKUP_ROOT}"
exec 9>"${BACKUP_ROOT}/.backup.lock"
flock -n 9 || { echo "[error] another PostgreSQL backup is running" >&2; exit 1; }

stamp=$(date -u +%Y%m%dT%H%M%SZ)
final_dump="${BACKUP_ROOT}/directus-${stamp}.dump"
temp_dump="${final_dump}.partial"
manifest="${BACKUP_ROOT}/directus-${stamp}.sha256"
trap 'rm -f "${temp_dump}"' EXIT

PGPASSWORD="${DB_PASSWORD}" pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_DATABASE}" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="${temp_dump}"

pg_restore --list "${temp_dump}" >/dev/null
mv "${temp_dump}" "${final_dump}"
sha256sum "${final_dump}" >"${manifest}"
chmod 600 "${final_dump}" "${manifest}"

find "${BACKUP_ROOT}" -maxdepth 1 -type f \
  \( -name 'directus-*.dump' -o -name 'directus-*.sha256' \) \
  -mtime "+${RETENTION_DAYS}" -delete

echo "[ok] ${final_dump}"
echo "[required] copy this backup and checksum to encrypted off-server storage"
