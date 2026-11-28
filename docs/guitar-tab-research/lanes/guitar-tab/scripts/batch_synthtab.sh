#!/bin/bash
# SynthTab TabCNN checkpoint $1 (path relative to SynthTab/demo_embedding/pretrained_models) on the clips given after it.
# Output prefix: out/synthtab/<clip>.<tag>   where tag = checkpoint path with / replaced by _ and .pt dropped
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
CK=$1; shift; TAG=$(echo $CK | sed 's#/#_#g; s#\.pt$##')
for c in "$@"; do
  echo "== $c $CK"; /usr/bin/time -f "clip $c: wall %e s, maxrss %M KB" $L/venv-amt/bin/python -I $S/run_synthtab_tabcnn.py $L/src/SynthTab/demo_embedding/pretrained_models/$CK /home/user/gtr/inputs/$c/$c.mono.wav $L/out/synthtab/$c.$TAG 2>&1 | grep -v -i "warn\|portaudio\|^\s*$"
done
