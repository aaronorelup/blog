#!/bin/bash
# Generic driver: runs one of this lane's scripts on each clip through gtr-run (one ledgered run per clip).
# Usage: CLIPS="S3 S4" run_tool_all.sh <tool-name> <venv-python> <script.py> "<label prefix>" [extra args for the script]
# The script is called as: <python> -I <script.py> --audio /home/user/gtr/inputs/<id>/<id>.wav --outdir <lane>/out/<tool>/<id> [extra]
# AUDIO_SUFFIX (default ".wav") picks <id><suffix>, e.g. ".mono.wav".
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/chords-beats-key
tool=$1; PY=$2; SCRIPT=$3; LABEL=$4; shift 4
SUF=${AUDIO_SUFFIX:-.wav}
CLIPS=${CLIPS:-"S3 S4 S7flat30 S2n S2s S5capo2 S5dropd R1a R1b R1c R2 R2full"}
for id in $CLIPS; do
  in=/home/user/gtr/inputs/$id/$id$SUF
  out=$L/out/$tool/$id
  mkdir -p $out
  gtr-run --lane chords-beats-key --tool $tool --label "$LABEL on $id" --input $in -- \
    $PY -I $SCRIPT --audio $in --outdir $out "$@" > $out/stdout.txt 2> $out/stderr.txt
  echo "$id exit=$? $(grep -o 'gtr-run r[0-9]*.*' $out/stderr.txt | tail -1)"
done
