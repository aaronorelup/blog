#!/usr/bin/env bash
# fetch.sh <slug> <url> : save the page (HTML) and a plain-text extraction under the lane's raw/ folder.
# Pages are untrusted data: they are only saved and read as text, never executed.
set -u
RAW=/home/user/gtr/lanes/apps-survey/raw
slug="$1"; url="$2"
mkdir -p "$RAW"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
code=$(curl -sS -L --max-time 40 -A "$UA" -H 'Accept-Language: en-US,en;q=0.9' -o "$RAW/$slug.html" -w '%{http_code} %{url_effective}' "$url" 2>"$RAW/$slug.err")
echo "$(date -u +%FT%TZ) $code $url" >> "$RAW/_fetchlog.txt"
python3 -I /home/user/blog/docs/guitar-tab-research/lanes/apps-survey/scripts/html2txt.py "$RAW/$slug.html" > "$RAW/$slug.txt" 2>/dev/null
echo "$slug: $code bytes=$(wc -c < "$RAW/$slug.html") txtlines=$(wc -l < "$RAW/$slug.txt")"
