#!/bin/bash
# verify-trials-guitar-tab (run by the verifier): Basic Pitch MIDI of R3b and R3c (audio-to-notes lane, run r0264,
# out/basic-pitch/tflite-default-R3bc/) -> merged to one track -> tuttut 0.0.7 and LilyPond 2.24.3, defaults.
# The same glue scripts and settings as the trial agent's R3a run r0301. No truth exists for R3b/R3c.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
V=$L/verify-trials; I=$V/inputs/bp-a2n; O=$V/r3bc; P="$L/venv-sym/bin/python -I"
mkdir -p $I $O/tuttut $O/lilypond
for c in R3b R3c; do
  cp /home/user/gtr/lanes/audio-to-notes/out/basic-pitch/tflite-default-R3bc/$c.mid $I/$c.bp.mid
  $P $S/merge_midi.py $I/$c.bp.mid $I/$c.bp.merged.mid > /dev/null
  $P $S/run_tuttut.py $I/$c.bp.merged.mid $O/tuttut --name $c.bp
  $P $S/run_lilypond_tab.py $I/$c.bp.merged.mid $O/lilypond --name $c.bp
done
sha256sum $I/R3b.bp.mid $I/R3c.bp.mid
