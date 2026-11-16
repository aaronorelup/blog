#!/bin/bash
# verify-trials-hosted-apis: re-runs of the recorded remote calls (Gemini probe, Vercel gateway, xAI, model lists).
# Every call goes through gtr-run --nolock with a label starting "verify". Small outputs go to samples/verify-trials/.
set -u
source /home/user/gtr/env.sh >/dev/null 2>&1
L=/home/user/gtr/lanes/hosted-apis
D=/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis
V=$D/samples/verify-trials
PY=$L/venv-apis/bin/python
P=$D/scripts/prompts
cd $L/out
# Gemini: the r0014 probe (countTokens + one-word generateContent), same command, new output folder
gtr-run --lane hosted-apis --tool gemini-api --label "verify: re-run of r0014 Gemini probe (countTokens on S3 + 1-word generateContent)" --input /home/user/gtr/inputs/S3/S3.mono.wav --nolock -- \
  $PY -I $D/scripts/gemini_probe.py gemini-3.5-flash-lite /home/user/gtr/inputs/S3/S3.mono.wav $V/gemini/probe
# Vercel gateway: r0028 (MiMo, S3 chords), same command except --out
gtr-run --lane hosted-apis --tool vercel-ai-gateway --label "verify: re-run of r0028 Vercel AI Gateway -> xiaomi/mimo-v2.6-flash: chords/tempo/key of S3" --input /home/user/gtr/inputs/S3/S3.mono.wav --nolock -- \
  $PY -I $D/scripts/gateway_trial.py --model xiaomi/mimo-v2.6-flash --media /home/user/gtr/inputs/S3/S3.mono.wav --mime audio/wav --prompt $P/chords_prompt.txt --schema $P/chords_schema.json --out $V/vercel-gateway/verify_S3_chords_mimo-v2.6-flash
# Vercel gateway: r0083 (Muse Spark Open, R3a MP4, --only togetherai), same command except --out
gtr-run --lane hosted-apis --tool vercel-ai-gateway --label "verify: re-run of r0083 Vercel AI Gateway -> meta/muse-spark-open (togetherai only): R3a MP4 video" --input /home/user/gtr/inputs/R3a/R3a.mp4 --nolock -- \
  $PY -I $D/scripts/gateway_trial.py --model meta/muse-spark-open --media /home/user/gtr/inputs/R3a/R3a.mp4 --mime video/mp4 --prompt $P/video_prompt.txt --schema $P/video_schema.json --out $V/vercel-gateway/verify_R3a_video_muse-spark-open_togetherai --only togetherai
# Vercel gateway: the same MP4 request to Muse Spark Open with no provider restriction (r0083 had --only togetherai)
gtr-run --lane hosted-apis --tool vercel-ai-gateway --label "verify: Vercel AI Gateway -> meta/muse-spark-open, R3a MP4 video, no provider restriction (r0083 variant)" --input /home/user/gtr/inputs/R3a/R3a.mp4 --nolock -- \
  $PY -I $D/scripts/gateway_trial.py --model meta/muse-spark-open --media /home/user/gtr/inputs/R3a/R3a.mp4 --mime video/mp4 --prompt $P/video_prompt.txt --schema $P/video_schema.json --out $V/vercel-gateway/verify_R3a_video_muse-spark-open_anyprovider
# xAI speech to text: r0105, same command except the output folder
gtr-run --lane hosted-apis --tool xai-stt --label "verify: re-run of r0105 xAI POST /v1/stt grok-voice-transcribe-2.0 on R2, language en" --input /home/user/gtr/inputs/R2/R2.wav --nolock -- \
  $PY -I $D/scripts/xai_stt.py /home/user/gtr/inputs/R2/R2.wav $V/xai/verify_R2_stt en
# xAI and DeepSeek model lists (free)
gtr-run --lane hosted-apis --tool xai-deepseek-models --label "verify: re-run of the xAI and DeepSeek model lists (no charge)" --nolock -- \
  $PY -I $D/scripts/list_models_xai_deepseek.py $V/xai
echo BATCH_REMOTE_DONE
