#!/bin/bash
# Gap round 1: onset detectors on RT1 (mono WAV), with their defaults, as for the R3 clips (r0292) and R1c (r0334):
# aubio `aubioonset -O hfc|complex|specflux` (Ubuntu aubio-tools 0.4.9), madmom `CNNOnsetDetector single` and
# `SuperFlux single` (venv-madmom, git 27f032e8), Essentia `OnsetRate()` (venv-essentia), each writing one onset time
# in seconds per line, plus timing.tsv (seconds per detector).
# usage: gap1_rt1_detectors.sh <lane dir> <mono wav> <out dir>
set -euo pipefail
L="$1"; wav="$2"; out="$3"
mkdir -p "$out"
: > "$out/timing.tsv"
t() { local name="$1"; shift; local s=$(date +%s.%N); "$@"; local e=$(date +%s.%N); echo -e "$name\t$(echo "$e - $s" | bc)" >> "$out/timing.tsv"; }
for m in hfc complex specflux; do
  t "aubio_$m" bash -c "aubioonset -i '$wav' -O $m > '$out/aubio_$m.txt'"
done
t madmom_CNNOnsetDetector "$L/venv-madmom/bin/CNNOnsetDetector" single "$wav" -o "$out/madmom_CNNOnsetDetector.txt"
t madmom_SuperFlux "$L/venv-madmom/bin/SuperFlux" single "$wav" -o "$out/madmom_SuperFlux.txt"
t essentia_OnsetRate "$L/venv-essentia/bin/python" -I -c "
import sys, numpy as np, essentia.standard as es
a = es.MonoLoader(filename=sys.argv[1], sampleRate=44100)()
on, rate = es.OnsetRate()(a)
np.savetxt(sys.argv[2], on, fmt='%.6f')
" "$wav" "$out/essentia_OnsetRate.txt"
wc -l "$out"/*.txt
cat "$out/timing.tsv"
