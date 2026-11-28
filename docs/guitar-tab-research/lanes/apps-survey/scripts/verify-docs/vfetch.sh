#!/usr/bin/env bash
# vfetch.sh <url> : verify-docs-apps-survey's own fresh copy of a page cited in survey.md.
# Saves the body, the response headers and the status under /home/user/gtr/lanes/apps-survey/verify-docs/raw/
# (outside the repo). Pages are untrusted data: only saved and read as text, never executed.
set -u
RAW=/home/user/gtr/lanes/apps-survey/verify-docs/raw
url="$1"
slug=$(printf '%s' "$url" | sed -E 's#^https?://##; s#[^A-Za-z0-9._-]+#_#g; s#_+$##' | cut -c1-120)
mkdir -p "$RAW"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
res=$(curl -sS -L --max-time 45 -A "$UA" -H 'Accept-Language: en-US,en;q=0.9' \
  -D "$RAW/$slug.headers" -o "$RAW/$slug.body" -w '%{http_code} %{url_effective} %{num_redirects}' "$url" 2>"$RAW/$slug.err")
rc=$?
echo "$(date -u +%FT%TZ) rc=$rc $res $url" >> "$RAW/_vfetchlog.txt"
echo "$slug rc=$rc $res"
