#!/bin/bash
# Gap round 1: drumsep (https://github.com/inagoy/drumsep, commit c1cea3f) on one input file.
# The repository's `drumsep` script runs, per file:  demucs --repo "model" -o "$output" -n 49469ca8 "$file"
# This runs that same demucs command with the PyPI demucs 4.1.0 of venv-drumsep (built from freeze/venv-demucs.txt)
# and the checkpoint model/49469ca8.th that `drumsepInstall` fetches with `gdown 1-Dm666ScPkg8Gt2-lK3Ua0xOudWHZBGC`.
# usage: gap1_drumsep_run.sh <venv> <model dir> <output dir> <input wav>
set -euo pipefail
venv="$1"; model="$2"; out="$3"; input="$4"
mkdir -p "$out"
"$venv/bin/demucs" --repo "$model" -o "$out" -n 49469ca8 "$input"
