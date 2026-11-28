"""Print the markdown tables of trials.md "Gap round 1" from the saved outputs, batch logs and the lane's score file,
so that no number is copied by hand.

Usage: python3 -I gap1_tables.py allin1|tempocnn|skey|omnizart|qm
"""
import json
import os
import sys

L = "/home/user/gtr/lanes/chords-beats-key"
OUT = L + "/out"
SC = OUT + "/scores/scores.jsonl"


def scores():
    d = {}
    if os.path.exists(SC):
        for line in open(SC):
            r = json.loads(line)
            d[(r["tool"], r["variant"], r["clip"], r["subcommand"])] = r   # newest line wins
    return d


def batch(path):
    rows = {}
    if os.path.exists(path):
        for line in open(path):
            r = json.loads(line)
            rows[r["clip"]] = r
    return rows


def f3(x):
    return "%.3f" % x if isinstance(x, (int, float)) else str(x)


def allin1():
    S = scores()
    B = batch(L + "/logs/gap1/batch_allin1.jsonl")
    B.update({k: v for k, v in batch(L + "/logs/gap1/batch_allin1_S3.jsonl").items()})
    print("| clip (audio s) | job wall s | htdemucs subprocess s (CPU s) | spectrograms s | model load s | inference s (CPU s) | peak RSS MB | bpm | beats / downbeats | segments |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for c in ["S3", "S4", "S7flat30", "S2n", "S5capo2", "S5dropd", "R1a", "R1b", "R1c", "R2full"]:
        tj = os.path.join(OUT, "allin1", c, "timings.json")
        if not os.path.exists(tj):
            continue
        t = json.load(open(tj))
        res = json.load(open(os.path.join(OUT, "allin1", c, c + ".json")))
        b = B.get(c, {})
        print("| %s | %s | %s (%s) | %s | %s | %s (%s) | %s | %s | %d / %d | %d |" % (
            c, f3(b.get("wall_s")), f3(t["demix_htdemucs_subprocess"]["wall_s"]), f3(t["demix_htdemucs_subprocess"]["cpu_children_s"]),
            f3(t["extract_spectrograms"]["wall_s"]), f3(t["load_pretrained_model"]["wall_s"]), f3(t["run_inference"]["wall_s"]),
            f3(t["run_inference"]["cpu_self_s"]), b.get("max_rss_mb"), res["bpm"], len(res["beats"]), len(res["downbeats"]),
            len(res["segments"])))
    print()
    print("| clip | beats F / CMLt / AMLt | est / truth beats | downbeat F / CMLt | est / truth downbeats | eval | bpm | within 4 % (ratio) | eval |")
    print("|---|---|---|---|---|---|---|---|---|")
    for c in ["S3", "S7flat30", "S4", "S2n", "S5capo2", "S5dropd", "R1a", "R1b", "R1c"]:
        rb = S.get(("allin1", "beats", c, "beats"))
        rt = S.get(("allin1", "tempo", c, "tempo"))
        if not rb:
            continue
        m, n = rb["metrics"], rb["counts"]
        bm, dm = m["beats"], m.get("downbeats") or {}
        tm = rt["metrics"] if rt else {}
        print("| %s | %.3f / %.3f / %.3f | %d / %d | %.3f / %.3f | %d / %d | %s | %s | %s (%.3f) | %s |" % (
            c, bm["f_measure"], bm["CMLt"], bm["AMLt"], bm["n_est"], bm["n_truth"], dm.get("f_measure", float("nan")),
            dm.get("CMLt", float("nan")), dm.get("n_est", -1), dm.get("n_truth", -1), rb["eval_id"],
            tm.get("est_bpm"), "yes" if tm.get("within_tolerance") else "no", tm.get("ratio_est_over_truth", float("nan")),
            rt["eval_id"] if rt else None))


def tempocnn():
    S = scores()
    models = ["fcn", "cnn", "ismir2018", "fma2018", "deeptemp", "deepsquare", "shallowtemp", "mazurka"]
    print("| clip | " + " | ".join(models) + " | meter (fma2018-meter) |")
    print("|---|" + "---|" * (len(models) + 1))
    for c in ["S3", "S7flat30", "S4", "S2n", "S5capo2", "S5dropd", "R1a", "R1b", "R1c", "R2full"]:
        j = os.path.join(OUT, "tempocnn", c, "tempocnn.json")
        if not os.path.exists(j):
            continue
        d = json.load(open(j))
        cells = []
        for m in models:
            v = d["models"].get(m, {}).get("tempo")
            r = S.get(("tempocnn", "tempo_" + m, c, "tempo"))
            if r and r.get("metrics"):
                ok = "yes" if r["metrics"]["within_tolerance"] else "no, x%.2f" % r["metrics"]["ratio_est_over_truth"]
                cells.append("%s (%s, %s)" % (v, ok, r["eval_id"]))
            else:
                cells.append("%s" % v)
        print("| %s | %s | %s |" % (c, " | ".join(cells), d.get("meter", {}).get("numerator")))


def skey():
    S = scores()
    print("| clip | truth key | S-KEY (ONNX) | score | weighted | eval | load+resample s | inference s |")
    print("|---|---|---|---|---|---|---|---|")
    for c in ["S3", "S7flat30", "S4", "S2n", "S5capo2", "S5dropd", "R1a", "R1b", "R1c", "R2", "R2full"]:
        j = os.path.join(OUT, "skey", c, "skey.json")
        if not os.path.exists(j):
            continue
        d = json.load(open(j))
        tp = "/home/user/gtr/inputs/%s/%s.truth.json" % (c, c)
        tk = json.load(open(tp)).get("key") if os.path.exists(tp) else None
        r = S.get(("skey", "key_skey", c, "key"))
        print("| %s | %s | %s | %.3f | %s | %s | %s | %s |" % (c, tk, d["key"], d["score_max"],
              r["metrics"]["weighted_score"] if r and r.get("metrics") else "", r["eval_id"] if r else "",
              d["timings"]["load_resample_s"], d["timings"]["inference_s"]))


if __name__ == "__main__":
    {"allin1": allin1, "tempocnn": tempocnn, "skey": skey}[sys.argv[1]]()
