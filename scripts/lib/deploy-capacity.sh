#!/usr/bin/env bash

safe_absolute_path() {
  local value="$1"
  [[ ${value} =~ ^/[A-Za-z0-9._/-]+$ ]] &&
    [[ "$value" != *//* ]] &&
    [[ "$value" != */./* && "$value" != */../* && "$value" != */. && "$value" != */.. ]]
}

validate_capacity_maintenance_paths() {
  local remote_dir="$1"
  local remote_baseline="$2"
  local pinned_file="$3"
  local cleanup_plan="$4"

  safe_absolute_path "$remote_dir" || {
    echo 'Error: REMOTE_DIR must be a safe absolute path' >&2
    return 1
  }
  safe_absolute_path "$remote_baseline" || {
    echo 'Error: REMOTE_CAPACITY_BASELINE_FILE must be a safe absolute path' >&2
    return 1
  }
  safe_absolute_path "$pinned_file" || {
    echo 'Error: PINNED_RELEASES_FILE must be a safe absolute path' >&2
    return 1
  }
  safe_absolute_path "$cleanup_plan" || {
    echo 'Error: RELEASE_CLEANUP_PLAN_FILE must be a safe absolute path' >&2
    return 1
  }
}

run_local_capacity_preflight() {
  local baseline_file="$1"
  shift
  node scripts/capacity-preflight.mjs --scope local --baseline-file "$baseline_file" "$@"
}

prepare_remote_cleanup_plan_directory() {
  local deploy_host="$1"
  local remote_dir="$2"
  local cleanup_plan="$3"

  "${ssh_cmd[@]}" "$deploy_host" "bash -s -- '$remote_dir' '$cleanup_plan'" <<'REMOTE_PREPARE'
set -euo pipefail
remote_dir="$1"
cleanup_plan="$2"
plan_directory="$(dirname -- "$cleanup_plan")"
[[ -d "$remote_dir" && ! -L "$remote_dir" && "$(readlink -f -- "$remote_dir")" == "$remote_dir" ]] || {
  echo 'unsafe_remote_dir_for_cleanup_plan' >&2
  exit 1
}
case "$plan_directory" in
  "$remote_dir"/*) ;;
  *) echo 'cleanup_plan_outside_remote_dir' >&2; exit 1 ;;
esac
relative_directory="${plan_directory#"$remote_dir"/}"
[[ -n "$relative_directory" && "$relative_directory" != "$plan_directory" ]] || {
  echo 'cleanup_plan_directory_must_be_below_remote_dir' >&2
  exit 1
}
current="$remote_dir"
IFS=/ read -r -a segments <<< "$relative_directory"
for segment in "${segments[@]}"; do
  [[ "$segment" =~ ^[A-Za-z0-9._-]+$ && "$segment" != . && "$segment" != .. ]] || {
    echo 'unsafe_cleanup_plan_directory_component' >&2
    exit 1
  }
  current="$current/$segment"
  if [[ -e "$current" || -L "$current" ]]; then
    [[ -d "$current" && ! -L "$current" && "$(readlink -f -- "$current")" == "$current" ]] || {
      echo 'unsafe_cleanup_plan_directory' >&2
      exit 1
    }
  else
    mkdir -- "$current"
    [[ -d "$current" && ! -L "$current" && "$(readlink -f -- "$current")" == "$current" ]] || {
      echo 'unsafe_created_cleanup_plan_directory' >&2
      exit 1
    }
  fi
done
[[ ! -e "$cleanup_plan" && ! -L "$cleanup_plan" ]] || {
  echo 'cleanup_plan_already_exists' >&2
  exit 1
}
REMOTE_PREPARE
}

capture_remote_previous_release() {
  local deploy_host="$1"
  local remote_dir="$2"
  local releases_dir="$3"
  local release_dir="$4"
  local current_link="$5"

  "${ssh_cmd[@]}" "$deploy_host" "bash -s -- '$remote_dir' '$releases_dir' '$release_dir' '$current_link'" <<'REMOTE_PREVIOUS'
set -euo pipefail
remote_dir="$1"
releases_dir="$2"
release_dir="$3"
current_link="$4"
[[ -d "$release_dir" && ! -L "$release_dir" && "$(readlink -f -- "$release_dir")" == "$release_dir" ]] || {
  echo 'unsafe_release_dir_for_previous_target' >&2
  exit 1
}
previous_target=''
if [[ -L "$current_link" ]]; then
  previous_target="$(readlink -f -- "$current_link")"
elif [[ -f "$remote_dir/ecosystem.config.cjs" && -d "$remote_dir/dist" ]]; then
  previous_target="$remote_dir"
fi
if [[ -n "$previous_target" ]]; then
  case "$previous_target" in
    "$releases_dir"/*|"$remote_dir") ;;
    *) echo 'unsafe_previous_release_target' >&2; exit 1 ;;
  esac
  [[ -d "$previous_target" ]] || { echo 'missing_previous_release_target' >&2; exit 1; }
  printf '%s\n' "$previous_target" > "$release_dir/.previous_target"
fi
REMOTE_PREVIOUS
}

preview_remote_release_cleanup() {
  local deploy_host="$1"
  local release_dir="$2"
  local releases_dir="$3"
  local current_link="$4"
  local remote_dir="$5"
  local release_keep="$6"
  local pinned_releases="$7"
  local pinned_file="$8"
  local cleanup_plan="$9"
  local node_bin="${10}"
  local cleanup_command
  local -a cleanup_args=(
    node scripts/release-cleanup.mjs --releases-dir "$releases_dir" --current-link "$current_link"
    --previous-file "$release_dir/.previous_target" --legacy-dir "$remote_dir" --keep "$release_keep"
    --pinned "$pinned_releases" --pinned-file "$pinned_file" --output "$cleanup_plan"
  )

  cleanup_command=$(printf '%q ' "${cleanup_args[@]}")
  "${ssh_cmd[@]}" "$deploy_host" "set -euo pipefail; cd '$release_dir'; PATH='$node_bin':\$PATH $cleanup_command"
}
