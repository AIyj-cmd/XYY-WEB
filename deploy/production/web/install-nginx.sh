#!/usr/bin/env bash
# Install the reviewed 56xyy.com Nginx vhost after the certificate exists.

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd -- "${SCRIPT_DIR}/../../.." && pwd)
if [[ -f ${SCRIPT_DIR}/nginx-56xyy.conf ]]; then
  default_source=${SCRIPT_DIR}/nginx-56xyy.conf
else
  default_source=${PROJECT_ROOT}/deploy/nginx-56xyy.conf
fi
SOURCE_CONFIG="${NGINX_CONFIG_SOURCE:-${default_source}}"
TARGET_CONFIG="${NGINX_CONFIG_TARGET:-/etc/nginx/sites-available/56xyy.com.conf}"
ENABLED_CONFIG="${NGINX_ENABLED_TARGET:-/etc/nginx/sites-enabled/56xyy.com.conf}"

[[ ${EUID} -eq 0 ]] || { echo "[error] run as root" >&2; exit 1; }
[[ -f ${SOURCE_CONFIG} ]] || { echo "[error] missing ${SOURCE_CONFIG}" >&2; exit 1; }
[[ -f /etc/letsencrypt/live/56xyy.com/fullchain.pem ]] || {
  echo "[error] 56xyy.com certificate is not installed" >&2
  exit 1
}
[[ -f /etc/letsencrypt/live/56xyy.com/privkey.pem ]] || {
  echo "[error] 56xyy.com private key is not installed" >&2
  exit 1
}

install -m 644 "${SOURCE_CONFIG}" "${TARGET_CONFIG}"
ln -sfn "${TARGET_CONFIG}" "${ENABLED_CONFIG}"
nginx -t
systemctl reload nginx
echo "[ok] 56xyy.com Nginx vhost installed"
