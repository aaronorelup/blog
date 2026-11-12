"""Score every onset file (*.txt, one time per line) in a directory against S6taps truth.

Usage: python score_onset_dir.py <clip id> <dir> [<label prefix>]
For each file: gtr-eval onsets --field taps, gtr-eval onsets --field notes (both window 50 ms, the eval ids are
captured from stderr), and the event-class breakdown of fvt_common.classify_onsets.
Writes <dir>/scores.json and prints a Markdown table row per file.
"""
import glob
import json
import os
import re
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fvt_common import classify_onsets, load_truth  # noqa: E402

cid, d = sys.argv[1], sys.argv[2]
prefix = sys.argv[3] if len(sys.argv) > 3 else ""
truth = load_truth(cid)
rows = []
for p in sorted(glob.glob(os.path.join(d, "*.txt"))):
    name = os.path.basename(p)[:-4]
    est = np.atleast_1d(np.loadtxt(p)) if os.path.getsize(p) else np.array([])
    est = est.reshape(-1) if est.ndim > 1 else est
    row = {"name": prefix + name, "file": p, "n_est": int(len(est))}
    for field in ("taps", "notes"):
        r = subprocess.run(["/home/user/gtr/bin/gtr-eval", "onsets", "--truth", cid, "--est", p, "--field", field],
                           capture_output=True, text=True)
        m = re.search(r"\[gtr-eval (e\d+)\]", r.stderr)
        try:
            res = json.loads(r.stdout)
            row[field] = {"eval_id": m.group(1) if m else None, **res["metrics"], "n_matched": res["counts"]["n_matched"]}
            row[field].pop("timing_of_matched", None)
        except Exception as e:  # report the failure, do not hide it
            row[field] = {"error": r.stdout[-300:] + r.stderr[-300:], "exc": str(e)}
    row["classes"] = classify_onsets(est, truth) if len(est) else None
    rows.append(row)
with open(os.path.join(d, "scores.json"), "w") as f:
    json.dump(rows, f, indent=1)
print("| method | n onsets | taps P / R / F (eval id) | notes P / R / F (eval id) | on tap+note (of 27) | on note-only (of 21) | on tap-only (of 5) | neither |")
print("|---|---|---|---|---|---|---|---|")
for r in rows:
    t, n, c = r["taps"], r["notes"], r["classes"]
    f = lambda x: f"{x['precision']:.3f} / {x['recall']:.3f} / {x['f_measure']:.3f} ({x['eval_id']})" if "precision" in x else "error"
    cc = c["matched_by_label"] if c else {"tap+note": 0, "note-only": 0, "tap-only": 0}
    print(f"| {r['name']} | {r['n_est']} | {f(t)} | {f(n)} | {cc['tap+note']} | {cc['note-only']} | {cc['tap-only']} | {c['neither'] if c else 0} |")
