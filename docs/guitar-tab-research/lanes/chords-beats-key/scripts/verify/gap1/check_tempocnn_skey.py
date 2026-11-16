"""verify-gapfill-chords-beats-key: check the tempo-cnn and S-KEY tables of trials.md "Gap round 1" cell by cell.

Each tempo cell "value yes|xR eNNNN" is compared with out/tempocnn/<clip>/tempo_<model>.txt, tempocnn.json and the
gtr-eval ledger entry (clip, estimate, within-4 % flag, ratio). Each S-KEY row is compared with out/skey/<clip>/skey.json
and its ledger entry. Also recomputes the timing ranges quoted in the text from the batch logs and per-clip JSON.
Run: python3 -I check_tempocnn_skey.py
"""
import json, os, re

TR = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/trials.md"
OUT = "/home/user/gtr/lanes/chords-beats-key/out"
LOG = "/home/user/gtr/lanes/chords-beats-key/logs/gap1"
SM = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/samples"
ev = {}
for l in open("/home/user/gtr/eval/ledger/evals.jsonl"):
    d = json.loads(l)
    ev[d["id"]] = d
text = open(TR).read()
gap = text[text.index("## Gap round 1"):text.index("## S3 versus S7flat30")]
problems = []


def table_after(marker):
    i = gap.index(marker)
    lines = gap[i:].splitlines()
    rows = []
    for ln in lines:
        if ln.startswith("|"):
            rows.append([c.strip() for c in ln.strip().strip("|").split("|")])
        elif rows:
            break
    return rows[0], rows[2:]


# ---- tempo-cnn
hdr, rows = table_after("| clip (truth BPM) | fcn |")
models = hdr[1:9]
n = 0
for r in rows:
    clip = r[0].split()[0]
    J = json.load(open(os.path.join(OUT, "tempocnn", clip, "tempocnn.json")))
    for m, cell in zip(models, r[1:9]):
        val, flag, eid = cell.split()
        t = float(open(os.path.join(OUT, "tempocnn", clip, "tempo_%s.txt" % m)).read().split()[0])
        if abs(J["models"][m]["tempo"] - t) > 1e-6:
            problems.append(("json vs txt", clip, m))
        shown = float(val)
        if abs(shown - t) > 0.005 + 1e-9:
            problems.append(("value", clip, m, val, t))
        E = ev[eid]
        M = E["result"]["metrics"]
        if E["argv"][2] != clip or abs(M["est_bpm"] - t) > 1e-6:
            problems.append(("eval mismatch", clip, m, eid, E["argv"], t))
        if flag == "yes":
            if not M["within_tolerance"]:
                problems.append(("flag", clip, m, eid))
        else:
            ratio = float(flag.lstrip("x"))
            if M["within_tolerance"] or abs(round(M["ratio_est_over_truth"], 2) - ratio) > 1e-9:
                problems.append(("ratio", clip, m, eid, flag, M["ratio_est_over_truth"], M["within_tolerance"]))
        n += 1
    meter = int(open(os.path.join(OUT, "tempocnn", clip, "meter_fma2018.txt")).read().split()[0])
    if str(meter) != r[9]:
        problems.append(("meter", clip, r[9], meter))
    if J["meter"]["numerator"] != meter:
        problems.append(("meter json", clip))
print("tempo-cnn table: %d tempo cells checked, %d rows" % (n, len(rows)))
# R2full and MIREX facts
R = json.load(open(os.path.join(OUT, "tempocnn", "R2full", "tempocnn.json")))
print("R2full:", {m: round(R["models"][m]["tempo"], 2) for m in R["models"]}, "meter", R["meter"]["numerator"])
S = json.load(open(os.path.join(OUT, "tempocnn", "S3", "tempocnn.json")))
print("S3 mirex fcn", S["models"]["fcn"]["mirex"], "shallowtemp", S["models"]["shallowtemp"]["mirex"])
print("R2full mirex fcn", R["models"]["fcn"]["mirex"])
F = json.load(open(os.path.join(OUT, "tempocnn", "S7flat30", "tempocnn.json")))
print("S7flat30 == S3 per model:", all(F["models"][m]["tempo"] == S["models"][m]["tempo"] for m in S["models"]), "meter", F["meter"]["numerator"], S["meter"]["numerator"])
# timings
jobs = [json.loads(l) for l in open(os.path.join(LOG, "batch_tempocnn.jsonl"))]
print("job walls", [(j["clip"], j["wall_s"], j["exit_code"]) for j in jobs])
rf, imp, load, est, estR, loadR = {}, [], [], [], [], []
longest = {}
for j in jobs:
    c = j["clip"]
    J = json.load(open(os.path.join(OUT, "tempocnn", c, "tempocnn.json")))
    rf[c] = J["timings"]["read_features_s"]
    imp.append(J["timings"]["import_s"])
    for m, v in J["models"].items():
        (loadR if c == "R2full" else load).append(v["load_s"])
        (estR if c == "R2full" else est).append(v["estimate_tempo_s"])
    if c != "R2full":
        longest[c] = max(J["models"], key=lambda m: J["models"][m]["estimate_tempo_s"])
print("read_features", rf)
print("import %.2f-%.2f; load (24-39 s clips) %.2f-%.2f; estimate (24-39 s) %.2f-%.2f; R2full load %.2f-%.2f estimate %.2f-%.2f" % (
    min(imp), max(imp), min(load), max(load), min(est), max(est), min(loadR), max(loadR), min(estR), max(estR)))
print("longest estimate per clip", longest)
print("samples equal out:", all(open(os.path.join(SM, "tempocnn", c + ".tempocnn.json")).read() == open(os.path.join(OUT, "tempocnn", c, "tempocnn.json")).read() for c in rf))

# ---- S-KEY
hdr, rows = table_after("| clip | truth key | S-KEY |")
for r in rows:
    clip, truth, lab, top, second, w, eid = r
    J = json.load(open(os.path.join(OUT, "skey", clip, "skey.json")))
    sc = J.get("scores") or J.get("all_scores")
    print(clip, json.dumps({k: J[k] for k in J if k not in ("scores", "all_scores", "labels")})[:300])
    E = ev[eid]
    M = E["result"]["metrics"]
    if E["argv"][2] != clip or M["est_key"] != lab or M["truth_key"] != truth or abs(M["weighted_score"] - float(w)) > 1e-9:
        problems.append(("skey eval", clip, eid, M))
    txt = open(os.path.join(OUT, "skey", clip, "key_skey.txt")).read().strip()
    if txt != lab:
        problems.append(("skey txt", clip, txt, lab))
print("PROBLEMS:", len(problems))
for p in problems:
    print("  ", p)
