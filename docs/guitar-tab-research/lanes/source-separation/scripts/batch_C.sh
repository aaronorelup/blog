#!/bin/bash
# Batch C of the source-separation lane, run as ONE `gtr-run` job (one 2-core slot). Inside, every item is started
# with `gtr-run --nolock` (own ledger line; inherits this batch's 2-core affinity and OMP_NUM_THREADS=2, printed below).
#  1. demucs.cpp (sevagh, commit 4edae49): CMake build of demucs.cpp.main and demucs_mt.cpp.main, OpenBLAS off
#     (Eigen + OpenMP path), then htdemucs_6s (ggml f16 weights from the Retrobear/demucs.cpp dataset) on S4_0-10s and S4.
#  2. barvarvara/demucs-guitar-lora: htdemucs + PEFT LoRA adapter (scripts/demucs_lora.py) on S4 and S2s.
#  3. ZFTurbo MSST (PyPI msst 0.1.0, `msst-inference`): becruily Mel-Band RoFormer guitar on S4_0-10s, S2s, S4;
#     BS-RoFormer-SW (same checkpoint file audio-separator uses) on S4_0-10s.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
IN=/home/user/gtr/inputs
cd $L/work
echo "batch C start $(date -u +%FT%TZ) affinity: $(taskset -cp $$) nproc=$(nproc) OMP_NUM_THREADS=$OMP_NUM_THREADS"
item() {  # item <tool> <label> <input> <cmd...>
  local tool=$1 label=$2 input=$3; shift 3
  gtr-run --nolock --lane source-separation --tool "$tool" --label "$label [inside batch C, 2-core slot]" --input "$input" -- "$@"
}
# 1. demucs.cpp
SRC=$L/src/demucs.cpp; B=$L/build/demucs.cpp
if [ ! -x "$B/demucs_mt.cpp.main" ]; then
  mkdir -p "$B"
  item demucs.cpp-4edae49 "cmake configure demucs.cpp (USE_OPENBLAS=OFF, Release)" "$SRC/CMakeLists.txt" \
    cmake -S "$SRC" -B "$B" -DUSE_OPENBLAS=OFF -DCMAKE_BUILD_TYPE=Release
  item demucs.cpp-4edae49 "cmake build demucs.cpp.main + demucs_mt.cpp.main (-j2)" "$SRC/CMakeLists.txt" \
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
# 2. LoRA guitar adapter on htdemucs
for c in S4 S2s; do
  out=$L/out/demucs-guitar-lora/$c
  [ -f "$out/.done" ] && continue
  item demucs-guitar-lora "htdemucs + barvarvara/demucs-guitar-lora (PEFT, merged) on $c, shifts=1 overlap=0.25" "$IN/$c/$c.wav" \
    $L/venv-demucs/bin/python -I $S/demucs_lora.py $L/models/demucs-guitar-lora "$IN/$c/$c.wav" "$out" && touch "$out/.done"
done
# 2b. demucs-onnx (StemSplit, PyPI 0.3.4): htdemucs_6s ONNX, fp16 weights (--small), ONNX Runtime CPU provider
out=$L/out/demucs-onnx-htdemucs_6s-fp16/S4
if [ ! -f "$out/.done" ]; then
  mkdir -p "$out"
  item demucs-onnx-0.3.4 "demucs-onnx separate --model htdemucs_6s --small --providers cpu on S4" "$IN/S4/S4.wav" \
    $L/venv-msst/bin/demucs-onnx separate "$IN/S4/S4.wav" "$out" --model htdemucs_6s --small --providers cpu -v \
    && touch "$out/.done"
fi
# 3. MSST
M=$L/models/msst
for c in S4_0-10s S2s S4; do
  out=$L/out/msst-becruily-guitar
  [ -f "$out/$c.done" ] && continue
  item msst-0.1.0 "msst-inference mel_band_roformer becruily_guitar.ckpt --force_cpu on $c" "$L/inputs/msst-in/$c/$c.wav" \
    $L/venv-msst/bin/msst-inference --model_type mel_band_roformer --config_path $M/config_guitar_becruily.yaml \
    --start_check_point $M/becruily_guitar.ckpt --input_folder $L/inputs/msst-in/$c --store_dir $out --force_cpu \
    --disable_detailed_pbar && touch "$out/$c.done"
done
out=$L/out/msst-bs-roformer-sw
if [ ! -f "$out/S4_0-10s.done" ]; then
  item msst-0.1.0 "msst-inference bs_roformer BS-Roformer-SW.ckpt --force_cpu on S4_0-10s" "$L/inputs/S4_0-10s/S4_0-10s.wav" \
    $L/venv-msst/bin/msst-inference --model_type bs_roformer --config_path $L/models/uvr/BS-Roformer-SW.yaml \
    --start_check_point $L/models/uvr/BS-Roformer-SW.ckpt --input_folder $L/inputs/msst-in/S4_0-10s --store_dir $out \
    --force_cpu --disable_detailed_pbar && touch "$out/S4_0-10s.done"
fi
echo "batch C end $(date -u +%FT%TZ)"
