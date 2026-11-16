#!/bin/bash
# verify-docs-source-separation: re-fetch every URL in a TSV list (local_name<TAB>URL) into a directory of
# untrusted downloads, and log the HTTP status, size and fetch time of each.  Usage:
#   verify-docs-fetch.sh LIST.tsv OUTDIR
list="$1"; out="$2"; mkdir -p "$out"
log="$out/_fetch_log.tsv"
grep -v '^#' "$list" | while IFS=$'\t' read -r name url; do
  [ -z "$name" ] && continue
  code=$(curl -sS -L -m 60 -o "$out/$name" -w "%{http_code}" "$url" 2>>"$out/_curl_errors.txt")
  size=$(stat -c %s "$out/$name" 2>/dev/null || echo 0)
  printf '%s\t%s\t%s\t%s\t%s\n' "$name" "$code" "$size" "$(date -u +%FT%TZ)" "$url" >> "$log"
done
