#!/bin/bash
# guitar checkpoints of xavriley/midi-transcription-models on the clips given; $1 = checkpoint file name
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
CK=$1; shift; TAG=${CK%.pth}; mkdir -p $L/out/hf-midi-transcription
for c in "$@"; do
  echo "== $c $CK"; /usr/bin/time -f "clip $c: wall %e s, maxrss %M KB" $L/venv-amt/bin/python -I $S/run_hfmt_guitar.py $L/weights/hf-midi-transcription/$CK /home/user/gtr/inputs/$c/$c.mono.wav $L/out/hf-midi-transcription/$c.$TAG 2>&1 | grep -v -i "warn\|portaudio\|^\s*$"
done
