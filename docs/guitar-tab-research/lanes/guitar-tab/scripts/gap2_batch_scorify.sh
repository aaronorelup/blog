#!/bin/bash
# gap round 2: scorify 0.4.0 (npm) on the merged truth MIDI ("perfect notes in"), default player (level maestro),
# exact mode, classicalGuitar() preset (E2 A2 D3 G3 B3 E4, 19 frets); capo and Drop D runs; outputs in gap2/scorify/.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
P="$L/venv-sym/bin/python -I"; M=$L/inputs/merged; O=${SCORIFY_OUT:-$L/gap2/scorify}
for c in S1 S2n S3 S5capo2 S5dropd R1a R1b R1c; do
  /usr/bin/time -f "  $c: process wall %e s, maxrss %M KB" $P $S/gap2_run_scorify.py $M/$c.merged.mid $O --name $c.truthmidi
done
/usr/bin/time -f "  S5capo2 capo 2: process wall %e s, maxrss %M KB" $P $S/gap2_run_scorify.py $M/S5capo2.merged.mid $O --name S5capo2.truthmidi.capo2 --capo 2
/usr/bin/time -f "  S5dropd Drop D: process wall %e s, maxrss %M KB" $P $S/gap2_run_scorify.py $M/S5dropd.merged.mid $O --name S5dropd.truthmidi.dropD --tuning 38,45,50,55,59,64
