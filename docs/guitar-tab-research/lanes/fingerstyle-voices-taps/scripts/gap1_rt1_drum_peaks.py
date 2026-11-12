"""Gap round 1: where the loudest moments of RT1's Demucs drums stems are (for a listener to check by ear).

For each drums stem: the (L+R)/2 mono signal, its absolute value, local maxima at least 1.0 s apart
(scipy.signal.find_peaks with distance = 1 s), the 12 highest, printed with time (s, and m:ss.s) and level (dBFS),
and how many peaks lie above -40 and above -50 dBFS. A measurement, not a detector: nothing here says what the
sounds are.

usage: python gap1_rt1_drum_peaks.py <drums.wav> [<drums.wav> ...]
"""
import json
import sys

import numpy as np
import soundfile as sf
from scipy.signal import find_peaks

res = {}
for p in sys.argv[1:]:
    y, sr = sf.read(p, always_2d=True)
    m = np.abs(y.astype(np.float64).mean(axis=1))
    idx, _ = find_peaks(m, distance=sr)
    lv = 20 * np.log10(m[idx] + 1e-12)
    order = np.argsort(-lv)[:12]
    top = sorted((round(idx[i] / sr, 3), round(float(lv[i]), 1)) for i in order)
    res[p] = {"n_peaks_1s_apart": int(len(idx)), "above_-40_dBFS": int(np.sum(lv > -40)),
              "above_-50_dBFS": int(np.sum(lv > -50)),
              "top12_time_s_level_dBFS": [[t, l, f"{int(t // 60)}:{t % 60:04.1f}"] for t, l in top]}
    print(p, json.dumps(res[p]))
json.dump(res, open("drum_peaks.json", "w"), indent=1)
