"""Gap round 1: count how many truth notes a voice-separation result puts in the right voice, for a result written
as MEI or MusicXML (what Cluster and Separate / piano_svsep writes), the same way this lane scored partitura and
music21 (fvt_common.voice_accuracy: one-to-one matching, onset within 50 ms, pitch within half a semitone, then the
share of matched pairs whose melody/bass label equals the truth voice).

The file is read with partitura (pt.load_score). Note times: onset_quarter * 60 / tempo, with the clip's tempo from
its truth file (the input MusicXML was written from a MIDI file at that tempo, first bar at 0 s). Two labelling
rules, neither uses the truth:
  staff rule: notes are grouped by (part, staff); the group with the highest mean pitch is melody, the others bass;
  voice rule: notes are grouped by (part, staff, voice); the group with the highest mean pitch is melody, the others
              bass (the rule used for partitura's voices, P1 / P2 in trials.md).
With --selftest the script writes the clip's truth as a two-part MusicXML (melody part, bass part, via pretty_midi
and music21) and scores that file, which must give every matched note the right voice under both rules.

usage: python gap1_score_svsep.py <pred .mei|.musicxml|.xml> <clip id> [--out result.json]
       python gap1_score_svsep.py --selftest <clip id> <work dir>
"""
import json
import os
import sys
from collections import defaultdict

import numpy as np
import partitura as pt

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fvt_common import load_truth, voice_accuracy  # noqa: E402


def read_notes(path, tempo):
    score = pt.load_score(path)
    notes = []
    for pi, part in enumerate(score.parts):
        na = part.note_array(include_staff=True)
        for n in na:
            notes.append({"onset": float(n["onset_quarter"]) * 60.0 / tempo,
                          "offset": float(n["onset_quarter"] + n["duration_quarter"]) * 60.0 / tempo,
                          "pitch": int(n["pitch"]), "part": pi, "staff": int(n["staff"]), "pvoice": int(n["voice"])})
    return notes


def label(notes, key):
    groups = defaultdict(list)
    for n in notes:
        groups[key(n)].append(n["pitch"])
    top = max(groups, key=lambda g: np.mean(groups[g]))
    out = [dict(n, voice="melody" if key(n) == top else "bass") for n in notes]
    desc = {str(g): {"notes": len(v), "mean_pitch": round(float(np.mean(v)), 2)} for g, v in sorted(groups.items())}
    return out, desc


def score(path, clip):
    truth = load_truth(clip)
    notes = read_notes(path, truth["tempo_bpm"])
    res = {"file": path, "clip": clip, "tempo_bpm": truth["tempo_bpm"], "n_notes_read": len(notes)}
    for name, key in (("staff_rule", lambda n: (n["part"], n["staff"])),
                      ("voice_rule", lambda n: (n["part"], n["staff"], n["pvoice"]))):
        lab, groups = label(notes, key)
        acc = voice_accuracy(lab, truth["notes"])
        res[name] = {"groups": groups, "n_matched": acc["n_matched"], "n_right_voice": acc["n_voice_agree"],
                     "confusion": acc["confusion"]}
    return res


def selftest(clip, work):
    import music21
    import pretty_midi

    truth = load_truth(clip)
    os.makedirs(work, exist_ok=True)
    pm = pretty_midi.PrettyMIDI(initial_tempo=truth["tempo_bpm"])
    for v in ("melody", "bass"):
        inst = pretty_midi.Instrument(program=24, name=v)
        for n in truth["notes"]:
            if n["voice"] == v:
                inst.notes.append(pretty_midi.Note(velocity=80, pitch=int(n["pitch"]), start=n["onset"], end=n["offset"]))
        pm.instruments.append(inst)
    mid = os.path.join(work, f"{clip}_truth_two_parts.mid")
    pm.write(mid)
    xml = os.path.join(work, f"{clip}_truth_two_parts.musicxml")
    music21.converter.parse(mid).write("musicxml", fp=xml)
    return score(xml, clip)


if __name__ == "__main__":
    if sys.argv[1] == "--selftest":
        r = selftest(sys.argv[2], sys.argv[3])
    else:
        r = score(sys.argv[1], sys.argv[2])
        if "--out" in sys.argv:
            json.dump(r, open(sys.argv[sys.argv.index("--out") + 1], "w"), indent=1)
    print(json.dumps(r))
