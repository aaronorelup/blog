#!/usr/bin/env bash
# fetch_all.sh PAGES.TSV OUTDIR : re-fetch every page named in PAGES.TSV (name<TAB>url) into OUTDIR.
# Writes NAME.raw (bytes as served), NAME.meta (status, type, size, url, UTC time) and NAME.txt
# (pandoc plain text for HTML, a copy otherwise). Used by verify-docs-hosted-apis on 2026-11-10.
set -u
list="$1"; out="$2"; mkdir -p "$out"
while IFS=$'\t' read -r name url; do
  [ -z "$name" ] && continue
  code=$(curl -sS -L --max-time 60 -A "Mozilla/5.0 (X11; Linux x86_64) verify-docs" \
         -o "$out/$name.raw" -w '%{http_code} %{content_type} %{size_download}' "$url" 2>"$out/$name.err")
  echo "$code $url $(date -u +%FT%TZ)" > "$out/$name.meta"
  case "$(head -c 600 "$out/$name.raw" | tr 'A-Z' 'a-z')" in
    *"<html"*|*"<!doctype html"*) pandoc -f html -t plain --wrap=none "$out/$name.raw" -o "$out/$name.txt" 2>/dev/null || cp "$out/$name.raw" "$out/$name.txt" ;;
    *) cp "$out/$name.raw" "$out/$name.txt" ;;
  esac
  printf '%s\t%s\n' "$name" "$code"
done < "$list"
