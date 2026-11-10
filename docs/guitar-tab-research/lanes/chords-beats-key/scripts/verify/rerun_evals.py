"""Verifier (verify-trials-chords-beats-key): re-run every gtr-eval scoring of this lane and compare.

For each line of the lane's master score file (out/scores/scores.jsonl):
  1. find the eval id in the gtr-eval ledger; check exit code 0 and that the ledger argv matches the row's args;
  2. check that the row's metrics equal the ledger result's metrics;
  3. check that the estimate file named in the result still has the SHA-256 it had when it was scored;
  4. run gtr-eval again in-process with the same argv plus --no-ledger, from the same working directory,
     and compare the whole new result with the stored one.
Run with the scorer's own interpreter:  /home/user/gtr/eval/venv/bin/python -I rerun_evals.py <scores.jsonl> <out_dir>
"""
import sys, os, json, io, hashlib, contextlib

sys.path.insert(0, "/home/user/gtr/eval")
import gtr_eval  # noqa: E402

LEDGER = "/home/user/gtr/eval/ledger/evals.jsonl"


def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for ch in iter(lambda: f.read(1 << 20), b""):
            h.update(ch)
    return h.hexdigest()


def diff(a, b, path=""):
    out = []
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a:
                out.append(f"{path}/{k}: missing in stored")
            elif k not in b:
                out.append(f"{path}/{k}: missing in rerun")
            else:
                out += diff(a[k], b[k], f"{path}/{k}")
    elif isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            out.append(f"{path}: list length {len(a)} vs {len(b)}")
        for i, (x, y) in enumerate(zip(a, b)):
            out += diff(x, y, f"{path}[{i}]")
    elif a != b:
        out.append(f"{path}: {a!r} vs {b!r}")
    return out


def main():
    scores_path, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    ledger = {}
    with open(LEDGER) as f:
        for line in f:
            d = json.loads(line)
            ledger[d["id"]] = d
    rows = [json.loads(l) for l in open(scores_path)]
    summary = {"n_rows": len(rows), "problems": [], "rerun_identical": 0, "rerun_different": 0}
    reruns = open(os.path.join(out_dir, "rerun_results.jsonl"), "w")
    for r in rows:
        eid = r["eval_id"]
        L = ledger.get(eid)
        if L is None:
            summary["problems"].append({"eval": eid, "problem": "not in ledger"})
            continue
        if L["exit_code"] != 0:
            summary["problems"].append({"eval": eid, "problem": f"ledger exit code {L['exit_code']}"})
        argv = L["argv"]
        # row args are the part after the subcommand and --truth <clip>
        if argv[0] != r["subcommand"] or r["clip"] not in argv:
            summary["problems"].append({"eval": eid, "problem": f"ledger argv {argv} vs row {r['subcommand']} {r['clip']}"})
        if [a for a in r["args"] if a not in argv]:
            summary["problems"].append({"eval": eid, "problem": f"row args {r['args']} not all in ledger argv {argv}"})
        res = L["result"]
        sub = r["subcommand"]
        if res.get("metrics") != r["metrics"]:
            summary["problems"].append({"eval": eid, "problem": "row metrics differ from ledger result",
                                        "diff": diff(res.get("metrics"), r["metrics"])[:10]})
        est = res.get("est") or {}
        if est.get("path") and est.get("sha256"):
            try:
                cur = sha(est["path"])
                if cur != est["sha256"]:
                    summary["problems"].append({"eval": eid, "problem": f"estimate file changed since scoring: {est['path']}"})
            except OSError as e:
                summary["problems"].append({"eval": eid, "problem": f"estimate file missing: {e}"})
        # re-run in-process
        cwd = L.get("cwd") or "/tmp"
        old = os.getcwd()
        try:
            os.chdir(cwd)
        except OSError:
            os.chdir("/tmp")
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(io.StringIO()):
            try:
                code = gtr_eval.main(list(argv) + ["--no-ledger"])
            except SystemExit as e:
                code = e.code
        os.chdir(old)
        try:
            new = json.loads(buf.getvalue().strip().splitlines()[-1])
        except Exception as e:  # noqa
            summary["problems"].append({"eval": eid, "problem": f"rerun output unreadable: {e}"})
            continue
        d = diff(res, new)
        reruns.write(json.dumps({"eval": eid, "code": code, "n_diff": len(d), "diff": d[:20],
                                 "metrics": new.get("metrics")}) + "\n")
        if d:
            summary["rerun_different"] += 1
            summary["problems"].append({"eval": eid, "problem": "rerun differs", "diff": d[:10]})
        else:
            summary["rerun_identical"] += 1
    reruns.close()
    with open(os.path.join(out_dir, "rerun_summary.json"), "w") as f:
        json.dump(summary, f, indent=1)
    print(json.dumps({k: v for k, v in summary.items() if k != "problems"}), "problems:", len(summary["problems"]))


if __name__ == "__main__":
    main()
