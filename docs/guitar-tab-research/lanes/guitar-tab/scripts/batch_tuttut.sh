#!/bin/bash
# Every tuttut run of the guitar-tab lane on the truth MIDI (perfect notes in). One gtr-run call wraps this script.
set +e  # keep going: one constraint run (span 7) fails by design of tuttut, see trials.md
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
PY="$L/venv-sym/bin/python -I $S/run_tuttut.py"; O=$L/out/tuttut; M=$L/inputs/merged
for c in S1 S2n S3 S5capo2 S5dropd R1a R1b R1c; do $PY $M/$c.merged.mid $O --name $c.truthmidi; done
# constraints
$PY $M/S5capo2.merged.mid $O --name S5capo2.truthmidi.capo2 --capo 2
$PY $M/S5dropd.merged.mid $O --name S5dropd.truthmidi.dropD --tuning 38,45,50,55,59,64
$PY $M/S5capo2.merged.minus2.mid $O --name S5capo2.truthmidi.transposed-2   # capo workaround 2: notes moved down 2 semitones
$PY $M/R1c.merged.mid $O --name R1c.truthmidi.nfrets12 --nfrets 12
$PY $M/R1c.merged.mid $O --name R1c.truthmidi.span3 --max-span 3
$PY $M/R1c.merged.mid $O --name R1c.truthmidi.span7 --max-span 7
$PY $M/S2n.merged.mid $O --name S2n.truthmidi.nfrets3 --nfrets 3
