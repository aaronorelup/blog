"""verify-gapfill-chords-beats-key: recount the All-In-One facts of trials.md "Gap round 1" from the output files.

Reads out/allin1/<clip>/{<clip>.json,timings.json}, logs/gap1/batch_allin1*.jsonl, the truth files, samples/allin1/,
and the gtr-eval ledger; prints one line per fact. Run: python3 -I check_allin1.py
"""
import json, statistics, hashlib, os

OUT = "/home/user/gtr/lanes/chords-beats-key/out/allin1"
LOG = "/home/user/gtr/lanes/chords-beats-key/logs/gap1"
SM = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/samples/allin1"
INP = "/home/user/gtr/inputs"
CLIPS = ["S3", "S4", "S7flat30", "S2n", "S5capo2", "S5dropd", "R1a", "R1b", "R1c", "R2full"]
ev = {json.loads(l)["id"]: json.loads(l) for l in open("/home/user/gtr/eval/ledger/evals.jsonl")}


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


jobs = {}
for f in ("batch_allin1_S3.jsonl", "batch_allin1.jsonl"):
    for l in open(os.path.join(LOG, f)):
        d = json.loads(l)
        jobs[d["clip"]] = d
print("clip | job wall | demix wall (cpu children) | spec wall | load wall | infer wall (cpu self) | rss | bpm | beats/downbeats | segs | sample==out")
for c in CLIPS:
    r = json.load(open(os.path.join(OUT, c, c + ".json")))
    t = json.load(open(os.path.join(OUT, c, "timings.json")))
    j = jobs[c]
    same = sha(os.path.join(OUT, c, c + ".json")) == sha(os.path.join(SM, c + ".json")) if os.path.exists(os.path.join(SM, c + ".json")) else "no sample"
    tsame = sha(os.path.join(OUT, c, "timings.json")) == sha(os.path.join(SM, c + ".timings.json")) if os.path.exists(os.path.join(SM, c + ".timings.json")) else "no sample"
    print(c, "|", j["wall_s"], "|", t["demix_htdemucs_subprocess"]["wall_s"], "(%s)" % t["demix_htdemucs_subprocess"]["cpu_children_s"],
          "|", t["extract_spectrograms"]["wall_s"], "|", t["load_pretrained_model"]["wall_s"], "|",
          t["run_inference"]["wall_s"], "(%s)" % t["run_inference"]["cpu_self_s"], "|", j["max_rss_mb"], "|", r["bpm"], "|",
          "%d / %d" % (len(r["beats"]), len(r["downbeats"])), "|", len(r["segments"]), "|", same, tsame, "| threads", t["torch_threads"], "exit", j["exit_code"])
    # 2-decimal grid
    bad = [x for x in r["beats"] + r["downbeats"] if abs(round(x, 2) - x) > 1e-9]
    if bad:
        print("   not on 0.01 grid:", bad[:5])
    # beats/downbeats files equal JSON
    bt = [float(x) for x in open(os.path.join(OUT, c, "beats.txt")).read().split()]
    dt = [float(x) for x in open(os.path.join(OUT, c, "downbeats.txt")).read().split()]
    tp = open(os.path.join(OUT, c, "tempo.txt")).read().strip()
    if [round(x, 3) for x in r["beats"]] != bt or [round(x, 3) for x in r["downbeats"]] != dt or tp != str(r["bpm"]):
        print("   txt files differ from JSON", len(bt), len(dt), tp)
    print("   positions", sorted(set(r["beat_positions"])), "segments", [(s["start"], s["end"], s["label"]) for s in r["segments"]][:12])

# excerpts
def tr(c):
    return json.load(open(os.path.join(INP, c, c + ".truth.json")))

r = json.load(open(os.path.join(OUT, "S3", "S3.json")))
print("S3 beats first 3", r["beats"][:3], "n", len(r["beats"]), "downbeats first 3", r["downbeats"][:3], "truth beats", len(tr("S3")["beats"]), tr("S3")["beats"][0])
for c in ("S2n", "S5capo2"):
    r = json.load(open(os.path.join(OUT, c, c + ".json")))
    print(c, "downbeats first 4", r["downbeats"][:4], len(r["downbeats"]), "truth", [round(x, 3) for x in tr(c)["downbeats"][:4]])
for c in ("R1a", "R1c", "R1b"):
    r = json.load(open(os.path.join(OUT, c, c + ".json")))
    T = tr(c)["beats"]
    ibi = statistics.median([b - a for a, b in zip(r["beats"], r["beats"][1:])])
    tibi = statistics.median([b - a for a, b in zip(T, T[1:])])
    offs = [min((b - t for t in T), key=abs) for b in r["beats"]]
    mo = statistics.median(offs)
    print(c, "median IBI %.3f truth %.3f; median offset to nearest truth beat %+.3f s = %+.2f of truth IBI; first beat %.2f" % (ibi, tibi, mo, mo / tibi, r["beats"][0]))
r = json.load(open(os.path.join(OUT, "R2full", "R2full.json")))
ibi = statistics.median([b - a for a, b in zip(r["beats"], r["beats"][1:])])
print("R2full bpm", r["bpm"], "median IBI %.3f -> %.2f BPM" % (ibi, 60 / ibi), "beats", len(r["beats"]), "downbeats", len(r["downbeats"]), "positions", sorted(set(r["beat_positions"])))

# CLI vs wrapper on S4
a = json.load(open(os.path.join(OUT, "S4", "S4.json")))
b = json.load(open(os.path.join(SM, "S4.cli_r0576.json")))
print("CLI vs wrapper S4: bpm", a["bpm"] == b["bpm"], "beats", a["beats"] == b["beats"], len(b["beats"]), "downbeats", a["downbeats"] == b["downbeats"], len(b["downbeats"]),
      "positions", a["beat_positions"] == b["beat_positions"], "path", a["path"] == b["path"])
for sa, sb in zip(a["segments"], b["segments"]):
    if sa != sb:
        print("   segment differs: wrapper", sa, "cli", sb)
print("   n segments", len(a["segments"]), len(b["segments"]))
cli_dir = "/home/user/gtr/lanes/chords-beats-key/out/allin1_cli/S4"
print("   CLI out dir:", sorted(os.listdir(cli_dir)), "CLI json == sample:", sha(os.path.join(cli_dir, "S4.json")) == sha(os.path.join(SM, "S4.cli_r0576.json")) if os.path.exists(os.path.join(cli_dir, "S4.json")) else "no S4.json")

# score table
print("evals:")
for e in ["e1509", "e1510"] + ["e%04d" % i for i in range(1578, 1592)] + ["e1614", "e1615"]:
    d = ev[e]
    m = d["result"]["metrics"]
    if d["argv"][0] == "beats":
        bm, dm = m["beats"], m.get("downbeats")
        print(e, d["argv"][2], "beats F/CMLt/AMLt %.3f / %.3f / %.3f" % (bm["f_measure"], bm["CMLt"], bm["AMLt"]), "%d/%d" % (bm["n_est"], bm["n_truth"]),
              "down F/CMLt %.3f / %.3f" % (dm["f_measure"], dm["CMLt"]), "%d/%d" % (dm["n_est"], dm["n_truth"]), d["argv"][4].split("/")[-2])
    else:
        print(e, d["argv"][2], "tempo est", m["est_bpm"], "within", m["within_tolerance"], "ratio %.3f" % m["ratio_est_over_truth"])
