"""Essentia 2.1-beta6-dev (essentia-tensorflow 2.1b6.dev1389 wheel): rhythm, key, tuning, chords, TempoCNN.

Usage (venv-essentia, Python 3.11):
  python -I essentia_run.py --audio <file.wav> --outdir <dir> [--tuning-hz 432.45] [--tempocnn-dir <dir with .pb>]

Writes into <outdir> (suffix "_tf<hz>" on key/chord files when --tuning-hz is given):
  beats_multifeature.txt  RhythmExtractor2013(method='multifeature') ticks, seconds, one per line
  beats_degara.txt        RhythmExtractor2013(method='degara') ticks
  rhythm.json             bpm, confidence (multifeature only), estimates, for both methods
  key_<profile>.txt       KeyExtractor(profileType=<profile>) -> "<key> <scale>" ; key.json has key, scale, strength
  tuning.json             TuningFrequencyExtractor(frameSize=4096, hopSize=2048): per-frame running estimate; the last
                          frame's value is reported, with cents = 1200*log2(f/440)
  chords_tonal.lab        TonalExtractor(frameSize=4096, hopSize=2048, tuningFrequency=440).chords_progression, one
                          label per 2048-sample hop (46.4 ms at 44.1 kHz); consecutive equal labels merged; frame i
                          starts at i*2048/44100 s
  tonal.json              TonalExtractor's chords_key/scale, key_key/scale/strength, chord histogram
  tempocnn_<model>.json   TempoCNN(graphFilename=<model>.pb) on MonoLoader(sampleRate=11025): global tempo, local tempi
  timings.json            wall-clock per stage, time.perf_counter inside this script
Audio: MonoLoader(filename, sampleRate=44100) (Essentia's loader: downmix to mono, resample if needed).
"""
import argparse
import json
import math
import os
import time

