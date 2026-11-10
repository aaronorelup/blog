#!/bin/bash
# Runs the metronome timing page for every method and load condition, one page at a time.
# Usage: run_metronome.sh <dur_s> <outdir> "<busy values>"
S=/home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/scripts
DUR=$1; OUT=$2; BUSYS=${3:-"0 100"}
mkdir -p "$OUT"
for busy in $BUSYS; do
  for m in lookahead interval tone worklet; do
    node $S/drive.mjs "/pages/metronome.html?method=$m&busy=$busy&dur=$DUR" "$OUT/metronome_${m}_busy${busy}.json" --port 18765 --timeout $((DUR + 120))
  done
done
