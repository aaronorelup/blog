#!/bin/bash
# fetch.sh URL NAME : download URL to $W/NAME.raw (curl through the session proxy, generic research User-Agent),
# print HTTP status, content type, final URL, bytes and sha256; PDFs also get NAME.txt (pdftotext -layout) and
# NAME.flow.txt (pdftotext, reading order).
W=${W:-/home/user/gtr/lanes/video-hands-fretboard/verify-gap2/web}
mkdir -p "$W"
UA="guitar-tab-research-verifier/1.0 (automated license and terms check)"
info=$(curl -sSL --max-time 120 -A "$UA" -o "$W/$2.raw" -w '%{http_code} %{content_type} %{url_effective}' "$1")
b=$(stat -c %s "$W/$2.raw" 2>/dev/null); h=$(sha256sum "$W/$2.raw" 2>/dev/null | cut -c1-16)
if [ "$(head -c 4 "$W/$2.raw" 2>/dev/null)" = "%PDF" ]; then pdftotext -layout "$W/$2.raw" "$W/$2.txt"; pdftotext "$W/$2.raw" "$W/$2.flow.txt"; fi
echo "$2 | $info | $b B | sha256 $h | $(date -u +%FT%TZ)"
