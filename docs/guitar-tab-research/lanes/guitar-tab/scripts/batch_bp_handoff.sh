#!/bin/bash
# "Transcribed notes in": the MIDI-to-tab tools on Basic Pitch MIDI made by the audio-to-notes lane
# (out/basic-pitch/tflite-default/<clip>.mid, copied and merged to one track in inputs/bp-a2n/). One gtr-run call.
set +e
L=/home/user/gtr/lanes/guitar-tab; S=/home/user/blog/docs/guitar-tab-research/lanes/guitar-tab/scripts
P="$L/venv-sym/bin/python -I"; M=$L/inputs/bp-a2n; O=$L/out/handoff-bp
mkdir -p $O/tuttut $O/tutts $O/tayuya $O/lilypond $O/tabsynth
for c in S1 S2n S3 S5capo2 S5dropd R1a R1b R1c; do
  $P $S/run_tuttut.py $M/$c.bp.merged.mid $O/tuttut --name $c.bp
  $P $S/run_tutts.py $M/$c.bp.merged.mid $O/tutts --name $c.bp | grep -v "^tutts:"
  $P $S/run_tayuya.py $M/$c.bp.merged.mid $O/tayuya --name $c.bp
  $P $S/run_lilypond_tab.py $M/$c.bp.merged.mid $O/lilypond --name $c.bp
  $P $S/run_tabsynth.py $M/$c.bp.merged.mid $O/tabsynth --name $c.bp.notes --mode notes
  $P $S/run_tabsynth.py $M/$c.bp.merged.mid $O/tabsynth --name $c.bp.groups --mode groups
done
# constraints told
$P $S/run_tuttut.py $M/S5capo2.bp.merged.mid $O/tuttut --name S5capo2.bp.capo2 --capo 2
$P $S/run_tuttut.py $M/S5dropd.bp.merged.mid $O/tuttut --name S5dropd.bp.dropD --tuning 38,45,50,55,59,64
$P $S/run_tutts.py $M/S5capo2.bp.merged.mid $O/tutts --name S5capo2.bp.capo2 --capo 2 | grep -v "^tutts:"
$P $S/run_tutts.py $M/S5dropd.bp.merged.mid $O/tutts --name S5dropd.bp.dropD --tuning 38,45,50,55,59,64 | grep -v "^tutts:"
$P $S/run_lilypond_tab.py $M/S5capo2.bp.merged.mid $O/lilypond --name S5capo2.bp.capo2 --capo-as-tuning 2
$P $S/run_lilypond_tab.py $M/S5dropd.bp.merged.mid $O/lilypond --name S5dropd.bp.dropD --tuning 38,45,50,55,59,64
$P $S/run_tayuya.py $M/S5capo2.bp.merged.minus2.mid $O/tayuya --name S5capo2.bp.transposed-2
$P $S/run_tabsynth.py $M/S5capo2.bp.merged.mid $O/tabsynth --name S5capo2.bp.notes.transposed-2 --mode notes --transpose -2