PROFILES = ["bgate", "krumhansl", "temperley", "edma", "shaath"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--tuning-hz", type=float, default=None,
                    help="tuning frequency passed to KeyExtractor and TonalExtractor (default 440)")
    ap.add_argument("--tempocnn-dir", default=None)
    ap.add_argument("--only-tonal", action="store_true", help="skip rhythm, tuning and TempoCNN")
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    t0 = time.perf_counter()
    import numpy as np
    import essentia
    import essentia.standard as es
    tim = {"essentia_version": essentia.__version__, "import_s": round(time.perf_counter() - t0, 3)}
    outs = {}
    tf = a.tuning_hz if a.tuning_hz else 440.0
    sfx = "" if a.tuning_hz is None else "_tf%g" % a.tuning_hz

    t = time.perf_counter()
    audio = es.MonoLoader(filename=a.audio, sampleRate=44100)()
    tim["load_s"] = round(time.perf_counter() - t, 3)
    dur = len(audio) / 44100.0

    if not a.only_tonal:
        rh = {}
        for method in ("multifeature", "degara"):
            t = time.perf_counter()
            bpm, ticks, conf, est, intervals = es.RhythmExtractor2013(method=method)(audio)
            tim["rhythm_%s_s" % method] = round(time.perf_counter() - t, 3)
            np.savetxt(os.path.join(a.outdir, "beats_%s.txt" % method), ticks, fmt="%.3f")
            rh[method] = {"bpm": float(bpm), "confidence": float(conf), "n_ticks": int(len(ticks)),
                          "estimates_first10": [round(float(x), 2) for x in est[:10]]}
        with open(os.path.join(a.outdir, "rhythm.json"), "w") as f:
            json.dump(rh, f, indent=1)
        outs["rhythm"] = {m: (rh[m]["bpm"], rh[m]["confidence"], rh[m]["n_ticks"]) for m in rh}

        t = time.perf_counter()
        tfr = es.TuningFrequencyExtractor(frameSize=4096, hopSize=2048)(audio)
        tim["tuning_s"] = round(time.perf_counter() - t, 3)
        last = float(tfr[-1]) if len(tfr) else float("nan")
        tun = {"n_frames": int(len(tfr)), "last_frame_hz": last,
               "last_frame_cents_vs_440": round(1200 * math.log2(last / 440.0), 2) if last > 0 else None,
               "median_hz": float(np.median(tfr)) if len(tfr) else None,
               "call": "TuningFrequencyExtractor(frameSize=4096, hopSize=2048) on MonoLoader(sampleRate=44100)"}
        with open(os.path.join(a.outdir, "tuning.json"), "w") as f:
            json.dump(tun, f, indent=1)
        outs["tuning_cents"] = tun["last_frame_cents_vs_440"]

    keys = {}
    for prof in PROFILES:
        t = time.perf_counter()
        k, s, st = es.KeyExtractor(profileType=prof, tuningFrequency=tf)(audio)
        tim["key_%s%s_s" % (prof, sfx)] = round(time.perf_counter() - t, 3)
        keys[prof] = {"key": k, "scale": s, "strength": round(float(st), 4)}
        with open(os.path.join(a.outdir, "key_%s%s.txt" % (prof, sfx)), "w") as f:
            f.write("%s %s\n" % (k, s))
    with open(os.path.join(a.outdir, "key%s.json" % sfx), "w") as f:
        json.dump({"tuningFrequency": tf, "profiles": keys}, f, indent=1)
    outs["keys"] = {p: "%s %s" % (keys[p]["key"], keys[p]["scale"]) for p in keys}

    t = time.perf_counter()
    r = es.TonalExtractor(frameSize=4096, hopSize=2048, tuningFrequency=tf)(audio)
    tim["tonal%s_s" % sfx] = round(time.perf_counter() - t, 3)
    names = es.TonalExtractor().outputNames()
    res = dict(zip(names, r))
    prog = list(res["chords_progression"])
    hop = 2048 / 44100.0
    segs = []
    for i, lab in enumerate(prog):
        if segs and segs[-1][2] == lab:
            segs[-1][1] = (i + 1) * hop
        else:
            segs.append([i * hop, (i + 1) * hop, lab])
    if segs:
        segs[-1][1] = max(segs[-1][1], dur)
    with open(os.path.join(a.outdir, "chords_tonal%s.lab" % sfx), "w") as f:
        for s, e, lab in segs:
            f.write("%.3f\t%.3f\t%s\n" % (s, e, lab))
    with open(os.path.join(a.outdir, "tonal%s.json" % sfx), "w") as f:
        json.dump({"tuningFrequency": tf, "n_frames": len(prog), "n_segments": len(segs),
                   "chords_key": res["chords_key"], "chords_scale": res["chords_scale"],
                   "key_key": res["key_key"], "key_scale": res["key_scale"],
                   "key_strength": float(res["key_strength"]),
                   "chords_changes_rate": float(res["chords_changes_rate"]),
                   "chords_histogram": [round(float(x), 3) for x in res["chords_histogram"]],
                   "labels_used": sorted(set(prog))}, f, indent=1)
    outs["tonal"] = {"n_segments": len(segs), "key": "%s %s" % (res["key_key"], res["key_scale"])}

    if a.tempocnn_dir and not a.only_tonal:
        t = time.perf_counter()
        audio11 = es.MonoLoader(filename=a.audio, sampleRate=11025)()
        tim["load11025_s"] = round(time.perf_counter() - t, 3)
        for model in ("deeptemp-k16-3", "deeptemp-k4-3"):
            pb = os.path.join(a.tempocnn_dir, model + ".pb")
            t = time.perf_counter()
            g, local, probs = es.TempoCNN(graphFilename=pb)(audio11)
            tim["tempocnn_%s_s" % model] = round(time.perf_counter() - t, 3)
            with open(os.path.join(a.outdir, "tempocnn_%s.json" % model), "w") as f:
                json.dump({"model": model, "global_tempo": float(g),
                           "local_tempo": [float(x) for x in local],
                           "local_tempo_max_prob": [round(float(p.max()), 4) for p in probs]}, f, indent=1)
            outs["tempocnn_" + model] = float(g)
    tim["outputs"] = outs
    with open(os.path.join(a.outdir, "timings%s.json" % sfx), "w") as f:
        json.dump(tim, f, indent=1)
    print(json.dumps(tim))


if __name__ == "__main__":
    main()
