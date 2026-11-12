"""Run gtr-eval on a list of (subcommand, truth, est, extra options) jobs and collect the counts with their eval ids.

usage: python3 score.py <jobs.tsv> <summary.json>
jobs.tsv: one job per line, tab-separated: label, subcommand, truth id, estimate path, extra options (space-separated)
The summary holds, per job, the eval id printed by gtr-eval and the counts and metrics this lane quotes.
"""
import json, re, subprocess, sys

jobs = [l.rstrip("\n").split("\t") for l in open(sys.argv[1]) if l.strip() and not l.startswith("#")]
summary = []
for j in jobs:
    label, sub, truth, est = j[:4]
    extra = j[4].split() if len(j) > 4 and j[4] else []
    cmd = ["gtr-eval", sub, "--truth", truth, "--est", est] + extra
    p = subprocess.run(cmd, capture_output=True, text=True)
    m = re.search(r"\[gtr-eval (e\d+)\]", p.stderr)
    rec = {"label": label, "cmd": " ".join(cmd), "eval_id": m.group(1) if m else None, "exit": p.returncode}
    try:
        d = json.loads(p.stdout)
    except Exception:
        rec["error"] = (p.stdout + p.stderr)[-400:]
        summary.append(rec); print(rec); continue
    if "error" in d:
        rec["error"] = d["error"]
    c, mt = d.get("counts", {}), d.get("metrics", {})
    rec["counts"] = c
    if sub == "tab":
        rec["metrics"] = {k: mt.get(k) for k in ("same_string_and_fret_fraction_of_matched", "same_string_fraction_of_matched",
                                                 "same_string_and_absolute_fret_fraction_of_matched",
                                                 "same_string_and_fret_fraction_of_truth", "string_difference_counts")}
    elif sub == "notes":
        rec["metrics"] = {"onset_only": mt.get("onset_only"), "recall_by_voice": mt.get("recall_by_voice"),
                          "onset_timing_of_matched": mt.get("onset_timing_of_matched")}
    else:
        rec["metrics"] = mt
    summary.append(rec)
    print(label, rec["eval_id"], json.dumps(rec.get("counts"))[:300], json.dumps(rec.get("metrics"))[:300])
json.dump(summary, open(sys.argv[2], "w"), indent=1)
