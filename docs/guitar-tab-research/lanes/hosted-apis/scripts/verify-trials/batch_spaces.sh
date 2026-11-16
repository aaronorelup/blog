#!/bin/bash
# verify-trials-hosted-apis: re-runs of the recorded Hugging Face Space calls (no token), same commands, new output folders.
set -u
source /home/user/gtr/env.sh >/dev/null 2>&1
L=/home/user/gtr/lanes/hosted-apis
D=/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis
O=$L/verify/hf-spaces
mkdir -p $O; cd $O
PY=$L/venv-apis/bin/python
gtr-run --lane hosted-apis --tool hf-space-yourmt3 --label "verify: re-run of r0164 HF Space mimbres/YourMT3-cpu /process_audio on S2n.mono.wav, no token" --input /home/user/gtr/inputs/S2n/S2n.mono.wav --nolock -- \
  $PY -I $D/scripts/hf_space_call.py mimbres/YourMT3-cpu /process_audio $O/yourmt3cpu_S2n '["file:/home/user/gtr/inputs/S2n/S2n.mono.wav"]'
gtr-run --lane hosted-apis --tool hf-space-beat-this --label "verify: re-run of r0118 HF Space teamup-tech/Beat-This /process on S4.wav, no token" --input /home/user/gtr/inputs/S4/S4.wav --nolock -- \
  $PY -I $D/scripts/hf_space_call.py teamup-tech/Beat-This /process $O/beatthis_S4 '["file:/home/user/gtr/inputs/S4/S4.wav"]'
gtr-run --lane hosted-apis --tool hf-space-muscriptor --label "verify: re-run of r0116 HF Space hugging-apps/muscriptor-music-transcription on S2n.mono.wav, no token (ZeroGPU)" --input /home/user/gtr/inputs/S2n/S2n.mono.wav --nolock -- \
  $PY -I $D/scripts/hf_space_call.py hugging-apps/muscriptor-music-transcription /transcribe $O/muscriptor_S2n '["file:/home/user/gtr/inputs/S2n/S2n.mono.wav", ["acoustic_guitar"], false, 1.0]'
gtr-run --lane hosted-apis --tool hf-space-yourmt3 --label "verify: re-run of r0112 HF Space mimbres/YourMT3 (ZeroGPU) /process_audio on S2n.mono.wav, no token" --input /home/user/gtr/inputs/S2n/S2n.mono.wav --nolock -- \
  $PY -I $D/scripts/hf_space_call.py mimbres/YourMT3 /process_audio $O/yourmt3_S2n '["file:/home/user/gtr/inputs/S2n/S2n.mono.wav"]'
gtr-run --lane hosted-apis --tool hf-space-demucs --label "verify: re-run of r0141 HF Space nakas/demucs_playground /predict on S4.wav via gradio_client 0.5.3, no token" --input /home/user/gtr/inputs/S4/S4.wav --nolock -- \
  $L/venv-gc-old/bin/python -I $D/scripts/hf_space_call_old.py nakas/demucs_playground /predict $O/demucs_S4_old /home/user/gtr/inputs/S4/S4.wav
echo BATCH_SPACES_DONE
