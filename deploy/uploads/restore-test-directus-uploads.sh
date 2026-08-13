#!/usr/bin/env bash
# Verify and extract an uploads backup into an isolated temporary directory.

set -euo pipefail
umask 077

BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/xyy-uploads}"
BACKUP_FILE="${1:-}"

if [[ -z ${BACKUP_FILE} ]]; then
  BACKUP_FILE=$(find "${BACKUP_ROOT}" -maxdepth 1 -type f \
    -name 'directus-uploads-*.tar.gz' -printf '%T@ %p\n' | sort -nr | \
    sed -n '1{s/^[^ ]* //;p;}')
fi

[[ -n ${BACKUP_FILE} && -f ${BACKUP_FILE} ]] || {
  echo "[error] no uploads backup found" >&2
  exit 1
}
manifest="${BACKUP_FILE%.tar.gz}.sha256"
[[ -f ${manifest} ]] || { echo "[error] missing ${manifest}" >&2; exit 1; }

(
  cd "$(dirname "${BACKUP_FILE}")"
  sha256sum --check "$(basename "${manifest}")"
)

while IFS= read -r entry; do
  case "${entry}" in
    /*|../*|*/../*) echo "[error] unsafe archive entry: ${entry}" >&2; exit 1 ;;
  esac
done < <(tar --list --gzip --file="${BACKUP_FILE}")

while IFS= read -r listing; do
  member_type=${listing:0:1}
  case "${member_type}" in
    -|d) ;;
    *) echo "[error] unsafe archive member type: ${member_type}" >&2; exit 1 ;;
  esac
done < <(tar --list --verbose --gzip --file="${BACKUP_FILE}")

temp_dir=$(mktemp -d /tmp/xyy-uploads-restore.XXXXXX)
cleanup() {
  [[ ${temp_dir} == /tmp/xyy-uploads-restore.* && -d ${temp_dir} ]] || return 0
  rm -rf -- "${temp_dir}"
}
trap cleanup EXIT

tar --extract --gzip --no-same-owner --no-same-permissions \
  --file="${BACKUP_FILE}" --directory="${temp_dir}"
[[ -d ${temp_dir}/uploads ]] || {
  echo "[error] archive does not contain the uploads directory" >&2
  exit 1
}
file_count=$(find "${temp_dir}/uploads" -type f | wc -l)
echo "[ok] uploads restore verification completed (${file_count} files)"
