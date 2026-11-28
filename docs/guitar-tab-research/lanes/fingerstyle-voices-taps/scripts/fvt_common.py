"""Shared helpers for the fingerstyle-voices-taps lane (truth loading, onset classes, voice scoring).

Used by the other scripts in this folder. Facts only: every function documents exactly what it counts.
"""
import json
import os

import numpy as np

INPUTS = "/home/user/gtr/inputs"
LANE = "/home/user/gtr/lanes/fingerstyle-voices-taps"


def load_truth(cid):
    with open(os.path.join(INPUTS, cid, f"{cid}.truth.json")) as f:
        return json.load(f)


def note_onset_groups(truth, merge_s=0.001, voice=None):
    """Truth note onsets, with onsets that coincide within merge_s merged into one (a chord = one onset).

    This is the same merge rule gtr-eval onsets --field notes uses (to the millisecond)."""
    ons = sorted(n["onset"] for n in truth["notes"] if voice is None or n["voice"] == voice)
    groups = []
    for t in ons:
        if groups and t - groups[-1] <= merge_s:
            continue
        groups.append(t)
    return np.array(groups)


def event_classes(truth, coincide_s=0.001):
    """Union of tap times and note-onset groups, each labelled.

    A tap within coincide_s of a note-onset group is the same event (label 'tap+note'); a tap with no note
    onset that close is 'tap-only'; a note-onset group with no tap is 'note-only'.
    Returns (times array, labels list, tap kinds list (None for note-only))."""
    groups = note_onset_groups(truth)
    taps = sorted((t["time"], t["kind"]) for t in truth.get("taps", []))
    events = [[g, "note-only", None] for g in groups]
    for tt, kind in taps:
        d = np.abs(groups - tt) if len(groups) else np.array([np.inf])
        i = int(np.argmin(d)) if len(groups) else -1
        if i >= 0 and d[i] <= coincide_s:
            events[i][1] = "tap+note"
            events[i][2] = kind
        else:
            events.append([tt, "tap-only", kind])
    events.sort(key=lambda e: e[0])
    return np.array([e[0] for e in events]), [e[1] for e in events], [e[2] for e in events]


def classify_onsets(est, truth, window=0.05, coincide_s=0.001):
    """Match estimated onset times one-to-one to the labelled events (mir_eval.util.match_events,
    maximum bipartite matching, |est - ref| <= window) and count matches per event label.
    Unmatched estimates are 'neither' (not within the window of any event left unmatched)."""
    import mir_eval

    times, labels, kinds = event_classes(truth, coincide_s)
    est = np.sort(np.asarray(est, dtype=float))
    matching = mir_eval.util.match_events(times, est, window) if len(est) else []
    out = {"n_est": int(len(est)), "n_events": int(len(times)),
           "events_by_label": {l: labels.count(l) for l in ("tap+note", "note-only", "tap-only")},
           "matched_by_label": {"tap+note": 0, "note-only": 0, "tap-only": 0},
           "matched_by_tap_kind": {}, "neither": 0, "window_s": window, "coincide_s": coincide_s}
    for ri, ei in matching:
        out["matched_by_label"][labels[ri]] += 1
        if kinds[ri] is not None:
            out["matched_by_tap_kind"][kinds[ri]] = out["matched_by_tap_kind"].get(kinds[ri], 0) + 1
    out["neither"] = int(len(est) - len(matching))
    out["matched_total"] = int(len(matching))
    return out


def write_times(path, times):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        for t in times:
            f.write(f"{float(t):.6f}\n")


def voice_accuracy(notes_pred, truth_notes, onset_tol=0.05, pitch_tol_semitones=0.5):
    """Fraction of notes given the right voice.

    notes_pred: list of dicts with onset, pitch (MIDI, may be float), voice ('melody'/'bass').
    Each predicted note is matched one-to-one to a truth note with |onset diff| <= onset_tol and
    |pitch diff| <= pitch_tol_semitones (mir_eval.transcription.match_notes, offsets ignored).
    Returns counts: matched pairs, pairs whose voice labels agree, and the per-voice confusion."""
    import mir_eval

    def arr(ns):
        iv = np.array([[n["onset"], max(n.get("offset", n["onset"] + 0.1), n["onset"] + 0.001)] for n in ns])
        hz = np.array([440.0 * 2 ** ((float(n["pitch"]) - 69) / 12) for n in ns])
        return iv, hz

    if not notes_pred:
        return {"n_pred": 0, "n_truth": len(truth_notes), "n_matched": 0}
    riv, rhz = arr(truth_notes)
    eiv, ehz = arr(notes_pred)
    m = mir_eval.transcription.match_notes(riv, rhz, eiv, ehz, onset_tolerance=onset_tol,
                                           pitch_tolerance=pitch_tol_semitones * 100, offset_ratio=None)
    conf = {}
    agree = 0
    for ri, ei in m:
        tv, pv = truth_notes[ri]["voice"], notes_pred[ei]["voice"]
        conf[f"truth_{tv}->pred_{pv}"] = conf.get(f"truth_{tv}->pred_{pv}", 0) + 1
        agree += int(tv == pv)
    return {"n_pred": len(notes_pred), "n_truth": len(truth_notes), "n_matched": len(m),
            "n_voice_agree": agree, "fraction_voice_agree_of_matched": (agree / len(m)) if m else None,
            "confusion": conf, "onset_tol_s": onset_tol, "pitch_tol_semitones": pitch_tol_semitones}
