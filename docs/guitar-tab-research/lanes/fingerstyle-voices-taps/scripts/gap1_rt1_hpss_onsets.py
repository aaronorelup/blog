"""Gap round 1: the lane's tap-side steps on a real recording without truth (RT1).

Same calls as real_clips_onsets.py (R3a-c, run r0292) and librosa_hpss_sweep.py (S6taps, r0031):
librosa.effects.hpss(y, margin=m) for m in 1, 4, 16 (defaults otherwise), librosa.onset.onset_detect (defaults,
units='time') on the mono mix and on each percussive part; energy fractions (sum of squares of the part / sum of
squares of the mix). Also the percussive part's share of the energy in every 10 s window, and onsets per second.
No truth exists for this file, so only counts and levels are written.

usage: python gap1_rt1_hpss_onsets.py <mono wav> <out dir>
"""
import json
import os
import sys
import time

import librosa
import numpy as np

wav, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
y, sr = librosa.load(wav, sr=None, mono=True)
dur = len(y) / sr
e = lambda x: float(np.sum(x.astype(np.float64) ** 2))
res = {"input": wav, "sr": sr, "duration_s": round(dur, 3), "librosa": librosa.__version__}
t0 = time.time()
om = librosa.onset.onset_detect(y=y, sr=sr, units="time")
np.savetxt(os.path.join(out, "onsets_mix.txt"), om, fmt="%.6f")
res["mix"] = {"n_onsets": int(len(om)), "onsets_per_s": round(len(om) / dur, 3), "seconds": round(time.time() - t0, 2)}
win = 10 * sr
for m in (1.0, 4.0, 16.0):
    t0 = time.time()
    h, p = librosa.effects.hpss(y, margin=m)
    op = librosa.onset.onset_detect(y=p, sr=sr, units="time")
    tag = f"m{int(m)}"
    np.savetxt(os.path.join(out, f"onsets_percussive_{tag}.txt"), op, fmt="%.6f")
    prof = []
    for i in range(0, len(y), win):
        ey = e(y[i:i + win])
        prof.append(round(e(p[i:i + win]) / ey, 4) if ey > 0 else None)
    res[tag] = {"n_onsets_percussive": int(len(op)), "onsets_per_s": round(len(op) / dur, 3),
                "energy_fraction_percussive": round(e(p) / e(y), 4), "energy_fraction_harmonic": round(e(h) / e(y), 4),
                "percussive_fraction_per_10s": prof, "seconds": round(time.time() - t0, 2)}
    print(tag, json.dumps({k: v for k, v in res[tag].items() if k != "percussive_fraction_per_10s"}), flush=True)
json.dump(res, open(os.path.join(out, "summary.json"), "w"), indent=1)
print(json.dumps({k: res[k] for k in ("duration_s", "mix")}))
