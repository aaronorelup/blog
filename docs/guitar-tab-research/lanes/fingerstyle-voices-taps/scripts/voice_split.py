"""Split a note list into two voices (melody, bass) with existing tools and plain baselines, and score the split
against the truth voices of an S2-family clip.

Usage: python voice_split.py <clip id> <notes source> <out dir>
  <notes source>: 'truth' (the clip's truth notes with their voice labels removed), or a path to a tool's notes
  (CSV with header onset,offset,pitch[,...] / start_time_s,end_time_s,pitch_midi, or a MIDI file: all non-drum
  notes pooled into one list).
Everything a method sees: onset (s), offset (s), MIDI pitch (rounded to an integer for MIDI-based tools). No voice,
string, fret, velocity or track information is passed on.

Methods (each emits one label per note, 'melody' or 'bass'):
  B1 threshold sweep (baseline): pitch < T -> bass, else melody, for every integer T from 36 to 72.
  B2 lowest-note-per-onset (baseline): notes whose onsets lie within 50 ms of the group's first onset form a group;
     the lowest note of a group is bass, the others melody; a one-note group is bass.
  B3 skyline (baseline): same groups; the highest note is melody, the others bass; a one-note group is melody.
  P1/P2 partitura.musicanalysis.estimate_voices (Chew & Wu 2004 contig mapping) on a note array built from the
     list, monophonic_voices False (P1) / True (P2). Partitura returns voice numbers 1..k; mapped to labels without
     truth: the voice with the highest mean pitch is melody, every other voice is bass.
  M1 music21: the notes are written as one single-track MIDI file (pretty_midi, program 24), parsed with
     music21.converter.parse; reports the Notes, Chords and Voices music21 creates. music21 assigns no
     melody/bass labels itself; M1 labels each Chord's lowest pitch (Chord.bass()) bass and its other pitches
     melody; a single Note inside a music21 Voice is melody when its Voice has the highest mean pitch of the
     Voices in that Measure, else bass; a single Note outside any Voice is bass.
Scoring: fvt_common.voice_accuracy (one-to-one match to truth notes, onset within 50 ms and pitch within 0.5
semitone, then the fraction of matched pairs whose labels agree). For B1 the whole sweep is written.
"""
import csv
import json
import os
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fvt_common import load_truth, voice_accuracy  # noqa: E402

cid, src, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
truth = load_truth(cid)
tnotes = [n for n in truth["notes"] if n["voice"] in ("melody", "bass")]


def read_notes(src):
    if src == "truth":
        return [{"onset": n["onset"], "offset": n["offset"], "pitch": n["pitch"]} for n in tnotes]
    if src.lower().endswith((".mid", ".midi")):
        import pretty_midi
        pm = pretty_midi.PrettyMIDI(src)
        ns = [{"onset": n.start, "offset": n.end, "pitch": n.pitch} for i in pm.instruments if not i.is_drum for n in i.notes]
        return sorted(ns, key=lambda n: (n["onset"], n["pitch"]))
    with open(src) as f:
        rows = list(csv.DictReader(f))
    k = rows[0].keys()
    on = next(c for c in ("onset", "start_time_s", "start") if c in k)
    off = next(c for c in ("offset", "end_time_s", "end") if c in k)
    pi = next(c for c in ("pitch", "pitch_midi", "midi") if c in k)
    return sorted([{"onset": float(r[on]), "offset": float(r[off]), "pitch": float(r[pi])} for r in rows],
                  key=lambda n: (n["onset"], n["pitch"]))


notes = read_notes(src)
res = {"clip": cid, "source": src, "n_notes_in": len(notes), "methods": {}}


def score(name, labels, extra=None, seconds=None):
    pred = [dict(n, voice=l) for n, l in zip(notes, labels)]
    r = voice_accuracy(pred, tnotes)
    r["n_labelled_melody"] = int(sum(l == "melody" for l in labels))
    r["n_labelled_bass"] = int(sum(l == "bass" for l in labels))
    if extra:
        r.update(extra)
    if seconds is not None:
        r["seconds"] = round(seconds, 4)
    res["methods"][name] = r
    with open(os.path.join(out, f"{name}.csv"), "w") as f:
        f.write("onset,offset,pitch,voice\n")
        for p in pred:
            f.write(f"{p['onset']:.6f},{p['offset']:.6f},{p['pitch']},{p['voice']}\n")


def groups(ns, win=0.05):
    g, cur, t0 = [], [], None
    for i, n in enumerate(ns):
        if cur and n["onset"] - t0 <= win:
            cur.append(i)
        else:
            if cur:
                g.append(cur)
            cur, t0 = [i], n["onset"]
    if cur:
        g.append(cur)
    return g


# B1 threshold sweep
sweep = {}
for T in range(36, 73):
    labels = ["bass" if n["pitch"] < T else "melody" for n in notes]
    pred = [dict(n, voice=l) for n, l in zip(notes, labels)]
    r = voice_accuracy(pred, tnotes)
    sweep[T] = {"n_voice_agree": r.get("n_voice_agree"), "n_matched": r["n_matched"],
                "fraction": r.get("fraction_voice_agree_of_matched")}
