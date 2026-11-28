#!/bin/bash
# verify-gapfill-source-separation (round 2, resumed 2026-11-12): re-run of the gap round's 4-core whole-song run r0660
# (demucs -n htdemucs_6s on R2full, `gtr-run --all-cores`), then the same command on 2 cores in the same session (the
# 2-core figure for htdemucs_6s in the record is r0477, from the first round), each with the gap round's own box
# sampler (scripts/gap2_box_sampler.py). Stem facts with scripts/stem_facts.py; the audio is deleted afterwards.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
D=/home/user/blog/docs/guitar-tab-research/lanes/source-separation
V=$L/verify-gap2/r2b
WAV=/home/user/gtr/inputs/R2full/R2full.wav
mkdir -p $V/out $V/work $D/samples/verify-gap2 && cd $V/work
echo "verify all-cores re-run start $(date -u +%FT%TZ)"
for n in 4 2; do
  O=$V/out/v-${n}c
  python3 -I $D/scripts/gap2_box_sampler.py $D/samples/verify-gap2/boxsampler_htdemucs_6s_R2full_${n}cores_verify.json \
    "r2b/out/v-${n}c" --interval 2 --max-seconds 1500 &
  sp=$!
  if [ "$n" = 4 ]; then
    gtr-run --all-cores --lane source-separation --tool demucs-4.1.0 \
      --label "verify (verify-gapfill-source-separation, round 2, resumed): re-run of r0660, demucs -n htdemucs_6s on R2full, 4 cores (--all-cores), with the gap round's box sampler" \
      --input "$WAV" -- $L/venv-demucs/bin/demucs -n htdemucs_6s -d cpu -o $O "$WAV"
  else
    gtr-run --lane source-separation --tool demucs-4.1.0 \
      --label "verify (verify-gapfill-source-separation, round 2, resumed): demucs -n htdemucs_6s on R2full, 2 cores, same session as the 4-core re-run of r0660 (command of r0477), with the gap round's box sampler" \
      --input "$WAV" -- $L/venv-demucs/bin/demucs -n htdemucs_6s -d cpu -o $O "$WAV"
  fi
  wait $sp
  $L/venv-librosa/bin/python -I $D/scripts/stem_facts.py "$WAV" $O/htdemucs_6s/R2full \
    $D/samples/verify-gap2/stemfacts_htdemucs_6s_R2full_${n}cores_verify.json > /dev/null
done
du -sh $V/out
rm -rf $V/out/v-4c $V/out/v-2c
echo "verify all-cores re-run end $(date -u +%FT%TZ)"
