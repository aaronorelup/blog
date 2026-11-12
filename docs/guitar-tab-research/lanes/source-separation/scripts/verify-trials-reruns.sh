#!/bin/bash
# verify-trials-source-separation: re-runs of recorded trial commands, each through its own `gtr-run` (one 2-core
# slot, label "verify: ..."). The command is the one in the run ledger except the output folder, which is
# /home/user/gtr/lanes/source-separation/verify/out/... so the trial's stems (used by other lanes) are not overwritten.
# Usage: verify-trials-reruns.sh <wave>   (wave1 = tools whose venv still exists; wave2 = rebuilt venvs)
source /home/user/gtr/env.sh 2>/dev/null
L=/home/user/gtr/lanes/source-separation
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
IN=/home/user/gtr/inputs
V=$L/verify/out
S10=$L/inputs/S4_0-10s/S4_0-10s.wav
mkdir -p "$V" "$L/verify/work"
cd "$L/verify/work"
run() {  # run <tool> <label> <input> <cmd...>
  local tool=$1 label=$2 input=$3; shift 3
  echo "=== $(date -u +%FT%TZ) $label"
  gtr-run --lane source-separation --tool "$tool" --label "verify: $label" --input "$input" -- "$@"
  echo "=== exit $?"
}
UVR_NAMES='{"Vocals":"vocals","Instrumental":"instrumental","Drums":"drums","Bass":"bass","Other":"other","Guitar":"guitar","Piano":"piano","No Other":"no_other","No Drums":"no_drums","No Bass":"no_bass","Drum-Bass":"drum-bass","No Drum-Bass":"no_drum-bass"}'
case "$1" in
wave1)
  run demucs-4.1.0 "re-run of r0019, demucs -n htdemucs -d cpu on S4" "$IN/S4/S4.wav" \
    $L/venv-demucs/bin/demucs -n htdemucs -d cpu -o "$V" "$IN/S4/S4.wav"
  run demucs-4.1.0 "re-run of r0099, demucs -n htdemucs_6s -d cpu on S2s" "$IN/S2s/S2s.wav" \
    $L/venv-demucs/bin/demucs -n htdemucs_6s -d cpu -o "$V" "$IN/S2s/S2s.wav"
  run demucs-4.1.0 "re-run of r0462, demucs -n htdemucs --mp3 on S4_0-10s" "$S10" \
    $L/venv-demucs/bin/demucs -n htdemucs -d cpu -o "$V/demucs-options/mp3-10s" --mp3 "$S10"
  run demucs-4.1.0 "re-run of r0460, demucs -n htdemucs --segment 10 on S4_0-10s" "$S10" \
    $L/venv-demucs/bin/demucs -n htdemucs -d cpu -o "$V/demucs-options/segment10-10s" --segment 10 "$S10"
  run demucs-guitar-lora "re-run of r0467, htdemucs + demucs-guitar-lora on S4" "$IN/S4/S4.wav" \
    $L/venv-demucs/bin/python -I $S/demucs_lora.py $L/models/demucs-guitar-lora "$IN/S4/S4.wav" "$V/demucs-guitar-lora/S4"
  OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 \
  run librosa-1.0.0-hpss "re-run of r0262, librosa.effects.hpss on S6taps (1 thread, as r0262)" "$IN/S6taps/S6taps.wav" \
    $L/venv-librosa/bin/python -I $S/hpss_run.py "$IN/S6taps/S6taps.wav" "$V/hpss/S6taps"
  run audio-separator-0.48.0 "re-run of r0481, audio-separator -m 1_HP-UVR.pth on S4" "$IN/S4/S4.wav" \
    $L/venv-uvr/bin/audio-separator -m 1_HP-UVR.pth --model_file_dir $L/models/uvr --output_dir "$V/uvr/1_HP-UVR/S4" \
    --output_format WAV --custom_output_names "$UVR_NAMES" "$IN/S4/S4.wav"
  mkdir -p "$V/demucs.cpp-htdemucs_6s/S4_0-10s"
  run demucs.cpp-4edae49 "re-run of r0508, demucs_mt.cpp.main htdemucs_6s ggml f16, 2 threads, on S4_0-10s" "$S10" \
    $L/build/demucs.cpp-nofp16/demucs_mt.cpp.main $L/models/demucs.cpp/ggml-model-htdemucs-6s-f16.bin "$S10" \
    "$V/demucs.cpp-htdemucs_6s/S4_0-10s" 2
  ;;
wave2-umx)
  run openunmix-1.3.0 "re-run of r0085, umx --model umxhq on S4" "$IN/S4/S4.wav" \
    $L/venv-umx/bin/umx --model umxhq --no-cuda --outdir "$V/umxhq" "$IN/S4/S4.wav"
  ;;
wave2-msst)
  run msst-0.1.0 "re-run of r0473, msst-inference mel_band_roformer becruily_guitar.ckpt --force_cpu on S4_0-10s" "$L/inputs/msst-in/S4_0-10s/S4_0-10s.wav" \
    $L/venv-msst/bin/msst-inference --model_type mel_band_roformer --config_path $L/models/msst/config_guitar_becruily.yaml \
    --start_check_point $L/models/msst/becruily_guitar.ckpt --input_folder $L/inputs/msst-in/S4_0-10s \
    --store_dir "$V/msst-becruily-guitar" --force_cpu --disable_detailed_pbar
  ;;
wave2-onnx)
  run demucs-onnx-0.3.4 "re-run of r0471, demucs-onnx separate --model htdemucs_6s --small --providers cpu on S4" "$IN/S4/S4.wav" \
    $L/venv-msst/bin/demucs-onnx separate "$IN/S4/S4.wav" "$V/demucs-onnx-htdemucs_6s-fp16/S4" --model htdemucs_6s --small --providers cpu -v
  ;;
wave2-spleeter)
  export MODEL_PATH=$L/models/spleeter
  run spleeter-2.4.2 "re-run of r0419, spleeter separate -p spleeter:4stems on S4" "$IN/S4/S4.wav" \
    $L/venv-spleeter/bin/spleeter separate -p spleeter:4stems -o "$V/spleeter-4stems" "$IN/S4/S4.wav"
  ;;
esac
# SCNet Small (MUSDB18, starrytong) through PyPI msst 0.1.0: not run by the trial agent ("lack of time"); run by the
# verifier. Checkpoint and config from ZFTurbo's release v.1.0.6 (docs/pretrained_models.md), kept in verify/models/scnet.
if [ "$1" = "wave3-scnet" ]; then
  for c in S4 S6taps; do
    run msst-0.1.0 "run by the verifier: msst-inference scnet (SCNet Small, MUSDB18) --force_cpu on $c" "$IN/$c/$c.wav" \
      $L/venv-msst/bin/msst-inference --model_type scnet --config_path $L/verify/models/scnet/config_musdb18_scnet.yaml \
      --start_check_point $L/verify/models/scnet/scnet_checkpoint_musdb18.ckpt --input_folder $L/verify/work/msst-in/$c \
      --store_dir "$V/msst-scnet-musdb18" --force_cpu --disable_detailed_pbar
  done
fi
