#!/usr/bin/env bash
# Usage: repo_facts.sh owner/repo [owner/repo ...]
# Blobless, shallow, no-checkout clone of each public GitHub repository into the lane's clones folder,
# then prints: repo, the branch HEAD points to, the last commit date (ISO 8601) and hash, and the top-level files.
# No file from the clone is executed. Blobs (LICENSE, README...) are fetched on demand by `git show HEAD:<file>`.
set -u
DEST=/home/user/gtr/lanes/fingerstyle-voices-taps/clones
mkdir -p "$DEST"
for r in "$@"; do
  d="$DEST/${r/\//__}"
  if [ ! -d "$d/.git" ]; then
    git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$r" "$d" 2>"$d.err" || { echo "== $r CLONE FAILED: $(tail -1 "$d.err")"; continue; }
  fi
  br=$(git -C "$d" rev-parse --abbrev-ref HEAD 2>/dev/null)
  echo "== $r branch=$br last_commit=$(git -C "$d" log -1 --format='%cI %h')"
  echo "   top-level: $(git -C "$d" ls-tree --name-only HEAD | tr '\n' ' ')"
done
