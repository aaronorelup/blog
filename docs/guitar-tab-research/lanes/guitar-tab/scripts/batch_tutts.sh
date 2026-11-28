#!/bin/bash
# Every tutts run of the guitar-tab lane on the merged truth MIDI. One gtr-run call wraps this script.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
PY="$L/venv-sym/bin/python -I $S/run_tutts.py"; O=$L/out/tutts; M=$L/inputs/merged
for c in S1 S2n S3 S5capo2 S5dropd R1a R1b R1c; do $PY $M/$c.merged.mid $O --name $c.truthmidi; done
$PY $M/S5capo2.merged.mid $O --name S5capo2.truthmidi.capo2 --capo 2
$PY $M/S5dropd.merged.mid $O --name S5dropd.truthmidi.dropD --tuning 38,45,50,55,59,64
$PY $M/R1c.merged.mid $O --name R1c.truthmidi.q16 --quantize 1/16
