#!/bin/bash

set -euo pipefail

# Set TRACE=1 to enable debugging: `TRACE=1 $0`
[[ -n "${TRACE-}" ]] && set -x

SH_DIR=$(dirname "$(realpath "$0")")
ROOT_DIR=$(dirname "$SH_DIR")
LOCAL_DIST_DIR="${ROOT_DIR}/skyline_console/static"
HOST_CONFIG_FILE="${SH_DIR}/remote_hosts.properties.local"

source "${HOST_CONFIG_FILE}"

if [[ ! -d "$LOCAL_DIST_DIR" ]]; then
  echo "Error: Local distribution directory does not exist: $LOCAL_DIST_DIR"
  exit 1
fi

for remote_host in "${remote_hosts[@]}"; do
  backup_date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  skyline_console_backup_path="${skyline_console_path}.${backup_date}.bak"

  ssh_host="${user}@${remote_host}"
  scp_skyline_console_path="${ssh_host}:${skyline_console_path}"
  scp_skyline_console_backup_path="${ssh_host}:${skyline_console_backup_path}"

  echo "[${ssh_host}] Backup: ${scp_skyline_console_path} -> ${scp_skyline_console_backup_path}"
  ssh "$ssh_host" "mv ${skyline_console_path} ${skyline_console_backup_path}"

  echo "[${ssh_host}] Deploy: ${LOCAL_DIST_DIR} -> $scp_skyline_console_path"
  scp -r "$LOCAL_DIST_DIR" "$scp_skyline_console_path"
done
