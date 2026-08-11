#!/usr/bin/env bash
# Initialize the XYY Directus schema in an existing Oracle Database 19c.
# This script does not install Oracle, create a CDB, or patch the database.

set -euo pipefail
umask 077

CONFIG_FILE="${1:-/etc/xyy/oracle-database.env}"
[[ -f ${CONFIG_FILE} ]] || { echo "[error] missing ${CONFIG_FILE}" >&2; exit 1; }
# shellcheck disable=SC1090
source "${CONFIG_FILE}"

ORACLE_OS_USER="${ORACLE_OS_USER:-oracle}"
ORACLE_HOME="${ORACLE_HOME:-/opt/oracle/product/19c/dbhome_1}"
ORACLE_SID="${ORACLE_SID:-ORCLCDB}"
PDB_NAME="${PDB_NAME:-ORCLPDB1}"
DIRECTUS_DB_USER="${DIRECTUS_DB_USER:-DIRECTUS_APP}"
DIRECTUS_DB_PASSWORD="${DIRECTUS_DB_PASSWORD:-}"
TABLESPACE_NAME="${TABLESPACE_NAME:-XYY_DIRECTUS}"
TABLESPACE_SIZE_MB="${TABLESPACE_SIZE_MB:-1024}"
TABLESPACE_NEXT_MB="${TABLESPACE_NEXT_MB:-256}"
ORACLE_DATAFILE="${ORACLE_DATAFILE:-}"

fail() { echo "[error] $*" >&2; exit 1; }
log() { echo "[oracle19c-init] $*"; }

