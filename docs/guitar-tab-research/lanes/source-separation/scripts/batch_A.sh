#!/bin/bash
# Batch A of the source-separation lane, run as ONE `gtr-run` job (one 2-core slot), because the shared CPU slots
# were queued 20+ deep. Inside, every item is started with `gtr-run --nolock`, so each item still gets its own
# ledger line (wall, CPU, peak RSS, input hash). --nolock records "cores": null, but the item inherits this batch's
# 2-core CPU affinity and the thread variables (OMP_NUM_THREADS=2 ...) set by the outer gtr-run; both are printed
# at the start of the log.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
IN=/home/user/gtr/inputs
cd $L/work
echo "batch A start $(date -u +%FT%TZ) affinity: $(taskset -cp $$) nproc=$(nproc) OMP_NUM_THREADS=$OMP_NUM_THREADS TF_NUM_INTRAOP_THREADS=$TF_NUM_INTRAOP_THREADS"
item() {  # item <tool> <label> <input> <cmd...>
  local tool=$1 label=$2 input=$3; shift 3
  gtr-run --nolock --lane source-separation --tool "$tool" --label "$label [inside batch A, 2-core slot]" --input "$input" -- "$@"
}
dem() {  # dem <model> <clip> [extra args]
  local model=$1 clip=$2; shift 2
  local wav=$IN/$clip/$clip.wav
  [ -f "$L/out/$model/$clip/.done" ] && { echo "skip $model $clip"; return; }
  item demucs-4.1.0 "demucs -n $model -d cpu on $clip (default options)" "$wav" \
    $L/venv-demucs/bin/demucs -n "$model" -d cpu -o "$L/out" "$wav" && touch "$L/out/$model/$clip/.done"
}
# 1. librosa HPSS (fast)
for c in S6taps S2s; do
  [ -f "$L/out/hpss/$c/hpss_report.json" ] || item librosa-1.0.0-hpss "librosa.effects.hpss on $c, settings default / margin3 / margin1-5" \
    "$IN/$c/$c.wav" $L/venv-librosa/bin/python -I $S/hpss_run.py "$IN/$c/$c.wav" "$L/out/hpss/$c"
done
# 2. Demucs on the solo-guitar video audio
dem htdemucs R3a
dem htdemucs_6s R3a
for c in R3b R3c; do dem htdemucs $c; dem htdemucs_6s $c; done
# 3. Spleeter 4stems
export MODEL_PATH=$L/models/spleeter
for c in S4 S6taps R2; do
  [ -f "$L/out/spleeter-4stems/$c/.done" ] && continue
  item spleeter-2.4.2 "spleeter separate -p spleeter:4stems on $c (defaults)" "$IN/$c/$c.wav" \
    $L/venv-spleeter/bin/spleeter separate -p spleeter:4stems -o "$L/out/spleeter-4stems" "$IN/$c/$c.wav" \
    && touch "$L/out/spleeter-4stems/$c/.done"
done
# 4. Demucs on the real band excerpt
dem htdemucs R2
dem htdemucs_6s R2
dem htdemucs_ft R2
dem mdx_extra R2
# 5. Demucs option checks
S10=$L/inputs/S4_0-10s/S4_0-10s.wav
opt() {  # opt <tag> <wav> <model> <extra args...>
  local tag=$1 wav=$2 model=$3; shift 3
  local out=$L/out/demucs-options/$tag
  [ -f "$out/.done" ] && return
  mkdir -p "$out"
  item demucs-4.1.0 "demucs -n $model $* on $(basename $wav .wav) (option check: $tag)" "$wav" \
    $L/venv-demucs/bin/demucs -n "$model" -d cpu -o "$out" "$@" "$wav" && touch "$out/.done"
}
opt two-stems-guitar "$IN/S4/S4.wav" htdemucs_6s --two-stems guitar
opt base-10s "$S10" htdemucs
opt shifts2-10s "$S10" htdemucs --shifts 2
opt overlap0.1-10s "$S10" htdemucs --overlap 0.1
opt segment4-10s "$S10" htdemucs --segment 4
opt segment10-10s "$S10" htdemucs --segment 10
opt jobs2-10s "$S10" htdemucs -j 2
opt mp3-10s "$S10" htdemucs --mp3
opt float32-10s "$S10" htdemucs --float32
# 6. Whole song (228.5 s) on 2 cores
dem htdemucs R2full
dem htdemucs_6s R2full
echo "batch A end $(date -u +%FT%TZ)"
