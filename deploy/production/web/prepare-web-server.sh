#!/usr/bin/env bash
# Prepare persistent Web directories and install a pre-filled environment file.

set -euo pipefail
umask 077

CONFIG_SOURCE="${1:-/etc/xyy/web.env}"
WEB_ROOT="${WEB_ROOT:-/var/www/xyy-web}"

[[ ${EUID} -eq 0 ]] || { echo "[error] run as root" >&2; exit 1; }
[[ -f ${CONFIG_SOURCE} ]] || { echo "[error] missing ${CONFIG_SOURCE}" >&2; exit 1; }
grep -Eq '^DIRECTUS_URL=.+' "${CONFIG_SOURCE}" || { echo "[error] DIRECTUS_URL is required" >&2; exit 1; }
grep -Eq '^DIRECTUS_TOKEN=.+' "${CONFIG_SOURCE}" || { echo "[error] DIRECTUS_TOKEN is required" >&2; exit 1; }
grep -Eq '^PUBLIC_SITE_URL=https://56xyy\.com$' "${CONFIG_SOURCE}" || {
  echo "[error] PUBLIC_SITE_URL must be https://56xyy.com" >&2
  exit 1
}

install -d -m 750 "${WEB_ROOT}" "${WEB_ROOT}/releases"
install -m 600 "${CONFIG_SOURCE}" "${WEB_ROOT}/.env"
echo "[ok] ${WEB_ROOT} is ready; deploy the first release from the build machine"
