"""Run gtr-eval on this lane's outputs and collect the numbers with their eval ids.

usage:
  python score.py f0 <tool> <f0 dir> [--conf X] [--clips ...]       -> <f0 dir>/scores_f0.json
  python score.py notes <tool> <dir> [--suffix .notes.csv|.mid] [--clips ...] [--chroma] [--extra "<gtr-eval args>"]
                                                                    -> <dir>/scores_notes<tag>.json
Clip -> truth: S4guitar/S4lead are scored against the S4 truth with --voice chord / --voice melody (notes) or the
melody voice (f0). R1b f0 uses --voice lead. Clips without truth (R2, R3a) are skipped.
"""
import argparse
import json
import os
import re
import shlex
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a2n_common import TRUTH, NO_TRUTH  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("kind", choices=["f0", "notes"])
ap.add_argument("tool")
ap.add_argument("dir")
ap.add_argument("--conf", type=float, default=None)
ap.add_argument("--clips", default=None)
ap.add_argument("--suffix", default=None)
ap.add_argument("--chroma", action="store_true")
ap.add_argument("--extra", default="")
ap.add_argument("--tag", default="")
a = ap.parse_args()

suffix = a.suffix or (".f0.csv" if a.kind == "f0" else ".notes.csv")
clips = a.clips.split(",") if a.clips else sorted(f[: -len(suffix)] for f in os.listdir(a.dir) if f.endswith(suffix))
res = {"tool": a.tool, "kind": a.kind, "dir": a.dir, "conf_threshold": a.conf, "results": {}}
for clip in clips:
    if clip in NO_TRUTH or clip not in TRUTH:
        continue
    est = os.path.join(a.dir, clip + suffix)
    if not os.path.exists(est):
        continue
    args = ["/home/user/gtr/bin/gtr-eval", a.kind, "--truth", TRUTH[clip], "--est", est]
    if a.kind == "f0":
        if clip == "R1b":
            args += ["--voice", "lead"]
        if clip == "S4guitar":
            continue
        if a.conf is not None:
            args += ["--conf-threshold", str(a.conf)]
    else:
        if clip == "S4guitar":
            args += ["--voice", "chord"]
        if clip == "S4lead":
            args += ["--voice", "melody"]
        if a.chroma:
            args += ["--chroma"]
        if suffix.endswith(".csv"):
            args += ["--pitch-unit", "midi"]
    args += shlex.split(a.extra)
    p = subprocess.run(args, capture_output=True, text=True)
    m = re.search(r"\[gtr-eval (e\d+)\]", p.stderr)
    try:
        out = json.loads(p.stdout)
    except Exception:
        out = {"error": (p.stdout + p.stderr)[-500:]}
    entry = {"eval_id": m.group(1) if m else None, "args": " ".join(args[1:])}
    if "metrics" in out:
        entry["metrics"] = out["metrics"]
        entry["counts"] = out.get("counts")
    else:
        entry["error"] = out.get("error")
    res["results"][clip] = entry
    mm = entry.get("metrics", {})
    if a.kind == "f0":
        print(clip, entry["eval_id"], {k: mm.get(k) for k in ("raw_pitch_accuracy", "raw_chroma_accuracy",
              "voicing_recall", "voicing_false_alarm", "overall_accuracy")}, entry.get("error") or "")
    else:
        oo = mm.get("onset_only", {})
        print(clip, entry["eval_id"], "onset-only P/R/F1", oo.get("precision"), oo.get("recall"), oo.get("f1"),
              "| on+off F1", (mm.get("onset_offset") or {}).get("f1"), entry.get("error") or "")
name = f"scores_{a.kind}{a.tag}.json"
with open(os.path.join(a.dir, name), "w") as f:
    json.dump(res, f, indent=1)
