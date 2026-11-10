#!/bin/bash
# Chain A: tuttut tab + a beat tracker's beats/downbeats + a chord recogniser's labels -> Guitar Pro 5 (tab_beats_to_gp5.py),
# with the three tempo choices of the glue (median, span, perbar). Beat and chord files are the chords-beats-key
# lane's outputs (not re-run here).
set +e
C=/home/user/gtr/lanes/chains; S=/home/user/blog/docs/guitar-tab-research/lanes/chains/scripts
K=/home/user/gtr/lanes/chords-beats-key/out; P="/home/user/gtr/lanes/guitar-tab/venv-sym/bin/python -I"
mkdir -p $C/out/gp5
T6=$C/out/tab/tuttut/S4sep6s-guitar.bp.gtreval.json; TR=$C/out/tab/tuttut/R2sep6s-guitar.bp.gtreval.json
for m in median span perbar; do
$P $S/tab_beats_to_gp5.py $T6 $K/madmom/S4/downbeats.txt $C/out/gp5/S4.madmom.$m.gp5 --tempo $m --beat-numbers --chords $K/madmom/S4/chords_cnn.lab --title "S4 chain A: htdemucs_6s guitar, Basic Pitch, tuttut, madmom beats and CNN chords"
$P $S/tab_beats_to_gp5.py $T6 $K/beat_this/S4/final0_beats.txt $C/out/gp5/S4.beatthis.$m.gp5 --tempo $m --downbeats $K/beat_this/S4/final0_downbeats.txt --chords $K/chordino/S4/chords_chordino.lab --title "S4 chain A: htdemucs_6s guitar, Basic Pitch, tuttut, Beat This beats, Chordino chords"
$P $S/tab_beats_to_gp5.py $TR $K/madmom/R2/downbeats.txt $C/out/gp5/R2.madmom.$m.gp5 --tempo $m --beat-numbers --chords $K/chordino/R2/chords_chordino.lab --title "R2 chain A: htdemucs_6s guitar, Basic Pitch, tuttut, madmom beats, Chordino chords"
$P $S/tab_beats_to_gp5.py $TR $K/beat_this/R2/final0_beats.txt $C/out/gp5/R2.beatthis.$m.gp5 --tempo $m --downbeats $K/beat_this/R2/final0_downbeats.txt --chords $K/madmom/R2/chords_cnn.lab --title "R2 chain A: htdemucs_6s guitar, Basic Pitch, tuttut, Beat This beats, madmom CNN chords"
done
