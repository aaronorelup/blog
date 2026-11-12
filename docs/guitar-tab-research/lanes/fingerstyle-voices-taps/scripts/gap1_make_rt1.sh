#!/bin/bash
# Gap round 1: make the lane input RT1 from the archive.org original MP3
# (ChrisSmuckWithANewTuningYouCanFly / With_A_New_Tuning_You_Can_Fly.mp3, CC BY 3.0).
# RT1.wav = ffmpeg decode, 16-bit PCM, 44.1 kHz, stereo, whole track (no excerpt, no gain change);
# RT1.mono.wav = (L+R)/2 computed with numpy and written as 16-bit PCM (the INPUTS.md convention);
# then a read-back: samples, duration, peak, RMS, channel correlation, left-minus-right level.
# usage: gap1_make_rt1.sh <python with numpy+soundfile> <RT1 folder>
set -euo pipefail
py="$1"; d="$2"
ffmpeg -nostdin -hide_banner -loglevel error -y -i "$d/original/With_A_New_Tuning_You_Can_Fly.mp3" \
  -map 0:a:0 -c:a pcm_s16le -ar 44100 -ac 2 "$d/RT1.wav"
"$py" -I - "$d" <<'EOF'
import json, sys
import numpy as np, soundfile as sf
d = sys.argv[1]
x, sr = sf.read(f"{d}/RT1.wav", dtype="int16", always_2d=True)
xf = x.astype(np.float64)
mono = np.round((xf[:, 0] + xf[:, 1]) / 2.0).astype(np.int16)
sf.write(f"{d}/RT1.mono.wav", mono, sr, subtype="PCM_16")
db = lambda v: float(20 * np.log10(v)) if v > 0 else float("-inf")
fs = 32768.0
l, r = xf[:, 0] / fs, xf[:, 1] / fs
m = mono.astype(np.float64) / fs
out = {
    "samples": int(len(x)), "sr": int(sr), "duration_s": round(len(x) / sr, 3),
    "peak_dbfs": round(db(np.max(np.abs(xf)) / fs), 2),
    "rms_dbfs": round(db(np.sqrt(np.mean((xf / fs) ** 2))), 2),
    "full_scale_samples": int(np.sum(np.abs(x.astype(np.int32)) >= 32767)),
    "corr_left_right": round(float(np.corrcoef(l, r)[0, 1]), 4),
    "left_minus_right_rms_dbfs": round(db(np.sqrt(np.mean((l - r) ** 2))), 2),
    "mono_peak_dbfs": round(db(np.max(np.abs(m))), 2), "mono_rms_dbfs": round(db(np.sqrt(np.mean(m ** 2))), 2),
}
# level over time, 5 s windows of the mono file (RMS dBFS), to show where it is quiet
w = 5 * sr
out["rms_dbfs_per_5s"] = [round(db(np.sqrt(np.mean(m[i:i + w] ** 2))), 1) for i in range(0, len(m), w)]
print(json.dumps(out))
json.dump(out, open(f"{d}/RT1.readback.json", "w"), indent=1)
EOF
