#!/bin/bash
# For each light/full clone: default branch, head commit, and whether raw.githubusercontent.com serves the same LICENSE/README bytes.
D=/home/user/gtr/lanes/source-separation/docs-agent
for dir in $D/repos/*/; do
  name=$(basename $dir); cd $dir
  url=$(git remote get-url origin); slug=${url#https://github.com/}
  br=$(git rev-parse --abbrev-ref HEAD); sha=$(git rev-parse --short HEAD); dt=$(git log -1 --format=%cI)
  out="$slug branch=$br head=$sha date=$dt"
  for f in $(git ls-tree --name-only HEAD | grep -i -E '^(license|licence|copying|notice)'); do
    code=$(curl -sS -m 30 -o /tmp/claude-0/raw_$$ -w "%{http_code}" "https://raw.githubusercontent.com/$slug/$br/$f")
    if [ "$code" = "200" ] && cmp -s /tmp/claude-0/raw_$$ <(git show HEAD:$f); then out="$out | $f raw=200 same"; else out="$out | $f raw=$code DIFF"; fi
  done
  echo "$out"
  cd - > /dev/null
done
rm -f /tmp/claude-0/raw_$$
