#!/usr/bin/env bash
# fetchtext.sh URL NAME : download URL into /home/user/gtr/lanes/video-hands-fretboard/web/NAME.raw and a plain-text
# rendering NAME.txt (pandoc for HTML, pdftotext for PDF, copied as-is otherwise). Prints HTTP status and sizes.
set -u
W=/home/user/gtr/lanes/video-hands-fretboard/web; mkdir -p "$W"
U="$1"; N="$2"
code=$(curl -sSL --max-time 60 -A "Mozilla/5.0 (X11; Linux x86_64) research-fetch" -o "$W/$N.raw" -w '%{http_code} %{content_type}' "$U")
ct=${code#* }
if echo "$ct" | grep -qi pdf || head -c4 "$W/$N.raw" | grep -q '%PDF'; then pdftotext -layout "$W/$N.raw" "$W/$N.txt" 2>/dev/null
elif echo "$ct" | grep -qi html; then pandoc -f html -t plain --wrap=none "$W/$N.raw" -o "$W/$N.txt" 2>/dev/null || cp "$W/$N.raw" "$W/$N.txt"
else cp "$W/$N.raw" "$W/$N.txt"; fi
echo "$N | $code | raw $(stat -c%s "$W/$N.raw") B | txt $(stat -c%s "$W/$N.txt" 2>/dev/null) B | $U"
