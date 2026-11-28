#!/usr/bin/env bash
# For each owner/repo given on stdin: a metadata-only partial clone (no file contents, depth 1) into
# /home/user/gtr/lanes/video-hands-fretboard/clones/, then print the last commit date and subject, and the
# root file names. File contents (LICENSE, README) are fetched on demand later with `git show HEAD:<path>`.
set -u
D=/home/user/gtr/lanes/video-hands-fretboard/clones
mkdir -p "$D"
while read -r R; do
  [ -z "$R" ] && continue
  T="$D/${R/\//__}"
  if [ ! -d "$T/.git" ]; then
    timeout 180 git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$R" "$T" >/dev/null 2>&1 || { echo "== $R CLONE FAILED"; continue; }
  fi
  echo "== $R | last commit $(git -C "$T" log -1 --format='%cI | %h | %s' | cut -c1-120)"
  echo "   root: $(git -C "$T" ls-tree --name-only HEAD | tr '\n' ' ' | cut -c1-400)"
done
