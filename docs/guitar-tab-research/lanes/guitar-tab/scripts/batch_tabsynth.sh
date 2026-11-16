#!/bin/bash
# Every tabsynth run of the guitar-tab lane on the merged truth MIDI. One gtr-run call wraps this script.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
PY="$L/venv-sym/bin/python -I $S/run_tabsynth.py"; O=$L/out/tabsynth; M=$L/inputs/merged
for c in S1 S2n S3 S5capo2 S5dropd R1a R1b R1c; do $PY $M/$c.merged.mid $O --name $c.truthmidi.groups --mode groups; $PY $M/$c.merged.mid $O --name $c.truthmidi.notes --mode notes; done
$PY $M/S5capo2.merged.mid $O --name S5capo2.truthmidi.notes.transposed-2 --mode notes --transpose -2
$PY $M/S5capo2.merged.mid $O --name S5capo2.truthmidi.groups.transposed-2 --mode groups --transpose -2
$PY $M/R1b.merged.mid $O --name R1b.truthmidi.notes.maxfret5 --mode notes --max-fret 5
