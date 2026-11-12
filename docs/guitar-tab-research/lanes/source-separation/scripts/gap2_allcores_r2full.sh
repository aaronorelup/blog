#!/bin/bash
# Gap round 2: whole-box (4-core) timings of Demucs 4.1.0 htdemucs and htdemucs_6s on the whole song R2full
# (228.5 s), next to the 2-core runs r0472 and r0477. Same command as those runs except the output folder; each run is
# a `gtr-run --all-cores` job (both slots, CPUs 0-3, OMP_NUM_THREADS=4).
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
WAV=/home/user/gtr/inputs/R2full/R2full.wav
O=$L/gap2/allcores
mkdir -p $O $L/gap2/work && cd $L/gap2/work
echo "gap2 all-cores start $(date -u +%FT%TZ)"
for m in ${*:-htdemucs htdemucs_6s}; do
  gtr-run --all-cores --lane source-separation --tool demucs-4.1.0 \
    --label "gap2: demucs -n $m on R2full (whole song), 4 cores (--all-cores), same command as the 2-core run" \
    --input "$WAV" -- $L/venv-demucs/bin/demucs -n $m -d cpu -o $O "$WAV"
done
echo "gap2 all-cores end $(date -u +%FT%TZ)"
