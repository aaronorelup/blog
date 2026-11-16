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
# the CLI itself, once, on S1 (TFLite chosen by default since TensorFlow and CoreML are absent), and once on the R3a
# video file (MP4) to record whether the CLI accepts a video container directly
mkdir -p $L/out/basic-pitch/cli-tflite-default/S1 $L/out/basic-pitch/cli-tflite-default/R3a-mp4
/usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $L/logs/time-bp-cli-S1.txt \
  $L/venv-basicpitch/bin/basic-pitch --save-midi --save-model-outputs --save-note-events \
  $L/out/basic-pitch/cli-tflite-default/S1 /home/user/gtr/inputs/S1/S1.wav > $L/out/basic-pitch/cli-tflite-default/S1/stdout.log 2>&1
echo "cli-S1 $(cat $L/logs/time-bp-cli-S1.txt)"
/usr/bin/time -f "wall_s=%e user_s=%U sys_s=%S max_rss_kb=%M exit=%x" -o $L/logs/time-bp-cli-R3a-mp4.txt \
  $L/venv-basicpitch/bin/basic-pitch --save-midi --save-note-events \
  $L/out/basic-pitch/cli-tflite-default/R3a-mp4 /home/user/gtr/inputs/R3a/R3a.mp4 > $L/out/basic-pitch/cli-tflite-default/R3a-mp4/stdout.log 2>&1
echo "cli-R3a-mp4 $(cat $L/logs/time-bp-cli-R3a-mp4.txt)"
