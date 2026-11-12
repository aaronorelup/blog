#!/bin/bash
# Gap round 2: stem facts, the R2 instrumental sum and gtr-eval scoring for the guitar fine-tune runs
# (scripts/gap2_guitar_ft_runs.sh). Run as one `gtr-run` job so the scoring sits in a 2-core slot.
source /home/user/gtr/env.sh
L=/home/user/gtr/lanes/source-separation
D=/home/user/blog/docs/guitar-tab-research/lanes/source-separation
S=$D/scripts
PY=$L/venv-librosa/bin/python
IN=/home/user/gtr/inputs
mkdir -p $D/samples/htdemucs-6s-guitar-ft $D/samples/scores
FT=$L/out/htdemucs-6s-guitar-ft
ST=$L/out/htdemucs_6s-via-ft-script
# stem facts (format, levels, stem-sum residual, projections onto the true stems where they exist)
$PY -I $S/stem_facts.py $IN/S4/S4.wav $FT/S4 $D/samples/htdemucs-6s-guitar-ft/stemfacts_guitar-ft_S4.json $IN/S4/stems
$PY -I $S/stem_facts.py $IN/S6taps/S6taps.wav $FT/S6taps $D/samples/htdemucs-6s-guitar-ft/stemfacts_guitar-ft_S6taps.json $IN/S6taps/stems
$PY -I $S/stem_facts.py $IN/S2s/S2s.wav $FT/S2s $D/samples/htdemucs-6s-guitar-ft/stemfacts_guitar-ft_S2s.json
$PY -I $S/stem_facts.py $IN/S4/S4.wav $ST/S4 $D/samples/htdemucs-6s-guitar-ft/stemfacts_stock-via-script_S4.json $IN/S4/stems
$PY -I $S/stem_facts.py $IN/S6taps/S6taps.wav $ST/S6taps $D/samples/htdemucs-6s-guitar-ft/stemfacts_stock-via-script_S6taps.json $IN/S6taps/stems
$PY -I $S/sum_stems.py $FT/R2/derived_instrumental_sum.wav $FT/R2/drums.wav $FT/R2/bass.wav $FT/R2/other.wav $FT/R2/guitar.wav $FT/R2/piano.wav
$PY -I $S/stem_facts.py $IN/R2/R2.wav $FT/R2 $D/samples/htdemucs-6s-guitar-ft/stemfacts_guitar-ft_R2.json
# scoring (same maps as the first round: e0095 / e0119 / e1399)
gtr-eval stems --truth S4 --est-dir $FT/S4 --map drums=drums.wav bass=bass.wav guitar=guitar.wav lead=vocals.wav \
  --out $D/samples/scores/gtreval_stems_htdemucs-6s-guitar-ft_S4.json
gtr-eval stems --truth S4 --est-dir $ST/S4 --map drums=drums.wav bass=bass.wav guitar=guitar.wav lead=vocals.wav \
  --out $D/samples/scores/gtreval_stems_htdemucs_6s-via-ft-script_S4.json
gtr-eval stems --truth S6taps --est-dir $FT/S6taps --map guitar=guitar.wav taps=drums.wav \
  --out $D/samples/scores/gtreval_stems_htdemucs-6s-guitar-ft_S6taps.json
gtr-eval stems --truth S6taps --est-dir $ST/S6taps --map guitar=guitar.wav taps=drums.wav \
  --out $D/samples/scores/gtreval_stems_htdemucs_6s-via-ft-script_S6taps.json
gtr-eval stems --truth R2 --est-dir $FT/R2 --map instrumental=derived_instrumental_sum.wav vocals_derived=vocals.wav \
  --out $D/samples/scores/gtreval_stems_htdemucs-6s-guitar-ft_R2.json
for c in S4 R2 S6taps S2s; do cp $FT/$c/run_info.json $D/samples/htdemucs-6s-guitar-ft/run_info_guitar-ft_$c.json; done
for c in S4 S6taps; do cp $ST/$c/run_info.json $D/samples/htdemucs-6s-guitar-ft/run_info_stock-via-script_$c.json; done
