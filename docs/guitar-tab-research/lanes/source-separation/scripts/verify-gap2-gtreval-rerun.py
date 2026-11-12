#!/usr/bin/env python3
"""verify-gap2-gtreval-rerun.py (verify-gapfill-source-separation, round 2).

For each eval id given: take its argv from the gtr-eval ledger, run gtr-eval again with the same arguments but
--out <scratch file> and --no-ledger, and compare the new result with (a) the result stored in the ledger and
(b) the JSON file the original run wrote (if it is still at its --out path, or at the renamed path given as
id=path). Compared: metrics, counts, options (minus the out path), and the sha256 of every estimate and reference
file. gtr_eval_version, timestamps and the out path are reported but not compared.

Usage: python3 -I verify-gap2-gtreval-rerun.py <scratch dir> <report.txt> e1831 e1832 ... [e1836=<saved json path>]
"""
import json
import os
import subprocess
import sys

LEDGER = "/home/user/gtr/eval/ledger/evals.jsonl"


def strip(res):
    r = json.loads(json.dumps(res))
    opts = r.get("options", {})
    opts.pop("out", None)
    keep = {"metrics": r.get("metrics"), "counts": r.get("counts"), "options": opts,
            "est_sha": {k: v.get("sha256") for k, v in (r.get("est", {}).get("files") or {}).items()},
            "ref_sha": {k: v.get("sha256") for k, v in (r.get("reference_files") or {}).items()},
            "truth_sha": (r.get("truth") or {}).get("sha256")}
    return keep


def main():
    scratch, report = sys.argv[1], sys.argv[2]
    specs = sys.argv[3:]
    os.makedirs(scratch, exist_ok=True)
    rows = {}
    for line in open(LEDGER):
        d = json.loads(line)
        rows[d["id"]] = d
    lines = []
    for spec in specs:
        eid, _, saved = spec.partition("=")
        d = rows[eid]
        argv = list(d["argv"])
        i = argv.index("--out")
        orig_out = argv[i + 1]
        new_out = os.path.join(scratch, f"{eid}.json")
        argv[i + 1] = new_out
        p = subprocess.run(["gtr-eval", *argv, "--no-ledger"], cwd=scratch, capture_output=True, text=True)
        new = json.load(open(new_out)) if os.path.exists(new_out) else None
        saved_path = saved or orig_out
        saved_json = json.load(open(saved_path)) if os.path.exists(saved_path) else None
        same_ledger = new is not None and strip(new) == strip(d["result"])
        same_saved = None if saved_json is None else (strip(saved_json) == strip(d["result"]))
        lines.append(f"{eid}: exit {p.returncode}; version ledger {d['result'].get('gtr_eval_version')} / re-run "
                     f"{(new or {}).get('gtr_eval_version')}; re-run == ledger result (metrics, counts, options, "
                     f"file hashes): {same_ledger}; saved file {saved_path} "
                     f"{'missing' if saved_json is None else ('== ledger result: ' + str(same_saved))}")
        if not same_ledger and new is not None:
            a, b = strip(new), strip(d["result"])
            for k in a:
                if a[k] != b[k]:
                    lines.append(f"   differs in {k}: re-run {json.dumps(a[k])[:400]} | ledger {json.dumps(b[k])[:400]}")
    with open(report, "w") as f:
        f.write("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
