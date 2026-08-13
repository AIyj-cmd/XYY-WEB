#!/usr/bin/env bash
# Consistent PostgreSQL backup for the current Directus database.

set -euo pipefail
umask 077

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/xyy-postgresql}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

[[ ${RETENTION_DAYS} =~ ^[1-9][0-9]*$ ]] || { echo "[error] invalid RETENTION_DAYS" >&2; exit 1; }
[[ ${BACKUP_ROOT} == /* && ${BACKUP_ROOT} != / ]] || {
  echo "[error] BACKUP_ROOT must be a specific absolute path" >&2
  exit 1
}

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
(
  cd "${BACKUP_ROOT}"
  sha256sum "$(basename "${final_dump}")" >"$(basename "${manifest}")"
)
chmod 600 "${final_dump}" "${manifest}"

find "${BACKUP_ROOT}" -maxdepth 1 -type f \
  \( -name 'directus-*.dump' -o -name 'directus-*.sha256' \) \
  -mtime "+${RETENTION_DAYS}" -delete

echo "[ok] ${final_dump}"
echo "[required] copy this backup and checksum to encrypted off-server storage"
