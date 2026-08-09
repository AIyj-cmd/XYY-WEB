#!/usr/bin/env bash
# Install Oracle Database 19c on a dedicated Oracle Linux 8 x86_64 server.
# The Oracle Database RPM must be downloaded from Oracle by the operator.

set -euo pipefail
umask 077

ORACLE_RPM_PATH="${ORACLE_RPM_PATH:-/opt/install/oracle-database-ee-19c-1.0-1.x86_64.rpm}"
APP_SERVER_IP="${APP_SERVER_IP:-}"
DIRECTUS_DB_USER="${DIRECTUS_DB_USER:-DIRECTUS_APP}"
DIRECTUS_DB_PASSWORD="${DIRECTUS_DB_PASSWORD:-}"
TABLESPACE_NAME="${TABLESPACE_NAME:-XYY_DIRECTUS}"
TABLESPACE_SIZE_MB="${TABLESPACE_SIZE_MB:-1024}"
PDB_SERVICE="${PDB_SERVICE:-ORCLPDB1}"
ORACLE_DATAFILE="${ORACLE_DATAFILE:-/opt/oracle/oradata/ORCLCDB/ORCLPDB1/xyy_directus01.dbf}"

fail() { echo "[error] $*" >&2; exit 1; }
log() { echo "[oracle19c] $*"; }

