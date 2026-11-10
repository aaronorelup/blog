#!/bin/bash
# Every LilyPond automatic-tab run of the guitar-tab lane on the merged truth MIDI. One gtr-run call wraps this script.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
PY="$L/venv-sym/bin/python -I $S/run_lilypond_tab.py"; O=$L/out/lilypond; M=$L/inputs/merged
for c in S1 S3 S5capo2 S5dropd R1a R1b R1c; do $PY $M/$c.merged.mid $O --name $c.truthmidi; done
$PY $M/S2n.merged.mid $O --name S2n.truthmidi --png
$PY $M/S5capo2.merged.mid $O --name S5capo2.truthmidi.capo2 --capo-as-tuning 2
$PY $M/S5dropd.merged.mid $O --name S5dropd.truthmidi.dropD --tuning 38,45,50,55,59,64 --png
$PY $M/S1.merged.mid $O --name S1.truthmidi.minfret5 --minimum-fret 5
$PY $M/S2n.merged.mid $O --name S2n.truthmidi.restrainopen --restrain-open
$PY $M/R1c.merged.mid $O --name R1c.truthmidi.minfret3 --minimum-fret 3
$PY $M/R1b.merged.mid $O --name R1b.truthmidi.minfret5 --minimum-fret 5
