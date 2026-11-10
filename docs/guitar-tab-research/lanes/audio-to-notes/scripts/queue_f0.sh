#!/bin/bash
# runs the monophonic f0 trackers one after another, one gtr-run each (2 cores); every clip file is passed as --input
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/audio-to-notes; S=/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/scripts
cd /tmp
CL=${CLIPS:-S1,S2n,S2s,S4,S4lead,R1b,R2,R3a}
INS=$(/usr/bin/python3 -I -c "
import sys; sys.path.insert(0,'$S'); from a2n_common import mono_path
print(' '.join('--input '+mono_path(c) for c in '$CL'.split(',')))")
for spec in ${TOOLS:-"swiftf0:venv-librosa" "pyin:venv-librosa" "fcpe:venv-torchf0" "pesto:venv-torchf0" "torchcrepe-tiny:venv-torchf0" "torchcrepe-full:venv-torchf0"}; do
  tool=${spec%%:*}; venv=${spec##*:}
  gtr-run --lane audio-to-notes --tool $tool --label "$tool f0 batch: $CL" $INS -- \
    $L/$venv/bin/python -I $S/run_f0.py $tool $L/out/$tool/f0 --clips $CL > $L/logs/f0-$tool.log 2>&1
  tail -n 1 $L/logs/f0-$tool.log
done
