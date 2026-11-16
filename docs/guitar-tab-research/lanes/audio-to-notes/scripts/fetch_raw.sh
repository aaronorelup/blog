#!/usr/bin/env bash
# Download files from raw.githubusercontent.com. Each stdin line: "<owner>/<repo> <branch> <path>".
# Saves to /home/user/gtr/lanes/audio-to-notes/fetched/raw/<owner>__<repo>/<path> (untrusted data, outside the
# blog repo) and prints "<http status> <bytes> <url>". Used by the docs-audio-to-notes agent.
set -u
ROOT=/home/user/gtr/lanes/audio-to-notes/fetched/raw
while read -r slug branch path; do
  [ -z "${slug:-}" ] && continue
  out="$ROOT/${slug//\//__}/$path"
  mkdir -p "$(dirname "$out")"
  url="https://raw.githubusercontent.com/$slug/$branch/$path"
  code=$(curl -sS -L -o "$out" -w '%{http_code}' --max-time 60 "$url")
  printf '%s %s %s\n' "$code" "$(stat -c %s "$out" 2>/dev/null || echo 0)" "$url"
done
