#!/usr/bin/env bash
# verify-docs-browser-audio-sync: re-fetch every page the survey cites, independently of the docs agent's copies.
# Usage: verify_fetch.sh OUTDIR LIST.tsv      (LIST.tsv lines: key<TAB>url)
# Saves OUTDIR/<key> (raw bytes, untrusted data, never executed) and appends
# "<utc time>\t<http status>\t<bytes>\t<final url after redirects>\t<key>\t<url>" to OUTDIR/_log.tsv.
set -u
out="$1"; list="$2"; mkdir -p "$out"
while IFS=$'\t' read -r key url; do
  [ -z "$key" ] && continue; case "$key" in \#*) continue;; esac
  res=$(curl -sS -L --compressed --max-time 120 -A 'Mozilla/5.0 (X11; Linux x86_64) research-verifier' \
        -o "$out/$key" -w '%{http_code}\t%{url_effective}' "$url" 2>>"$out/_errors.txt")
  code=${res%%$'\t'*}; eff=${res#*$'\t'}
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$(date -u +%FT%TZ)" "$code" "$(stat -c %s "$out/$key" 2>/dev/null || echo 0)" "$eff" "$key" "$url" >> "$out/_log.tsv"
  printf '%s\t%s\t%s\n' "$code" "$key" "$eff"
done < "$list"
