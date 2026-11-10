"""Print a markdown table of this lane's `gtr-eval stems` runs from the gtr-eval ledger.
Usage: python3 stem_scores_table.py [substring of est_dir ...]
Each row: eval id, truth, estimated-stem dir (relative to the lane's out/), the --map, then per truth stem
SI-SDR / SDR / SIR / SAR in dB as gtr-eval wrote them (rounded to 2 decimals here)."""
import json, sys

LEDGER = "/home/user/gtr/eval/ledger/evals.jsonl"
LANE_OUT = "/home/user/gtr/lanes/source-separation/out/"
filters = sys.argv[1:]
rows = []
with open(LEDGER) as fh:
    for line in fh:
        r = json.loads(line)
        if not r.get("argv") or r["argv"][0] != "stems":
            continue
        res = r.get("result") or {}
        est = (res.get("est") or {}).get("est_dir") or ""
        if LANE_OUT not in est and not any(LANE_OUT in a for a in r["argv"]):
            continue
        if filters and not any(f in est or any(f in a for a in r["argv"]) for f in filters):
            continue
        rows.append(r)
print("| eval id | truth | estimated stems | map | stem: SI-SDR / SDR / SIR / SAR (dB) |")
print("|---|---|---|---|---|")
for r in rows:
    res = r["result"]
    est = (res.get("est") or {}).get("est_dir", "").replace(LANE_OUT, "")
    per = (res.get("metrics") or {}).get("per_stem", {})
    cells = []
    for s, m in per.items():
        f = lambda k: ("%.2f" % m[k]) if isinstance(m.get(k), (int, float)) else "n/a"
        cells.append(f"{s}: {f('si_sdr_db')} / {f('sdr_db')} / {f('sir_db')} / {f('sar_db')}")
    mp = " ".join((res.get("options") or {}).get("map") or [])
    print(f"| {r['id']} | {res.get('truth', {}).get('id')} | {est} | {mp} | {'; '.join(cells)} |")
