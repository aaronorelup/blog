"""Energy of a signal just after each truth event of S6taps, grouped by event label.

Usage: python event_energy.py <clip id> <wav> [<wav> ...]
For each event (fvt_common.event_classes: 'tap+note', 'note-only', 'tap-only') the energy of the signal (mono) in
[t, t + 50 ms) is taken, in dB relative to the largest such window energy in the same file. Prints per label:
count, min, median, max (dB). Also the number of 'note-only' events whose energy is above the smallest
'tap-only'/'tap+note' energy (a count of overlaps between the label ranges, nothing else).
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fvt_common import event_classes, load_truth  # noqa: E402

cid = sys.argv[1]
truth = load_truth(cid)
times, labels, kinds = event_classes(truth)
for p in sys.argv[2:]:
    y, sr = sf.read(p, dtype="float64", always_2d=True)
    y = y.mean(axis=1)
    w = int(0.05 * sr)
    e = np.array([np.sum(y[int(t * sr):int(t * sr) + w] ** 2) for t in times])
    db = 10 * np.log10(e / e.max() + 1e-20)
    out = {"file": p, "window_s": 0.05}
    for l in ("tap+note", "note-only", "tap-only"):
        v = db[[i for i, x in enumerate(labels) if x == l]]
        out[l] = {"n": int(len(v)), "min_db": round(float(v.min()), 2), "median_db": round(float(np.median(v)), 2),
                  "max_db": round(float(v.max()), 2)}
    tap_min = float(db[[i for i, x in enumerate(labels) if x != "note-only"]].min())
    out["note_only_above_lowest_tap_event"] = int(np.sum(db[[i for i, x in enumerate(labels) if x == "note-only"]] > tap_min))
    print(json.dumps(out))
