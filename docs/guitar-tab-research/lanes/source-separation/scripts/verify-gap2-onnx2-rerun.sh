#!/bin/bash
# verify-gapfill-source-separation (round 2): re-run of r0612 (demucs-onnx 0.3.4 on S4 with ONNX Runtime's intra-op
# thread count set to 2 by scripts/gap2_ort_threads.py), in the venv re-created from its freeze, inside a gtr-run
# 2-core slot, watched by scripts/verify-gap2-thread-probe.py. Output under verify-gap2/out/.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
D=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/samples/verify-gap2
V=$L/verify-gap2
mkdir -p $V/work $D && cd $V/work
gtr-run --lane source-separation --tool demucs-onnx-0.3.4 \
  --label "verify (verify-gapfill-source-separation, round 2): re-run of r0612, demucs-onnx on S4, ORT intra_op_num_threads=2, own thread probe" \
  --input /home/user/gtr/inputs/S4/S4.wav -- \
  python3 -I $S/verify-gap2-thread-probe.py $D/probe_onnx-ort2_S4_verify.json -- \
  $V/venv-ort/bin/python $S/gap2_ort_threads.py 2 demucs_onnx.cli:main separate /home/user/gtr/inputs/S4/S4.wav \
  $V/out/onnx-ort2/S4 --model htdemucs_6s --small --providers cpu -v
