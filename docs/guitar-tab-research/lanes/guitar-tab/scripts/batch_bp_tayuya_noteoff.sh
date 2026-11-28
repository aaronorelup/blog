#!/bin/bash
# tayuya on the Basic Pitch MIDI with velocity-0 note_on messages rewritten as note_off (glue: merge_midi.py --vel0-to-noteoff)
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts; M=$L/inputs/bp-a2n; O=$L/out/handoff-bp/tayuya
for c in S1 S2n S3 S5capo2 S5dropd R1a R1b R1c; do $L/venv-sym/bin/python -I $S/run_tayuya.py $M/$c.bp.merged.noteoff.mid $O --name $c.bp.noteoff 2>&1 | tail -1; done
