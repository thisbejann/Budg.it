#!/usr/bin/env bash
set -euo pipefail

# EAS Cloud runs on Linux x64 but npm ci may skip platform-specific optional
# dependencies when the lockfile was generated on Windows. This hook ensures
# the native binaries required by lightningcss and @tailwindcss/oxide are present.

if [[ "$(uname -s)" != "Linux" ]] || [[ "$(uname -m)" != "x86_64" ]]; then
  echo "Skipping — not Linux x64"
  exit 0
fi

NEED_INSTALL=false

if [ ! -d "node_modules/lightningcss-linux-x64-gnu" ]; then
  echo "lightningcss-linux-x64-gnu missing — will install"
  NEED_INSTALL=true
fi

if [ ! -d "node_modules/@tailwindcss/oxide-linux-x64-gnu" ]; then
  echo "@tailwindcss/oxide-linux-x64-gnu missing — will install"
  NEED_INSTALL=true
fi

if [ "$NEED_INSTALL" = true ]; then
  npm install \
    lightningcss-linux-x64-gnu@1.30.2 \
    @tailwindcss/oxide-linux-x64-gnu@4.1.17 \
    --no-save --ignore-scripts
  echo "Native modules installed successfully"
else
  echo "Native modules already present"
fi
