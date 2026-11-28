"""Verifier: recompute at least one metric per tool directly with mir_eval 0.8.2, without gtr-eval's code.

Reads the truth JSON and the tool's saved output, builds the arrays itself, calls mir_eval, prints one line per check
with the value and the eval id it should agree with. Run: /home/user/gtr/eval/venv/bin/python -I independent_mir_eval.py
"""
import json
import re
import numpy as np
import mir_eval

OUT = "/home/user/gtr/lanes/chords-beats-key/out"


def truth(c):
    return json.load(open("/home/user/gtr/inputs/%s/%s.truth.json" % (c, c)))


def beats_file(p, col=None, want=None):
    rows = [l.split() for l in open(p) if l.strip()]
    if col is None:
        return np.array([float(r[0]) for r in rows])
    return np.array([float(r[0]) for r in rows if float(r[col]) == want])


def own_harte(lab):
    # minimal converter for Chordino's short names used in the files checked here
    if lab == "N":
        return "N"
    m = re.match(r"^([A-G][#b]?)(.*)$", lab)
    root, q = m.group(1), m.group(2)
    table = {"": "maj", "m": "min", "7": "7", "m7": "min7", "maj7": "maj7", "6": "maj6"}
    return "%s:%s" % (root, table[q])


def chords(c, p, convert=False, cols=(0, 1, 2)):
    T = truth(c)
    ri = np.array([[x["start"], x["end"]] for x in T["chords"]])
    rl = [x["label"] for x in T["chords"]]
    rows = [re.split(r"\s+", l.strip()) for l in open(p) if l.strip()]
    ei = np.array([[float(r[cols[0]]), float(r[cols[1]])] for r in rows])
    el = [own_harte(r[cols[2]]) if convert else r[cols[2]] for r in rows]
    ei, el = mir_eval.util.adjust_intervals(ei, el, ri.min(), ri.max(), mir_eval.chord.NO_CHORD, mir_eval.chord.NO_CHORD)
    iv, r_, e_ = mir_eval.util.merge_labeled_intervals(ri, rl, ei, el)
    d = mir_eval.util.intervals_to_durations(iv)
    out = {}
    for name, fn in (("root", mir_eval.chord.root), ("majmin", mir_eval.chord.majmin), ("sevenths", mir_eval.chord.sevenths)):
        out[name] = round(mir_eval.chord.weighted_accuracy(fn(r_, e_), d), 3)
    return out


def bf(c, est, field="beats"):
    ref = np.array(truth(c)[field])
    return round(mir_eval.beat.f_measure(ref, est, f_measure_threshold=0.07), 3)


checks = []
# aubio S3 beats (e0494: 0.889)
checks.append(("aubio aubiotrack S3 beat F", bf("S3", beats_file(OUT + "/aubio/S3/beats_aubiotrack.txt")), "e0494 0.889"))
# Chordino S3 chords (e0557: 0.878) with my own label conversion
checks.append(("Chordino S3 root/majmin/sevenths", chords("S3", OUT + "/chordino/S3/chords_chordino.lab", convert=True), "e0557 0.878/0.878/0.878"))
# madmom S3 deep-chroma chords (e0216: 0.919/0.919/0.710), downbeats (e0210: 1.000)
checks.append(("madmom deep-chroma S3", chords("S3", OUT + "/madmom/S3/chords_dc.lab"), "e0216 0.919/0.919/0.710"))
checks.append(("madmom downbeat F S3", bf("S3", beats_file(OUT + "/madmom/S3/downbeats.txt", 1, 1), "downbeats"), "e0210 1.000"))
checks.append(("madmom S2n downbeat F", bf("S2n", beats_file(OUT + "/madmom/S2n/downbeats.txt", 1, 1), "downbeats"), "e0276 0.000"))
# librosa S3 beats (e0219: 0.820) and the key baseline weighted score R1b (e1129: 0.2)
checks.append(("librosa S3 beat F", bf("S3", beats_file(OUT + "/librosa/S3/beats.txt")), "e0219 0.820"))
checks.append(("librosa KK baseline R1b weighted", mir_eval.key.weighted_score(truth("R1b")["key"], open(OUT + "/librosa/R1b/key_baseline.txt").read().strip()), "e1129 0.2"))
# Essentia S7flat30 TonalExtractor at 440 (e0273: 0.000) and at 432.45 (e1218: 0.675)
checks.append(("Essentia TonalExtractor S7flat30 440 Hz", chords("S7flat30", OUT + "/essentia/S7flat30/chords_tonal.lab", convert=True), "e0273 0/0/0"))
checks.append(("Essentia TonalExtractor S7flat30 432.45 Hz", chords("S7flat30", OUT + "/essentia/S7flat30/chords_tonal_tf432.45.lab", convert=True), "e1218 0.675/0.675/0.594"))
# music21 S3 truth MIDI default (e0801: E minor 0.3)
checks.append(("music21 S3 truthmidi default weighted", mir_eval.key.weighted_score("G major", open(OUT + "/music21/S3/key_truthmidi_default-aarden.txt").read().strip()), "e0801 0.3"))
# autochord and CREMA S3 (e1283 0.923/0.923/0.700; e1290 0.931/0.931/0.831)
checks.append(("autochord S3", chords("S3", OUT + "/autochord/S3/chords_autochord.lab"), "e1283 0.923/0.923/0.700"))
checks.append(("CREMA S3", chords("S3", OUT + "/crema/S3/chords_crema.lab"), "e1290 0.931/0.931/0.831"))
# DeepRhythm R1b tempo ratio (e1342 0.989)
dr = json.load(open(OUT + "/deeprhythm/R1b/deeprhythm.json"))
checks.append(("DeepRhythm R1b est/truth", round(float(dr.get("bpm", dr.get("tempo", 0))) / truth("R1b")["tempo_bpm"], 3), "e1342 0.989"))
# BeatNet S4 offline beats and downbeats (e1348: 0.951, downbeat 0.944)
bn = OUT + "/beatnet/S4/beatnet_offline.txt"
checks.append(("BeatNet offline S4 beat F / downbeat F", (bf("S4", beats_file(bn)), bf("S4", beats_file(bn, 1, 1), "downbeats")), "e1348 0.951 / 0.944"))
# Beat This! final0 R1c (e1376: 1.000 / 1.000)
checks.append(("Beat This final0 R1c beat F / downbeat F", (bf("R1c", beats_file(OUT + "/beat_this/R1c/final0_beats.txt")), bf("R1c", beats_file(OUT + "/beat_this/R1c/final0_downbeats.txt"), "downbeats")), "e1376 1.000 / 1.000"))
# lv-chordia S3 and S7flat30 submission (e1379 0.965; e1383 0.878/0.878/0.746)
checks.append(("lv-chordia S3 submission", chords("S3", OUT + "/lv_chordia/S3/chords_lvchordia_submission.lab"), "e1379 0.965"))
checks.append(("lv-chordia S7flat30 submission", chords("S7flat30", OUT + "/lv_chordia/S7flat30/chords_lvchordia_submission.lab"), "e1383 0.878/0.878/0.746"))
for c in checks:
    print(" | ".join(str(x) for x in c))
