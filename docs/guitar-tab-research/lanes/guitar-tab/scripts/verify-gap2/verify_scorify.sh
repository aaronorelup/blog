#!/bin/bash
# verify-gapfill-guitar-tab, round 2 (2026-11-11): re-run of six of the gap round's scorify 0.4.0 runs with its glue
# (scripts/gap2_run_scorify.py and .mjs, unchanged) into verify-gap2/scorify/; the gap round's gap2/scorify/ is not
# touched. Python glue in a venv with mido 1.3.3 only (the gap round's venv-sym was deleted).
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
P="$L/venv-verify-sym/bin/python -I"; M=$L/inputs/merged; O=$L/verify-gap2/scorify; mkdir -p $O
$P $S/gap2_run_scorify.py $M/S2n.merged.mid $O --name S2n.truthmidi
$P $S/gap2_run_scorify.py $M/R1c.merged.mid $O --name R1c.truthmidi
$P $S/gap2_run_scorify.py $M/R1b.merged.mid $O --name R1b.truthmidi
$P $S/gap2_run_scorify.py $M/S5capo2.merged.mid $O --name S5capo2.truthmidi.capo2 --capo 2
$P $S/gap2_run_scorify.py $M/S5dropd.merged.mid $O --name S5dropd.truthmidi.dropD --tuning 38,45,50,55,59,64
$P $S/gap2_run_scorify.py $M/S2n.merged.mid $O --name S2n.truthmidi.pin-n1-s4 --pin 1:4
$P $S/gap2_run_scorify.py $M/R1a.merged.mid $O --name R1a.truthmidi.mindur256 --override minDuration=1/256
