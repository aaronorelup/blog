#!/bin/bash
# verify-trials-guitar-tab (run by the verifier): score guitar-gaps.pth MIDI of S3, R1b, R1c (gtr-eval notes), merge to
# one track (velocity-0 note_on -> note_off), tuttut 0.0.7 and LilyPond 2.24.3 defaults (one gtr-run --nolock call),
# then gtr-eval tab. Same steps as post_gaps.sh.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
V=$L/verify-trials/hfmt; P="$L/venv-sym/bin/python -I"
for c in S3 R1b R1c; do
  gtr-eval notes --truth $c --est $V/$c.guitar-gaps.mid --out $V/$c.guitar-gaps.notes-eval.json > /dev/null
  $P $S/merge_midi.py $V/$c.guitar-gaps.mid $V/$c.guitar-gaps.merged.mid --vel0-to-noteoff > /dev/null
done
gtr-run --lane guitar-tab --tool midi-to-tab-handoff --nolock --label "verify (run by the verifier): tuttut and LilyPond on guitar-gaps.pth MIDI of S3 R1b R1c (light job, no slot)" --input $V/R1c.guitar-gaps.mid -- bash -c "for c in S3 R1b R1c; do $P $S/run_tuttut.py $V/\$c.guitar-gaps.merged.mid $V/tuttut --name \$c.guitar-gaps; $P $S/run_lilypond_tab.py $V/\$c.guitar-gaps.merged.mid $V/lilypond --name \$c.guitar-gaps; done"
for c in S3 R1b R1c; do
  gtr-eval tab --truth $c --est $V/tuttut/$c.guitar-gaps.gtreval.json --out $V/$c.guitar-gaps.tuttut-tab-eval.json > /dev/null
  gtr-eval tab --truth $c --est $V/lilypond/$c.guitar-gaps.gtreval.json --out $V/$c.guitar-gaps.lilypond-tab-eval.json > /dev/null
done
