#!/bin/bash
# verify-docs-source-separation: for each owner/repo[@branch] on stdin, make a blob-less depth-1 clone (commit and
# tree only, no file contents) and print default branch, head commit, committer date and subject.
# Usage: verify-docs-heads.sh OUTDIR < repos.txt
out="$1"; mkdir -p "$out"
while read -r spec; do
  [ -z "$spec" ] && continue
  repo="${spec%@*}"; br=""; [ "$spec" != "$repo" ] && br="${spec#*@}"
  d="$out/$(echo "$repo" | tr '/' '_')"
  if [ ! -d "$d/.git" ]; then
    if [ -n "$br" ]; then
      timeout 300 git clone -q --depth 1 --filter=blob:none --no-checkout -b "$br" "https://github.com/$repo" "$d" >/dev/null 2>&1
    else
      timeout 300 git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$repo" "$d" >/dev/null 2>&1
    fi
  fi
  if [ -d "$d/.git" ]; then
    printf '%s\t%s\t%s\t%s\t%s\n' "$repo" "$(git -C "$d" rev-parse --abbrev-ref HEAD)" "$(git -C "$d" rev-parse --short=7 HEAD)" \
      "$(git -C "$d" log -1 --format=%cI)" "$(git -C "$d" log -1 --format=%s | cut -c1-90)"
  else
    printf '%s\tCLONE-FAILED\n' "$repo"
  fi
done
