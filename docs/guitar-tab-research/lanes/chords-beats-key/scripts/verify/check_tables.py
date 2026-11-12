"""Verifier: for every table row of trials.md that names gtr-eval ids, check that each number in the row is a value
found in the results of those evals (metrics, counts, the estimate passed on the command line), within rounding.

Usage: python3 check_tables.py trials.md /home/user/gtr/eval/ledger/evals.jsonl
Prints the rows with numbers it could not explain. Heuristic: a flagged number still needs a human look (it can be a
truth value, a clip duration or a version), and a number explained by an unrelated metric of the same eval is missed.
"""
import sys, re, json, math

md, ledger_path = sys.argv[1], sys.argv[2]
L = {}
for line in open(ledger_path):
    d = json.loads(line)
    L[d["id"]] = d


def walk(x, out):
    if isinstance(x, dict):
        for v in x.values():
            walk(v, out)
    elif isinstance(x, list):
        for v in x:
            walk(v, out)
    elif isinstance(x, bool):
        return
    elif isinstance(x, (int, float)):
        out.append(float(x))
    elif isinstance(x, str):
        try:
            out.append(float(x))
        except ValueError:
            pass


def candidates(eid):
    d = L.get(eid)
    if not d:
        return None
    vals = []
    walk(d["result"].get("metrics"), vals)
    walk(d["result"].get("counts"), vals)
    argv = d["argv"]
    for i, a in enumerate(argv):
        if a.startswith("--est-") and i + 1 < len(argv):
            walk(argv[i + 1], vals)
    return vals


def explained(num, vals, ndp):
    tol = 0.5 * 10 ** (-ndp) + 1e-9
    for v in vals:
        if abs(v - num) <= tol:
            return True
        if abs(abs(v) - abs(num)) <= tol:  # sign written separately
            return True
    return False


bad = 0
for ln, line in enumerate(open(md), 1):
    if not line.startswith("|") or set(line.strip()) <= set("|-: "):
        continue
    ids = re.findall(r"e(\d{4})", line)
    rng = re.findall(r"e(\d{4}) to e(\d{4})", line)
    allids = set("e" + i for i in ids)
    for a, b in rng:
        for k in range(int(a), int(b) + 1):
            allids.add(f"e{k:04d}")
    if not allids:
        continue
    vals = []
    missing = []
    for e in sorted(allids):
        c = candidates(e)
        if c is None:
            missing.append(e)
        else:
            vals += c
    text = re.sub(r"e\d{4}", " ", line)
    nums = re.findall(r"(?<![\w.])[-+]?\d+(?:\.\d+)?", text)
    unexplained = []
    for n in nums:
        ndp = len(n.split(".")[1]) if "." in n else 0
        x = float(n)
        if not explained(x, vals, ndp):
            unexplained.append(n)
    if unexplained or missing:
        bad += 1
        print(f"L{ln}: unexplained {unexplained} missing-evals {missing}\n    {line.strip()[:220]}")
print("rows flagged:", bad)
