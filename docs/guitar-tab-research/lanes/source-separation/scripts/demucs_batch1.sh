#!/bin/bash
# Demucs 4.1.0, first pass: every model on its clips, default settings (int16 WAV out), 2 CPU cores per run via gtr-run.
# Output: $L/out/<model>/<clip>/<stem>.wav  (demucs -o $L/out writes <out>/<model>/<track name>/<stem>.wav)
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
IN=/home/user/gtr/inputs
DEMUCS=$L/venv-demucs/bin/demucs
cd $L/work
run() {  # run <model> <clip> <wav>
  local model=$1 clip=$2 wav=$3
  if [ -f "$L/out/$model/$clip/.done" ]; then echo "skip $model $clip"; return; fi
  gtr-run --lane source-separation --tool demucs-4.1.0 --label "demucs -n $model -d cpu on $clip (default options)" \
    --input "$wav" -- $DEMUCS -n "$model" -d cpu -o "$L/out" "$wav" && touch "$L/out/$model/$clip/.done"
}
for spec in "$@"; do
  model=${spec%%:*}; clip=${spec#*:}
  case $clip in
    S4|S2s|S6taps) wav=$IN/$clip/$clip.wav ;;
    R2) wav=$IN/R2/R2.wav ;;
    R3a) wav=$IN/R3a/R3a.wav ;;
    R2full) wav=$IN/R2full/R2full.wav ;;
  esac
  run "$model" "$clip" "$wav"
done
