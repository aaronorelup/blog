#!/usr/bin/env bash
# For each "owner/repo" on stdin: blobless, no-checkout shallow clone into the lane's clones/ folder
# (outside the blog repo), then print the last commit date and the root file list. Used by the
# docs-audio-to-notes agent to read last-commit dates and LICENSE files without api.github.com.
# Usage: repo_facts.sh < repos.txt > facts.tsv
set -u
DEST=/home/user/gtr/lanes/audio-to-notes/clones
mkdir -p "$DEST"
while read -r slug; do
  [ -z "$slug" ] && continue
  dir="$DEST/${slug//\//__}"
  if [ ! -d "$dir/.git" ]; then
    timeout 300 git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$slug" "$dir" >/dev/null 2>&1 \
      || { printf '%s\tCLONE-FAILED\n' "$slug"; continue; }
  fi
  d=$(git -C "$dir" log -1 --format=%cI 2>/dev/null)
  h=$(git -C "$dir" log -1 --format=%h 2>/dev/null)
  b=$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null)
  files=$(git -C "$dir" ls-tree --name-only HEAD | tr '\n' ' ')
  printf '%s\t%s\t%s\t%s\t%s\n' "$slug" "$b" "$h" "$d" "$files"
done
