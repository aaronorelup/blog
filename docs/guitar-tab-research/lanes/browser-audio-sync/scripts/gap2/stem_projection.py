"""Share of a true stem found in each estimated stem, by amplitude projection: <est, ref> / <ref, ref> on mono signals
(channels averaged), the definition the source-separation lane uses (its trials.md, "Projection").

usage: python -I stem_projection.py <true stem wav> <est dir> <prefix> [stem ...]
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

ref_path, est_dir, prefix = sys.argv[1:4]
stems = sys.argv[4:] or ["drums", "bass", "other", "vocals", "guitar", "piano"]
ref, sr = sf.read(ref_path, dtype="float64", always_2d=True)
ref = ref.mean(axis=1)
rr = float(np.dot(ref, ref))
out = {"ref": ref_path, "est_dir": est_dir, "prefix": prefix, "projection": {}}
for s in stems:
    est, sre = sf.read(os.path.join(est_dir, f"{prefix}{s}.wav"), dtype="float64", always_2d=True)
    est = est.mean(axis=1)
    n = min(len(est), len(ref))
    out["projection"][s] = round(float(np.dot(est[:n], ref[:n]) / rr), 4)
out["sum"] = round(sum(out["projection"].values()), 4)
print(json.dumps(out))
