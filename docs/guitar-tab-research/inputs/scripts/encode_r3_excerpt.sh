#!/usr/bin/env bash
# encode_r3_excerpt.sh ORIG START DUR OUTDIR ID
#
# Cuts one excerpt of a video into the four files every R3 clip has, with the settings R3a used (make_r3.py):
#   <ID>.mp4       H.264 (libx264, preset medium, CRF 18), yuv420p, original frame rate and frame size, AAC 192 kb/s
#   <ID>.webm      VP9 (libvpx-vp9, CRF 32, -b:v 0), yuv420p, original frame rate and frame size, Opus 128 kb/s (48 kHz)
#   <ID>.wav       16-bit PCM, 44.1 kHz, stereo
#   <ID>.mono.wav  16-bit PCM, 44.1 kHz, one channel (ffmpeg -ac 1 downmix)
# START and DUR are seconds of the original (input seeking, so the cut is decoded from the keyframe before START).
# The sources used here are at most 1920x1080, so nothing is scaled; the script stops if a source is taller.
# FF_THREADS (optional) sets -threads for the two video encoders (default 0 = ffmpeg's automatic choice); the R3b and
# R3c encodes used FF_THREADS=2.
# Run through gtr-run so the encode is logged, e.g.
#   gtr-run --lane inputs --tool ffmpeg --label "R3b excerpt ..." --input ORIG -- bash encode_r3_excerpt.sh ORIG 200 18 DIR R3b
set -euo pipefail
ORIG=$1; SS=$2; T=$3; OUT=$4; ID=$5
TH=${FF_THREADS:-0}
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$ORIG")
if [ "$H" -gt 1080 ]; then echo "source is ${H} px tall; add scaling before using this script" >&2; exit 2; fi
mkdir -p "$OUT"
ffmpeg -nostdin -v error -y -ss "$SS" -i "$ORIG" -t "$T" -map 0:v:0 -map 0:a:0 -c:v libx264 -preset medium -crf 18 \
       -threads "$TH" -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT/$ID.mp4"
ffmpeg -nostdin -v error -y -ss "$SS" -i "$ORIG" -t "$T" -map 0:v:0 -map 0:a:0 -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 \
       -deadline good -cpu-used 4 -threads "$TH" -pix_fmt yuv420p -c:a libopus -b:a 128k "$OUT/$ID.webm"
ffmpeg -nostdin -v error -y -ss "$SS" -i "$ORIG" -t "$T" -vn -ac 2 -c:a pcm_s16le -ar 44100 "$OUT/$ID.wav"
ffmpeg -nostdin -v error -y -ss "$SS" -i "$ORIG" -t "$T" -vn -ac 1 -c:a pcm_s16le -ar 44100 "$OUT/$ID.mono.wav"
ls -l "$OUT"
