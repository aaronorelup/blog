"""Gap round 1: update this lane's tools.json from the gap round's outputs (numbers are read from the files, not typed).

Usage: python3 -I gap1_tools_json.py   (rewrites tools.json in place, same formatting: indent=2, ensure_ascii=False)
Run it once on the pre-gap-round tools.json: a second run would append the r0605 run to autochord, CREMA and lv-chordia
again and prefix the gap-round notes twice. (It was run once on 2026-11-11; afterwards `for_aaron` of All-In-One and
tempo-cnn was set to true by hand, as the two lines below now do.)
"""
import json
import os

LANE = "/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key"
TJ = LANE + "/tools.json"
OUT = "/home/user/gtr/lanes/chords-beats-key/out"
SC = OUT + "/scores/scores.jsonl"


def scores():
    d = {}
    for line in open(SC):
        r = json.loads(line)
        d[(r["tool"], r["variant"], r["clip"], r["subcommand"])] = r
    return d


S = scores()


def find(d, name):
    for t in d["tools"]:
        if t["name"] == name:
            return t
    raise KeyError(name)


def allin1_entry(t):
    rows = {}
    B = {}
    for f in ("/home/user/gtr/lanes/chords-beats-key/logs/gap1/batch_allin1_S3.jsonl",
              "/home/user/gtr/lanes/chords-beats-key/logs/gap1/batch_allin1.jsonl"):
        for line in open(f):
            r = json.loads(line)
            B[r["clip"]] = r
    for c in ["S3", "S4", "S7flat30", "S2n", "S5capo2", "S5dropd", "R1a", "R1b", "R1c", "R2full"]:
        tj = json.load(open(os.path.join(OUT, "allin1", c, "timings.json")))
        res = json.load(open(os.path.join(OUT, "allin1", c, c + ".json")))
        s = "job %.1f s (htdemucs %.1f, inference %.1f), bpm %s, %d beats / %d downbeats" % (
            B[c]["wall_s"], tj["demix_htdemucs_subprocess"]["wall_s"], tj["run_inference"]["wall_s"], res["bpm"],
            len(res["beats"]), len(res["downbeats"]))
        rb = S.get(("allin1", "beats", c, "beats"))
        rt = S.get(("allin1", "tempo", c, "tempo"))
        if rb:
            m = rb["metrics"]
            s += "; beat F %.3f, AMLt %.3f, downbeat F %.3f (%s); tempo ratio %.3f (%s)" % (
                m["beats"]["f_measure"], m["beats"]["AMLt"], m["downbeats"]["f_measure"], rb["eval_id"],
                rt["metrics"]["ratio_est_over_truth"], rt["eval_id"])
        rows[c] = s
    t["tried"] = True
    t["tried_how"] = "local-cpu"
    t["runs"] = [
        {"run_id": "r0512", "input_id": "build NATTEN 0.17.4 from its PyPI sdist (CPU only)", "cores": 2, "wall_s": 224.85,
         "peak_mb": 1303.1, "exit_code": 1, "output_files": [],
         "metrics": {"note": "built, but `import natten` failed on Python 3.9: TypeError in natten/flops.py line 82 (X | Y annotation)"}},
        {"run_id": "r0518", "input_id": "build NATTEN 0.17.3 from its PyPI sdist (CPU only)", "cores": 2, "wall_s": 97.45,
         "peak_mb": 1302.9, "exit_code": 0, "output_files": [], "metrics": {"cpu_s": 158.6}},
        {"run_id": "r0521", "input_id": "S3", "cores": 2, "wall_s": 103.54, "peak_mb": 1552.6, "exit_code": 0,
         "output_files": ["samples/allin1/"], "metrics": {"per_clip": {"S3": rows["S3"]}}},
        {"run_id": "r0563", "input_id": "S4,S7flat30,S2n,S5capo2,S5dropd,R1a,R1b,R1c,R2full", "cores": 2,
         "wall_s": 1854.58, "peak_mb": 2038.5, "exit_code": 0, "output_files": ["samples/allin1/"],
         "metrics": {"cpu_s": 2178.5, "note": "every job's wall time includes the Demucs htdemucs separation subprocess",
                     "per_clip": {c: rows[c] for c in rows if c != "S3"}}},
        {"run_id": "r0576", "input_id": "S4 (allin1 CLI as published)", "cores": 2, "wall_s": 155.62, "peak_mb": 1526.9,
         "exit_code": 0, "output_files": ["samples/allin1/S4.cli_r0576.json"],
         "metrics": {"note": "same bpm, beats, downbeats and positions as r0563's S4; one segment boundary 20.70 s vs 20.69 s (Demucs --shifts 1 uses a random offset)"}},
    ]
    t["not_run_reason"] = None
    t["for_aaron"] = True  # for-aaron.md keeps an optional section for a GPU or Windows run
    t["version"] = t["version"] + "; gap round 1 ran it with NATTEN 0.17.3 (built from the PyPI sdist, CPU), madmom 0.16.1 (PyPI), demucs 4.0.1, torch 2.5.1+cpu, Python 3.9"
    t["unverified"] = [u for u in t["unverified"] if "NATTEN builds on Windows" not in u] + [
        "whether NATTEN 0.17.4 imports on Python 3.10 or newer (it did not on 3.9 here) and whether it builds on Windows with CUDA (for-aaron.md step 5)",
        "the allin1 README's NATTEN website (shi-labs.com/natten) had an expired TLS certificate on 2026-11-10 (notAfter Dec 3 2025); its wheel list was not read"]


