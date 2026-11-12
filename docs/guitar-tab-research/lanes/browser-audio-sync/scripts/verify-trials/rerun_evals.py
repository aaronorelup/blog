import json, re, subprocess, sys
TR = "/home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/trials.md"
ids = sorted(set(re.findall(r"e\d{4}", open(TR).read())))
ev = {}
for line in open("/home/user/gtr/eval/ledger/evals.jsonl"):
    d = json.loads(line); ev[d["id"]] = d
def strip(o):
    if isinstance(o, dict):
        return {k: strip(v) for k, v in o.items() if k not in ("gtr_eval_version",)}
    if isinstance(o, list):
        return [strip(x) for x in o]
    return o
out = {}
for i in ids:
    d = ev[i]
    argv = list(d["argv"])
    if "--out" in argv:
        k = argv.index("--out"); del argv[k:k+2]
    argv += ["--no-ledger"]
    p = subprocess.run(["/home/user/gtr/bin/gtr-eval"] + argv, capture_output=True, text=True, cwd=d["cwd"])
    try:
        new = json.loads(p.stdout.strip().splitlines()[-1]) if p.stdout.strip() else None
    except Exception as e:
        new = {"parse_error": str(e), "stdout": p.stdout[-300:]}
    old = d.get("result")
    same = strip(new) == strip(old)
    ver_old = (old or {}).get("gtr_eval_version"); ver_new = (new or {}).get("gtr_eval_version")
    diffkeys = []
    if not same and isinstance(new, dict) and isinstance(old, dict):
        for k in set(new) | set(old):
            if strip(new.get(k)) != strip(old.get(k)): diffkeys.append(k)
    print(i, "rc", p.returncode, "stored_exit", d["exit_code"], "SAME" if same else "DIFF", ver_old, ver_new, diffkeys)
    out[i] = {"new": new, "old": old}
json.dump(out, open("/home/user/gtr/lanes/browser-audio-sync/verify/rerun_evals.json", "w"))
