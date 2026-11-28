#!/usr/bin/env bash
# Shallow, blob-less, no-checkout clone of each repository, then print: repo, HEAD commit date, HEAD sha,
# and the names of license-like files at the top level. Only the tree is fetched, not file contents.
# Usage: repo_facts.sh <dest_dir> owner/repo ...
dest="$1"; shift
for r in "$@"; do
  d="$dest/${r//\//__}"
  if [ ! -d "$d" ]; then
    git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$r" "$d" 2>"$d.err" || { echo "$r	CLONE_FAILED	$(head -c 200 "$d.err" | tr '\n' ' ')"; continue; }
  fi
  date=$(git -C "$d" log -1 --format=%cI); sha=$(git -C "$d" log -1 --format=%h); br=$(git -C "$d" rev-parse --abbrev-ref HEAD)
  lic=$(git -C "$d" ls-tree --name-only HEAD | grep -i -E '^(licen|copying|notice|readme)' | tr '\n' ' ')
  echo "$r	$date	$sha	$br	$lic"
done
