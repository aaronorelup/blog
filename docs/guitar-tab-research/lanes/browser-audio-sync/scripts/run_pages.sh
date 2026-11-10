#!/bin/bash
# Run a list of trial pages one after another in headless Chromium (drive.mjs).
# Usage: run_pages.sh <list file>   each line: <result json path> <page path+query> [extra drive.mjs args...]
S=/home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/scripts
while read -r out page rest; do
  [ -z "$out" ] && continue
  case "$out" in \#*) continue;; esac
  node $S/drive.mjs "$page" "$out" --port 18765 --timeout 900 $rest
done < "$1"
