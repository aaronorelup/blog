#!/bin/bash
# Every tayuya run of the guitar-tab lane on the merged truth MIDI (perfect notes in). One gtr-run call wraps this script.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
PY="$L/venv-sym/bin/python -I $S/run_tayuya.py"; O=$L/out/tayuya; M=$L/inputs/merged
for c in S1 S2n S3 S5capo2 S5dropd R1a R1b R1c; do $PY $M/$c.merged.mid $O --name $c.truthmidi; done
$PY $M/S5capo2.merged.minus2.mid $O --name S5capo2.truthmidi.transposed-2   # capo workaround: notes moved down 2 semitones