res["B1_threshold_sweep"] = sweep
# B2 / B3
gs = groups(notes)
lab2, lab3 = [None] * len(notes), [None] * len(notes)
for g in gs:
    lo = min(g, key=lambda i: notes[i]["pitch"])
    hi = max(g, key=lambda i: notes[i]["pitch"])
    for i in g:
        lab2[i] = "bass" if i == lo else "melody"
        lab3[i] = "melody" if i == hi else "bass"
    if len(g) == 1:
        lab2[g[0]], lab3[g[0]] = "bass", "melody"
score("B2_lowest_per_onset", lab2, {"n_groups": len(gs)})
score("B3_skyline", lab3, {"n_groups": len(gs)})

# partitura
import partitura  # noqa: E402
from partitura.musicanalysis import estimate_voices  # noqa: E402

na = np.zeros(len(notes), dtype=[("onset_sec", "f4"), ("duration_sec", "f4"), ("pitch", "i4"), ("id", "U10")])
for i, n in enumerate(notes):
    na[i] = (n["onset"], max(n["offset"] - n["onset"], 0.001), int(round(n["pitch"])), f"n{i}")
for name, mono in (("P1_partitura_poly", False), ("P2_partitura_mono", True)):
    t0 = time.time()
    try:
        v = estimate_voices(na, monophonic_voices=mono)
        dt = time.time() - t0
        ids = sorted(set(int(x) for x in v))
        means = {k: float(np.mean([notes[i]["pitch"] for i in range(len(notes)) if v[i] == k])) for k in ids}
        top = max(means, key=means.get)
        labels = ["melody" if v[i] == top else "bass" for i in range(len(notes))]
        counts = {int(k): int(np.sum(v == k)) for k in ids}
        score(name, labels, {"n_voices": len(ids), "notes_per_voice": counts, "mean_pitch_per_voice": means,
                             "partitura": partitura.__version__}, dt)
    except Exception as e:
        res["methods"][name] = {"error": repr(e)[:500]}

# music21
try:
    import music21 as m21
    import pretty_midi
    pm = pretty_midi.PrettyMIDI(initial_tempo=float(truth.get("tempo_bpm") or 120))
    inst = pretty_midi.Instrument(program=24)
    for n in notes:
        inst.notes.append(pretty_midi.Note(velocity=80, pitch=int(round(n["pitch"])), start=n["onset"],
                                           end=max(n["offset"], n["onset"] + 0.01)))
    pm.instruments.append(inst)
    mid = os.path.join(out, "merged_single_track.mid")
    pm.write(mid)
    t0 = time.time()
    s = m21.converter.parse(mid)
    parts = list(s.parts)
    flat = s.flatten()
    n_chords = len(flat.getElementsByClass("Chord"))
    n_single = len(flat.getElementsByClass("Note"))
    n_voices = len(list(s.recurse().getElementsByClass("Voice")))
    # label each pitch occurrence; then map back to our notes by (offset in seconds, pitch)
    # music21 gives offsets in quarter notes; convert with the file's single tempo
    qps = 60.0 / float(truth.get("tempo_bpm") or 120)
    topv = set()  # per Measure: the Voice with the highest mean pitch
    for meas in s.recurse().getElementsByClass("Measure"):
        vm = {}
        for vo in meas.getElementsByClass("Voice"):
            ps = [p.midi for el in vo.notes for p in el.pitches]
            if ps:
                vm[id(vo)] = float(np.mean(ps))
        if vm:
            topv.add(max(vm, key=vm.get))
    occ = []
    for el in s.recurse().notes:
        on = float(el.getOffsetInHierarchy(s)) * qps
        if isinstance(el, m21.chord.Chord):
            b = el.bass().midi
            for p in el.pitches:
                occ.append((on, p.midi, "bass" if p.midi == b else "melody"))
        else:
            v = el.getContextByClass("Voice")
            lab = ("melody" if (v is not None and id(v) in topv) else "bass")
            occ.append((on, el.pitch.midi, lab))
    dt = time.time() - t0
    labels = []
    used = set()
    for n in notes:
        best, bd = None, 1e9
        for j, (on, p, l) in enumerate(occ):
            if j in used or p != int(round(n["pitch"])):
                continue
            d = abs(on - n["onset"])
            if d < bd:
                best, bd = j, d
        if best is not None and bd <= 0.1:
            used.add(best)
            labels.append(occ[best][2])
        else:
            labels.append("bass")
    score("M1_music21", labels, {"music21": m21.__version__, "n_parts": len(parts), "n_chords": n_chords,
                                 "n_single_notes": n_single, "n_voices": n_voices,
                                 "n_notes_not_found_back": len(notes) - len(used)}, dt)
except Exception as e:
    import traceback
    res["methods"]["M1_music21"] = {"error": traceback.format_exc()[-800:]}

with open(os.path.join(out, "voice_split.json"), "w") as f:
    json.dump(res, f, indent=1)
best_T = [T for T, v in sweep.items() if v["fraction"] is not None and v["fraction"] == max(x["fraction"] or 0 for x in sweep.values())]
print(json.dumps({"clip": cid, "source": src, "n_notes_in": len(notes),
                  "sweep_max_fraction": max(x["fraction"] or 0 for x in sweep.values()), "sweep_argmax_T": best_T,
                  **{k: {kk: v.get(kk) for kk in ("n_matched", "n_voice_agree", "fraction_voice_agree_of_matched", "n_voices", "error")}
                     for k, v in res["methods"].items()}}, indent=1))
