"""Gap round 1: confidence statistics of an f0 CSV (time_s,frequency_hz,confidence) inside and outside the truth notes.

usage: python f0_conf_stats.py <truth.json> <f0.csv> [<voice>]
Prints JSON: frames inside truth notes of the voice (onset <= t < offset), their median and 90th-percentile
confidence, the share within 50 cents of the sounding truth pitch, and the median frequency and confidence of the
frames that miss by 50 cents or more; the same median confidence for frames outside every truth note.
"""
import json
import sys

import numpy as np

truth = json.load(open(sys.argv[1]))
a = np.genfromtxt(sys.argv[2], delimiter=",", names=True)
voice = sys.argv[3] if len(sys.argv) > 3 else None
t, f, c = a[a.dtype.names[0]], a[a.dtype.names[1]], a[a.dtype.names[2]]
inside = np.zeros(len(t), bool)
ref = np.zeros(len(t))
for n in truth["notes"]:
    if voice and n.get("voice") != voice:
        continue
    m = (t >= n["onset"]) & (t < n["offset"])
    inside |= m
    ref[m] = 440 * 2 ** ((n["pitch"] - 69) / 12)
anynote = np.zeros(len(t), bool)
for n in truth["notes"]:
    anynote |= (t >= n["onset"]) & (t < n["offset"])
ok = inside & (f > 0)
cents = np.full(len(t), np.inf)
cents[ok] = 1200 * np.abs(np.log2(f[ok] / ref[ok]))
hit = inside & (cents < 50)
miss = inside & ~hit
out = {
    "frames": int(len(t)), "frames_in_truth_notes": int(inside.sum()),
    "conf_median_in_notes": round(float(np.median(c[inside])), 4),
    "conf_p90_in_notes": round(float(np.percentile(c[inside], 90)), 4),
    "share_within_50_cents_in_notes": round(float(hit.sum() / inside.sum()), 3),
    "miss_median_freq_hz": round(float(np.median(f[miss])), 1) if miss.any() else None,
    "miss_median_conf": round(float(np.median(c[miss])), 4) if miss.any() else None,
    "conf_median_outside_all_notes": round(float(np.median(c[~anynote])), 4) if (~anynote).any() else None,
}
print(json.dumps(out))
