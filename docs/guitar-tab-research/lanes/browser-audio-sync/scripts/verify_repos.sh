#!/usr/bin/env bash
# verify-docs-browser-audio-sync: read the HEAD commit date and top-level file list of each repository.
# Usage: verify_repos.sh OUTDIR owner/repo [owner/repo ...]
# Makes a bare, depth-1, blob-less clone (no file contents), records "<repo>\t<HEAD sha>\t<committer date ISO>\t<default branch>"
# in OUTDIR/heads.tsv and the top-level names in OUTDIR/<owner>_<repo>.ls, then deletes the clone.
set -u
out="$1"; shift; mkdir -p "$out"
for r in "$@"; do
  d="$out/clone_${r//\//_}"; rm -rf "$d"
  if git clone -q --bare --depth 1 --filter=blob:none "https://github.com/$r" "$d" 2>"$out/err_${r//\//_}.txt"; then
    printf '%s\t%s\t%s\n' "$r" "$(git -C "$d" log -1 --format='%H%x09%cI')" "$(git -C "$d" symbolic-ref --short HEAD)" >> "$out/heads.tsv"
    git -C "$d" ls-tree --name-only HEAD > "$out/${r//\//_}.ls"
  else
    printf '%s\tCLONE_FAILED\t%s\n' "$r" "$(head -c 200 "$out/err_${r//\//_}.txt" | tr '\n' ' ')" >> "$out/heads.tsv"
  fi
  rm -rf "$d"
done
