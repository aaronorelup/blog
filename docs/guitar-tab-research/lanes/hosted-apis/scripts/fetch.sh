#!/usr/bin/env bash
# fetch.sh NAME URL : saves the raw page to $RAW/NAME.raw and a plain-text rendering to $RAW/NAME.txt
# Used by docs-hosted-apis to keep exact copies of the pages that quotes come from.
set -u
RAW=/home/user/gtr/lanes/hosted-apis/raw
mkdir -p "$RAW"
name="$1"; url="$2"
code=$(curl -sS -L --max-time 60 -A "Mozilla/5.0 (X11; Linux x86_64) research-fetch" -o "$RAW/$name.raw" -w '%{http_code} %{content_type} %{size_download}' "$url")
echo "$code $url" | tee "$RAW/$name.meta"
case "$(head -c 400 "$RAW/$name.raw" | tr 'A-Z' 'a-z')" in
  *"<html"*|*"<!doctype html"*) pandoc -f html -t plain --wrap=none "$RAW/$name.raw" -o "$RAW/$name.txt" 2>/dev/null || cp "$RAW/$name.raw" "$RAW/$name.txt" ;;
  *) cp "$RAW/$name.raw" "$RAW/$name.txt" ;;
esac
wc -c "$RAW/$name.txt"
