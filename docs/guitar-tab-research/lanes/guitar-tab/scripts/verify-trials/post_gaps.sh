#!/bin/bash
# verify-trials-guitar-tab (run by the verifier): after guitar-gaps.pth on S2n, score the notes (gtr-eval notes,
# logged), merge the MIDI to one track with velocity-0 note_on rewritten as note_off (the trial agent's merge_midi.py),
# run tuttut 0.0.7 and LilyPond 2.24.3 with defaults on it (one gtr-run --nolock call), and score the tab (gtr-eval tab).
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
V=$L/verify-trials/hfmt; P="$L/venv-sym/bin/python -I"
gtr-eval notes --truth S2n --est $V/S2n.guitar-gaps.mid --out $V/S2n.guitar-gaps.notes-eval.json > /dev/null
$P $S/merge_midi.py $V/S2n.guitar-gaps.mid $V/S2n.guitar-gaps.merged.mid --vel0-to-noteoff > /dev/null
gtr-run --lane guitar-tab --tool midi-to-tab-handoff --nolock --label "verify (run by the verifier): tuttut and LilyPond on guitar-gaps.pth MIDI of S2n (light job, no slot)" --input $V/S2n.guitar-gaps.mid -- bash -c "$P $S/run_tuttut.py $V/S2n.guitar-gaps.merged.mid $V/tuttut --name S2n.guitar-gaps; $P $S/run_lilypond_tab.py $V/S2n.guitar-gaps.merged.mid $V/lilypond --name S2n.guitar-gaps"
gtr-eval tab --truth S2n --est $V/tuttut/S2n.guitar-gaps.gtreval.json --out $V/S2n.guitar-gaps.tuttut-tab-eval.json > /dev/null
gtr-eval tab --truth S2n --est $V/lilypond/S2n.guitar-gaps.gtreval.json --out $V/S2n.guitar-gaps.lilypond-tab-eval.json > /dev/null
