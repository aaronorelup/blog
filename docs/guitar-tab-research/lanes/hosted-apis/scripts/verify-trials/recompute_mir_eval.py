"""verify-trials-hosted-apis: recompute one or more metrics per tool directly with mir_eval / pretty_midi / numpy,
independently of gtr-eval, from the saved outputs in samples/ and the truth files in /home/user/gtr/inputs/.
Run with the gtr-eval venv's Python (mir_eval 0.8.2): /home/user/gtr/eval/venv/bin/python -I recompute_mir_eval.py
Prints one JSON object per check."""
import json, os
import numpy as np
import mir_eval, pretty_midi

S = "/home/user/blog/docs/guitar-tab-research/lanes/hosted-apis/samples"
I = "/home/user/gtr/inputs"


def truth(c):
    return json.load(open(f"{I}/{c}/{c}.truth.json"))


def hz(m):
    return 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)


def notes_f1(ref, est, onset_tol=0.05):
    ri = np.array([[n["onset"], max(n["offset"], n["onset"] + 1e-3)] for n in ref])
    rp = hz([n["pitch"] for n in ref])
    if not est:
        return {"n_ref": len(ref), "n_est": 0, "p": 0.0, "r": 0.0, "f1": 0.0}
    ei = np.array([[a, max(b, a + 1e-3)] for a, b, _ in est])
    ep = hz([p for _, _, p in est])
    p, r, f, _ = mir_eval.transcription.precision_recall_f1_overlap(ri, rp, ei, ep, onset_tolerance=onset_tol,
                                                                     pitch_tolerance=50.0, offset_ratio=None)
    m = mir_eval.transcription.match_notes(ri, rp, ei, ep, onset_tolerance=onset_tol, pitch_tolerance=50.0,
                                           offset_ratio=None)
    return {"n_ref": len(ref), "n_est": len(est), "n_matched": len(m), "p": round(p, 6), "r": round(r, 6), "f1": round(f, 6)}


def midi_notes(path, programs=None):
    pm = pretty_midi.PrettyMIDI(path)
    out = []
    for ins in pm.instruments:
        if ins.is_drum or (programs and ins.program not in programs):
            continue
        out += [(n.start, n.end, n.pitch) for n in ins.notes]
    return out


def chord_root(c, est_chords):
    t = truth(c)
    ri = np.array([[x["start"], x["end"]] for x in t["chords"]])
    rl = [x["label"] for x in t["chords"]]
    conv = {"m": ":min", "": ":maj", "7": ":7", "m7": ":min7"}
    def harte(l):
        if l in ("N", "N.C.", "NC"):
            return "N"
        root = l[0] + (l[1] if len(l) > 1 and l[1] in "#b" else "")
        q = l[len(root):]
        return root + conv[q]
    ei = np.array([[x["start"], x["end"]] for x in est_chords])
    el = [harte(x["label"]) for x in est_chords]
    ei, el = mir_eval.util.adjust_intervals(ei, el, ri.min(), ri.max(), mir_eval.chord.NO_CHORD, mir_eval.chord.NO_CHORD)
    iv, r2, e2 = mir_eval.util.merge_labeled_intervals(ri, rl, ei, el)
    d = mir_eval.util.intervals_to_durations(iv)
    return {"root": round(mir_eval.chord.weighted_accuracy(mir_eval.chord.root(r2, e2), d), 6),
            "sevenths": round(mir_eval.chord.weighted_accuracy(mir_eval.chord.sevenths(r2, e2), d), 6)}


res = {}
# Vercel gateway / MiMo: chords root on S3, S4, R1c
for c, d in [("S3", "S3_chords_mimo-v2.6-flash"), ("S4", "S4_chords_mimo-v2.6-flash"), ("R1c", "R1c_chords_mimo-v2.6-flash")]:
    a = json.load(open(f"{S}/vercel-gateway/{d}/answer.json"))
    res[f"mimo_chords_{c}"] = chord_root(c, a["chords"])
    res[f"mimo_key_{c}"] = mir_eval.key.weighted_score(truth(c)["key"], a["key"])
    res[f"mimo_tempo_{c}"] = round((a["tempo_bpm"] - truth(c)["tempo_bpm"]) / truth(c)["tempo_bpm"], 6)
# MiMo notes on S2n
a = json.load(open(f"{S}/vercel-gateway/S2n_notes_mimo-v2.6-flash/answer.json"))
res["mimo_notes_S2n"] = notes_f1(truth("S2n")["notes"], [(n["onset"], n["offset"], n["pitch"]) for n in a["notes"]])
# YourMT3 Spaces (MIDI)
res["yourmt3_S2n_all"] = notes_f1(truth("S2n")["notes"], midi_notes(f"{S}/hf-spaces/yourmt3_S2n/yourmt3_S2n.mid"))
res["yourmt3_S2n_prog24_31"] = notes_f1(truth("S2n")["notes"], midi_notes(f"{S}/hf-spaces/yourmt3_S2n/yourmt3_S2n.mid", set(range(24, 32))))
res["yourmt3cpu_S2n_all"] = notes_f1(truth("S2n")["notes"], midi_notes(f"{S}/hf-spaces/yourmt3cpu_S2n/yourmt3cpu_S2n.mid"))
res["yourmt3cpu_R1c_all"] = notes_f1(truth("R1c")["notes"], midi_notes(f"{S}/hf-spaces/yourmt3cpu_R1c/yourmt3cpu_R1c.mid"))
# handoff: S4 guitar part (voice chord) vs YourMT3-cpu on the ElevenLabs guitar stem
t4 = [n for n in truth("S4")["notes"] if n["voice"] == "chord"]
est = midi_notes(f"{S}/hf-spaces/yourmt3cpu_S4_elguitar/yourmt3cpu_S4_elguitar.mid")
res["handoff_S4_chordvoice"] = notes_f1(t4, est)
res["handoff_S4_chordvoice_shift"] = notes_f1(t4, [(a - 0.025057, b - 0.025057, p) for a, b, p in est])
# Beat This! Space: beats and downbeats
for c, d in [("S4", "beatthis_S4"), ("R1c", "beatthis_R1c")]:
    b = json.load(open(f"{S}/hf-spaces/{d}/beats.json"))
    t = truth(c)
    res[f"beatthis_{c}"] = {"n_est": len(b["beats"]), "n_est_down": len(b.get("downbeats") or []),
                            "beat_F": round(mir_eval.beat.f_measure(np.array(t["beats"]), np.array(b["beats"])), 6),
                            "down_F": round(mir_eval.beat.f_measure(np.array(t["downbeats"]), np.array(b["downbeats"])), 6)}
for k, v in res.items():
    print(json.dumps({k: v}))
