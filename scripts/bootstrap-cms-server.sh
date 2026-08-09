#!/usr/bin/env bash
# Install PostgreSQL and Directus on the CMS application server.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/bootstrap-cms-functions.sh
source "${SCRIPT_DIR}/lib/bootstrap-cms-functions.sh"

CMS_DIR="${CMS_DIR:-/var/www/xyy-cms}"
DB_NAME="${DB_NAME:-directus}"
DB_USER="${DB_USER:-directus}"
DB_PASS="${DB_PASS:-}"
ADMIN_PASS="${ADMIN_PASS:-}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@56xyy.com}"
PUBLIC_ORIGIN="${PUBLIC_ORIGIN:-https://56xyy.com}"
PUBLIC_URL="${PUBLIC_URL:-${PUBLIC_ORIGIN}/cms}"
CORS_ORIGIN="${CORS_ORIGIN:-${PUBLIC_ORIGIN},https://www.56xyy.com}"

require_bootstrap_inputs
DIRECTUS_SECRET=$(openssl rand -base64 32)

echo "XYY CMS: ${DB_NAME} / ${DB_USER} -> ${CMS_DIR} (${PUBLIC_URL})"
install_postgresql
configure_postgresql

node_bin=$(which node)
npm_bin=$(which npm)
echo ">>> 安装 Directus 到 ${CMS_DIR} ..."
write_directus_package
cd "${CMS_DIR}"
"${npm_bin}" install --omit=dev
write_directus_env

echo ">>> 初始化 Directus 数据库..."
"${npm_bin}" exec directus -- bootstrap

echo ">>> 配置 PM2 进程管理..."
"${npm_bin}" install -g pm2
write_directus_pm2_config
pm2 start "${CMS_DIR}/ecosystem.config.cjs"
pm2 save
pm2 startup systemd -u "$(logname)" --hp "/home/$(logname)" | tail -1 | bash || true

echo "✅ Directus CMS 安装完成：${PUBLIC_URL}/admin/（管理员 ${ADMIN_EMAIL}）"
echo "下一步：配置 /cms/ 反代、创建业务 Collection、生成 Static Token 并配置网站环境。"
