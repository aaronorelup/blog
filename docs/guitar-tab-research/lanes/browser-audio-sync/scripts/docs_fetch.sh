#!/usr/bin/env bash
# docs-browser-audio-sync: save a list of URLs as raw files (untrusted data) for quoting.
# Usage: docs_fetch.sh OUTDIR URL [URL...]
# Each URL is saved as OUTDIR/<url with every non-alphanumeric character replaced by _>.
# A line "<http status> <bytes> <url>" is appended to OUTDIR/_fetch_log.tsv with the UTC time, so every quote can be
# traced to the fetch that produced it.
set -u
out="$1"; shift
mkdir -p "$out"
for u in "$@"; do
  f="$out/$(printf '%s' "$u" | sed -E 's#^https?://##; s#[^A-Za-z0-9._-]#_#g' | cut -c1-200)"
  code=$(curl -sS -L --compressed --max-time 90 -A 'Mozilla/5.0 (research script)' -o "$f" -w '%{http_code}' "$u" 2>>"$out/_fetch_errors.txt")
  printf '%s\t%s\t%s\t%s\n' "$(date -u +%FT%TZ)" "$code" "$(stat -c %s "$f" 2>/dev/null || echo 0)" "$u" >> "$out/_fetch_log.tsv"
  printf '%s\t%s\t%s\n' "$code" "$(stat -c %s "$f" 2>/dev/null || echo 0)" "$u"
done
