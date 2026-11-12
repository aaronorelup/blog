#!/bin/bash
# verify-gapfill-source-separation (round 2): re-run of r0615 (audio-separator 0.48.0, UVR-MDX-NET-Inst_HQ_3.onnx on
# S4, ONNX Runtime threads left at the default) inside a gtr-run 2-core slot, watched by this verifier's own probe
# (scripts/verify-gap2-thread-probe.py, written separately from gap2_thread_probe.py). Output under verify-gap2/out/.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
D=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/samples/verify-gap2
V=$L/verify-gap2
mkdir -p $V/work $D && cd $V/work
gtr-run --lane source-separation --tool audio-separator-0.48.0 \
  --label "verify (verify-gapfill-source-separation, round 2): re-run of r0615, UVR-MDX-NET-Inst_HQ_3.onnx on S4, ORT default threads, own thread probe" \
  --input /home/user/gtr/inputs/S4/S4.wav -- \
  python3 -I $S/verify-gap2-thread-probe.py $D/probe_mdx-default_S4_verify.json -- \
  $L/venv-uvr/bin/audio-separator -m UVR-MDX-NET-Inst_HQ_3.onnx --model_file_dir $L/models/uvr \
  --output_dir $V/out/mdx-default/S4 --output_format WAV \
  --custom_output_names '{"Vocals":"vocals","Instrumental":"instrumental","Drums":"drums","Bass":"bass","Other":"other","Guitar":"guitar","Piano":"piano","No Other":"no_other","No Drums":"no_drums","No Bass":"no_bass","Drum-Bass":"drum-bass","No Drum-Bass":"no_drum-bass"}' \
  /home/user/gtr/inputs/S4/S4.wav
