"""verify-trials-source-separation: re-run every gtr-eval call of the trial agent (those whose --out is under
samples/scores/) with the same arguments, writing to /home/user/gtr/lanes/source-separation/verify/evals/ instead,
then compare metrics and counts with the trial's saved JSON. Run under gtr-run (one slot).
Usage: python3 verify-trials-gtreval-rerun.py run|compare"""
import json, os, subprocess, sys
LEDGER = "/home/user/gtr/eval/ledger/evals.jsonl"
OUT = "/home/user/gtr/lanes/source-separation/verify/evals"
E = [json.loads(l) for l in open(LEDGER)]
mine = [e for e in E if any("source-separation/samples/scores" in a for a in e["argv"])
        and not (e.get("agent_hint") or "").startswith("verify")]
def newargv(e):
    a = list(e["argv"]); i = a.index("--out")
    a[i + 1] = os.path.join(OUT, e["id"] + "__" + os.path.basename(a[i + 1])); return a
if sys.argv[1] == "run":
    env = dict(os.environ, GTR_AGENT="verify-trials-source-separation")
    for e in mine:
        a = newargv(e)
        if os.path.exists(a[a.index("--out") + 1]): continue
        p = subprocess.run(["/home/user/gtr/bin/gtr-eval"] + a, env=env, capture_output=True, text=True)
        print(e["id"], "->", p.stderr.strip().splitlines()[-1] if p.stderr.strip() else "", "exit", p.returncode, flush=True)
else:
    n_same = 0
    for e in mine:
        a = newargv(e); o = a[a.index("--out") + 1]
        if not os.path.exists(o): print(e["id"], "NOT RE-RUN"); continue
        new = json.load(open(o)); old = e["result"]
        same = all(new.get(k) == old.get(k) for k in ("metrics", "counts", "est", "options", "truth"))
        n_same += same
        print(e["id"], "identical metrics/counts/est hashes" if same else "DIFFERENT", os.path.basename(o))
    print("identical:", n_same, "of", len(mine))
