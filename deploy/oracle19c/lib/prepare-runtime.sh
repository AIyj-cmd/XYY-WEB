#!/usr/bin/env bash

dotenv_quote() {
  local value=${1//\\/\\\\}
  value=${value//\"/\\\"}
  value=${value//$'\n'/\\n}
  printf '"%s"' "${value}"
}

validate_prepare_environment() {
  local required=(ORACLE_DB_HOST ORACLE_DB_PORT ORACLE_DB_SERVICE ORACLE_DB_USER ORACLE_DB_PASSWORD
    DIRECTUS_ADMIN_EMAIL DIRECTUS_ADMIN_PASSWORD DIRECTUS_STATIC_TOKEN DIRECTUS_SECRET
    SOURCE_CMS_DIR TARGET_CMS_DIR NODE_BIN STAGING_PORT PUBLIC_URL CORS_ORIGIN)
  local key
  for key in "${required[@]}"; do
    [[ -n ${!key:-} ]] || { echo "[error] ${key} is required in ${CONFIG_FILE}" >&2; exit 1; }
  done

  [[ ${EUID} -eq 0 ]] || { echo "[error] run as root" >&2; exit 1; }
  [[ -d ${SOURCE_CMS_DIR} ]] || { echo "[error] source CMS not found: ${SOURCE_CMS_DIR}" >&2; exit 1; }
  [[ -x ${NODE_BIN}/node && -x ${NODE_BIN}/npm ]] || {
    echo "[error] Node.js not found in ${NODE_BIN}" >&2
    exit 1
  }
}

verify_oracle_port() {
  timeout 5 bash -c "</dev/tcp/${ORACLE_DB_HOST}/${ORACLE_DB_PORT}" || {
    echo "[error] cannot reach Oracle at ${ORACLE_DB_HOST}:${ORACLE_DB_PORT}" >&2
    exit 1
  }
}

verify_oracle_connection() {
  export ORACLE_CONNECT_STRING="${ORACLE_DB_HOST}:${ORACLE_DB_PORT}/${ORACLE_DB_SERVICE}"
  export ORACLE_CONNECT_USER="${ORACLE_DB_USER}"
  export ORACLE_CONNECT_PASSWORD="${ORACLE_DB_PASSWORD}"
  "${NODE_BIN}/node" <<'NODE'
const oracledb = require('oracledb')
;(async () => {
  let connection
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_CONNECT_USER,
      password: process.env.ORACLE_CONNECT_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    })
    const result = await connection.execute(
      "select version from product_component_version where product like 'Oracle Database%'"
    )
    const version = result.rows?.[0]?.[0]
    if (!String(version || '').startsWith('19.')) {
      throw new Error(`expected Oracle 19c, received ${version || 'unknown version'}`)
    }
    console.log(`Oracle ${version} connection verified`)
  } finally {
    if (connection) await connection.close()
  }
})().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
NODE
  unset ORACLE_CONNECT_STRING ORACLE_CONNECT_USER ORACLE_CONNECT_PASSWORD
}

install_oracle_directus() {
  install -d -m 750 "${TARGET_CMS_DIR}" "${TARGET_CMS_DIR}/uploads" /var/backups/xyy-directus

  local directus_version oracledb_version
  directus_version=$("${NODE_BIN}/node" -p "require('${SOURCE_CMS_DIR}/node_modules/directus/package.json').version")
  oracledb_version=$("${NODE_BIN}/node" -p "require('${SOURCE_CMS_DIR}/node_modules/@directus/api/package.json').optionalDependencies.oracledb")
  [[ -n ${directus_version} && ${directus_version} != "undefined" ]] || {
    echo "[error] unable to resolve the source Directus version" >&2
    exit 1
  }
  [[ -n ${oracledb_version} && ${oracledb_version} != "undefined" && ${oracledb_version} != "null" ]] || {
    echo "[error] Directus ${directus_version} does not declare an Oracle driver" >&2
    exit 1
  }

  cat > "${TARGET_CMS_DIR}/package.json" <<JSON
{
  "name": "xyy-cms-oracle",
  "version": "1.0.0",
  "private": true,
  "scripts": { "start": "directus start" },
  "dependencies": {
    "directus": "${directus_version}",
    "oracledb": "${oracledb_version}"
  }
}
JSON

  if [[ -f ${SOURCE_CMS_DIR}/package.json ]]; then
    "${NODE_BIN}/node" - "${SOURCE_CMS_DIR}/package.json" "${TARGET_CMS_DIR}/package.json" <<'NODE'
const fs = require('node:fs')
const source = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const targetPath = process.argv[3]
const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
if (source.overrides) target.overrides = source.overrides
fs.writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`)
NODE
  fi

  cd "${TARGET_CMS_DIR}"
  "${NODE_BIN}/npm" install --omit=dev
  "${NODE_BIN}/node" -e "const o=require('oracledb'); if(!o.thin) process.exit(1); console.log('node-oracledb', o.versionString, 'thin mode')"
}

write_oracle_directus_env() {
  cat > "${TARGET_CMS_DIR}/.env" <<ENV
SECRET=$(dotenv_quote "${DIRECTUS_SECRET}")
DB_CLIENT=oracledb
DB_CONNECT_STRING=$(dotenv_quote "${ORACLE_DB_HOST}:${ORACLE_DB_PORT}/${ORACLE_DB_SERVICE}")
DB_USER=$(dotenv_quote "${ORACLE_DB_USER}")
DB_PASSWORD=$(dotenv_quote "${ORACLE_DB_PASSWORD}")
ADMIN_EMAIL=$(dotenv_quote "${DIRECTUS_ADMIN_EMAIL}")
ADMIN_PASSWORD=$(dotenv_quote "${DIRECTUS_ADMIN_PASSWORD}")
ADMIN_TOKEN=$(dotenv_quote "${DIRECTUS_STATIC_TOKEN}")
PUBLIC_URL=$(dotenv_quote "${PUBLIC_URL}")
PORT=${STAGING_PORT}
HOST=127.0.0.1
SERVE_APP=true
DEFAULT_LANGUAGE=zh-CN
CORS_ENABLED=true
CORS_ORIGIN=$(dotenv_quote "${CORS_ORIGIN}")
RATE_LIMITER_ENABLED=true
RATE_LIMITER_POINTS=50
RATE_LIMITER_DURATION=1
ENV
  chmod 600 "${TARGET_CMS_DIR}/.env"
}

write_oracle_pm2_configs() {
  local target_file process_name
  for target_file in ecosystem.stage.cjs ecosystem.production.cjs; do
    process_name=xyy-cms
    [[ ${target_file} == ecosystem.stage.cjs ]] && process_name=xyy-cms-oracle-stage
    cat > "${TARGET_CMS_DIR}/${target_file}" <<JS
module.exports = { apps: [{
  name: '${process_name}',
  script: '${TARGET_CMS_DIR}/node_modules/.bin/directus',
  interpreter: '${NODE_BIN}/node',
  args: 'start', cwd: '${TARGET_CMS_DIR}', instances: 1,
  autorestart: true, watch: false, max_memory_restart: '768M',
  env: { NODE_ENV: 'production' }
}] }
JS
  done
}
