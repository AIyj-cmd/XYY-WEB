#!/usr/bin/env bash
set -euo pipefail

node_bin="$1"
bootstrap_dir="$2"
baseline_file="$3"
remote_dir="$4"
releases_dir="$5"
release_dir="$6"
current_link="$7"

"$node_bin/node" "$bootstrap_dir/scripts/capacity-preflight.mjs" --scope remote --baseline-file "$baseline_file" --path "$remote_dir" --path /tmp
mkdir -p "$releases_dir"
test ! -e "$release_dir"
mkdir -p "$release_dir/dist"
if [[ -d "$current_link/dist" ]]; then
  cp -al "$current_link/dist/." "$release_dir/dist/"
fi
