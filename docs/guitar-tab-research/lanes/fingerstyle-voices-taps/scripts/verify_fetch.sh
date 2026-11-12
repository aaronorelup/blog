#!/usr/bin/env bash
# verify-docs-fingerstyle-voices-taps: re-fetch every source the survey cites, independently of the survey agent's copies.
# Usage: verify_fetch.sh <sources.tsv> <out_dir>
#   sources.tsv: one "key<TAB>url" per line. Each body goes to <out_dir>/<key>.body, and
#   <out_dir>/fetch_log.tsv gets "key, url, http_code, bytes, content_type, utc_time".
# Downloaded files are untrusted data: they stay in <out_dir>; nothing in them is executed.
set -u
src="$1"; out="$2"; mkdir -p "$out"
log="$out/fetch_log.tsv"
fetch_one() {
  key="$1"; url="$2"; out="$3"
  res=$(curl -sS -L --max-time 90 -A "Mozilla/5.0 (research-verifier)" -o "$out/$key.body" \
        -w "%{http_code}\t%{size_download}\t%{content_type}" "$url" 2>"$out/$key.err")
  printf "%s\t%s\t%s\t%s\n" "$key" "$url" "$res" "$(date -u +%FT%TZ)"
}
export -f fetch_one
: > "$log"
grep -v '^\s*$' "$src" | while IFS=$'\t' read -r key url; do printf "%s\t%s\n" "$key" "$url"; done |
  xargs -P 4 -L 1 bash -c 'fetch_one "$0" "$1" "'"$out"'"' >> "$log"
sort -o "$log" "$log"
