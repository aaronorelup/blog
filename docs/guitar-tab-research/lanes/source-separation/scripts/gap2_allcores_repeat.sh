#!/bin/bash
# Gap round 2: htdemucs on R2full once more with 4 cores (repeat of r0659) and once with 2 cores in the same session,
# each with scripts/gap2_box_sampler.py recording how busy the box was and how much of it was the job.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
D=/home/user/blog/docs/guitar-tab-research/lanes/source-separation
WAV=/home/user/gtr/inputs/R2full/R2full.wav
mkdir -p $L/gap2/work $D/samples/demucs-allcores && cd $L/gap2/work
echo "gap2 all-cores repeat start $(date -u +%FT%TZ)"
for spec in ${*:-4:htdemucs 2:htdemucs}; do
  n=${spec%%:*}; m=${spec#*:}; O=$L/gap2/allcores-repeat-${n}c
  python3 $D/scripts/gap2_box_sampler.py $D/samples/demucs-allcores/boxsampler_${m}_R2full_${n}cores_repeat.json \
    "allcores-repeat-${n}c" --interval 2 --max-seconds 1500 &
  sp=$!
  if [ "$n" = 4 ]; then
    gtr-run --all-cores --lane source-separation --tool demucs-4.1.0 \
      --label "gap2: demucs -n $m on R2full, 4 cores (--all-cores), repeat with a box-load sampler" \
      --input "$WAV" -- $L/venv-demucs/bin/demucs -n $m -d cpu -o $O "$WAV"
  else
    gtr-run --lane source-separation --tool demucs-4.1.0 \
      --label "gap2: demucs -n $m on R2full, 2 cores, same session as the 4-core runs, with a box-load sampler" \
      --input "$WAV" -- $L/venv-demucs/bin/demucs -n $m -d cpu -o $O "$WAV"
  fi
  wait $sp
done
echo "gap2 all-cores repeat end $(date -u +%FT%TZ)"
