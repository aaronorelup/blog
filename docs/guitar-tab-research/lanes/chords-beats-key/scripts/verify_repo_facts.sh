#!/usr/bin/env bash
# verify-docs-chords-beats-key: independent re-check of repository HEAD dates and top-level files.
# Blob-less, no-checkout, depth-1 clones (tree and commit objects only). Usage: verify_repo_facts.sh owner/repo ...
# Output: one TSV line per repo: owner/repo, HEAD commit date, short hash, default branch, top-level file names.
dest=/home/user/gtr/lanes/chords-beats-key/verify/repos
for r in "$@"; do
  d="$dest/${r//\//__}"
  if [ ! -d "$d" ]; then
    git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$r" "$d" 2>"$d.err" || { echo -e "$r\tCLONE_FAILED\t$(tr '\n' ' ' < "$d.err" | cut -c1-150)"; continue; }
  fi
  date=$(git -C "$d" log -1 --format=%cI)
  hash=$(git -C "$d" log -1 --format=%h)
  br=$(git -C "$d" rev-parse --abbrev-ref HEAD)
  top=$(git -C "$d" ls-tree --name-only HEAD | tr '\n' ' ')
  echo -e "$r\t$date\t$hash\t$br\t$top"
done
