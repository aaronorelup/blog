"""verify-gapfill-guitar-tab round 2: re-run cited gtr-eval ids with --no-ledger and compare metrics and counts.
usage: python3 rescore.py <ids...>  [--swap OLD=NEW ...]  (swap replaces a substring in the est path, for G1)"""
import json, subprocess, sys

args = sys.argv[1:]
swaps = []
ids = []
i = 0
while i < len(args):
    if args[i] == "--swap":
        swaps.append(args[i + 1].split("=", 1)); i += 2
    else:
        ids.append(args[i]); i += 1
ev = {}
for line in open("/home/user/gtr/eval/ledger/evals.jsonl"):
    d = json.loads(line)
    ev[d["id"]] = d


def norm(x):
    if isinstance(x, float):
        return round(x, 6)
    if isinstance(x, dict):
        return {k: norm(v) for k, v in x.items()}
    if isinstance(x, list):
        return [norm(v) for v in x]
    return x


ndiff = 0
for eid in ids:
    d = ev.get(eid)
    if d is None:
        print(eid, "NOT IN LEDGER"); ndiff += 1; continue
    argv = list(d["argv"])
    for old, new in swaps:
        argv = [a.replace(old, new) for a in argv]
    p = subprocess.run(["gtr-eval"] + argv + ["--no-ledger"], capture_output=True, text=True, cwd=d["cwd"])
    if p.returncode != 0:
        print(eid, "exit", p.returncode, p.stderr[-300:]); ndiff += 1; continue
    new = json.loads(p.stdout)
    old = d["result"]
    same_m = norm(new.get("metrics")) == norm(old.get("metrics"))
    same_c = norm(new.get("counts")) == norm(old.get("counts"))
    tag = "same" if (same_m and same_c) else "DIFF"
    if tag == "DIFF":
        ndiff += 1
        for k in ("metrics", "counts"):
            o, n = norm(old.get(k)), norm(new.get(k))
            if o != n:
                if isinstance(o, dict) and isinstance(n, dict):
                    for kk in sorted(set(o) | set(n)):
                        if o.get(kk) != n.get(kk):
                            print("   ", k, kk, "old", str(o.get(kk))[:200], "new", str(n.get(kk))[:200])
                else:
                    print("   ", k, "old", str(o)[:200], "new", str(n)[:200])
    print(eid, d["result"].get("gtr_eval_version"), "->", new.get("gtr_eval_version"), argv[0], argv[2], argv[4].split("/")[-1], tag,
          "exit", d["exit_code"])
print("differences:", ndiff, "of", len(ids))
