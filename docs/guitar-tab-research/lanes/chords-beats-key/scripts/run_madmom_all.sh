#!/bin/bash
# Runs madmom_run.py on each clip through gtr-run (one ledgered run per clip, 2 cores).
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/chords-beats-key
S=/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/scripts
PY=$L/venv-madmom39/bin/python
CLIPS=${CLIPS:-"S3 S4 S7flat30 S2n S2s S5capo2 S5dropd R1a R1b R1c R2 R2full"}
for id in $CLIPS; do
  in=/home/user/gtr/inputs/$id/$id.wav
  out=$L/out/madmom/$id
  mkdir -p $out
  gtr-run --lane chords-beats-key --tool madmom --label "madmom 0.16.1 beats+downbeats+tempo+chords(CNN,deepchroma)+key on $id" --input $in -- \
    $PY -I $S/madmom_run.py --audio $in --outdir $out > $out/stdout.txt 2> $out/stderr.txt
  echo "$id exit=$? $(grep -o 'gtr-run r[0-9]*.*' $out/stderr.txt | tail -1)"
done
