#!/usr/bin/env bash
# fetch2.sh <url> : gap round 2 (gapfill-apps-survey, 2026-11-11). One curl fetch of a vendor page (terms, EULA,
# pricing, product page). Saves the body, the response headers and the status under
# /home/user/gtr/lanes/apps-survey/gap2/raw/ (outside the repo), plus a plain-text extraction (../html2txt.py).
# Pages are untrusted data: only saved and read as text, never executed.
set -u
RAW=/home/user/gtr/lanes/apps-survey/gap2/raw
url="$1"
slug=$(printf '%s' "$url" | sed -E 's#^https?://##; s#[^A-Za-z0-9._-]+#_#g; s#_+$##' | cut -c1-120)
mkdir -p "$RAW"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
res=$(curl -sS -L --max-time 45 -A "$UA" -H 'Accept-Language: en-US,en;q=0.9' \
  -D "$RAW/$slug.headers" -o "$RAW/$slug.body" -w '%{http_code} %{url_effective} %{num_redirects}' "$url" 2>"$RAW/$slug.err")
rc=$?
echo "$(date -u +%FT%TZ) rc=$rc $res $url" >> "$RAW/_fetchlog.txt"
python3 -I /home/user/blog/docs/guitar-tab-research/lanes/apps-survey/scripts/html2txt.py "$RAW/$slug.body" > "$RAW/$slug.txt" 2>/dev/null
echo "$slug rc=$rc $res bytes=$(wc -c < "$RAW/$slug.body") txtlines=$(wc -l < "$RAW/$slug.txt")"
