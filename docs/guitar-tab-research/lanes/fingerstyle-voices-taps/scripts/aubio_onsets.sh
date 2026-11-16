#!/usr/bin/env bash
# aubio 0.4.9 (Ubuntu package aubio-tools) onset detection, every method, default settings otherwise.
# Usage: aubio_onsets.sh <input wav> <out dir>
# Writes <out>/<method>.txt (one onset time in seconds per line, aubioonset's own output) and <out>/timing.tsv.
set -euo pipefail
in="$1"; out="$2"; mkdir -p "$out"
: > "$out/timing.tsv"
for m in energy hfc complex phase specdiff kl mkl specflux; do
  s=$(date +%s.%N)
  aubioonset -i "$in" -O "$m" > "$out/$m.txt"
  e=$(date +%s.%N)
  printf "%s\t%s\t%s\n" "$m" "$(wc -l < "$out/$m.txt")" "$(echo "$e - $s" | bc)" >> "$out/timing.tsv"
done
cat "$out/timing.tsv"
