"""Shared helpers for the hosted-API trials: the spend ledger and the per-service caps.

Every paid call appends one line to SPEND (outside git) and to the lane's samples copy, with the tokens the response
reported and the cost computed from the published price. Before a call, check_cap() refuses it when the money already
spent on that service plus the call's worst case (estimated input + max output tokens) would pass the cap.
No key is read or written here.
"""
import json, os, time

SPEND = "/home/user/gtr/lanes/hosted-apis/out/spend.jsonl"
SPEND_COPY = "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/samples/spend.jsonl"
CAP_PER_SERVICE_USD = 2.00
CAP_TOTAL_USD = 10.00


def spent(service=None):
    tot = 0.0
    if os.path.exists(SPEND):
        for line in open(SPEND):
            if not line.strip():
                continue
            j = json.loads(line)
            if service is None or j.get("service") == service:
                tot += float(j.get("cost_usd") or 0)
    return tot


def check_cap(service, worst_case_usd):
    s, t = spent(service), spent()
    if s + worst_case_usd > CAP_PER_SERVICE_USD:
        raise SystemExit(f"REFUSED: {service} spent {s:.4f} + worst case {worst_case_usd:.4f} > cap {CAP_PER_SERVICE_USD}")
    if t + worst_case_usd > CAP_TOTAL_USD:
        raise SystemExit(f"REFUSED: total spent {t:.4f} + worst case {worst_case_usd:.4f} > cap {CAP_TOTAL_USD}")
    return s, t


def log_spend(rec):
    rec = dict(rec)
    rec.setdefault("utc", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    for path in (SPEND, SPEND_COPY):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "a") as f:
            f.write(json.dumps(rec) + "\n")
