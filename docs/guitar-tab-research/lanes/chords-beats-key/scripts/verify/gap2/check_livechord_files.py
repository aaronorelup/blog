"""verify-gapfill-chords-beats-key, round 2: recount the LiveChord refiner's saved outputs against the text of
trials.md "Gap round 2", with this script's own code (not the gap agent's livechord_tables.py).

Checks: sample JSON copies equal the files in out/livechord/; beats_*.txt and downbeats_*.txt equal the JSON lists;
counts in/out; every refined time on the 2048/22050 s grid (rounded to 4 decimals); downbeats a subset of beats;
timing ranges (import, model load, refine, per-job wall, peak RSS from the batch logs); audio lengths; R2full counts and
median inter-beat interval; prior inputs equal the first-round prior files; the r0726 CLI output against the batch JSON.
Run: python3 -I check_livechord_files.py
"""
import filecmp
import json
import os
import statistics
import wave

OUT = "/home/user/gtr/lanes/chords-beats-key/out"
SAM = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/samples/livechord"
LOGS = "/home/user/gtr/lanes/chords-beats-key/logs/gap2"
PRIORS = ["beat_this_final0", "madmom_dbn_downbeat"]
CLIPS = ["S3", "S4", "R1a", "R1b", "R1c"]
FPS = 22050 / 2048.0
res = {"problems": []}


def P(*a):
    res["problems"].append(" ".join(str(x) for x in a))


def read_list(p):
    return [float(x) for x in open(p).read().split()]


ranges = {"import": [], "model_load": [], "refine": [], "dur": []}
n_grid = 0
worst = 0.0
subset_all = True
for clip in CLIPS + ["R2full"]:
    for pr in PRIORS:
        jo = os.path.join(OUT, "livechord", clip, "livechord_%s.json" % pr)
        js = os.path.join(SAM, "%s.livechord_%s.json" % (clip, pr))
        if not filecmp.cmp(jo, js, shallow=False):
            P("sample differs", clip, pr)
        j = json.load(open(jo))
        if read_list(os.path.join(OUT, "livechord", clip, "beats_%s.txt" % pr)) != j["refined_beats"]:
            P("beats txt differs", clip, pr)
        if read_list(os.path.join(OUT, "livechord", clip, "downbeats_%s.txt" % pr)) != j["refined_downbeats"]:
            P("downbeats txt differs", clip, pr)
        if (len(j["refined_beats"]), len(j["refined_downbeats"]), len(j["beats_in"]), len(j["downbeats_in"])) != (
                j["n_beats_out"], j["n_downbeats_out"], j["n_beats_in"], j["n_downbeats_in"]):
            P("count fields differ", clip, pr)
        if not (j["applied"] is True and j["reason"] == "ok"):
            P("not applied", clip, pr)
        for t in j["refined_beats"] + j["refined_downbeats"]:
            k = round(t * FPS)
            worst = max(worst, abs(t - round(k / FPS, 4)))
            if clip != "R2full":
                n_grid += 1
        if not set(j["refined_downbeats"]) <= set(j["refined_beats"]):
            subset_all = False
            P("downbeats not subset", clip, pr)
        # prior inputs equal the first-round files
        if pr == "beat_this_final0":
            b = read_list(os.path.join(OUT, "beat_this", clip, "final0_beats.txt"))
            d = read_list(os.path.join(OUT, "beat_this", clip, "final0_downbeats.txt"))
        else:
            rows = [l.split() for l in open(os.path.join(OUT, "madmom", clip, "downbeats.txt")) if l.strip()]
            b = [float(r[0]) for r in rows]
            d = [float(r[0]) for r in rows if int(float(r[1])) == 1]
        if (b, d) != (j["beats_in"], j["downbeats_in"]):
            P("prior input differs", clip, pr)
        w = wave.open(j["audio"])
        dur = w.getnframes() / w.getframerate()
        if clip != "R2full":
            for k in ("import", "model_load", "refine"):
                ranges[k].append(j["timings_s"][k])
            ranges["dur"].append(round(dur, 3))
        else:
            ibi = statistics.median([y - x for x, y in zip(j["refined_beats"], j["refined_beats"][1:])])
            res.setdefault("R2full", {})[pr] = {
                "beats_in": j["n_beats_in"], "beats_out": j["n_beats_out"], "downbeats_in": j["n_downbeats_in"],
                "downbeats_out": j["n_downbeats_out"], "refine_s": j["timings_s"]["refine"],
                "median_ibi_s": round(ibi, 4), "bpm": round(60 / ibi, 2), "dur_s": round(dur, 3)}
res["grid_times_checked_batch"] = n_grid
res["grid_worst_abs_s"] = worst
res["subset_all_12"] = subset_all
res["ranges"] = {k: [min(v), max(v)] for k, v in ranges.items()}
jobs = [json.loads(l) for l in open(os.path.join(LOGS, "batch_livechord.jsonl"))]
res["batch_wall"] = [min(x["wall_s"] for x in jobs), max(x["wall_s"] for x in jobs)]
res["batch_rss"] = [min(x["max_rss_mb"] for x in jobs), max(x["max_rss_mb"] for x in jobs)]
res["batch_exit"] = sorted(set(x["exit_code"] for x in jobs))
res["batch_affinity"] = sorted(set(tuple(x.get("affinity", [])) for x in jobs))
jr = [json.loads(l) for l in open(os.path.join(LOGS, "batch_livechord_r2full.jsonl"))]
res["r2full_wall_rss"] = [(x["wall_s"], x["max_rss_mb"], x["exit_code"]) for x in jr]
for a, b in (("batch_livechord.jsonl", "batch_gap2_livechord_timings.jsonl"),
             ("batch_livechord_r2full.jsonl", "batch_gap2_livechord_r2full_timings.jsonl")):
    if not filecmp.cmp(os.path.join(LOGS, a), os.path.join(SAM, b), shallow=False):
        P("timings copy differs", a)
# the CLI run r0726 against the batch's S3 Beat This! output
cli = open(os.path.join(OUT, "livechord_cli", "S3", "cli_stdout.txt")).read()
if cli != open(os.path.join(SAM, "S3.cli_r0726_stdout.txt")).read():
    P("cli stdout copy differs")
j = json.load(open(os.path.join(OUT, "livechord", "S3", "livechord_beat_this_final0.json")))
lines = {l.split(":")[0].strip(): l.split(":", 1)[1] for l in cli.splitlines() if ":" in l}
first8 = [float(x) for x in lines["first 8 beats   out"].split(",")]
first4 = [float(x) for x in lines["first 4 downbts out"].split(",")]
res["cli_vs_batch_first8"] = [round(x, 3) for x in j["refined_beats"][:8]] == first8
res["cli_vs_batch_first4"] = [round(x, 3) for x in j["refined_downbeats"][:4]] == first4
res["cli_counts"] = (lines["output beats"].split()[0], lines["output downbeats"].split()[0])
print(json.dumps(res, indent=1))
