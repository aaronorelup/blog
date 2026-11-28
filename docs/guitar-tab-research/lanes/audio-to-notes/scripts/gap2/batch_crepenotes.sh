#!/bin/bash
# Gap round 2, item A3: CREPE Notes 0.2.0 (`crepe_notes` CLI, defaults otherwise) on precomputed torchcrepe f0.
# Run through gtr-run (one 2-core slot). Each call under GNU time; per-call log in <cfg>/<clip>.<cfg>.log.
# usage: batch_crepenotes.sh <venv> <work dir made by prep_crepenotes_inputs.py>
set -u
VENV=$1
W=$2
export MPLBACKEND=Agg
for cfg in tcfull tctiny tcfullz; do
  for clip in S1 R1b S4lead; do
    cd "$W/$cfg" || exit 2
    /usr/bin/time -f "time $cfg $clip wall %e s user %U s sys %S s maxrss %M KiB exit %x" \
      "$VENV/bin/crepe_notes" --f0 "$clip.f0in.csv" --use-cwd --output-label "$cfg" "$clip.wav" \
      > "$clip.$cfg.log" 2>&1
    tail -1 "$clip.$cfg.log"
  done
done
