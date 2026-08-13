#!/usr/bin/env bash
# Archive Directus file storage independently from the database engine.

set -euo pipefail
umask 077

UPLOADS_DIR="${UPLOADS_DIR:-/var/www/xyy-cms/uploads}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/xyy-uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

[[ ${UPLOADS_DIR} == /* && ${UPLOADS_DIR} != / ]] || {
  echo "[error] UPLOADS_DIR must be a specific absolute path" >&2
  exit 1
}
[[ -d ${UPLOADS_DIR} ]] || { echo "[error] missing ${UPLOADS_DIR}" >&2; exit 1; }
[[ ${BACKUP_ROOT} == /* && ${BACKUP_ROOT} != / ]] || {
  echo "[error] BACKUP_ROOT must be a specific absolute path" >&2
  exit 1
}
[[ ${RETENTION_DAYS} =~ ^[1-9][0-9]*$ ]] || {
  echo "[error] invalid RETENTION_DAYS" >&2
  exit 1
}

install -d -m 700 "${BACKUP_ROOT}"
exec 9>"${BACKUP_ROOT}/.backup.lock"
flock -n 9 || { echo "[error] another uploads backup is running" >&2; exit 1; }

stamp=$(date -u +%Y%m%dT%H%M%SZ)
archive="${BACKUP_ROOT}/directus-uploads-${stamp}.tar.gz"
partial="${archive}.partial"
manifest="${BACKUP_ROOT}/directus-uploads-${stamp}.sha256"
uploads_parent=$(dirname "${UPLOADS_DIR}")
uploads_name=$(basename "${UPLOADS_DIR}")
trap 'rm -f -- "${partial}"' EXIT

tar --create --gzip --file="${partial}" --directory="${uploads_parent}" "${uploads_name}"
tar --list --gzip --file="${partial}" >/dev/null
mv "${partial}" "${archive}"
(
  cd "${BACKUP_ROOT}"
  sha256sum "$(basename "${archive}")" >"$(basename "${manifest}")"
)
chmod 600 "${archive}" "${manifest}"

find "${BACKUP_ROOT}" -maxdepth 1 -type f \
  \( -name 'directus-uploads-*.tar.gz' -o -name 'directus-uploads-*.sha256' \) \
  -mtime "+${RETENTION_DAYS}" -delete

echo "[ok] ${archive}"
echo "[required] copy this archive and checksum to encrypted off-server storage"
