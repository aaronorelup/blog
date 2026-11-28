#!/bin/bash
# verify-trials-guitar-tab: re-run one or more representative trials per MIDI-to-tab tool with the trial agent's own
# glue scripts and recorded arguments; outputs go to verify-trials/rerun/<tool>/ (the originals are not touched).
# One gtr-run --nolock call wraps this script (light jobs, as the original runs were except tuttut/tayuya).
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
V=$L/verify-trials/rerun; P="$L/venv-sym/bin/python -I"; M=$L/inputs/merged; B=$L/inputs/bp-a2n
mkdir -p $V/tuttut $V/tayuya $V/lilypond $V/tabsynth $V/tutts $V/gp5 $V/handoff-bp/tuttut $V/handoff-bp/tayuya $V/handoff-bp/lilypond
echo "== tuttut (r0048 items)"
$P $S/run_tuttut.py $M/R1c.merged.mid $V/tuttut --name R1c.truthmidi
$P $S/run_tuttut.py $M/S5dropd.merged.mid $V/tuttut --name S5dropd.truthmidi.dropD --tuning 38,45,50,55,59,64
$P $S/run_tuttut.py $M/S5capo2.merged.mid $V/tuttut --name S5capo2.truthmidi.capo2 --capo 2
$P $S/run_tuttut.py $M/R1c.merged.mid $V/tuttut --name R1c.truthmidi.span7 --max-span 7 2>&1 | tail -2
echo "== tuttut, not run by the trial: MAX_FRET_SPAN 6 on R1c"
$P $S/run_tuttut.py $M/R1c.merged.mid $V/tuttut --name R1c.truthmidi.span6 --max-span 6 2>&1 | tail -2
echo "== tayuya (r0117 items)"
$P $S/run_tayuya.py $M/S2n.merged.mid $V/tayuya --name S2n.truthmidi
$P $S/run_tayuya.py $M/R1c.merged.mid $V/tayuya --name R1c.truthmidi
echo "== LilyPond (r0145, r0155 items)"
$P $S/run_lilypond_tab.py $M/R1a.merged.mid $V/lilypond --name R1a.truthmidi
$P $S/run_lilypond_tab.py $M/S2n.merged.mid $V/lilypond --name S2n.truthmidi.pin0-55-s4 --pin 0:55:4
echo "== tabsynth (r0186 items)"
$P $S/run_tabsynth.py $M/S2n.merged.mid $V/tabsynth --name S2n.truthmidi.groups --mode groups
$P $S/run_tabsynth.py $M/R1b.merged.mid $V/tabsynth --name R1b.truthmidi.notes.maxfret5 --mode notes --max-fret 5
echo "== tutts (r0205 items)"
$P $S/run_tutts.py $M/R1c.merged.mid $V/tutts --name R1c.truthmidi.q16 --quantize 1/16
$P $S/run_tutts.py $M/S5dropd.merged.mid $V/tutts --name S5dropd.truthmidi.dropD --tuning 38,45,50,55,59,64
echo "== Basic Pitch handoff (r0240 items)"
$P $S/run_tuttut.py $B/R1c.bp.merged.mid $V/handoff-bp/tuttut --name R1c.bp
$P $S/run_lilypond_tab.py $B/S3.bp.merged.mid $V/handoff-bp/lilypond --name S3.bp
$P $S/run_tayuya.py $B/S2n.bp.merged.mid $V/handoff-bp/tayuya --name S2n.bp 2>&1 | tail -1
echo "== tayuya, not run by the trial: a MIDI file holding only C4 at 0 s and D#6 (MIDI 87) at 1 s"
$P $S/run_tayuya.py $L/verify-trials/two_notes_C4_Ds6.mid $V/handoff-bp/tayuya --name two_notes 2>&1 | tail -1
echo "== PyGuitarPro glue (GP5 files listed in trials.md)"
$P $S/gtreval_to_gp5.py $L/out/tuttut/S5capo2.truthmidi.capo2.gtreval.json $V/gp5/tuttut_S5capo2.truthmidi.capo2.gp5 --bpm 112
$P $S/gtreval_to_gp5.py $L/out/handoff-bp/tuttut/R1c.bp.gtreval.json $V/gp5/bp-tuttut_R1c.bp.gp5 --bpm 119
$P $S/gtreval_to_gp5.py $L/out/handoff-bp/tuttut/S2n.bp.gtreval.json $V/gp5/bp-tuttut_S2n.bp.gp5 --bpm 112
