#!/usr/bin/env bash
# MP3 copies of the shared clips for apps that take MP3 only (audio2guitar's free plan) or for a phone.
# Input: /home/user/gtr/inputs/<id>/<id>.wav (44.1 kHz). Output: /home/user/gtr/lanes/apps-survey/out/clips-mp3/<id>.mp3
# Encoder: ffmpeg 6.1.1 with libmp3lame, 192 kbit/s CBR. MP3 adds encoder padding: the decoded files are about
# 0.03 s longer than the WAVs (29.388 s against 29.357 s for S2s), so times from an app fed an MP3 may be offset.
set -euo pipefail
source /home/user/gtr/env.sh
O=/home/user/gtr/lanes/apps-survey/out/clips-mp3
mkdir -p "$O"
for id in S1 S2s S3 S4 S5capo2 S5dropd S6taps S7flat30 R1a R2; do
  ffmpeg -v error -y -i "/home/user/gtr/inputs/$id/$id.wav" -codec:a libmp3lame -b:a 192k "$O/$id.mp3"
done
