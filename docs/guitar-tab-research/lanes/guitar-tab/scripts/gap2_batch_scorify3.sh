#!/bin/bash
# gap round 2: scorify 0.4.0, third batch: R1a and R1b with one player capability relaxed each (exact mode otherwise
# default), after the prefix bisection (r0630) found where they first fail.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
P="$L/venv-sym/bin/python -I"; M=$L/inputs/merged; O=$L/gap2/scorify
echo "== R1a, minDuration 1/256 quarter (default 1/64)"; $P $S/gap2_run_scorify.py $M/R1a.merged.mid $O --name R1a.truthmidi.mindur256 --override minDuration=1/256
echo "== R1b, maxAttacksPerSecond 64 (default 32)"; $P $S/gap2_run_scorify.py $M/R1b.merged.mid $O --name R1b.truthmidi.attacks64 --override maxAttacksPerSecond=64
echo "== R1a, both"; $P $S/gap2_run_scorify.py $M/R1a.merged.mid $O --name R1a.truthmidi.mindur256-attacks64 --override minDuration=1/256 --override maxAttacksPerSecond=64
