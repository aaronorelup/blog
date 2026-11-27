#!/usr/bin/env python3
"""score_e1.py <truth.json> <hand_window.csv> [--out score.json] [--maxfret 17] [--notes notes.csv]
Scoring only (reads the answer key): for every fretted key note (fret >= 1, counted from the capo) the window at its onset:
coverage = the key's fret inside lo..hi (rows not lost), excluded = the key's place ruled out, lost share, mean width;
and for every key note (open ones too) the possible places of its pitch (tuning + capo, frets 0..maxfret, one per string)
without and with the window (open strings always allowed; a lost row allows everything).
With --notes (onset,offset,pitch csv, e.g. chain-2's notes): the window as a filter, notes that no place inside the
window can play, split into notes matching a key note (real, onset 50 ms and same pitch) and the rest (invented).
Added by e1-record (2026-11-27), the definitions above unchanged: the same coverage over HEARD key notes alone (conf not
"tab"); every excluded note listed (excluded_notes: onset, string, fret, pitch, conf, the row's lo, hi, f_lo, f_hi,
p_lo, p_hi, conf); and "filter_hf", the same filter by hand_filter.py (the one LOOP hand filter: open strings always,
fretted places inside the window up to fret 24, lost rows keep everything)."""
import argparse, csv, json
import numpy as np
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hand_filter as HF

ap = argparse.ArgumentParser()
ap.add_argument("truth"); ap.add_argument("window"); ap.add_argument("--out", default=None)
ap.add_argument("--maxfret", type=int, default=17); ap.add_argument("--notes", default=None)
a = ap.parse_args()
T = json.load(open(a.truth)); tun = T["tuning_midi"]; capo = int(T["capo"])
rows = list(csv.DictReader(open(a.window)))
wt = np.array([float(r["t"]) for r in rows])


def row(t):
    return rows[int(np.argmin(np.abs(wt - t)))]


def win(t):
    r = row(t)
    if r["lost"] == "1" or r["lo"] == "":
        return None
    return int(r["lo"]), int(r["hi"])


def places(pitch, w):
    out = []
    for si, op in enumerate(tun):  # string 6 .. 1
        fr = pitch - (op + capo)
        if 0 <= fr <= a.maxfret and (fr == 0 or w is None or w[0] <= fr <= w[1]):
            out.append((6 - si, fr))
    return out


fretted = [n for n in T["notes"] if n.get("fret", 0) >= 1]
cov = exc = lost = 0; widths = []; hcov = hexc = hlost = 0; excl = []
for n in fretted:
    w = win(n["onset"]); heard = n.get("conf") != "tab"
    if w is None:
        lost += 1; hlost += heard; continue
    widths.append(w[1] - w[0] + 1)
    if w[0] <= n["fret"] <= w[1]: cov += 1; hcov += heard
    else:
        exc += 1; hexc += heard; r = row(n["onset"])
        excl.append({"onset": round(n["onset"], 3), "string": n["string"], "fret": n["fret"], "pitch": n["pitch"],
                     "conf": n.get("conf"), "row_t": float(r["t"]), "lo": w[0], "hi": w[1], "f_lo": r.get("f_lo"),
                     "f_hi": r.get("f_hi"), "p_lo": r.get("p_lo"), "p_hi": r.get("p_hi"), "row_conf": r.get("conf")})
p0 = [len(places(n["pitch"], None)) for n in T["notes"]]
p1 = [len(places(n["pitch"], win(n["onset"]))) for n in T["notes"]]
res = {"truth": a.truth, "window": a.window, "notes": len(T["notes"]), "fretted": len(fretted),
       "lost": lost, "lost_share": round(lost / len(fretted), 4),
       "coverage_of_not_lost": round(cov / max(1, cov + exc), 4), "excluded": exc,
       "coverage_of_all_fretted": round(cov / len(fretted), 4), "mean_width": round(float(np.mean(widths)), 2) if widths else None,
       "places_per_note_before": round(float(np.mean(p0)), 3), "places_per_note_after": round(float(np.mean(p1)), 3),
       "one_place_before": round(float(np.mean([p == 1 for p in p0])), 3), "one_place_after": round(float(np.mean([p == 1 for p in p1])), 3),
       "key_place_kept": round(float(np.mean([any(pl == (n["string"], n["fret"]) for pl in places(n["pitch"], win(n["onset"])))
                                              for n in T["notes"]])), 4)}
nh = sum(1 for n in fretted if n.get("conf") != "tab")
res.update({"fretted_heard": nh, "lost_heard": hlost, "excluded_heard": hexc,
            "coverage_of_not_lost_heard": round(hcov / max(1, hcov + hexc), 4),
            "coverage_of_all_fretted_heard": round(hcov / max(1, nh), 4),
            "covered": cov, "covered_heard": hcov, "excluded_notes": excl})
if a.notes:
    est = [(float(r[0]), float(r[1]), int(round(float(r[2])))) for r in csv.reader(open(a.notes)) if r and r[0][0].isdigit()]
    kon = sorted((n["onset"], n["pitch"]) for n in T["notes"])
    used = set(); real_drop = inv_drop = real = inv = 0
    for on, off, p in est:
        m = None
        for j, (ko, kp) in enumerate(kon):
            if j in used: continue
            if kp == p and abs(ko - on) <= 0.05: m = j; break
        if m is not None: used.add(m)
        drop = len(places(p, win(on))) == 0
        if m is not None:
            real += 1; real_drop += drop
        else:
            inv += 1; inv_drop += drop
    res["filter"] = {"notes": len(est), "real": real, "invented": inv, "real_removed": real_drop, "invented_removed": inv_drop}
    HT, HW = HF.load_window(a.window); used = set(); f = {"real": 0, "invented": 0, "real_removed": 0, "invented_removed": 0}
    for on, off, p in est:
        m = None
        for j, (ko, kp) in enumerate(kon):
            if j in used: continue
            if kp == p and abs(ko - on) <= 0.05: m = j; break
        if m is not None: used.add(m)
        drop = not HF.allowed(p, HF.window_at(HT, HW, on), tun, capo)
        k = "real" if m is not None else "invented"
        f[k] += 1; f[k + "_removed"] += drop
    res["filter_hf"] = dict(notes=len(est), **f)
print(json.dumps(res))
if a.out: json.dump(res, open(a.out, "w"), indent=1)
