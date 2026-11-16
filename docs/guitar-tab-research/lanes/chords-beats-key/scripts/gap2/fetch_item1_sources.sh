#!/bin/bash
# Gap round 2, item 1: fetch the STONE, key-cnn and BeatNet+ files that for-aaron.md sections 10-12 rest on.
# Writes copies and a status.tsv (UTC time, HTTP status, bytes, URL) under $OUT. HEAD requests give file sizes.
set -u
OUT=${1:-/home/user/gtr/lanes/chords-beats-key/raw/gap2/2026-11-12}
mkdir -p "$OUT"/stone "$OUT"/keycnn "$OUT"/beatnetplus
ST="$OUT/status.tsv"
get() { # url dest
  code=$(curl -sS -L -o "$2" -w '%{http_code}' --max-time 60 "$1"); n=$(wc -c < "$2" 2>/dev/null || echo 0)
  printf '%s\t%s\t%s\t%s\n' "$(date -u +%FT%TZ)" "$code" "$n" "$1" >> "$ST"
}
head_size() { # url
  h=$(curl -sS -I -L --max-time 60 "$1"); code=$(printf '%s' "$h" | grep -i '^HTTP/' | tail -1 | awk '{print $2}')
  len=$(printf '%s' "$h" | grep -i '^content-length:' | tail -1 | awk '{print $2}' | tr -d '\r')
  printf '%s\t%s\tHEAD content-length=%s\t%s\n' "$(date -u +%FT%TZ)" "$code" "$len" "$1" >> "$ST"
}
R=https://raw.githubusercontent.com
for f in README.md pyproject.toml Dockerfile inference.py; do get $R/deezer/stone/main/$f "$OUT/stone/$f"; done
for f in semisupervised_ks_mode.pt semitone_ks.pt semisupervised_key_mode.pt; do head_size $R/deezer/stone/main/ckpt/$f; done
for f in README.rst setup.py LICENSE CHANGES.rst requirements.txt; do get $R/hendriks73/key-cnn/master/$f "$OUT/keycnn/$f"; done
get $R/hendriks73/key-cnn/master/bin/key "$OUT/keycnn/bin_key"
get $R/hendriks73/key-cnn/master/keycnn/classifier.py "$OUT/keycnn/classifier.py"
get $R/hendriks73/key-cnn/master/keycnn/feature.py "$OUT/keycnn/feature.py"
for m in deepspec_k16 deepsquare_k16; do head_size $R/hendriks73/key-cnn/master/keycnn/models/$m.h5; done
for f in README.md setup.py; do get $R/mjhydri/BeatNet-Plus/main/$f "$OUT/beatnetplus/$f"; done
get $R/mjhydri/BeatNet-Plus/main/src/BeatNetPlus/inference.py "$OUT/beatnetplus/inference.py"
for m in generic_weights.pt generic_main_weights.pt af_non_percussive_weights.pt; do head_size $R/mjhydri/BeatNet-Plus/main/src/BeatNetPlus/models/$m; done
get https://pypi.org/pypi/tensorflow/1.15.2/json "$OUT/pypi_tensorflow_1.15.2.json"
get https://pypi.org/pypi/numpy/1.16.0/json "$OUT/pypi_numpy_1.16.0.json"
for n in keycnn key-cnn stone deezer-stone beatnetplus beatnet-plus BeatNetPlus; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 https://pypi.org/pypi/$n/json)
  printf '%s\t%s\tPyPI name check\thttps://pypi.org/pypi/%s/json\n' "$(date -u +%FT%TZ)" "$code" "$n" >> "$ST"
done
head_size https://www.python.org/ftp/python/3.7.9/python-3.7.9-amd64.exe
for r in deezer/stone hendriks73/key-cnn mjhydri/BeatNet-Plus; do
  printf '%s\tls-remote\t%s\t%s\n' "$(date -u +%FT%TZ)" "$(git ls-remote https://github.com/$r HEAD | cut -c1-12)" "$r" >> "$ST"
done
