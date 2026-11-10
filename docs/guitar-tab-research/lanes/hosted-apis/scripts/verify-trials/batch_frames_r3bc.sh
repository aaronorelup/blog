#!/bin/bash
# verify-trials-hosted-apis (run by the verifier): the trial (c) frames question put to MiMo V2.6 Flash for R3b and R3c,
# which joined the shared set after the trial ran. Frames made like R3a's: ffmpeg -i <clip>.mp4 -vf fps=1 -q:v 3 f_%02d.jpg
set -u
source /home/user/gtr/env.sh >/dev/null 2>&1
L=/home/user/gtr/lanes/hosted-apis
D=/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis
P=$D/scripts/prompts
cd $L/verify
for c in R3b R3c; do
  gtr-run --lane hosted-apis --tool vercel-ai-gateway --label "verify (run by the verifier): Vercel AI Gateway -> xiaomi/mimo-v2.6-flash: $c as 18 frames at 1 fps (capo, frets, tuning)" --input /home/user/gtr/inputs/$c/$c.mp4 --nolock -- \
    $L/venv-apis/bin/python -I $D/scripts/gateway_frames_trial.py xiaomi/mimo-v2.6-flash $L/verify/frames/$c $P/video_prompt.txt $P/video_schema.json $D/samples/verify-trials/vercel-gateway/verify_${c}_frames_mimo-v2.6-flash &
done
wait
echo BATCH_FRAMES_DONE
