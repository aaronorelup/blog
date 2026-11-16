#!/bin/bash
# Chain C additions (the no-hint / hint tab runs on Basic Pitch notes were run by the guitar-tab lane, r0240):
#  1. the Drop D correction given to both stages: the audio-to-notes lane's Basic Pitch re-run with a Drop D range
#     (r0349, minimum_frequency 73.4 Hz) -> merge_midi.py -> tuttut and LilyPond told Drop D;
#  2. a pinned note: LilyPond (the one tool here with a per-note string input, note\N) on the S5dropd Basic Pitch notes
#     with Drop D told, chord group 1's G3 (MIDI 55) pinned to string 4.
set +e
C=/home/user/gtr/lanes/chains; G=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
P="/home/user/gtr/lanes/guitar-tab/venv-sym/bin/python -I"; O=$C/out/chainC
mkdir -p $O/tuttut $O/lilypond
cp /home/user/gtr/lanes/audio-to-notes/out/basic-pitch/dropd-range/S5dropd.mid $C/inputs/S5dropd.bp-dropdrange.mid
$P $G/merge_midi.py $C/inputs/S5dropd.bp-dropdrange.mid $O/S5dropd.bp-dropdrange.merged.mid
$P $G/run_tuttut.py $O/S5dropd.bp-dropdrange.merged.mid $O/tuttut --name S5dropd.bpDropDrange.dropD --tuning 38,45,50,55,59,64
$P $G/run_lilypond_tab.py $O/S5dropd.bp-dropdrange.merged.mid $O/lilypond --name S5dropd.bpDropDrange.dropD --tuning 38,45,50,55,59,64
$P $G/run_lilypond_tab.py /home/user/gtr/lanes/guitar-tab/inputs/bp-a2n/S5dropd.bp.merged.mid $O/lilypond --name S5dropd.bp.dropD.pin1-55-s4 --tuning 38,45,50,55,59,64 --pin 1:55:4
