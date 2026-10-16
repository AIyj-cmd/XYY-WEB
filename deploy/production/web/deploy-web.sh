#!/usr/bin/env bash
# Production Web deployment wrapper. Run from a clean project checkout on the
# build/release machine. The underlying release script performs atomic switch
# and rollback.

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
if [[ -z ${PROJECT_ROOT:-} ]]; then
  relative_root=$(cd -- "${SCRIPT_DIR}/../../.." && pwd)
  if [[ -f ${relative_root}/package.json && -f ${relative_root}/scripts/deploy.sh ]]; then
    PROJECT_ROOT=${relative_root}
  elif git_root=$(git -C "${PWD}" rev-parse --show-toplevel 2>/dev/null) && \
       [[ -f ${git_root}/package.json && -f ${git_root}/scripts/deploy.sh ]]; then
    PROJECT_ROOT=${git_root}
  else
    echo "[error] run from the XYY-WEB checkout or set PROJECT_ROOT=/path/to/XYY-WEB" >&2
    exit 1
  fi
fi

[[ -n ${DEPLOY_HOST:-} ]] || {
  echo '[error] DEPLOY_HOST must be explicitly authorized for the approved remote target' >&2
  exit 1
}

cd "${PROJECT_ROOT}"
export SITE_URL="${SITE_URL:-https://56xyy.com}"
export PUBLIC_DIRECTUS_URL="${PUBLIC_DIRECTUS_URL:-https://56xyy.com/cms}"
[[ -n ${BUILD_DIRECTUS_URL:-} ]] || {
  echo '[error] BUILD_DIRECTUS_URL must explicitly identify the approved remote CMS target' >&2
  exit 1
}
[[ -n ${HEALTHCHECK_SITE_URL:-} ]] || {
  echo '[error] HEALTHCHECK_SITE_URL must explicitly identify the approved remote web target' >&2
  exit 1
}

exec bash scripts/deploy.sh
