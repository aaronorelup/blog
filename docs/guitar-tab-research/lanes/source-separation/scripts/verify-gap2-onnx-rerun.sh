#!/bin/bash
# verify-gapfill-source-separation (round 2): re-run of r0610 (demucs-onnx 0.3.4, htdemucs_6s fp16 weights, S4,
# ONNX Runtime threads left at the default) in a venv re-created from samples/demucs-onnx/uv-pip-freeze-venv-ort.txt,
# inside a gtr-run 2-core slot, watched by scripts/verify-gap2-thread-probe.py. Output under verify-gap2/out/.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
D=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/samples/verify-gap2
V=$L/verify-gap2
mkdir -p $V/work $D && cd $V/work
gtr-run --lane source-separation --tool demucs-onnx-0.3.4 \
  --label "verify (verify-gapfill-source-separation, round 2): re-run of r0610, demucs-onnx htdemucs_6s fp16weights on S4, ORT default threads, own thread probe" \
  --input /home/user/gtr/inputs/S4/S4.wav -- \
  python3 -I $S/verify-gap2-thread-probe.py $D/probe_onnx-default_S4_verify.json -- \
  $V/venv-ort/bin/demucs-onnx separate /home/user/gtr/inputs/S4/S4.wav $V/out/onnx-default/S4 \
  --model htdemucs_6s --small --providers cpu -v
