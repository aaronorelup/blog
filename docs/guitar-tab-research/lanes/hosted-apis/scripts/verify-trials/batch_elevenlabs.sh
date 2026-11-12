#!/bin/bash
# verify-trials-hosted-apis: re-runs of r0064 (ElevenLabs six_stems_v1 on S4) and r0108 (Scribe v3 on R2), one after
# the other so the credit-counter differences do not overlap. Same commands as recorded, new output folders.
set -u
source /home/user/gtr/env.sh >/dev/null 2>&1
L=/home/user/gtr/lanes/hosted-apis
D=/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis
O=$L/verify/elevenlabs
V=$D/samples/verify-trials/elevenlabs
mkdir -p $O; cd $O
PY=$L/venv-apis/bin/python
gtr-run --lane hosted-apis --tool elevenlabs-stem-separation --label "verify: re-run of r0064 ElevenLabs POST /v1/music/stem-separation six_stems_v1 on S4 mix" --input /home/user/gtr/inputs/S4/S4.wav --nolock -- \
  $PY -I $D/scripts/elevenlabs_call.py stems /home/user/gtr/inputs/S4/S4.wav $O/verify_S4_six_stems --variation six_stems_v1 --format mp3_44100_192 --samples $V/verify_S4_six_stems
gtr-run --lane hosted-apis --tool elevenlabs-stt --label "verify: re-run of r0108 ElevenLabs POST /v1/speech-to-text scribe_v3 on R2, word timestamps, audio event tags" --input /home/user/gtr/inputs/R2/R2.wav --nolock -- \
  $PY -I $D/scripts/elevenlabs_call.py stt /home/user/gtr/inputs/R2/R2.wav $O/verify_R2_stt_scribe_v3 --model scribe_v3 --samples $V/verify_R2_stt_scribe_v3
echo BATCH_EL_DONE
