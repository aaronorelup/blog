#!/bin/bash
# Basic Pitch 0.4.0 Python API, three configurations in one gtr-run slot; GNU time per configuration.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/audio-to-notes; S=/home/user/blog/docs/guitar-tab-research/lanes/audio-to-notes/scripts
PY="$L/venv-basicpitch/bin/python -I $S/run_basic_pitch_py.py"
cd /tmp
run() { name=$1; shift
  /usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $L/logs/time-bp-$name.txt $PY "$@" > $L/logs/bp-$name.log 2>&1
  echo "$name $(cat $L/logs/time-bp-$name.txt)"; }
run tflite-default tflite $L/out/basic-pitch/tflite-default tflite-default
run tflite-guitar-range tflite $L/out/basic-pitch/tflite-guitar-range tflite-guitar-range --fmin 82.4 --fmax 1319.0
run onnx-default onnx $L/out/basic-pitch/onnx-default onnx-default
