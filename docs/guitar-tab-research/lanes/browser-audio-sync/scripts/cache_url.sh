#!/bin/bash
# Fetch a URL with curl (through the session proxy, TLS verified) into the lane's browser cache, keyed by the SHA-1 of
# the URL, so drive.mjs can answer the browser's request for it. Usage: cache_url.sh <url> [content-type]
set -e
C=/home/user/gtr/lanes/browser-audio-sync/dl/cache
mkdir -p "$C"
key=$(printf '%s' "$1" | sha1sum | cut -d' ' -f1)
curl -sS -L --fail -o "$C/$key" "$1"
printf '%s' "${2:-application/octet-stream}" > "$C/$key.type"
echo "$(stat -c %s "$C/$key") bytes  $key  $1"
