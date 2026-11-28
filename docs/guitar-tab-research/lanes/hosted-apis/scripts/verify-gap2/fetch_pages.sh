#!/usr/bin/env bash
# verify-gapfill-hosted-apis (round 2): fetch every page the gap round 2 text cites, fresh, into a new folder.
# usage: fetch_pages.sh urls.tsv OUTDIR   (one "name<TAB>url" per line). Saves OUTDIR/NAME.raw and OUTDIR/NAME.meta
# (HTTP status, content type, bytes, url). Plain curl, no cookies, no JavaScript. The x.ai terms pages are not in the
# list: their status is checked separately without keeping the body (their 403 page printed the client's address).
set -u
list="$1"; out="$2"; mkdir -p "$out"
while IFS=$'\t' read -r name url; do
  [ -z "$name" ] && continue
  code=$(curl -sS -L --max-time 90 -A "Mozilla/5.0 (X11; Linux x86_64) research-fetch" -o "$out/$name.raw" \
         -w '%{http_code} %{content_type} %{size_download}' "$url" 2>&1)
  echo "$code $url" | tee "$out/$name.meta"
done < "$list"
