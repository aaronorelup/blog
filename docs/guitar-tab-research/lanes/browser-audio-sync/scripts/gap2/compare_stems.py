"""Compare two sets of stems sample by sample (browser run against the native reference, or two browser runs).

usage: python -I compare_stems.py <dir A> <prefix A> <dir B> <prefix B> [stem ...]
Files: <dir>/<prefix><stem>.wav. Prints per stem: sample count, max |A - B|, number of samples that differ,
10 log10(sum (A - B)^2 / sum B^2) in dB (B as the reference), and whether the arrays are identical.
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

da, pa, db, pb = sys.argv[1:5]
stems = sys.argv[5:] or ["drums", "bass", "other", "vocals", "guitar", "piano"]
res = {}
for s in stems:
    a, sra = sf.read(os.path.join(da, f"{pa}{s}.wav"), dtype="float32", always_2d=True)
    b, srb = sf.read(os.path.join(db, f"{pb}{s}.wav"), dtype="float32", always_2d=True)
    n = min(len(a), len(b))
    d = a[:n].astype(np.float64) - b[:n].astype(np.float64)
    e = float(np.sum(d ** 2)); r = float(np.sum(b[:n].astype(np.float64) ** 2))
    res[s] = {"samples_a": len(a), "samples_b": len(b), "sr": [sra, srb], "max_abs_diff": float(np.max(np.abs(d))),
              "n_diff": int(np.count_nonzero(d)), "diff_db_re_b": (10 * np.log10(e / r)) if e > 0 and r > 0 else None,
              "identical": bool(len(a) == len(b) and np.array_equal(a, b)), "peak_b": float(np.max(np.abs(b)))}
print(json.dumps(res, indent=1))
