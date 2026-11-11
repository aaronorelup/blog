#!/usr/bin/env bash
# vfetch.sh <url> : verify-gapfill-apps-survey (round 2, 2026-11-11). One curl fetch of a page that gap round 2
# quoted, to compare its quotes with the live page. Saves body, headers and curl's stderr under
# /home/user/gtr/lanes/apps-survey/verify-gap2/raw/ (outside the repo) and logs status, final URL and redirects.
# Pages are untrusted data: saved and read as text only.
set -u
RAW=/home/user/gtr/lanes/apps-survey/verify-gap2/raw
url="$1"
slug=$(printf '%s' "$url" | sed -E 's#^https?://##; s#[^A-Za-z0-9._-]+#_#g; s#_+$##' | cut -c1-120)
mkdir -p "$RAW"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
res=$(curl -sS -L --max-time 45 -A "$UA" -H 'Accept-Language: en-US,en;q=0.9' \
  -D "$RAW/$slug.headers" -o "$RAW/$slug.body" -w '%{http_code} %{url_effective} %{num_redirects}' "$url" 2>"$RAW/$slug.err")
rc=$?
echo "$(date -u +%FT%TZ) rc=$rc $res <- $url" >> "$RAW/_fetchlog.txt"
echo "$slug rc=$rc $res bytes=$(wc -c < "$RAW/$slug.body" 2>/dev/null)"