def tempocnn_entry(t):
    per = {}
    models = ["fcn", "cnn", "ismir2018", "fma2018", "deeptemp", "deepsquare", "shallowtemp", "mazurka"]
    for c in ["S3", "S7flat30", "S4", "S2n", "S5capo2", "S5dropd", "R1a", "R1b", "R1c", "R2full"]:
        d = json.load(open(os.path.join(OUT, "tempocnn", c, "tempocnn.json")))
        cells = []
        for m in models:
            v = d["models"][m]["tempo"]
            r = S.get(("tempocnn", "tempo_" + m, c, "tempo"))
            if r and r.get("metrics"):
                cells.append("%s %s%s %s" % (m, ("%.2f" % v) if m == "fma2018" else "%d" % v,
                                             "" if r["metrics"]["within_tolerance"] else " (x%.2f)" % r["metrics"]["ratio_est_over_truth"],
                                             r["eval_id"]))
            else:
                cells.append("%s %s" % (m, ("%.2f" % v) if m == "fma2018" else "%d" % v))
        per[c] = "; ".join(cells) + "; meter %d" % d["meter"]["numerator"]
    t["tried"] = True
    t["tried_how"] = "local-cpu"
    t["runs"] = [{"run_id": "r0584", "input_id": "S3,S7flat30,S4,S2n,S5capo2,S5dropd,R1a,R1b,R1c,R2full", "cores": 2,
                  "wall_s": 140.95, "peak_mb": 1249.9, "exit_code": 0, "output_files": ["samples/tempocnn/"],
                  "metrics": {"cpu_s": 147.4, "per_clip_wall_s": "S3 26.98 (first job), others 11.1 to 12.3, R2full 20.58",
                              "note": "estimate_tempo per model; (xR) = outside 4 % of the truth, R = ratio; meter = fma2018-meter numerator (truth 4/4 on all nine clips with truth)",
                              "per_clip": per}}]
    t["not_run_reason"] = None
    t["for_aaron"] = True  # for-aaron.md keeps an optional section for a GPU or Windows run
    t["outputs"] = t["outputs"] + ["the 0.0.8 wheel holds 24 tempo models and no key or meter model; fma2018, fma2018-meter, deeptemp_k16 and deepsquare_k16 are downloaded from raw.githubusercontent.com at first use"]
    t["unverified"] = [u for u in t["unverified"] if "for-aaron.md says pip install" not in u]


def skey_entry(t):
    per = {}
    for c in ["S3", "S7flat30", "S4", "S2n", "S5capo2", "S5dropd", "R1a", "R1b", "R1c", "R2", "R2full"]:
        d = json.load(open(os.path.join(OUT, "skey", c, "skey.json")))
        r = S.get(("skey", "key_skey", c, "key"))
        per[c] = "%s (score %.3f)%s" % (d["key"], d["score_max"],
                                        (", weighted %s %s" % (r["metrics"]["weighted_score"], r["eval_id"])) if r else "")
    t["tried"] = True
    t["tried_how"] = "local-cpu"
    t["runs"] = [{"run_id": "r0588", "input_id": "S3,S7flat30,S4,S2n,S5capo2,S5dropd,R1a,R1b,R1c,R2,R2full", "cores": 2,
                  "wall_s": 22.29, "peak_mb": 1158.8, "exit_code": 0, "output_files": ["samples/skey/"],
                  "metrics": {"cpu_s": 28.5, "route": "community ONNX export huggingface.co/aaatmy/skey-onnx (revision c04b6a2b, skey.onnx sha256 50bac66d...12b1, converted from skey.pt sha256 78dfd0ad...ead4, the same file as skey.pt at the repository's main) with onnxruntime 1.31.1 and lane glue (soundfile, torchaudio Resample to 22050 Hz, channel mean); no repository code ran",
                              "per_clip": per}}]
    t["not_run_reason"] = ("(corrected in gap round 1: the same weights ran through the community ONNX export, see runs; "
                           "the repository's own PyTorch route is still not run.) First-round reason: " + t["not_run_reason"])
    t["callable_via"] = sorted(set(t["callable_via"] + ["onnx"]))
    t["unverified"] = t["unverified"] + [
        "README at the converter's commit 918b83d states only that the code is MIT-licensed; README at main adds the non-commercial research restriction for the weights (both read 2026-11-10)"]


