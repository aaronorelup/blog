"""Print a markdown table from a scores_*.json written by score.py (numbers rounded to 3 decimals, eval id kept).
usage: python3 table.py <scores json> [f0|notes]"""
import json
import sys

d = json.load(open(sys.argv[1]))
order = ["S1", "S2n", "S2s", "S3", "S4", "S4guitar", "S4lead", "S5capo2", "S5dropd", "S6taps", "S7flat30", "R1a", "R1b", "R1c"]
rows = sorted(d["results"].items(), key=lambda kv: order.index(kv[0]) if kv[0] in order else 99)
r3 = lambda x: "-" if x is None else f"{x:.3f}"
if d["kind"] == "f0":
    print("| clip | RPA | RCA | voicing recall | voicing false alarm | overall accuracy | eval id |")
    print("|---|---|---|---|---|---|---|")
    for c, e in rows:
        m = e.get("metrics")
        if not m:
            print(f"| {c} | error: {e.get('error')} | | | | | {e.get('eval_id')} |")
            continue
        print(f"| {c} | {r3(m['raw_pitch_accuracy'])} | {r3(m['raw_chroma_accuracy'])} | {r3(m['voicing_recall'])} | "
              f"{r3(m['voicing_false_alarm'])} | {r3(m['overall_accuracy'])} | {e['eval_id']} |")
else:
    print("| clip | truth notes | est. notes | onset-only P | R | F1 | onset+offset F1 | median onset diff of matched (s) | eval id |")
    print("|---|---|---|---|---|---|---|---|---|")
    for c, e in rows:
        m = e.get("metrics")
        if not m:
            print(f"| {c} | error: {e.get('error')} | | | | | | | {e.get('eval_id')} |")
            continue
        oo = m["onset_only"]
        of = (m.get("onset_offset") or {}).get("f1")
        cnt = e.get("counts") or {}
        tm = (m.get("onset_timing_of_matched") or {}).get("median_s")
        print(f"| {c} | {cnt.get('n_truth', '-')} | {cnt.get('n_est', '-')} | {r3(oo['precision'])} | {r3(oo['recall'])} | "
              f"{r3(oo['f1'])} | {r3(of)} | {r3(tm)} | {e['eval_id']} |")
