#!/bin/bash
# verify-trials-audio-to-notes: one gtr-run slot (2 cores) re-runs one representative trial per heavy tool with the
# trial agent's own runner scripts, unchanged, in venvs rebuilt offline (uv --offline) from the saved freezes.
# Outputs go to /home/user/gtr/lanes/audio-to-notes/verify/out/<tool>/ ; GNU time per tool in verify/logs/time-<tool>.txt
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/audio-to-notes; V=$L/verify; S=/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/scripts
cd /tmp
t() { name=$1; shift
  /usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $V/logs/time-$name.txt "$@" > $V/logs/run-$name.log 2>&1
  echo "$name $(cat $V/logs/time-$name.txt)"; }
t basic-pitch $V/venv-basicpitch/bin/python -I $S/run_basic_pitch_py.py tflite $V/out/basic-pitch verify --clips S1,S2n
t pyin        $V/venv-librosa/bin/python -I $S/run_f0.py pyin $V/out/pyin --clips S1
t fcpe        $V/venv-torchf0/bin/python -I $S/run_f0.py fcpe $V/out/fcpe --clips S1
t pesto       $V/venv-torchf0/bin/python -I $S/run_f0.py pesto $V/out/pesto --clips S1
t torchcrepe-decoders $V/venv-torchf0/bin/python -I $S/run_torchcrepe_decoders.py $V/out/torchcrepe-tiny-decoders R1b
t essentia-crepe-tiny $V/venv-essentia/bin/python -I $S/run_essentia.py crepe-tiny $V/out/essentia-crepe-tiny --clips S1
t transkun    $V/venv-piano/bin/python -I $S/run_piano.py transkun $V/out/transkun --clips S1
for i in $(seq 1 60); do [ -s "$L/dl/bytedance/note_F1=0.9677_pedal_F1=0.9186.pth" ] && ! pgrep -f 'zenodo.org/record/4034264' >/dev/null && break; sleep 5; done
t bytedance   $V/venv-piano/bin/python -I $S/run_piano.py bytedance $V/out/bytedance --clips S2n
