#!/bin/bash
# Demucs 4.1.0 option checks, 2 CPU cores per run via gtr-run.
# --two-stems runs on the whole S4 (38.7 s); the other options run on the first 10.000 s of S4
# ($L/inputs/S4_0-10s/S4_0-10s.wav, cut with sox) to keep each run short while the CPU slots are queued.
# Each run writes to $L/out/demucs-options/<tag>/<model>/<track>/
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
S4=/home/user/gtr/inputs/S4/S4.wav
S10=$L/inputs/S4_0-10s/S4_0-10s.wav
DEMUCS=$L/venv-demucs/bin/demucs
cd $L/work
opt() {  # opt <tag> <wav> <model> <extra args...>
  local tag=$1 wav=$2 model=$3; shift 3
  local out=$L/out/demucs-options/$tag
  if [ -f "$out/.done" ]; then echo "skip $tag"; return; fi
  mkdir -p "$out"
  gtr-run --lane source-separation --tool demucs-4.1.0 --label "demucs -n $model $* on $(basename $wav .wav) (option check: $tag)" \
    --input "$wav" -- $DEMUCS -n "$model" -d cpu -o "$out" "$@" "$wav" && touch "$out/.done"
}
opt two-stems-guitar "$S4" htdemucs_6s --two-stems guitar
opt base-10s "$S10" htdemucs
opt shifts2-10s "$S10" htdemucs --shifts 2
opt overlap0.1-10s "$S10" htdemucs --overlap 0.1
opt segment4-10s "$S10" htdemucs --segment 4
opt segment10-10s "$S10" htdemucs --segment 10
opt jobs2-10s "$S10" htdemucs -j 2
opt mp3-10s "$S10" htdemucs --mp3
opt float32-10s "$S10" htdemucs --float32
