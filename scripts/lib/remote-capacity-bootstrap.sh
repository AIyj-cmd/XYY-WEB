#!/usr/bin/env bash
set -euo pipefail

remote_dir="$1"
node_bin="$2"
bootstrap_dir="$3"
release_dir="$4"

test -f "$remote_dir/.env"
grep -Eq '^DIRECTUS_URL=.+' "$remote_dir/.env"
if ! grep -Eq '^DIRECTUS_CONTENT_TOKEN=.+' "$remote_dir/.env" || ! grep -Eq '^XIANSUO_API_URL=https://.+' "$remote_dir/.env" || ! grep -Eq '^XIANSUO_INGEST_TOKEN=.+' "$remote_dir/.env"; then
  echo '[error] required CMS content or Xiansuo contact integration settings are missing' >&2
  exit 1
fi
"$node_bin/node" -e "const fs=require('node:fs/promises');(async()=>{const paths=process.argv.slice(1),devices=new Map();for(const path of paths){const [s,f]=await Promise.all([fs.stat(path),fs.statfs(path)]);const key=String(s.dev),free=Number(f.bavail)*Number(f.bsize),inodes=Number(f.ffree),old=devices.get(key);devices.set(key,{free:old?Math.min(old.free,free):free,inodes:old?Math.min(old.inodes,inodes):inodes})}for(const value of devices.values())if(value.free<2147483648||value.inodes<1024)throw new Error('remote_capacity_bootstrap_floor_blocked')})().catch(error=>{console.error(error.message);process.exit(1)})" "$remote_dir" /tmp
mkdir -p "$bootstrap_dir/scripts/lib"
test ! -e "$release_dir"
