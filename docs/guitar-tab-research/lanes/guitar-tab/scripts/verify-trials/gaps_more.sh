#!/bin/bash
# verify-trials-guitar-tab (run by the verifier): guitar-gaps.pth on S3, R1b and R1c with the trial agent's
# run_hfmt_guitar.py (the clips its cancelled gtr-run calls had listed besides S2n). One gtr-run call wraps this script.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts; V=$L/verify-trials
for c in S3 R1b R1c; do
  echo "== $c guitar-gaps.pth"; /usr/bin/time -f "clip $c: wall %e s, maxrss %M KB" $L/venv-amt/bin/python -I $S/run_hfmt_guitar.py $V/dl/hfmt/guitar-gaps.pth /home/user/gtr/inputs/$c/$c.mono.wav $V/hfmt/$c.guitar-gaps 2>&1 | grep -v -i "warn\|portaudio\|^\s*$\|Segment"
done
