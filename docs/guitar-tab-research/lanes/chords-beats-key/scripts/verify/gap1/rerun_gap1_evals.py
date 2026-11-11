"""verify-gapfill-chords-beats-key: re-run every gtr-eval scoring the gap round (agent gapfill-chords-beats-key) wrote.

For each ledger line with agent_hint gapfill-chords-beats-key:
  1. exit code 0;
  2. the estimate file (result.est.file) still has the SHA-256 it had when it was scored;
  3. gtr-eval run again in-process with the stored argv plus --no-ledger, from the stored working directory;
     the whole new result is compared with the stored one, ignoring only `gtr_eval_version` (the scorer is now 0.12.0,
     whose changelog changes only `tab` and `f0` file reading).
Also checks that every row of the lane's master score file with one of these eval ids equals the ledger result.
Run: /home/user/gtr/eval/venv/bin/python -I rerun_gap1_evals.py <out_dir>
"""
import sys, os, json, io, hashlib, contextlib

sys.path.insert(0, "/home/user/gtr/eval")
import gtr_eval  # noqa: E402

LEDGER = "/home/user/gtr/eval/ledger/evals.jsonl"
SCORES = "/home/user/gtr/lanes/chords-beats-key/out/scores/scores.jsonl"


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
            if k == "gtr_eval_version":
                continue
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
    out_dir = sys.argv[1]
    os.makedirs(out_dir, exist_ok=True)
    rows = [json.loads(l) for l in open(LEDGER)]
    mine = [d for d in rows if d.get("agent_hint") == "gapfill-chords-beats-key"]
    scores = {}
    for l in open(SCORES):
        r = json.loads(l)
        scores.setdefault(r["eval_id"], []).append(r)
    summary = {"n": len(mine), "identical": 0, "different": 0, "problems": [], "est_sha_ok": 0, "est_value": 0,
               "in_scores_file": 0, "not_in_scores_file": []}
    rr = open(os.path.join(out_dir, "rerun_results.jsonl"), "w")
    for L in mine:
        eid = L["id"]
        if L["exit_code"] != 0:
            summary["problems"].append({"eval": eid, "problem": f"exit {L['exit_code']}"})
        res = L["result"]
        est = res.get("est") or {}
        if est.get("file"):
            try:
                if sha(est["file"]) == est.get("sha256"):
                    summary["est_sha_ok"] += 1
                else:
                    summary["problems"].append({"eval": eid, "problem": "estimate file changed", "file": est["file"]})
            except OSError as e:
                summary["problems"].append({"eval": eid, "problem": f"estimate file missing: {e}"})
        else:
            summary["est_value"] += 1
        if eid in scores:
            summary["in_scores_file"] += 1
            for r in scores[eid]:
                if r.get("metrics") != res.get("metrics"):
                    summary["problems"].append({"eval": eid, "problem": "scores.jsonl metrics differ from ledger"})
        else:
            summary["not_in_scores_file"].append(eid)
        old = os.getcwd()
        try:
            os.chdir(L.get("cwd") or "/tmp")
        except OSError:
            os.chdir("/tmp")
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(io.StringIO()):
            try:
                code = gtr_eval.main(list(L["argv"]) + ["--no-ledger"])
            except SystemExit as e:
                code = e.code
        os.chdir(old)
        try:
            new = json.loads(buf.getvalue().strip().splitlines()[-1])
        except Exception as e:  # noqa
            summary["problems"].append({"eval": eid, "problem": f"rerun output unreadable: {e}"})
            continue
        d = diff(res, new)
        rr.write(json.dumps({"eval": eid, "argv": L["argv"], "code": code, "n_diff": len(d), "diff": d[:20],
                             "metrics": new.get("metrics"), "version": new.get("gtr_eval_version")}) + "\n")
        if d:
            summary["different"] += 1
            summary["problems"].append({"eval": eid, "problem": "rerun differs", "diff": d[:10]})
        else:
            summary["identical"] += 1
    rr.close()
    with open(os.path.join(out_dir, "rerun_summary.json"), "w") as f:
        json.dump(summary, f, indent=1)
    print(json.dumps({k: v for k, v in summary.items() if k != "problems"}), "problems:", len(summary["problems"]))
    for p in summary["problems"][:30]:
        print(p)


if __name__ == "__main__":
    main()
