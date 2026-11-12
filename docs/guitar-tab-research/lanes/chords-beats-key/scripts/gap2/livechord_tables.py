"""Gap round 2: print the LiveChord refiner's score table (markdown) from out/scores/scores.jsonl, and check the output
time grid. Numbers are read from the files, not typed.

Usage: python3 -I livechord_tables.py
"""
import json
import os

OUT = "/home/user/gtr/lanes/chords-beats-key/out"
SC = OUT + "/scores/scores.jsonl"
CLIPS = ["S3", "S4", "R1a", "R1b", "R1c"]
PRIORS = [("beat_this_final0", "Beat This! final0", "beat_this",
           "final0 (prior of the LiveChord refiner, re-scored in gap round 2)"),
          ("madmom_dbn_downbeat", "madmom downbeat tracker", "madmom",
           "RNNDownBeatProcessor+DBNDownBeatTrackingProcessor (prior of the LiveChord refiner, re-scored in gap round 2)")]

rows = {}
for line in open(SC):
    r = json.loads(line)
    rows[(r["tool"], r["variant"], r["clip"], r["subcommand"])] = r


def cells(r):
    b, d = r["metrics"]["beats"], r["metrics"]["downbeats"]
    med = b["timing_of_matched"]["median_s"] if b.get("timing_of_matched") else None
    return ("%.3f / %.3f / %.3f" % (b["f_measure"], b["CMLt"], b["AMLt"]), "%d / %d" % (b["n_est"], b["n_truth"]),
            "%+.0f" % (med * 1000) if med is not None else "(none matched)",
            "%.3f / %.3f" % (d["f_measure"], d["CMLt"]), "%d / %d" % (d["n_est"], d["n_truth"]), r["eval_id"],
            r["gtr_eval_version"])


print("| clip | prior | beats in: F / CMLt / AMLt | est / truth | median offset ms | downbeats in: F / CMLt | est / truth "
      "| eval | refined: F / CMLt / AMLt | est / truth | median offset ms | downbeats refined: F / CMLt | est / truth "
      "| eval |")
print("|" + "---|" * 14)  # 14 columns (was 15, one more than the header; fixed by the round's verifier)
for key, label, tool, variant in PRIORS:
    for c in CLIPS:
        a = cells(rows[(tool, variant, c, "beats")])
        z = cells(rows[("livechord", "refine(prior=%s)" % key, c, "beats")])
        assert a[6] == z[6] == "0.12.1"
        print("| %s | %s | %s |" % (c, label, " | ".join(a[:6] + z[:6])))

grid = 2048 / 22050.0
worst = 0.0
n = 0
for key, _, _, _ in PRIORS:
    for c in CLIPS:
        j = json.load(open(os.path.join(OUT, "livechord", c, "livechord_%s.json" % key)))
        for t in j["refined_beats"] + j["refined_downbeats"]:
            k = round(t / grid)
            worst = max(worst, abs(t - round(k * grid, 4)))
            n += 1
        sub = set(j["refined_downbeats"]) <= set(j["refined_beats"])
        print("%s %s: refined downbeats a subset of refined beats: %s; first refined beat %.4f, first input beat %.3f"
              % (key, c, sub, j["refined_beats"][0], j["beats_in"][0]))
print("refined times checked: %d; largest |t - round(k * 2048/22050, 4)| = %.6f s" % (n, worst))
