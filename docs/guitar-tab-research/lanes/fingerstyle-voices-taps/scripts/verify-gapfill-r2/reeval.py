#!/usr/bin/env python3
"""Re-run the gap round 2 gtr-eval scorings of this lane with --no-ledger and compare them with the eval ledger.

Usage: python3 reeval.py <out_dir>
For each eval id below: take its argv from /home/user/gtr/eval/ledger/evals.jsonl, point any --out at <out_dir>,
add --no-ledger, run gtr-eval, and compare counts, metrics, options and exit code with the stored result.
Prints one line per id and writes <out_dir>/reeval_summary.json.
"""
import json, os, subprocess, sys

IDS = [f"e{i}" for i in list(range(1792, 1808)) + [1809, 1811, 1813, 1815, 1817, 1819] + list(range(1820, 1826))]
LEDGER = "/home/user/gtr/eval/ledger/evals.jsonl"
GTR_EVAL = "/home/user/gtr/bin/gtr-eval"


def main():
    out_dir = sys.argv[1]
    os.makedirs(out_dir, exist_ok=True)
    rows = {}
    with open(LEDGER) as f:
        for line in f:
            r = json.loads(line)
            rows[r["id"]] = r
    summary = []
    for eid in IDS:
        r = rows[eid]
        argv = list(r["argv"])
        if "--out" in argv:
            k = argv.index("--out")
            argv[k + 1] = os.path.join(out_dir, f"{eid}.json")
        argv.append("--no-ledger")
        p = subprocess.run([GTR_EVAL] + argv, capture_output=True, text=True, cwd=r["cwd"])
        try:
            new = json.loads(p.stdout.strip().splitlines()[-1])
        except Exception as e:  # noqa: BLE001
            new = {"parse_error": str(e), "stdout": p.stdout[-500:], "stderr": p.stderr[-500:]}
        old = r["result"]
        same = {}
        for key in ("counts", "metrics", "options"):
            same[key] = old.get(key) == new.get(key)
        same["exit_code"] = r["exit_code"] == p.returncode
        same["processing"] = old.get("processing") == new.get("processing")
        ok = all(same.values())
        summary.append({"id": eid, "argv0": argv[0], "est": argv[argv.index("--est") + 1] if "--est" in argv else argv[argv.index("--est-dir") + 1],
                        "field": argv[argv.index("--field") + 1] if "--field" in argv else None,
                        "identical": ok, "same": same, "old_version": old.get("gtr_eval_version"),
                        "new_version": new.get("gtr_eval_version"), "counts": new.get("counts"), "metrics": new.get("metrics")})
        print(eid, "identical" if ok else f"DIFFERENT {same}", old.get("gtr_eval_version"), "->", new.get("gtr_eval_version"))
    with open(os.path.join(out_dir, "reeval_summary.json"), "w") as f:
        json.dump(summary, f, indent=1)
    print(sum(1 for s in summary if s["identical"]), "of", len(summary), "identical")


if __name__ == "__main__":
    main()