[[ ${EUID} -eq 0 ]] || fail "请以 root 身份运行"
[[ -n ${APP_SERVER_IP} ]] || fail "必须设置 APP_SERVER_IP（应用服务器私网 IPv4）"
[[ ${APP_SERVER_IP} =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || fail "APP_SERVER_IP 格式不正确"
[[ ${DIRECTUS_DB_USER} =~ ^[A-Z][A-Z0-9_]{0,29}$ ]] || fail "DIRECTUS_DB_USER 仅允许大写字母、数字和下划线，最长 30 位"
[[ ${TABLESPACE_NAME} =~ ^[A-Z][A-Z0-9_]{0,29}$ ]] || fail "TABLESPACE_NAME 格式不正确"
[[ ${PDB_SERVICE} =~ ^[A-Z][A-Z0-9_]{0,29}$ ]] || fail "PDB_SERVICE 格式不正确"
[[ ${PDB_SERVICE} == "ORCLPDB1" ]] || fail "RPM 自动化脚本仅支持默认 PDB_SERVICE=ORCLPDB1"
[[ ${TABLESPACE_SIZE_MB} =~ ^[0-9]+$ ]] || fail "TABLESPACE_SIZE_MB 必须是整数"

if [[ -z ${DIRECTUS_DB_PASSWORD} ]]; then
  read -rsp "设置 Oracle ${DIRECTUS_DB_USER} 密码: " DIRECTUS_DB_PASSWORD
  echo
fi

# Restrict the password alphabet so it can be safely used by SQL*Plus without
# interpolation or substitution surprises. It still supports strong passwords.
[[ ${#DIRECTUS_DB_PASSWORD} -ge 16 ]] || fail "数据库密码至少 16 位"
[[ ${DIRECTUS_DB_PASSWORD} =~ ^[A-Za-z0-9_@#.+-]+$ ]] || \
  fail "数据库密码仅允许字母、数字及 _ @ # . + -"

source /etc/os-release
[[ ${ID:-} == "ol" && ${VERSION_ID%%.*} == "8" ]] || \
  fail "此脚本只支持 Oracle Linux 8；当前系统为 ${PRETTY_NAME:-unknown}"
[[ $(uname -m) == "x86_64" ]] || fail "此安装介质脚本只支持 x86_64"
[[ -f ${ORACLE_RPM_PATH} ]] || fail "未找到 ${ORACLE_RPM_PATH}；请从 Oracle 官方下载 19c Database RPM 后再运行"

memory_kb=$(awk '/MemTotal/ { print $2 }' /proc/meminfo)
[[ ${memory_kb:-0} -ge 4194304 ]] || fail "Oracle 19c 数据库服务器至少准备 4 GiB 内存"
available_kb=$(df -Pk /opt | awk 'NR==2 { print $4 }')
[[ ${available_kb:-0} -ge 20971520 ]] || fail "/opt 至少需要 20 GiB 可用空间"

log "安装 Oracle 19c 预安装包和数据库 RPM"
dnf install -y oracle-database-preinstall-19c firewalld
dnf localinstall -y "${ORACLE_RPM_PATH}"

config_file=/etc/sysconfig/oracledb_ORCLCDB-19c.conf
service_script=/etc/init.d/oracledb_ORCLCDB-19c
[[ -f ${config_file} && -x ${service_script} ]] || fail "Oracle RPM 安装不完整，未找到默认配置脚本"

# The RPM creates ORCLCDB / ORCLPDB1. Force the website data character set.
if grep -q '^CHARSET=' "${config_file}"; then
  sed -i 's/^CHARSET=.*/CHARSET=AL32UTF8/' "${config_file}"
else
  echo 'CHARSET=AL32UTF8' >> "${config_file}"
fi

if ! pgrep -f 'ora_pmon_ORCLCDB' >/dev/null 2>&1; then
  log "创建 ORCLCDB 容器数据库和 ORCLPDB1 可插拔数据库"
  "${service_script}" configure
else
  log "ORCLCDB 已运行，跳过数据库创建"
fi

sql_file=$(mktemp /tmp/xyy-oracle-schema.XXXXXX.sql)
trap 'rm -f "${sql_file}"' EXIT
cat > "${sql_file}" <<SQL
whenever sqlerror exit sql.sqlcode
set define off
declare
  v_open_mode varchar2(20);
begin
  select open_mode into v_open_mode from v\$pdbs where name='${PDB_SERVICE}';
  if v_open_mode <> 'READ WRITE' then
    execute immediate 'alter pluggable database ${PDB_SERVICE} open';
  end if;
end;
/
alter pluggable database ${PDB_SERVICE} save state;
alter session set container=${PDB_SERVICE};

declare
  n number;
begin
  select count(*) into n from dba_tablespaces where tablespace_name='${TABLESPACE_NAME}';
  if n = 0 then
    execute immediate 'create tablespace ${TABLESPACE_NAME} datafile ''${ORACLE_DATAFILE}'' size ${TABLESPACE_SIZE_MB}M autoextend on next 256M maxsize unlimited extent management local segment space management auto';
  end if;
end;
/

declare
  n number;
begin
  select count(*) into n from dba_users where username='${DIRECTUS_DB_USER}';
  if n = 0 then
    execute immediate 'create user ${DIRECTUS_DB_USER} identified by "${DIRECTUS_DB_PASSWORD}" default tablespace ${TABLESPACE_NAME} temporary tablespace TEMP quota unlimited on ${TABLESPACE_NAME}';
  else
    execute immediate 'alter user ${DIRECTUS_DB_USER} identified by "${DIRECTUS_DB_PASSWORD}" account unlock';
    execute immediate 'alter user ${DIRECTUS_DB_USER} default tablespace ${TABLESPACE_NAME} quota unlimited on ${TABLESPACE_NAME}';
  end if;
end;
/

grant create session, alter session, create table, create sequence, create view,
      create procedure, create trigger, create type to ${DIRECTUS_DB_USER};

select sys_context('USERENV','DB_NAME') as cdb,
       sys_context('USERENV','CON_NAME') as pdb,
       (select value from nls_database_parameters where parameter='NLS_CHARACTERSET') as charset
from dual;
exit
SQL
chown oracle:oinstall "${sql_file}"
chmod 600 "${sql_file}"

log "创建 Directus 独立表空间和最小权限 Schema 用户"
su - oracle -c "sqlplus -s / as sysdba @${sql_file}"

systemctl enable --now firewalld
if firewall-cmd --query-port=1521/tcp >/dev/null 2>&1; then
  fail "检测到 1521/tcp 已向整个防火墙区域开放；请先移除宽泛规则，再仅允许应用服务器"
fi
firewall-cmd --permanent --add-rich-rule="rule family=ipv4 source address=${APP_SERVER_IP}/32 port port=1521 protocol=tcp accept"
firewall-cmd --reload

log "验证监听器和 PDB"
su - oracle -c '/opt/oracle/product/19c/dbhome_1/bin/lsnrctl status' >/dev/null
ss -ltn | grep -q ':1521 ' || fail "Oracle Listener 未监听 1521"

cat <<EOF

Oracle 19c 数据库端已准备完成。
连接服务: <数据库私网IP>:1521/${PDB_SERVICE}
Schema:   ${DIRECTUS_DB_USER}
防火墙:   仅允许 ${APP_SERVER_IP}/32 访问 1521

下一步：在应用服务器复制 env.example 为 /etc/xyy/oracle19c.env，
然后运行 prepare-directus-oracle.sh。云安全组仍需同步限制 1521 来源。
EOF
