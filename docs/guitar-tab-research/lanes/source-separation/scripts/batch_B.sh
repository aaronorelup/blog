#!/bin/bash
# Batch B of the source-separation lane: python-audio-separator 0.48.0, run as ONE `gtr-run` job (one 2-core slot).
# Inside, every item is started with `gtr-run --nolock` (own ledger line; inherits this batch's 2-core affinity and
# thread variables, printed at the start of the log). Options on every item: --output_format WAV,
# --model_file_dir $L/models/uvr, --custom_output_names (lower-case stem file names); everything else at its default.
# Output: $L/out/uvr/<model file without extension>/<clip>/<stem>.wav
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
IN=/home/user/gtr/inputs
SEP=$L/venv-uvr/bin/audio-separator
NAMES='{"Vocals":"vocals","Instrumental":"instrumental","Drums":"drums","Bass":"bass","Other":"other","Guitar":"guitar","Piano":"piano","No Other":"no_other","No Drums":"no_drums","No Bass":"no_bass","Drum-Bass":"drum-bass","No Drum-Bass":"no_drum-bass"}'
cd $L/work
echo "batch B start $(date -u +%FT%TZ) affinity: $(taskset -cp $$) nproc=$(nproc) OMP_NUM_THREADS=$OMP_NUM_THREADS"
sep() {  # sep <model file> <clip>
  local model=$1 clip=$2 wav
  case $clip in
    S4_0-24s|S4_0-10s) wav=$L/inputs/$clip/$clip.wav ;;
    *) wav=$IN/$clip/$clip.wav ;;
  esac
  local out=$L/out/uvr/${model%.*}/$clip
  [ -f "$out/.done" ] && { echo "skip $model $clip"; return; }
  mkdir -p "$out"
  gtr-run --nolock --lane source-separation --tool audio-separator-0.48.0 \
    --label "audio-separator -m $model on $clip (defaults, WAV out) [inside batch B, 2-core slot]" --input "$wav" -- \
    $SEP -m "$model" --model_file_dir "$L/models/uvr" --output_dir "$out" --output_format WAV \
    --custom_output_names "$NAMES" "$wav" && touch "$out/.done"
}
for spec in "$@"; do sep "${spec%%:*}" "${spec#*:}"; done
echo "batch B end $(date -u +%FT%TZ)"
