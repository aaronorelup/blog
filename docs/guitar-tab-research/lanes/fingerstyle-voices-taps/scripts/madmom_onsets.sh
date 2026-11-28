#!/usr/bin/env bash
# madmom 0.17.dev0 (git commit 27f032e8) onset programs, each with its default settings, 'single' file mode.
# Usage: madmom_onsets.sh <madmom venv> <input wav> <out dir>
# Writes <out>/<program>.txt (one onset time in seconds per line, the program's own output) and <out>/timing.tsv.
set -euo pipefail
venv="$1"; in="$2"; out="$3"; mkdir -p "$out"
: > "$out/timing.tsv"
for p in CNNOnsetDetector OnsetDetector OnsetDetectorLL SuperFlux SuperFluxNN ComplexFlux LogFiltSpecFlux SpectralOnsetDetection; do
  s=$(date +%s.%N)
  "$venv/bin/$p" single "$in" -o "$out/$p.txt" 2> "$out/$p.err" || echo "$p failed" >> "$out/timing.tsv"
  e=$(date +%s.%N)
  printf "%s\t%s\t%s\n" "$p" "$(wc -l < "$out/$p.txt" 2>/dev/null || echo NA)" "$(echo "$e - $s" | bc)" >> "$out/timing.tsv"
done
cat "$out/timing.tsv"
