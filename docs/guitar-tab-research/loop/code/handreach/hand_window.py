#!/usr/bin/env python3
"""hand_window.py <landmarks.jsonl> <anchors.json> <out_dir> [--track track.json] [--margin 1] [--fps 30] [--span 0.04]
   [--corrections corrections.txt]
The hand-reach window: for every 1/fps s of the recording (--fps 30 or 10 rows a second), the frets the playing hands
can reach, counted from the capo (the capo is fret 0; open strings are always allowed and are not part of lo..hi).
Writes <out_dir>/hand_window.csv (t, lo, hi, conf, lost, f_lo, f_hi, p_lo, p_hi, nframes) and <out_dir>/tips.jsonl
(per video frame: each tip's fret coordinate f and across position s, for overlays and solvers).
Rules: the fretting hand is the hand on the neck nearer the nut; its four fingertips on or near the board give their
frets (fret = ceil(f), the space behind the wire they are past); the thumb counts when it comes over the string-6 edge.
The picking hand's tips count when they are over the board in front of the soundhole (taps). Window = [min - margin,
max + margin], then moved to frets from the capo and clipped to 1..24. A frame with no fretting hand on the neck, no neck
model (with --track: a time the tracker could not fit), or fewer than two fingertips on the board is lost: no
constraint. Each output row is the union of the video frames within +-span s of the row's time.
--corrections: a text file applied AFTER the window is computed, one line per time range, later lines win:
    <t0> <t1> <lo>-<hi>     the window from t0 to t1 s is lo..hi (frets from the capo); conf 1
    <t0> <t1> lost          no constraint from t0 to t1
    <t0> <t1> shift <n>     every window from t0 to t1 moved by n frets (e.g. the fret numbering was one off)
  "#" starts a comment (write the reason there). The lines applied and the rows they changed go to
  <out_dir>/corrections_applied.json."""
import argparse, json, math, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neck import NeckModel, to_board

TIPS = [8, 12, 16, 20]
THUMB = 4

ap = argparse.ArgumentParser()
ap.add_argument("landmarks"); ap.add_argument("anchors"); ap.add_argument("out")
ap.add_argument("--track", default=None); ap.add_argument("--margin", type=int, default=1)
ap.add_argument("--fps", type=float, default=30.0); ap.add_argument("--span", type=float, default=0.04)
ap.add_argument("--max-fret", type=int, default=22); ap.add_argument("--corrections", default=None)
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
NM = NeckModel(a.anchors, a.track)
capo = int(NM.A.get("capo", 0))
kind = NM.kind

frames = []
with open(a.landmarks) as fh, open(os.path.join(a.out, "tips.jsonl"), "w") as out:
    for line in fh:
        r = json.loads(line)
        t = float(r["t_s"])
        H, nconf = NM.H_at(t)
        rec = {"t": round(t, 4), "lost": True}
        if H is not None and r.get("hands"):
            hands = []
            for h in r["hands"]:
                pts = np.array(h["lm_px_full"], np.float64)
                f, s = to_board(H, pts, kind)
                hands.append({"label": h.get("label"), "score": float(h.get("score", 1.0)), "f": f, "s": s})
            # hands whose fingertips are near the board
            def near(hh):
                return [i for i in TIPS if -0.35 <= hh["s"][i] <= 1.35 and -1.0 <= hh["f"][i] <= a.max_fret + 2]
            onneck = [hh for hh in hands if len(near(hh)) >= 2]
            fret_hand = min(onneck, key=lambda hh: float(np.median(hh["f"][[0, 5, 9, 13, 17]]))) if onneck else None
            if fret_hand is not None:
                tipf = {i: float(fret_hand["f"][i]) for i in near(fret_hand)}
                fr = [max(1, math.ceil(v)) for v in tipf.values() if v > -0.5]
                th = fret_hand["s"][THUMB]
                if -0.3 <= th <= 0.25 and 0 < fret_hand["f"][THUMB] <= a.max_fret:
                    fr.append(max(1, math.ceil(float(fret_hand["f"][THUMB]))))
                    rec["thumb_over"] = True
                pick = [hh for hh in hands if hh is not fret_hand]
                pfr = []
                for ph in pick:
                    for i in TIPS:
                        if -0.1 <= ph["s"][i] <= 1.1 and capo + 0.5 <= ph["f"][i] <= a.max_fret:
                            pfr.append(max(1, math.ceil(float(ph["f"][i]))))
                if len(fr) >= 1:
                    rec.update({"lost": False, "f_lo": min(fr), "f_hi": max(fr), "p": [min(pfr), max(pfr)] if pfr else None,
                                "conf": round(fret_hand["score"] * nconf * min(1.0, len(tipf) / 4), 3),
                                "tips": {str(i): [round(fret_hand["f"][i], 2), round(float(fret_hand["s"][i]), 2)] for i in TIPS + [THUMB]}})
        out.write(json.dumps(rec) + "\n")
        frames.append(rec)

