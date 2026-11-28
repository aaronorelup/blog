#!/bin/bash
# gap round 2: scorify 0.4.0, second batch: the documented options tried on the clips the first batch (r0621) could not
# place, a lower player level, and a pinned note (S2n, the first G3 asked for on string 4, as LilyPond's r0155).
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
P="$L/venv-sym/bin/python -I"; M=$L/inputs/merged; O=$L/gap2/scorify
BIG="--beam 512 --max-candidates 512 --max-expanded 5000000"
for c in R1a R1b S5capo2 S5dropd; do
  echo "== $c, larger search limits"; $P $S/gap2_run_scorify.py $M/$c.merged.mid $O --name $c.truthmidi.bigsearch $BIG
done
for c in R1a R1b; do
  echo "== $c, adaptive mode, hold shortening allowed"; $P $S/gap2_run_scorify.py $M/$c.merged.mid $O --name $c.truthmidi.adaptive-hold --mode adaptive --allow-hold-shortening
done
echo "== S5dropd (Drop D not told), adaptive mode, octave shift allowed"
$P $S/gap2_run_scorify.py $M/S5dropd.merged.mid $O --name S5dropd.truthmidi.adaptive-octave --mode adaptive --allow-octave-shift
echo "== R1c, player level amateur"; $P $S/gap2_run_scorify.py $M/R1c.merged.mid $O --name R1c.truthmidi.amateur --level amateur
echo "== S2n, note n1 (G3 at 2.143 s) pinned to string 4"; $P $S/gap2_run_scorify.py $M/S2n.merged.mid $O --name S2n.truthmidi.pin-n1-s4 --pin 1:4
