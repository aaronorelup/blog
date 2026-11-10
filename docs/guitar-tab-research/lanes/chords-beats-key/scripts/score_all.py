"""Score every output of this lane that has ground truth, with gtr-eval, and keep one JSON line per scoring run.

Usage: python3 -I score_all.py [--only <tool>]
Reads   /home/user/gtr/lanes/chords-beats-key/out/<tool>/<clip>/...
Writes  /home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/samples/scores/scores.jsonl
        (tool, variant, clip, subcommand, est file + sha256, gtr-eval id, metrics, counts)
A (tool, variant, clip, subcommand, est sha256, options) already in scores.jsonl is not scored again.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess

OUT = "/home/user/gtr/lanes/chords-beats-key/out"
SC = "/home/user/gtr/lanes/chords-beats-key/out/scores/scores.jsonl"
GTR_EVAL = "/home/user/gtr/bin/gtr-eval"
TRUTH = ["S3", "S4", "S7flat30", "S2n", "S2s", "S5capo2", "S5dropd", "S6taps", "R1a", "R1b", "R1c", "S1"]
HAS_CHORDS = {"S3", "S4", "S7flat30", "S2n", "S2s", "S5capo2", "S5dropd", "S6taps", "R1a", "R1b", "R1c"}


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def first_number(p):
    m = re.search(r"[-+]?\d+(?:\.\d+)?", open(p).read())
    return float(m.group(0)) if m else None


def load_done():
    done = {}
    if os.path.exists(SC):
        for line in open(SC):
            r = json.loads(line)
            done[(r["tool"], r["variant"], r["clip"], r["subcommand"], r["est_sha256"], json.dumps(r["args"]))] = r
    return done


def ev(done, tool, variant, clip, sub, est_path, args, est_hash_src=None):
    key_src = est_hash_src if est_hash_src is not None else sha(est_path)
    k = (tool, variant, clip, sub, key_src, json.dumps(args))
    if k in done:
        return done[k]
    cmd = [GTR_EVAL, sub, "--truth", clip] + args
    p = subprocess.run(cmd, capture_output=True, text=True)
    m = re.search(r"\[gtr-eval (e\d+)\]", p.stderr)
    try:
        res = json.loads(p.stdout.strip().splitlines()[-1])
    except Exception:
        res = {"error": (p.stdout + p.stderr)[-500:]}
    rec = {"tool": tool, "variant": variant, "clip": clip, "subcommand": sub, "args": args,
           "est_path": est_path, "est_sha256": key_src, "eval_id": m.group(1) if m else None,
           "gtr_eval_version": res.get("gtr_eval_version"), "metrics": res.get("metrics"),
           "counts": res.get("counts"), "error": res.get("error")}
    with open(SC, "a") as f:
        f.write(json.dumps(rec) + "\n")
    done[k] = rec
    print(tool, variant, clip, sub, rec["eval_id"], json.dumps(rec["metrics"])[:200] if rec["metrics"] else rec["error"])
    return rec


def exists(*parts):
    p = os.path.join(OUT, *parts)
    return p if os.path.exists(p) and os.path.getsize(p) > 0 else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=None)
    a = ap.parse_args()
    os.makedirs(os.path.dirname(SC), exist_ok=True)
    done = load_done()
    for clip in TRUTH:
        def want(t):
            return a.only is None or a.only == t
        # ---------- madmom
        if want("madmom"):
            p = exists("madmom", clip, "beats.txt")
            if p: ev(done, "madmom", "RNNBeatProcessor+DBNBeatTrackingProcessor", clip, "beats", p, ["--est", p])
            p = exists("madmom", clip, "downbeats.txt")
            if p: ev(done, "madmom", "RNNDownBeatProcessor+DBNDownBeatTrackingProcessor", clip, "beats", p, ["--est", p, "--downbeat-col", "2"])
            p = exists("madmom", clip, "tempo.txt")
            if p: ev(done, "madmom", "TempoEstimationProcessor (top tempo)", clip, "tempo", p, ["--est-bpm", str(first_number(p))])
            if clip in HAS_CHORDS:
                for f, v in (("chords_cnn.lab", "CNNChordFeature+CRF"), ("chords_dc.lab", "DeepChroma+DeepChromaChordRecognition")):
                    p = exists("madmom", clip, f)
                    if p: ev(done, "madmom", v, clip, "chords", p, ["--est", p])
            p = exists("madmom", clip, "key.txt")
            if p: ev(done, "madmom", "CNNKeyRecognitionProcessor", clip, "key", p, ["--est-key", open(p).read().strip()])
        # ---------- librosa
        if want("librosa"):
            p = exists("librosa", clip, "beats.txt")
            if p: ev(done, "librosa", "beat.beat_track", clip, "beats", p, ["--est", p])
            p = exists("librosa", clip, "tempo.txt")
            if p: ev(done, "librosa", "feature.tempo", clip, "tempo", p, ["--est-bpm", str(first_number(p))])
            p = exists("librosa", clip, "key_baseline.txt")
            if p: ev(done, "librosa", "chroma_cqt + Krumhansl-Kessler baseline (lane-written)", clip, "key", p, ["--est-key", open(p).read().strip()])
            p = exists("librosa", clip, "tuning.json")
            if p:
                c = json.load(open(p))["estimate_tuning_cents"]
                ev(done, "librosa", "estimate_tuning", clip, "tuning", p, ["--est-cents", str(c)])
        # ---------- essentia
        if want("essentia"):
            for m in ("multifeature", "degara"):
                p = exists("essentia", clip, "beats_%s.txt" % m)
                if p: ev(done, "essentia", "RhythmExtractor2013 %s" % m, clip, "beats", p, ["--est", p])
            p = exists("essentia", clip, "rhythm.json")
            if p:
                r = json.load(open(p))
                for m in ("multifeature", "degara"):
                    ev(done, "essentia", "RhythmExtractor2013 %s bpm" % m, clip, "tempo", p, ["--est-bpm", str(r[m]["bpm"])], est_hash_src=sha(p) + m)
            for model in ("deeptemp-k16-3", "deeptemp-k4-3"):
                p = exists("essentia", clip, "tempocnn_%s.json" % model)
                if p: ev(done, "essentia", "TempoCNN %s" % model, clip, "tempo", p, ["--est-bpm", str(json.load(open(p))["global_tempo"])])
            for prof in ("bgate", "krumhansl", "temperley", "edma", "shaath"):
                for sfx in ("", "_tf432.45"):
                    p = exists("essentia", clip, "key_%s%s.txt" % (prof, sfx))
                    if p: ev(done, "essentia", "KeyExtractor %s%s" % (prof, sfx), clip, "key", p, ["--est-key", open(p).read().strip()])
            if clip in HAS_CHORDS:
                for sfx in ("", "_tf432.45"):
                    p = exists("essentia", clip, "chords_tonal%s.lab" % sfx)
                    if p: ev(done, "essentia", "TonalExtractor chords_progression%s" % sfx, clip, "chords", p, ["--est", p])
            p = exists("essentia", clip, "tuning.json")
            if p:
                c = json.load(open(p))["last_frame_cents_vs_440"]
                ev(done, "essentia", "TuningFrequencyExtractor", clip, "tuning", p, ["--est-cents", str(c)])
        # ---------- beat_this
        if want("beat_this"):
            for ck in ("final0", "small0"):
                p = exists("beat_this", clip, ck + "_beats.txt")
                d = exists("beat_this", clip, ck + "_downbeats.txt")
                if p and d: ev(done, "beat_this", ck, clip, "beats", p, ["--est", p, "--downbeats-est", d])
        # ---------- aubio
        if want("aubio"):
            for f in ("beats_aubio_beat.txt", "beats_aubiotrack.txt"):
                p = exists("aubio", clip, f)
                if p: ev(done, "aubio", f[:-4], clip, "beats", p, ["--est", p])
            p = exists("aubio", clip, "tempo.txt")
            if p: ev(done, "aubio", "aubio tempo", clip, "tempo", p, ["--est-bpm", str(first_number(p))])
        # ---------- chordino (chord-extractor / vamp)
        if want("chordino") and clip in HAS_CHORDS:
            for f in sorted(os.listdir(os.path.join(OUT, "chordino", clip))) if os.path.isdir(os.path.join(OUT, "chordino", clip)) else []:
                if f.endswith(".lab"):
                    p = exists("chordino", clip, f)
                    if p: ev(done, "chordino", f[:-4], clip, "chords", p, ["--est", p])
        if want("chordino"):
            p = exists("chordino", clip, "nnls_tuning.json")
            if p:
                j = json.load(open(p))
                try:
                    hz = float(j["raw"]["list"][0]["values"][0])  # unrounded value; the label rounds to 0.1 Hz
                except Exception:
                    hz = j.get("tuning_hz")
                if hz: ev(done, "chordino", "nnls-chroma tuning output", clip, "tuning", p, ["--est-a4-hz", str(hz)])
        # ---------- generic: any other tool folder with chords*.lab / beats*.txt / key*.txt / tempo*.txt
        for tool in sorted(os.listdir(OUT)):
            if tool in ("madmom", "librosa", "essentia", "beat_this", "aubio", "chordino") or not want(tool):
                continue
            d = os.path.join(OUT, tool, clip)
            if not os.path.isdir(d):
                continue
            for f in sorted(os.listdir(d)):
                p = exists(tool, clip, f)
                if not p:
                    continue
                if f.startswith("chords") and f.endswith(".lab") and clip in HAS_CHORDS:
                    ev(done, tool, f[:-4], clip, "chords", p, ["--est", p])
                elif f.startswith("beats") and f.endswith(".txt"):
                    dbf = os.path.join(d, f.replace("beats", "downbeats"))
                    args = ["--est", p] + (["--downbeats-est", dbf] if os.path.exists(dbf) and dbf != p else [])
                    ev(done, tool, f[:-4], clip, "beats", p, args)
                elif f.startswith("key") and f.endswith(".txt"):
                    ev(done, tool, f[:-4], clip, "key", p, ["--est-key", open(p).read().strip()])
                elif f.startswith("tempo") and f.endswith(".txt"):
                    ev(done, tool, f[:-4], clip, "tempo", p, ["--est-bpm", str(first_number(p))])


if __name__ == "__main__":
    main()
