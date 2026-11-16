#!/usr/bin/env bash
# verify-docs-audio-to-notes, 2026-11-10. For each "owner/repo" on stdin: a shallow, blobless, no-checkout clone
# (commits and trees only) into the lane's verify-docs/clones folder, then one line: repo, default branch, HEAD short
# hash, committer date of HEAD, and the root file list. api.github.com is blocked on this box, so this is how the
# last-commit dates and root listings (LICENSE present or not) were re-read.
# Usage: git_heads.sh < repos.txt > heads.tsv
set -u
DEST=/home/user/gtr/lanes/audio-to-notes/verify-docs/clones
mkdir -p "$DEST"
while read -r slug; do
  [ -z "$slug" ] && continue
  dir="$DEST/${slug//\//__}"
  if [ ! -d "$dir/.git" ]; then
    timeout 300 git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$slug" "$dir" >/dev/null 2>&1 \
      || { printf '%s\tCLONE-FAILED\n' "$slug"; continue; }
  fi
  printf '%s\t%s\t%s\t%s\t%s\n' "$slug" \
    "$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null)" \
    "$(git -C "$dir" log -1 --format=%h 2>/dev/null)" \
    "$(git -C "$dir" log -1 --format=%cI 2>/dev/null)" \
    "$(git -C "$dir" ls-tree --name-only HEAD | tr '\n' ' ')"
done
