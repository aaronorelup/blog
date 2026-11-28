#!/bin/bash
# One gtr-run slot (2 cores) runs several f0 tools one after another. Each tool runs under GNU time, which writes
# wall-clock s, user CPU s, system CPU s and peak RSS (KB) to logs/time-<tool>.txt; per-clip seconds are in each
# tool's timings.json.
# usage: TOOLS="swiftf0:venv-librosa:run_f0 ..." CLIPS=S1,... batch_f0.sh
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/audio-to-notes; S=/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/scripts
cd /tmp
CL=${CLIPS:-S1,S2n,S2s,S4,S4lead,R1b,R2,R3a}
for spec in $TOOLS; do
  IFS=: read tool venv script sub <<< "$spec"
  out=$L/out/$tool/f0
  /usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $L/logs/time-$tool.txt \
    $L/$venv/bin/python -I $S/$script.py ${sub:-$tool} $out --clips $CL > $L/logs/f0-$tool.log 2>&1
  echo "$tool $(cat $L/logs/time-$tool.txt)"
done
