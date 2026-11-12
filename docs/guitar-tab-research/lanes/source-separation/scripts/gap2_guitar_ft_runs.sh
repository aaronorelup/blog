#!/bin/bash
# Gap round 2: `adityalakhani/htdemucs-6s-guitar-ft` through scripts/gap2_guitar_ft.py (the steps of the repo's
# inference.py, with demucs 4.1.0 from the lane's venv-demucs), and the stock htdemucs_6s weights through the same
# script as a control. Every run is its own `gtr-run` job in a 2-core slot. Arguments pick runs as <variant>:<clip>,
# variant ft or stock; default: ft:S4 ft:R2 stock:S4 ft:S6taps ft:S2s stock:S6taps.
# Outputs: /home/user/gtr/lanes/source-separation/out/htdemucs-6s-guitar-ft/<clip>/ (ft) and
#          /home/user/gtr/lanes/source-separation/out/htdemucs_6s-via-ft-script/<clip>/ (stock control).
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
S=/home/user/blog/docs/guitar-tab-research/lanes/source-separation/scripts
PY=$L/venv-demucs/bin/python
CK=$L/gap2/models/guitar-ft/guitar_htdemucs_6s.pt
mkdir -p $L/gap2/work && cd $L/gap2/work
echo "gap2 guitar-ft runs start $(date -u +%FT%TZ)"
for spec in ${*:-ft:S4 ft:R2 stock:S4 ft:S6taps ft:S2s stock:S6taps}; do
  v=${spec%%:*}; clip=${spec#*:}; wav=/home/user/gtr/inputs/$clip/$clip.wav
  if [ "$v" = ft ]; then
    out=$L/out/htdemucs-6s-guitar-ft/$clip
    gtr-run --lane source-separation --tool htdemucs-6s-guitar-ft --label "gap2: guitar_htdemucs_6s.pt (epoch 60) via gap2_guitar_ft.py on $clip, shifts 1, overlap 0.25, segment 7.8, seed 0" \
      --input "$wav" --input "$CK" -- $PY -I $S/gap2_guitar_ft.py --input "$wav" --outdir "$out" --checkpoint "$CK"
  else
    out=$L/out/htdemucs_6s-via-ft-script/$clip
    gtr-run --lane source-separation --tool htdemucs_6s-via-ft-script --label "gap2: stock htdemucs_6s via gap2_guitar_ft.py (control) on $clip, shifts 1, overlap 0.25, segment 7.8, seed 0" \
      --input "$wav" -- $PY -I $S/gap2_guitar_ft.py --input "$wav" --outdir "$out"
  fi
done
echo "gap2 guitar-ft runs end $(date -u +%FT%TZ)"
