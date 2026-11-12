"""verify-trials-hosted-apis: re-run gtr-eval with the exact arguments of each cited scoring id (except --out, which
goes to a new folder) and compare metrics and counts with the stored result. Stem scorings are skipped here (their
estimate folders were deleted; they are re-scored from remade files by batch_rescore_stems.sh).
Usage: python3 -I rescore_ledger.py <outdir> <eid> [<eid> ...]   (run with GTR_AGENT set; uses /home/user/gtr/bin/gtr-eval)"""
import json, os, subprocess, sys

out, ids = sys.argv[1], sys.argv[2:]
os.makedirs(out, exist_ok=True)
led = {}
for line in open("/home/user/gtr/eval/ledger/evals.jsonl"):
    try:
        d = json.loads(line)
    except ValueError:
        continue
    if d.get("id") in ids:
        led[d["id"]] = d
summary = []
for i in ids:
    d = led[i]
    args = list(d.get("argv") or d.get("args"))
    if args[0] == "stems":
        summary.append({"id": i, "skipped": "stems"})
        continue
    if "--out" in args:
        k = args.index("--out")
        args[k + 1] = os.path.join(out, i + ".json")
    p = subprocess.run(["/home/user/gtr/bin/gtr-eval"] + args, capture_output=True, text=True, cwd=d.get("cwd") or "/")
    new_id = (p.stderr.split("[gtr-eval ")[1].split("]")[0]) if "[gtr-eval " in p.stderr else None
    new = json.load(open(os.path.join(out, i + ".json")))
    old = d["result"]
    same = (new.get("metrics") == old.get("metrics")) and (new.get("counts") == old.get("counts"))
    summary.append({"id": i, "rerun_id": new_id, "exit": p.returncode, "metrics_and_counts_identical": same})
    print(json.dumps(summary[-1]))
json.dump(summary, open(os.path.join(out, "rescore_summary.json"), "w"), indent=1)
