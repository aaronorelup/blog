#!/bin/bash
# verify-gapfill-source-separation (round 2): re-run of r0636 (adityalakhani/htdemucs-6s-guitar-ft on S4 through
# scripts/gap2_guitar_ft.py, seed 0) with a fresh download of the checkpoint, output under verify-gap2/out/.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
V=$L/verify-gap2
CK=$V/models/guitar-ft/guitar_htdemucs_6s.pt
mkdir -p $V/work && cd $V/work
wav=/home/user/gtr/inputs/S4/S4.wav
gtr-run --lane source-separation --tool htdemucs-6s-guitar-ft \
  --label "verify (verify-gapfill-source-separation, round 2): re-run of r0636, guitar_htdemucs_6s.pt via gap2_guitar_ft.py on S4, seed 0" \
  --input "$wav" --input "$CK" -- $L/venv-demucs/bin/python -I $S/gap2_guitar_ft.py --input "$wav" \
  --outdir $V/out/htdemucs-6s-guitar-ft/S4 --checkpoint "$CK"
