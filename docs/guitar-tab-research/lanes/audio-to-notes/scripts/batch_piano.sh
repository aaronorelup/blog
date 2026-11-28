#!/bin/bash
# ByteDance piano_transcription_inference and Transkun (both piano-trained) on guitar clips, one gtr-run slot.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/audio-to-notes; S=/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/scripts
cd /tmp
for tool in bytedance transkun; do
  /usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $L/logs/time-$tool.txt \
    $L/venv-piano/bin/python -I $S/run_piano.py $tool $L/out/$tool --clips ${CLIPS:-S1,S2n,S3,R1a,R1b,R1c} > $L/logs/piano-$tool.log 2>&1
  echo "$tool $(cat $L/logs/time-$tool.txt)"
done
