#!/bin/bash
# Second gateway batch (MiMo V2.6 Flash only): controls and tuning questions.
set -u
source /home/user/gtr/env.sh
S=/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis
P=$S/scripts/prompts
PY=/home/user/gtr/lanes/hosted-apis/venv-apis/bin/python
IN=/home/user/gtr/inputs
M=xiaomi/mimo-v2.6-flash
cd /home/user/gtr/lanes/hosted-apis/out
run() {  # clip media promptbase tag
  local clip=$1 media=$2 pb=$3 tag=$4
  gtr-run --lane hosted-apis --tool vercel-ai-gateway --label "Vercel AI Gateway -> $M: $tag of $clip (remote call)" \
    --input "$media" --nolock -- $PY -I $S/scripts/gateway_trial.py --model $M --media "$media" --mime audio/wav \
    --prompt $P/${pb}_prompt.txt --schema $P/${pb}_schema.json --out $S/samples/vercel-gateway/${clip}_${tag}_mimo-v2.6-flash
}
run S2n $IN/S2n/S2n.mono.wav capo capo-control
run S5capo2 $IN/S5capo2/S5capo2.mono.wav capo capo-repeat2
run S5capo2 $IN/S5capo2/S5capo2.mono.wav capo capo-repeat3
run S5dropd $IN/S5dropd/S5dropd.mono.wav tuning tuning
run S7flat30 $IN/S7flat30/S7flat30.mono.wav tuning tuning
run S2n $IN/S2n/S2n.mono.wav tuning tuning-control
echo BATCH2_DONE
