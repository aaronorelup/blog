#!/bin/bash
# Spleeter 2.4.2 (tensorflow-cpu 2.12.1), 4stems model, default options except the output folder, 2 CPU cores via gtr-run.
# Model files are read from MODEL_PATH=$L/models/spleeter (pre-downloaded with spleeter's own ModelProvider).
# Output: $L/out/spleeter-4stems/<clip>/<instrument>.wav  (spleeter's default filename format {filename}/{instrument}.{codec})
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
IN=/home/user/gtr/inputs
export MODEL_PATH=$L/models/spleeter
cd $L/work
for clip in "$@"; do
  wav=$IN/$clip/$clip.wav
  if [ -f "$L/out/spleeter-4stems/$clip/.done" ]; then echo "skip $clip"; continue; fi
  gtr-run --lane source-separation --tool spleeter-2.4.2 --label "spleeter separate -p spleeter:4stems on $clip (defaults)" \
    --input "$wav" -- $L/venv-spleeter/bin/spleeter separate -p spleeter:4stems -o "$L/out/spleeter-4stems" "$wav" \
    && touch "$L/out/spleeter-4stems/$clip/.done"
done
