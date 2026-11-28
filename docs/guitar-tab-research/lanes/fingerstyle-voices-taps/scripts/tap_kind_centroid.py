"""Spectral centroid of a drums stem just after each detected onset, grouped by the truth tap kind it matched.

Usage: python tap_kind_centroid.py <clip id> <stem wav> <onsets.txt>
Each onset is matched one-to-one to a truth tap within 50 ms (mir_eval.util.match_events). For each matched onset:
the spectral centroid (Hz) of the magnitude spectrum of the 50 ms after the onset (Hann window, mono). Prints the
min / median / max per tap kind and the count of onsets that matched no tap. A measurement, not a classifier.
"""
import json
import sys

import mir_eval
import numpy as np
import soundfile as sf

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from fvt_common import load_truth  # noqa: E402

cid, wav, onf = sys.argv[1], sys.argv[2], sys.argv[3]
truth = load_truth(cid)
taps = sorted(truth["taps"], key=lambda t: t["time"])
tt = np.array([t["time"] for t in taps])
est = np.atleast_1d(np.loadtxt(onf))
y, sr = sf.read(wav, dtype="float64", always_2d=True)
y = y.mean(axis=1)
w = int(0.05 * sr)
win = np.hanning(w)
freqs = np.fft.rfftfreq(w, 1 / sr)
out = {}
m = mir_eval.util.match_events(tt, est, 0.05)
for ri, ei in m:
    seg = y[int(est[ei] * sr):int(est[ei] * sr) + w]
    if len(seg) < w:
        continue
    mag = np.abs(np.fft.rfft(seg * win))
    c = float(np.sum(freqs * mag) / np.sum(mag))
    out.setdefault(taps[ri]["kind"], []).append(c)
res = {k: {"n": len(v), "min_hz": round(min(v)), "median_hz": round(float(np.median(v))), "max_hz": round(max(v))}
       for k, v in out.items()}
res["onsets_matching_no_tap"] = int(len(est) - len(m))
print(json.dumps({"stem": wav, "onsets": onf, "centroid_by_kind": res}))
