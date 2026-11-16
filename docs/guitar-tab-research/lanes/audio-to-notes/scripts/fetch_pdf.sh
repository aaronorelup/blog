#!/usr/bin/env bash
# Download a PDF (e.g. an arXiv paper) and convert it to text with pdftotext.
# Usage: fetch_pdf.sh <name> <url>   -> /home/user/gtr/lanes/audio-to-notes/fetched/pdf/<name>.pdf and .txt
set -u
D=/home/user/gtr/lanes/audio-to-notes/fetched/pdf
mkdir -p "$D"
code=$(curl -sS -L -o "$D/$1.pdf" -w '%{http_code}' --max-time 120 "$2")
pdftotext -layout "$D/$1.pdf" "$D/$1.txt" 2>/dev/null
echo "$code $(stat -c %s "$D/$1.pdf") bytes, $(wc -l < "$D/$1.txt" 2>/dev/null) text lines: $2"
