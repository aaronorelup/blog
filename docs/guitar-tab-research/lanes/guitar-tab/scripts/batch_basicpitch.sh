#!/bin/bash
# Basic Pitch 0.4.0 (ONNX model, all other settings default) on the clips given; output out/basic-pitch/<clip>/
# These MIDI files are the "transcribed notes in" input for the MIDI-to-tab tools of the guitar-tab lane.
set +e
L=/home/user/gtr/lanes/guitar-tab
for c in "$@"; do
  mkdir -p $L/out/basic-pitch/$c
  /usr/bin/time -f "clip $c: wall %e s, maxrss %M KB" $L/venv-bp/bin/basic-pitch --model-serialization onnx --save-midi --save-note-events $L/out/basic-pitch/$c /home/user/gtr/inputs/$c/$c.mono.wav 2>&1 | grep -v -i "warning:root\|coremltools\|tensorflow is not" | tail -3
done
