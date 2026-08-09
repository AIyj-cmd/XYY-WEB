#!/usr/bin/env bash
# Restore the latest Directus dump into an isolated temporary database.

set -euo pipefail
umask 077

if [[ ${CONFIRM_RESTORE_TEST:-} != "YES" ]]; then
  echo "[error] set CONFIRM_RESTORE_TEST=YES to create and remove a temporary verification database" >&2
  exit 1
fi

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/xyy-postgresql}"
BACKUP_FILE="${1:-}"

if [[ -z ${BACKUP_FILE} ]]; then
  BACKUP_FILE=$(find "${BACKUP_ROOT}" -maxdepth 1 -type f -name 'directus-*.dump' -printf '%T@ %p\n' | sort -nr | head -n 1 | cut -d' ' -f2-)
fi

[[ -n ${BACKUP_FILE} && -f ${BACKUP_FILE} ]] || { echo "[error] no backup file found" >&2; exit 1; }
pg_restore --list "${BACKUP_FILE}" >/dev/null

stamp=$(date -u +%Y%m%d%H%M%S)
test_database="xyy_restore_verify_${stamp}"
[[ ${test_database} =~ ^xyy_restore_verify_[0-9]{14}$ ]] || { echo "[error] unsafe test database name" >&2; exit 1; }

temp_dir=$(mktemp -d /tmp/xyy-pg-restore.XXXXXX)
temp_dump="${temp_dir}/directus.dump"
cleanup() {
  sudo -u postgres dropdb --if-exists "${test_database}" >/dev/null 2>&1 || true
  rm -rf "${temp_dir}"
}
trap cleanup EXIT

cp "${BACKUP_FILE}" "${temp_dump}"
chown -R postgres:postgres "${temp_dir}"
chmod 700 "${temp_dir}"
chmod 600 "${temp_dump}"

sudo -u postgres createdb --template=template0 --encoding=UTF8 "${test_database}"
sudo -u postgres pg_restore --exit-on-error --no-owner --no-acl \
  --dbname="${test_database}" "${temp_dump}"

sudo -u postgres psql --dbname="${test_database}" --set=ON_ERROR_STOP=1 --tuples-only <<'SQL'
select 'homepage_stats', count(*) from homepage_stats;
select 'services', count(*) from services;
select 'warehouses', count(*) from warehouses;
select 'cases', count(*) from cases;
select 'contact_leads', count(*) from contact_leads;
SQL

echo "[ok] restore verification completed with ${BACKUP_FILE}"
