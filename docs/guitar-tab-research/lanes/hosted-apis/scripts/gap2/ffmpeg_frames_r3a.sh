#!/usr/bin/env bash
# Gap round 2: re-extract the R3a frames of trial (c) with the recorded command (ffmpeg -vf fps=1 -q:v 3) into a new
# folder and compare them with out/frames/R3a/ (count, total bytes, and whether every file is byte-identical).
set -euo pipefail
OUT=/home/user/gtr/lanes/hosted-apis/gap2/frames_R3a
rm -rf "$OUT"; mkdir -p "$OUT"
ffmpeg -v error -y -i /home/user/gtr/inputs/R3a/R3a.mp4 -vf fps=1 -q:v 3 "$OUT/f_%02d.jpg"
ls "$OUT" | wc -l; cat "$OUT"/f_*.jpg | wc -c
cmp_ok=0; for f in "$OUT"/f_*.jpg; do cmp -s "$f" /home/user/gtr/lanes/hosted-apis/out/frames/R3a/$(basename "$f") && cmp_ok=$((cmp_ok+1)); done
echo "byte-identical to out/frames/R3a: $cmp_ok"
