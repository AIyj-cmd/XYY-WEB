#!/usr/bin/env bash
# setup-cms.sh — 在服务器上一键安装 PostgreSQL + Directus
# 用法：sudo bash setup-cms.sh
# 目标路径：/var/www/xyy-cms/

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CMS_DIR="${CMS_DIR:-/var/www/xyy-cms}"
DB_NAME="directus"
DB_USER="directus"
DB_PASS="${DB_PASS:-}"   # 可通过环境变量传入，否则脚本会提示输入

# ── 1. 检查是否 root ──────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  echo "请用 sudo 运行此脚本：sudo bash setup-cms.sh"
  exit 1
fi

# ── 2. 输入密码 ───────────────────────────────────────────────────────────────
if [[ -z "$DB_PASS" ]]; then
  read -rsp "设置 PostgreSQL directus 用户密码: " DB_PASS
  echo
  if [[ -z "$DB_PASS" ]]; then
    echo "密码不能为空，请重新运行并输入密码"
    exit 1
  fi
fi

read -rsp "设置 Directus 管理员密码（登录 CMS 后台用）: " ADMIN_PASS
echo
if [[ -z "$ADMIN_PASS" ]]; then
  echo "管理员密码不能为空"
  exit 1
fi

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@wz.tomatopia.top}"
DIRECTUS_SECRET=$(openssl rand -base64 32)

echo ""
echo "========================================"
echo "  XYY-GEO CMS 安装脚本"
echo "  数据库: $DB_NAME / 用户: $DB_USER"
echo "  CMS 目录: $CMS_DIR"
echo "  管理员邮箱: $ADMIN_EMAIL"
echo "========================================"
echo ""

# ── 3. 安装 PostgreSQL ────────────────────────────────────────────────────────
echo ">>> 安装 PostgreSQL..."
apt-get update -qq
apt-get install -y postgresql postgresql-contrib

systemctl enable postgresql
systemctl start postgresql

# ── 4. 创建数据库和用户 ───────────────────────────────────────────────────────
echo ">>> 初始化数据库..."
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') \gexec
SQL

echo ">>> 数据库准备完成"

# ── 5. 安装 Directus ─────────────────────────────────────────────────────────
echo ">>> 安装 Directus 到 $CMS_DIR ..."
# 使用当前目录的 node/npm（假设已安装 Node.js 22）
node_bin=$(which node)
npm_bin=$(which npm)

mkdir -p "$CMS_DIR"

# 写 package.json 后直接 npm install directus（比 create-directus-project 更可控）
cat > "$CMS_DIR/package.json" <<'JSON'
{
  "name": "xyy-cms",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "directus start",
    "build": "directus build"
  },
  "dependencies": {
    "directus": "^12.1.1"
  }
}
JSON

cd "$CMS_DIR"
if [[ -f "$SCRIPT_DIR/scripts/directus-overrides.json" ]]; then
  CMS_PACKAGE="$CMS_DIR/package.json" OVERRIDES_FILE="$SCRIPT_DIR/scripts/directus-overrides.json" "$node_bin" <<'NODE'
const fs = require('node:fs')

const packagePath = process.env.CMS_PACKAGE
const overridesPath = process.env.OVERRIDES_FILE
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
pkg.overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'))
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
NODE
fi
$npm_bin install --omit=dev

# ── 6. 写 .env ────────────────────────────────────────────────────────────────
cat > "$CMS_DIR/.env" <<ENV
SECRET=${DIRECTUS_SECRET}

DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}

ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASS}

PUBLIC_URL=https://wz.tomatopia.top/cms
PORT=8055
HOST=127.0.0.1

DEFAULT_LANGUAGE=zh-CN

CORS_ENABLED=true
CORS_ORIGIN=https://wz.tomatopia.top

RATE_LIMITER_ENABLED=true
RATE_LIMITER_POINTS=50
RATE_LIMITER_DURATION=1
ENV

chmod 600 "$CMS_DIR/.env"

# ── 7. 初始化 Directus 数据库 Schema ─────────────────────────────────────────
echo ">>> 初始化 Directus 数据库..."
cd "$CMS_DIR"
$npm_bin exec directus -- bootstrap

# ── 8. 安装 PM2 并配置开机自启 ───────────────────────────────────────────────
echo ">>> 配置 PM2 进程管理..."
$npm_bin install -g pm2

cat > "$CMS_DIR/ecosystem.config.cjs" <<JS
module.exports = {
  apps: [
    {
      name: 'xyy-cms',
      script: 'node_modules/.bin/directus',
      args: 'start',
      cwd: '${CMS_DIR}',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production' },
    },
  ],
}
JS

pm2 start "$CMS_DIR/ecosystem.config.cjs"
pm2 save
pm2 startup systemd -u "$(logname)" --hp "/home/$(logname)" | tail -1 | bash || true

# ── 9. 完成提示 ───────────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  ✅ Directus CMS 安装完成！"
echo ""
echo "  本地访问: http://127.0.0.1:8055"
echo "  线上后台: https://wz.tomatopia.top/cms/admin/"
echo "  管理员:   ${ADMIN_EMAIL}"
echo ""
echo "  下一步："
echo "  1. 配置 nginx 反代 /cms/ → 127.0.0.1:8055"
echo "  2. 登录 Directus 创建 news 和 contact_leads Collection"
echo "  3. 在 Directus 生成 Static Token，填入 website/.env"
echo "  4. npm run start 启动 Astro 网站"
echo "========================================"
