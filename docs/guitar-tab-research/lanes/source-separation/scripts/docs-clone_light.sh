#!/bin/bash
# Light clone: commit metadata and tree only, then pull out text files we need to read.
D=/home/user/gtr/lanes/source-separation/docs-agent
while read r; do
  [ -z "$r" ] && continue
  d=$(echo "$r" | tr '/' '_')
  dest="$D/repos/$d"
  if [ ! -d "$dest" ]; then
    timeout 180 git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$r" "$dest" > "$D/clone_$d.log" 2>&1
    rc=$?
  else rc=existing; fi
  if [ -d "$dest/.git" ]; then
    cd "$dest"
    date=$(git log -1 --format=%cI 2>/dev/null)
    mkdir -p "$D/txt/$d"
    git ls-tree -r --name-only HEAD > "$D/txt/$d/_tree.txt" 2>/dev/null
    for f in $(git ls-tree --name-only HEAD | grep -i -E '^(license|licence|copying|notice|readme)' ); do
      timeout 60 git show "HEAD:$f" > "$D/txt/$d/$f" 2>/dev/null
    done
    echo "$r rc=$rc last_commit=$date files=$(ls "$D/txt/$d" | tr '\n' ' ')"
    cd - >/dev/null
  else
    echo "$r rc=$rc CLONE FAILED"
  fi
done
