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
# demucs.cpp second build attempt (added after batch C's build failed with the Eigen AVX512-FP16 error):
# same sources, a fresh build dir, compiler = scripts/gxx_no_avx512fp16.sh (g++ ... -mno-avx512fp16)
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
SRC=$L/src/demucs.cpp; B=$L/build/demucs.cpp-nofp16
item() { local tool=$1 label=$2 input=$3; shift 3
  gtr-run --nolock --lane source-separation --tool "$tool" --label "$label [inside batch B, 2-core slot]" --input "$input" -- "$@"; }
if [ ! -x "$B/demucs_mt.cpp.main" ]; then
  mkdir -p "$B"
  item demucs.cpp-4edae49 "cmake configure demucs.cpp (USE_OPENBLAS=OFF, Release, CXX=g++ wrapper adding -mno-avx512fp16)" "$SRC/CMakeLists.txt" \
    cmake -S "$SRC" -B "$B" -DUSE_OPENBLAS=OFF -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_COMPILER=$S/gxx_no_avx512fp16.sh
  item demucs.cpp-4edae49 "cmake build demucs.cpp.main + demucs_mt.cpp.main (-j2), -mno-avx512fp16" "$SRC/CMakeLists.txt" \
    cmake --build "$B" --target demucs.cpp.main demucs_mt.cpp.main -j2
fi
G6=$L/models/demucs.cpp/ggml-model-htdemucs-6s-f16.bin
for c in S4_0-10s S4; do
  case $c in S4_0-10s) wav=$L/inputs/S4_0-10s/S4_0-10s.wav ;; *) wav=$IN/$c/$c.wav ;; esac
  out=$L/out/demucs.cpp-htdemucs_6s/$c
  [ -f "$out/.done" ] && continue
  mkdir -p "$out"
  [ -x "$B/demucs_mt.cpp.main" ] && item demucs.cpp-4edae49 "demucs_mt.cpp.main htdemucs_6s ggml f16, 2 threads, on $c" "$wav" \
    "$B/demucs_mt.cpp.main" "$G6" "$wav" "$out" 2 && touch "$out/.done"
done
echo "batch B end $(date -u +%FT%TZ)"
