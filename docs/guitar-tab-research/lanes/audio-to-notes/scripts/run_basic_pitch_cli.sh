#!/bin/bash
# Basic Pitch 0.4.0 CLI, default settings, one gtr-run per clip.
# usage: run_basic_pitch_cli.sh <backend: tflite|onnx|tf> <venv> <outroot> [extra basic-pitch flags...]
source /home/user/gtr/env.sh
BACKEND=$1; VENV=$2; OUTROOT=$3; shift 3
I=/home/user/gtr/inputs
declare -A C=( [S1]=$I/S1/S1.wav [S2n]=$I/S2n/S2n.wav [S2s]=$I/S2s/S2s.wav [S3]=$I/S3/S3.wav [S4]=$I/S4/S4.wav
  [S4guitar]=$I/S4/stems/guitar.wav [S4lead]=$I/S4/stems/lead.wav [S5capo2]=$I/S5capo2/S5capo2.wav
  [S5dropd]=$I/S5dropd/S5dropd.wav [S6taps]=$I/S6taps/S6taps.wav [S7flat30]=$I/S7flat30/S7flat30.wav
  [R1a]=$I/R1a/R1a.wav [R1b]=$I/R1b/R1b.wav [R1c]=$I/R1c/R1c.wav [R2]=$I/R2/R2.wav [R3a]=$I/R3a/R3a.wav )
for id in ${CLIPS:-S1 S2n S2s S3 S4 S4guitar S4lead S5capo2 S5dropd S6taps S7flat30 R1a R1b R1c R2 R3a}; do
  out=$OUTROOT/$id; rm -rf $out; mkdir -p $out
  gtr-run --lane audio-to-notes --tool basic-pitch --label "basic-pitch 0.4.0 CLI $BACKEND ${LABEL:-defaults} on $id" --input ${C[$id]} -- \
    $VENV/bin/basic-pitch --model-serialization $BACKEND --save-midi --save-model-outputs --save-note-events "$@" $out ${C[$id]} > $out/stdout.log 2>&1
done
