#!/usr/bin/env bash
# Data Pump backup for the Directus schema. Run on the Oracle database server.

set -euo pipefail
umask 077

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/oracle/xyy-directus}"
DIRECTUS_DB_USER="${DIRECTUS_DB_USER:-DIRECTUS_APP}"
DIRECTUS_DB_PASSWORD="${DIRECTUS_DB_PASSWORD:-}"
PDB_SERVICE="${PDB_SERVICE:-ORCLPDB1}"
ORACLE_HOME="${ORACLE_HOME:-/opt/oracle/product/19c/dbhome_1}"

[[ ${EUID} -eq 0 ]] || { echo "[error] run as root" >&2; exit 1; }
[[ -n ${DIRECTUS_DB_PASSWORD} ]] || { echo "[error] DIRECTUS_DB_PASSWORD is required" >&2; exit 1; }
[[ ${DIRECTUS_DB_USER} =~ ^[A-Z][A-Z0-9_]{0,29}$ ]] || { echo "[error] invalid DIRECTUS_DB_USER" >&2; exit 1; }
[[ ${DIRECTUS_DB_PASSWORD} =~ ^[A-Za-z0-9_@#.+-]+$ ]] || { echo "[error] unsupported password characters" >&2; exit 1; }

stamp=$(date -u +%Y%m%dT%H%M%SZ)
install -d -m 700 "${BACKUP_ROOT}"
chown oracle:oinstall "${BACKUP_ROOT}"

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
chown oracle:oinstall "${sql_file}"
chmod 600 "${sql_file}"
su - oracle -c "${ORACLE_HOME}/bin/sqlplus -s / as sysdba @${sql_file}"

cat > "${par_file}" <<PAR
userid=${DIRECTUS_DB_USER}/"${DIRECTUS_DB_PASSWORD}"@127.0.0.1:1521/${PDB_SERVICE}
schemas=${DIRECTUS_DB_USER}
directory=XYY_BACKUP_DIR
dumpfile=directus-${stamp}.dmp
logfile=directus-${stamp}.log
metrics=yes
PAR
chown oracle:oinstall "${par_file}"
chmod 600 "${par_file}"
su - oracle -c "${ORACLE_HOME}/bin/expdp parfile=${par_file}"

chmod 600 "${BACKUP_ROOT}/directus-${stamp}.dmp" "${BACKUP_ROOT}/directus-${stamp}.log"
echo "[ok] ${BACKUP_ROOT}/directus-${stamp}.dmp"
