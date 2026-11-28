#!/bin/bash
# The Vercel AI Gateway trials, one gtr-run (--nolock: remote calls, local CPU idle) per call, in sequence.
set -u
source /home/user/gtr/env.sh
S=/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis
P=$S/scripts/prompts
PY=/home/user/gtr/lanes/hosted-apis/venv-apis/bin/python
IN=/home/user/gtr/inputs
cd /home/user/gtr/lanes/hosted-apis/out
run() {  # model tag clip media mime promptbase [extra args...]
  local model=$1 tag=$2 clip=$3 media=$4 mime=$5 pb=$6; shift 6
  local short=${model#*/}
  local out=$S/samples/vercel-gateway/${clip}_${tag}_${short}
  case "$*" in *--only*) out=${out}_$(echo "$*" | sed -E 's/.*--only ([^ ]+).*/\1/');; esac
  gtr-run --lane hosted-apis --tool vercel-ai-gateway --label "Vercel AI Gateway -> $model: $tag of $clip (remote call)" \
    --input "$media" --nolock -- $PY -I $S/scripts/gateway_trial.py --model "$model" --media "$media" --mime "$mime" \
    --prompt $P/${pb}_prompt.txt --schema $P/${pb}_schema.json --out "$out" "$@"
}
M=xiaomi/mimo-v2.6-flash
run $M chords S4 $IN/S4/S4.mono.wav audio/wav chords
run $M notes S2n $IN/S2n/S2n.mono.wav audio/wav notes
run $M video R3a $IN/R3a/R3a.mp4 video/mp4 video
run $M capo S5capo2 $IN/S5capo2/S5capo2.mono.wav audio/wav capo
M=meta/muse-spark-open
run $M notes S2n $IN/S2n/S2n.mono.wav audio/wav notes --only togetherai
run $M video R3a $IN/R3a/R3a.mp4 video/mp4 video --only togetherai
run $M capo S5capo2 $IN/S5capo2/S5capo2.mono.wav audio/wav capo --only togetherai
run bytedance/seed-2.1-turbo video R3a $IN/R3a/R3a.mp4 video/mp4 video --schema-in-prompt
echo BATCH_DONE
