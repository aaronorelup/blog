#!/bin/bash
# Open-Unmix 1.3.0 (umx CLI), default options, 2 CPU cores per run via gtr-run.
# umx writes <outdir>/<track name>/<target>.wav ; we use outdir = $L/out/<model>.
# Needs torchcodec in the venv: torchaudio 2.11 routes torchaudio.load through torchcodec.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
IN=/home/user/gtr/inputs
cd $L/work
for spec in "$@"; do
  model=${spec%%:*}; clip=${spec#*:}
  case $clip in
    R2|R2full|R3a|S4|S2s|S6taps) wav=$IN/$clip/$clip.wav ;;
  esac
  if [ -f "$L/out/$model/$clip/.done" ]; then echo "skip $model $clip"; continue; fi
  gtr-run --lane source-separation --tool openunmix-1.3.0 --label "umx --model $model on $clip (default options)" \
    --input "$wav" -- $L/venv-umx/bin/umx --model "$model" --no-cuda --outdir "$L/out/$model" "$wav" \
    && touch "$L/out/$model/$clip/.done"
done
