#!/bin/bash
# second batch in one gtr-run slot: PENN f0 on the mono clip set, then the ByteDance piano model (rerun after the
# load_audio fix in run_piano.py); GNU time per tool.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/audio-to-notes; S=/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/scripts
cd /tmp
/usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $L/logs/time-penn.txt \
  $L/venv-penn/bin/python -I $S/run_f0.py penn $L/out/penn/f0 --clips S1,S2n,S2s,S4,S4lead,R1b,R2,R3a > $L/logs/f0-penn.log 2>&1
echo "penn $(cat $L/logs/time-penn.txt)"
/usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $L/logs/time-bytedance.txt \
  $L/venv-piano/bin/python -I $S/run_piano.py bytedance $L/out/bytedance --clips S1,S2n,S3,R1a,R1b,R1c > $L/logs/piano-bytedance.log 2>&1
echo "bytedance $(cat $L/logs/time-bytedance.txt)"
# Essentia's two multi-pitch algorithms on the polyphonic clips (added after the batch was queued)
for algo in klapuri multimelodia; do
  /usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $L/logs/time-essentia-$algo.txt \
    $L/venv-essentia/bin/python -I $S/run_essentia.py $algo $L/out/essentia-$algo/f0 --clips S2n,S2s,S3,S4guitar,R1a,R1c > $L/logs/f0-essentia-$algo.log 2>&1
  echo "essentia-$algo $(cat $L/logs/time-essentia-$algo.txt)"
done