[[ ${EUID} -eq 0 ]] || fail "请以 root 身份运行"
id "${ORACLE_OS_USER}" >/dev/null 2>&1 || fail "Oracle OS 用户不存在：${ORACLE_OS_USER}"
[[ -x ${ORACLE_HOME}/bin/sqlplus ]] || fail "未找到 SQL*Plus：${ORACLE_HOME}/bin/sqlplus"
[[ ${ORACLE_SID} =~ ^[A-Za-z][A-Za-z0-9_$#]{0,29}$ ]] || fail "ORACLE_SID 格式不正确"
[[ ${PDB_NAME} =~ ^[A-Z][A-Z0-9_$#]{0,29}$ ]] || fail "PDB_NAME 仅允许大写 Oracle 标识符"
[[ ${DIRECTUS_DB_USER} =~ ^[A-Z][A-Z0-9_$#]{0,29}$ ]] || fail "DIRECTUS_DB_USER 格式不正确"
[[ ${TABLESPACE_NAME} =~ ^[A-Z][A-Z0-9_$#]{0,29}$ ]] || fail "TABLESPACE_NAME 格式不正确"
[[ ${TABLESPACE_SIZE_MB} =~ ^[0-9]+$ && ${TABLESPACE_SIZE_MB} -ge 256 ]] || fail "TABLESPACE_SIZE_MB 必须是不小于 256 的整数"
[[ ${TABLESPACE_NEXT_MB} =~ ^[0-9]+$ && ${TABLESPACE_NEXT_MB} -ge 16 ]] || fail "TABLESPACE_NEXT_MB 必须是不小于 16 的整数"

if [[ -z ${DIRECTUS_DB_PASSWORD} ]]; then
  read -rsp "设置 Oracle ${DIRECTUS_DB_USER} 密码: " DIRECTUS_DB_PASSWORD
  echo
fi
[[ ${#DIRECTUS_DB_PASSWORD} -ge 16 ]] || fail "数据库密码至少 16 位"
[[ ${DIRECTUS_DB_PASSWORD} =~ ^[A-Za-z0-9_@#.+-]+$ ]] || \
  fail "数据库密码仅允许字母、数字及 _ @ # . + -"

if [[ -n ${ORACLE_DATAFILE} ]]; then
  [[ ${ORACLE_DATAFILE} == /* ]] || fail "ORACLE_DATAFILE 必须是绝对路径；使用 ASM/OMF 时请留空"
  [[ ${ORACLE_DATAFILE} =~ ^/[A-Za-z0-9._/-]+$ ]] || fail "ORACLE_DATAFILE 包含不安全字符"
  datafile_clause="datafile '${ORACLE_DATAFILE}'"
else
  # Omitting the path lets an existing OMF/ASM configuration choose storage.
  datafile_clause="datafile"
fi

sql_file=$(mktemp /tmp/xyy-directus-schema.XXXXXX.sql)
cleanup() { rm -f "${sql_file}"; }
trap cleanup EXIT

cat > "${sql_file}" <<SQL
whenever sqlerror exit sql.sqlcode rollback
set define off verify off feedback on serveroutput on

declare
  v_version varchar2(32);
begin
  select version into v_version
    from product_component_version
   where product like 'Oracle Database%'
     and rownum = 1;
  if not regexp_like(v_version, '^19\\.') then
    raise_application_error(-20001, 'Expected Oracle Database 19c, received ' || v_version);
  end if;
  dbms_output.put_line('Oracle version: ' || v_version);
end;
/

declare
  v_count number;
  v_mode varchar2(20);
begin
  select count(*) into v_count from v\$pdbs where name = '${PDB_NAME}';
  if v_count = 0 then
    raise_application_error(-20002, 'PDB ${PDB_NAME} does not exist');
  end if;
  select open_mode into v_mode from v\$pdbs where name = '${PDB_NAME}';
  if v_mode <> 'READ WRITE' then
    execute immediate 'alter pluggable database ${PDB_NAME} open';
  end if;
end;
/
alter pluggable database ${PDB_NAME} save state;
alter session set container=${PDB_NAME};

declare
  v_charset varchar2(64);
begin
  select value into v_charset
    from nls_database_parameters
   where parameter = 'NLS_CHARACTERSET';
  if v_charset <> 'AL32UTF8' then
    raise_application_error(-20003, 'PDB character set must be AL32UTF8, received ' || v_charset);
  end if;
  dbms_output.put_line('PDB character set: ' || v_charset);
end;
/

declare
  v_count number;
begin
  select count(*) into v_count from dba_tablespaces where tablespace_name = '${TABLESPACE_NAME}';
  if v_count = 0 then
    execute immediate 'create tablespace ${TABLESPACE_NAME} ${datafile_clause} size ${TABLESPACE_SIZE_MB}M autoextend on next ${TABLESPACE_NEXT_MB}M maxsize unlimited extent management local segment space management auto';
    dbms_output.put_line('Created tablespace ${TABLESPACE_NAME}');
  else
    dbms_output.put_line('Tablespace ${TABLESPACE_NAME} already exists');
  end if;
end;
/

declare
  v_count number;
begin
  select count(*) into v_count from dba_users where username = '${DIRECTUS_DB_USER}';
  if v_count = 0 then
    execute immediate 'create user ${DIRECTUS_DB_USER} identified by "${DIRECTUS_DB_PASSWORD}" default tablespace ${TABLESPACE_NAME} temporary tablespace TEMP quota unlimited on ${TABLESPACE_NAME}';
    dbms_output.put_line('Created user ${DIRECTUS_DB_USER}');
  else
    execute immediate 'alter user ${DIRECTUS_DB_USER} identified by "${DIRECTUS_DB_PASSWORD}" account unlock';
    execute immediate 'alter user ${DIRECTUS_DB_USER} default tablespace ${TABLESPACE_NAME} quota unlimited on ${TABLESPACE_NAME}';
    dbms_output.put_line('Updated user ${DIRECTUS_DB_USER}');
  end if;
end;
/

grant create session, alter session, create table, create sequence, create view,
      create procedure, create trigger, create type to ${DIRECTUS_DB_USER};

select sys_context('USERENV', 'DB_NAME') as cdb,
       sys_context('USERENV', 'CON_NAME') as pdb,
       username,
       account_status,
       default_tablespace
  from dba_users
 where username = '${DIRECTUS_DB_USER}';

exit success
SQL

chown "${ORACLE_OS_USER}" "${sql_file}"
chmod 600 "${sql_file}"

log "检查现有 Oracle 19c 并初始化 ${PDB_NAME}/${DIRECTUS_DB_USER}"
sudo -u "${ORACLE_OS_USER}" env \
  ORACLE_HOME="${ORACLE_HOME}" \
  ORACLE_SID="${ORACLE_SID}" \
  PATH="${ORACLE_HOME}/bin:/usr/bin:/bin" \
  "${ORACLE_HOME}/bin/sqlplus" -s / as sysdba @"${sql_file}"

log "初始化完成"
cat <<EOF
PDB/Service: ${PDB_NAME}
Schema:      ${DIRECTUS_DB_USER}
Tablespace:  ${TABLESPACE_NAME}

请让数据库管理员确认监听器已发布 ${PDB_NAME} 服务，并在网络策略中仅允许应用服务器访问 TCP 1521。
EOF
