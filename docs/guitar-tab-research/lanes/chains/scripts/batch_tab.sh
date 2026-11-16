#!/bin/bash
# Chains A and B, the "notes -> string and fret" joints. One gtr-run call.
# Chain A: Basic Pitch MIDI of two separators' guitar stems (S4) and of htdemucs_6s on R2 -> the guitar-tab lane's
#          merge_midi.py -> tuttut 0.0.7 (run_tuttut.py) and LilyPond 2.24.3 (run_lilypond_tab.py), defaults.
# Chain B: voice-labelled Basic Pitch notes of the HPSS harmonic part -> chainB_voice_tab.py (tuttut pooled / per voice).
set +e
C=/home/user/gtr/lanes/chains; G=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
S=/home/user/blog/docs/guitar-tab-research/lanes/chains/scripts
P="/home/user/gtr/lanes/guitar-tab/venv-sym/bin/python -I"
A2N=/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/handoff-htdemucs6s
mkdir -p $C/out/tab/merged $C/out/tab/tuttut $C/out/tab/lilypond $C/out/tab/chainB
cp $A2N/S4sep6s-guitar.mid $C/inputs/S4sep6s-guitar.bp.mid
cp $C/out/bp/S4becruily-Guitar.mid $C/inputs/S4becruily-Guitar.bp.mid
cp $C/out/bp/R2sep6s-guitar.mid $C/inputs/R2sep6s-guitar.bp.mid
for n in S4sep6s-guitar S4becruily-Guitar R2sep6s-guitar; do
  $P $G/merge_midi.py $C/inputs/$n.bp.mid $C/out/tab/merged/$n.bp.merged.mid
  $P $G/run_tuttut.py $C/out/tab/merged/$n.bp.merged.mid $C/out/tab/tuttut --name $n.bp
  $P $G/run_lilypond_tab.py $C/out/tab/merged/$n.bp.merged.mid $C/out/tab/lilypond --name $n.bp
done
for clip in S6taps S2s; do
  for m in B1_threshold_T55 M1_music21; do
    $P $S/chainB_voice_tab.py $C/out/voicesplit/$clip/$m.csv $C/out/tab/chainB --name $clip.$m
  done
done