ft = np.array([fr["t"] for fr in frames])
dur = ft[-1]
rows = []
n_out = int(math.floor(dur * a.fps)) + 1
for j in range(n_out):
    t = j / a.fps
    i0, i1 = np.searchsorted(ft, t - a.span - 1e-9), np.searchsorted(ft, t + a.span + 1e-9)
    sel = [frames[i] for i in range(max(0, i0), min(len(frames), max(i1, i0 + 1)))]
    ok = [s for s in sel if not s["lost"]]
    if not ok:
        rows.append((t, "", "", 0.0, 1, "", "", "", "", len(sel))); continue
    flo = min(s["f_lo"] for s in ok) - a.margin; fhi = max(s["f_hi"] for s in ok) + a.margin
    ps = [s["p"] for s in ok if s.get("p")]
    plo = min(p[0] for p in ps) - a.margin if ps else None; phi = max(p[1] for p in ps) + a.margin if ps else None
    lo, hi = flo, fhi
    if ps:
        lo, hi = min(lo, plo), max(hi, phi)
    lo_c, hi_c = max(1, lo - capo), min(24, hi - capo)
    conf = round(float(np.mean([s["conf"] for s in ok])), 3)
    if hi_c < 1:
        rows.append((t, "", "", conf, 1, "", "", "", "", len(sel))); continue
    rows.append((t, lo_c, hi_c, conf, 0, max(1, flo - capo), fhi - capo, "" if plo is None else max(1, plo - capo),
                 "" if phi is None else phi - capo, len(sel)))
applied = []
if a.corrections:
    for ln, line in enumerate(open(a.corrections), 1):
        body, _, why = line.partition("#")
        tok = body.split()
        if not tok: continue
        if len(tok) < 3: sys.exit(f"corrections line {ln}: need <t0> <t1> <lo>-<hi> | lost | shift <n>")
        t0, t1, spec = float(tok[0]), float(tok[1]), tok[2].lower()
        n = 0
        for j, r in enumerate(rows):
            if not (t0 - 1e-6 <= r[0] <= t1 + 1e-6): continue
            if spec == "lost":
                rows[j] = (r[0], "", "", 0.0, 1, "", "", "", "", r[9])
            elif spec == "shift":
                d = int(tok[3])
                if r[4] == 1: continue
                sh = lambda v: "" if v == "" else min(24, max(1, int(v) + d))
                rows[j] = (r[0], sh(r[1]), sh(r[2]), r[3], 0, sh(r[5]), sh(r[6]), sh(r[7]), sh(r[8]), r[9])
            elif "-" in spec:
                lo, hi = [int(v) for v in spec.split("-")]
                rows[j] = (r[0], max(1, lo), min(24, hi), 1.0, 0, max(1, lo), min(24, hi), "", "", r[9])
            else:
                sys.exit(f"corrections line {ln}: unknown action {spec}")
            n += 1
        applied.append({"line": ln, "t0": t0, "t1": t1, "action": " ".join(tok[2:]), "why": why.strip(), "rows": n})
    json.dump(applied, open(os.path.join(a.out, "corrections_applied.json"), "w"), indent=1)
with open(os.path.join(a.out, "hand_window.csv"), "w") as fh:
    fh.write("t,lo,hi,conf,lost,f_lo,f_hi,p_lo,p_hi,nframes\n")
    for r in rows:
        fh.write(",".join([f"{r[0]:.4f}"] + [str(v) for v in r[1:]]) + "\n")
lost = sum(1 for r in rows if r[4] == 1)
w = [r[2] - r[1] + 1 for r in rows if r[4] == 0]
print(json.dumps({"rows": len(rows), "lost_share": round(lost / len(rows), 4), "mean_width": round(float(np.mean(w)), 2) if w else None,
                  "capo": capo, "margin": a.margin, "fps": a.fps, "frames": len(frames), "corrections": len(applied)}))
