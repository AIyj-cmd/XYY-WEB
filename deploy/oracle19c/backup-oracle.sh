#!/usr/bin/env bash
# Data Pump backup for the Directus schema. Run on the Oracle database server.

set -euo pipefail
umask 077

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/oracle/xyy-directus}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
DIRECTUS_DB_USER="${DIRECTUS_DB_USER:-DIRECTUS_APP}"
DIRECTUS_DB_PASSWORD="${DIRECTUS_DB_PASSWORD:-}"
PDB_SERVICE="${PDB_SERVICE:-${PDB_NAME:-ORCLPDB1}}"
ORACLE_HOME="${ORACLE_HOME:-/opt/oracle/product/19c/dbhome_1}"
ORACLE_SID="${ORACLE_SID:-ORCLCDB}"
ORACLE_OS_USER="${ORACLE_OS_USER:-oracle}"

[[ ${EUID} -eq 0 ]] || { echo "[error] run as root" >&2; exit 1; }
id "${ORACLE_OS_USER}" >/dev/null 2>&1 || { echo "[error] Oracle OS user not found" >&2; exit 1; }
[[ -n ${DIRECTUS_DB_PASSWORD} ]] || { echo "[error] DIRECTUS_DB_PASSWORD is required" >&2; exit 1; }
[[ ${DIRECTUS_DB_USER} =~ ^[A-Z][A-Z0-9_$#]{0,29}$ ]] || { echo "[error] invalid DIRECTUS_DB_USER" >&2; exit 1; }
[[ ${PDB_SERVICE} =~ ^[A-Z][A-Z0-9_$#]{0,29}$ ]] || { echo "[error] invalid PDB_SERVICE" >&2; exit 1; }
[[ ${DIRECTUS_DB_PASSWORD} =~ ^[A-Za-z0-9_@#.+-]+$ ]] || { echo "[error] unsupported password characters" >&2; exit 1; }
[[ -x ${ORACLE_HOME}/bin/sqlplus && -x ${ORACLE_HOME}/bin/expdp ]] || { echo "[error] Oracle tools not found" >&2; exit 1; }
[[ ${BACKUP_ROOT} =~ ^/[A-Za-z0-9._/-]+$ ]] || { echo "[error] unsafe BACKUP_ROOT" >&2; exit 1; }
[[ ${RETENTION_DAYS} =~ ^[1-9][0-9]*$ ]] || { echo "[error] invalid RETENTION_DAYS" >&2; exit 1; }

oracle_group=$(id -gn "${ORACLE_OS_USER}")

stamp=$(date -u +%Y%m%dT%H%M%SZ)
install -d -m 700 "${BACKUP_ROOT}"
chown "${ORACLE_OS_USER}:${oracle_group}" "${BACKUP_ROOT}"
exec 9>"${BACKUP_ROOT}/.backup.lock"
flock -n 9 || { echo "[error] another Oracle backup is running" >&2; exit 1; }

sql_file=$(mktemp /tmp/xyy-backup-dir.XXXXXX.sql)
par_file=$(mktemp /tmp/xyy-expdp.XXXXXX.par)
trap 'rm -f "${sql_file}" "${par_file}"' EXIT
cat > "${sql_file}" <<SQL
whenever sqlerror exit sql.sqlcode
alter session set container=${PDB_SERVICE};
create or replace directory XYY_BACKUP_DIR as '${BACKUP_ROOT}';
grant read, write on directory XYY_BACKUP_DIR to ${DIRECTUS_DB_USER};
exit
SQL
chown "${ORACLE_OS_USER}:${oracle_group}" "${sql_file}"
chmod 600 "${sql_file}"
sudo -u "${ORACLE_OS_USER}" env ORACLE_HOME="${ORACLE_HOME}" ORACLE_SID="${ORACLE_SID}" \
  PATH="${ORACLE_HOME}/bin:/usr/bin:/bin" \
  "${ORACLE_HOME}/bin/sqlplus" -s / as sysdba @"${sql_file}"

cat > "${par_file}" <<PAR
userid=${DIRECTUS_DB_USER}/"${DIRECTUS_DB_PASSWORD}"@127.0.0.1:1521/${PDB_SERVICE}
schemas=${DIRECTUS_DB_USER}
directory=XYY_BACKUP_DIR
dumpfile=directus-${stamp}.dmp
logfile=directus-${stamp}.log
metrics=yes
PAR
chown "${ORACLE_OS_USER}:${oracle_group}" "${par_file}"
chmod 600 "${par_file}"
sudo -u "${ORACLE_OS_USER}" env ORACLE_HOME="${ORACLE_HOME}" ORACLE_SID="${ORACLE_SID}" \
  PATH="${ORACLE_HOME}/bin:/usr/bin:/bin" \
  "${ORACLE_HOME}/bin/expdp" parfile="${par_file}"

chmod 600 "${BACKUP_ROOT}/directus-${stamp}.dmp" "${BACKUP_ROOT}/directus-${stamp}.log"
(
  cd "${BACKUP_ROOT}"
  sha256sum "directus-${stamp}.dmp" "directus-${stamp}.log" >"directus-${stamp}.sha256"
)
chmod 600 "${BACKUP_ROOT}/directus-${stamp}.sha256"
find "${BACKUP_ROOT}" -maxdepth 1 -type f \
  \( -name 'directus-*.dmp' -o -name 'directus-*.log' -o -name 'directus-*.sha256' \) \
  -mtime "+${RETENTION_DAYS}" -delete
echo "[ok] ${BACKUP_ROOT}/directus-${stamp}.dmp"
