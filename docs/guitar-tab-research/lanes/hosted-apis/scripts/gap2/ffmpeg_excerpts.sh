#!/usr/bin/env bash
# Gap round 2: re-make the three 15-second excerpts of the hosted-apis lane with the command recorded in
# /home/user/gtr/lanes/hosted-apis/inputs/README.md (ffmpeg -i <clip>.wav -t 15.0 -c:a pcm_s16le <clip>_0-15s.wav),
# into a new folder, and print each file's sha256 next to the one the README records.
set -euo pipefail
OUT=/home/user/gtr/lanes/hosted-apis/gap2/excerpts
mkdir -p "$OUT"
for c in S2n S3 S4; do
  ffmpeg -v error -y -i /home/user/gtr/inputs/$c/$c.wav -t 15.0 -c:a pcm_s16le "$OUT/${c}_0-15s.wav"
done
cd "$OUT"; sha256sum S2n_0-15s.wav S3_0-15s.wav S4_0-15s.wav
cd /home/user/gtr/lanes/hosted-apis/inputs; sha256sum S2n_0-15s.wav S3_0-15s.wav S4_0-15s.wav
