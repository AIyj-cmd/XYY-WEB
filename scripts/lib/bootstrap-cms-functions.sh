#!/usr/bin/env bash

dotenv_quote() {
  local value=${1//\\/\\\\}
  value=${value//\"/\\\"}
  value=${value//$'\n'/\\n}
  printf '"%s"' "${value}"
}

require_bootstrap_inputs() {
  [[ ${EUID} -eq 0 ]] || {
    echo "请用 sudo 运行此脚本：sudo bash scripts/bootstrap-cms-server.sh" >&2
    return 1
  }

  if [[ -z ${DB_PASS} ]]; then
    read -rsp "设置 PostgreSQL directus 用户密码: " DB_PASS
    echo
  fi
  [[ -n ${DB_PASS} ]] || { echo "数据库密码不能为空" >&2; return 1; }

  if [[ -z ${ADMIN_PASS} ]]; then
    read -rsp "设置 Directus 管理员密码（登录 CMS 后台用）: " ADMIN_PASS
    echo
  fi
  [[ -n ${ADMIN_PASS} ]] || { echo "管理员密码不能为空" >&2; return 1; }
  [[ ${PUBLIC_ORIGIN} =~ ^https://[A-Za-z0-9.-]+(:[0-9]+)?$ ]] || {
    echo "PUBLIC_ORIGIN 必须是无路径的 HTTPS 源站地址" >&2
    return 1
  }
}

install_postgresql() {
  echo ">>> 安装 PostgreSQL..."
  apt-get update -qq
  apt-get install -y postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
}

configure_postgresql() {
  echo ">>> 初始化数据库..."
  local db_password_b64
  db_password_b64=$(printf '%s' "${DB_PASS}" | base64 | tr -d '\n')
  sudo -u postgres psql -v ON_ERROR_STOP=1 -v db_user="${DB_USER}" -v db_name="${DB_NAME}" <<SQL
SELECT format(
  'CREATE ROLE %I WITH LOGIN PASSWORD %L',
  :'db_user',
  convert_from(decode('${db_password_b64}', 'base64'), 'UTF8')
)
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'db_user') \gexec

SELECT format(
  'ALTER ROLE %I WITH PASSWORD %L',
  :'db_user',
  convert_from(decode('${db_password_b64}', 'base64'), 'UTF8')
)
WHERE EXISTS (SELECT FROM pg_roles WHERE rolname = :'db_user') \gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name') \gexec
SQL
  unset db_password_b64
}

write_directus_package() {
  mkdir -p "${CMS_DIR}"
  cat > "${CMS_DIR}/package.json" <<'JSON'
{
  "name": "xyy-cms",
  "version": "1.0.0",
  "private": true,
  "scripts": { "start": "directus start", "build": "directus build" },
  "dependencies": { "directus": "^12.1.1" }
}
JSON

  if [[ -f ${SCRIPT_DIR}/directus-overrides.json ]]; then
    CMS_PACKAGE="${CMS_DIR}/package.json" OVERRIDES_FILE="${SCRIPT_DIR}/directus-overrides.json" "${node_bin}" <<'NODE'
const fs = require('node:fs')
const packagePath = process.env.CMS_PACKAGE
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
pkg.overrides = JSON.parse(fs.readFileSync(process.env.OVERRIDES_FILE, 'utf8'))
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
NODE
  fi
}

write_directus_env() {
  cat > "${CMS_DIR}/.env" <<ENV
SECRET=$(dotenv_quote "${DIRECTUS_SECRET}")
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=$(dotenv_quote "${DB_PASS}")
ADMIN_EMAIL=$(dotenv_quote "${ADMIN_EMAIL}")
ADMIN_PASSWORD=$(dotenv_quote "${ADMIN_PASS}")
PUBLIC_URL=$(dotenv_quote "${PUBLIC_URL}")
PORT=8055
HOST=127.0.0.1
DEFAULT_LANGUAGE=zh-CN
CORS_ENABLED=true
CORS_ORIGIN=$(dotenv_quote "${CORS_ORIGIN}")
RATE_LIMITER_ENABLED=true
RATE_LIMITER_POINTS=50
RATE_LIMITER_DURATION=1
ENV
  chmod 600 "${CMS_DIR}/.env"
}

write_directus_pm2_config() {
  cat > "${CMS_DIR}/ecosystem.config.cjs" <<JS
module.exports = {
  apps: [{
    name: 'xyy-cms',
    script: 'node_modules/.bin/directus',
    args: 'start',
    cwd: '${CMS_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production' },
  }],
}
JS
}