def notrun(t, text):
    t["not_run_reason"] = text


def chords_s5capo2(t, tool, variants):
    adds = {}
    for v in variants:
        r = S[(tool, v, "S5capo2", "chords")]
        m = r["metrics"]
        adds[v] = "root %.3f, majmin %.3f, mirex %.3f, %d segments (%s)" % (
            m["root"], m["majmin"], m["other_mir_eval_chord_scores"]["mirex"], r["counts"]["n_est_segments"], r["eval_id"])
    t["runs"].append({"run_id": "r0605", "input_id": "S5capo2 (gap round 1; S3 control run byte-identical to the first round's output)",
                      "cores": 2, "wall_s": 102.1, "peak_mb": 1040.7, "exit_code": 0,
                      "output_files": ["samples/capo_chords/capo_chord_labels.json"],
                      "metrics": {"note": "run total covers autochord, CREMA and lv-chordia, each on S3 and S5capo2; venvs rebuilt from the first-round freezes",
                                  "S5capo2_chords": adds}})


def main():
    d = json.loads(open(TJ).read())
    allin1_entry(find(d, "All-In-One (allin1)"))
    tempocnn_entry(find(d, "tempo-cnn (tempocnn)"))
    skey_entry(find(d, "S-KEY (Deezer self-supervised key estimation)"))
    lk = find(d, "libKeyFinder and keyfinder-cli")
    notrun(lk, lk["not_run_reason"] + " (Gap round 1: still not run. No Debian/Ubuntu package in any suite, no conda-forge package, only the PyPI sdist binding; the CMake build of a 2.2.8 clone was refused: \"Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]\".)")
    qm = find(d, "QM Vamp Plugins (Tempo and Beat Tracker, Bar and Beat Tracker, Key Detector, Tonal Change, Chromagram)")
    notrun(qm, qm["not_run_reason"] + " (Gap round 1: still not run. The download site reset the connection again (2026-11-10 23:30:27 UTC); no Debian, Ubuntu or PyPI package (Ubuntu has only libqm-dsp, the library); the Vamp Plugin Pack 2.0 Linux AppImage holds the plugins only inside its GUI installer program, which was not run.)")
    om = find(d, "Omnizart (chord application)")
    notrun(om, om["not_run_reason"] + " (Gap round 1: one attempt with the omnizart 0.5.0 wheel on Python 3.8, tensorflow 2.5.0 and numpy 1.19.5 preinstalled, no build isolation, failed building madmom 0.16.1: \"madmom/ml/nn/layers.c:38:6: error: #error Cython requires Python 3.9+.\", a C file generated by Cython 3.3.1 left in uv's shared sdist cache by this lane's r0025.)")
    hu = find(d, "Guitar open-string tuning classifier (Hulme et al.)")
    notrun(hu, hu["not_run_reason"] + " (Gap round 1: a new search of the web, arXiv, Hugging Face and PyPI found no open-string tuning or capo detector from audio with published weights or a package; survey.md.)")
    chords_s5capo2(find(d, "autochord"), "autochord", ["chords_autochord"])
    chords_s5capo2(find(d, "CREMA (convolutional and recurrent estimators for music analysis)"), "crema", ["chords_crema"])
    chords_s5capo2(find(d, "lv-chordia / ISMIR 2019 large-vocabulary chord model (Chord-CNN-LSTM)"), "lv_chordia",
                   ["chords_lvchordia_submission", "chords_lvchordia_ismir2017"])
    s = json.dumps(d, indent=2, ensure_ascii=False)
    open(TJ, "w").write(s)
    print("tools.json bytes:", len(s.encode("utf-8")))


if __name__ == "__main__":
    main()
