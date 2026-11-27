#!/usr/bin/env python3
"""track_check.py <video> <anchors.json> <track.json> <landmarks.jsonl> [--every 5] [--offset 0.1] [--out check.json]
The self-check of a neck track, with no answer key: every --every seconds, the fret-wire detector of
wire_candidates.py runs on the board where the track puts it (from just past the nut to wire 19.5, the part inside the
frame; ridges of 1 grey level or more), candidates mostly under a hand are dropped, and each remaining candidate is measured against the nearest wire the
track predicts: the pixel distance at the candidate's middle, and that distance as a share of the local fret spacing;
and "edge": how far (in frets) the candidate sits from that wire at the board's two edges, which shows a grid that is
turned against the real wires (right in the middle, wrong at strings 6 and 1). Prints per time and in
total: candidates, median and 90th percentile (pixels and share), the share of candidates within 1/3 of a spacing.
Reading it: a good track has a median share well under 1/3 (most candidates are real wires sitting on the predicted
lines); candidates at random places would give a median share of 0.25 and a 90th percentile of 0.45, so a median near
0.25 means the grid does not sit on the wires there. A time listed as "lost" has no track (no constraint there).
It cannot see a grid that is off by a WHOLE fret (the wire pattern repeats): check the numbering on overlay.py's
pictures (inlays, the capo, the nut)."""
import argparse, json, os, sys
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neck import NeckModel, to_image, to_board
from wire_candidates import detect

F_MAX = 19.5
MIN_N = 5      # a time with fewer candidates is listed, not judged


def _seg_dist(p, a, b):
    ab = b - a
    t = np.clip(np.dot(p - a, ab) / max(1e-9, np.dot(ab, ab)), 0, 1)
    return float(np.hypot(*(p - (a + t * ab))))


def board_quad(H, kind, shape, f_lo=-0.4, f_hi=F_MAX):
    """The wire_candidates quad (string-6 edge at the body end, string-6 at the nut end, string-1 at the nut end,
    string-1 at the body end) of the part of the modelled board inside the frame, or None."""
    Hh, Ww = shape[:2]
    f = np.arange(f_lo, f_hi + 1e-6, 0.05)
    inside = np.ones(len(f), bool)
    for s in (0.0, 1.0):
        p = to_image(H, f, np.full_like(f, s), kind)
        inside &= (p[:, 0] >= 3) & (p[:, 0] <= Ww - 4) & (p[:, 1] >= 3) & (p[:, 1] <= Hh - 4)
    if inside.sum() < 20:
        return None
    idx = np.where(inside)[0]
    runs = np.split(idx, np.where(np.diff(idx) > 1)[0] + 1)
    run = max(runs, key=len)
    fa, fb = float(f[run[0]]), float(f[run[-1]])
    if fb - fa < 3:
        return None
    return np.vstack([to_image(H, [fb], [0.0], kind), to_image(H, [fa], [0.0], kind), to_image(H, [fa], [1.0], kind), to_image(H, [fb], [1.0], kind)])


def check_frame(g, H, kind, hand_mask):
    Hh, Ww = g.shape[:2]
    quad = board_quad(H, kind, g.shape)
    if quad is None:
        return None
    fa, fb = [float(v) for v in to_board(H, quad[[1, 0]], kind)[0]]
    cands = detect(g, quad)
    out = []
    for c in cands:
        a, b = np.array(c["a"]), np.array(c["b"])
        seg = a[None, :] + np.linspace(0, 1, 9)[:, None] * (b - a)[None, :]
        si = np.clip(seg.round().astype(int), [0, 0], [Ww - 1, Hh - 1])
        if hand_mask is not None and np.mean(hand_mask[si[:, 1], si[:, 0]] > 0) > 0.5:
            continue
        m = (a + b) / 2
        fc, s_c = to_board(H, m[None, :], kind)
        fc, s_c = float(fc[0]), float(np.clip(s_c[0], 0, 1))
        k = int(np.clip(round(fc), 0, 21))
        ka, kb = to_image(H, [k, k], [0.0, 1.0], kind)
        d = _seg_dist(m, ka, kb)
        k2 = k + 1 if fc >= k else k - 1
        if k2 < 0: k2 = 1
        p1, p2 = to_image(H, [k, k2], [s_c, s_c], kind)
        sp = float(np.hypot(*(p2 - p1)))
        fe, _ = to_board(H, np.vstack([a, b]), kind)
        edge = float(np.max(np.abs(fe - k)))
        out.append({"f": round(fc, 3), "k": k, "px": round(d, 2), "share": round(d / max(1e-6, sp), 4), "edge": round(edge, 4),
                    "a": c["a"], "b": c["b"]})
    return {"range": [round(fa, 2), round(fb, 2)], "cands": out}


def snap_grow(g, wires, kind, hand_mask, rounds=8, step=3, max_share=0.2):
    """Grow a set of named wires ({"k", "a", "b"}) with the wires the detector finds within max_share of a spacing of the
    modelled ones, outwards from the named range, step wires a round, refitting each round. Returns the new list (the
    named wires first; added ones carry "snap": True)."""
    from neck import fit
    cur = [dict(w) for w in wires]
    named = {w["k"] for w in wires}
    lo, hi = min(named), max(named)
    for rnd in range(rounds):
        H = fit(cur, kind)
        r = check_frame(g, H, kind, hand_mask)
        if r is None:
            break
        have = {w["k"] for w in cur}
        lo2, hi2 = lo - step * (rnd + 1), hi + step * (rnd + 1)
        best = {}
        for c in r["cands"]:
            if c["k"] in have or not (lo2 <= c["k"] <= hi2) or c["share"] >= max_share: continue
            if c["k"] not in best or c["share"] < best[c["k"]]["share"]: best[c["k"]] = c
        cur += [{"k": k, "a": c["a"], "b": c["b"], "snap": True} for k, c in sorted(best.items())]
        if lo2 < -3 and hi2 > 24 and not best:
            break
    return cur


def _stats(c):
    if not c:
        return {"n": 0}
    px = np.array([x["px"] for x in c]); sh = np.array([x["share"] for x in c]); ed = np.array([x["edge"] for x in c])
    return {"n": len(c), "median_px": round(float(np.median(px)), 2), "p90_px": round(float(np.percentile(px, 90)), 2),
            "median_share": round(float(np.median(sh)), 4), "p90_share": round(float(np.percentile(sh, 90)), 4),
            "within_third": round(float(np.mean(sh < 1 / 3)), 4), "median_edge": round(float(np.median(ed)), 4),
            "edge_within_third": round(float(np.mean(ed < 1 / 3)), 4)}


def selfcheck(frames, anchors, track, hands):
    """frames: {t: grey full frame}; hands: lmhands.Hands or None."""
    NM = NeckModel(anchors, track)
    per, pool, lost = [], [], []
    for t in sorted(frames):
        g = frames[t]
        H, c = NM.H_at(t)
        if H is None:
            lost.append(round(float(t), 2)); continue
        hm = hands.mask(t, g.shape) if hands is not None else None
        r = check_frame(g, H, NM.kind, hm)
        if r is None:
            per.append({"t": round(float(t), 2), "note": "board not inside the frame"}); continue
        s = _stats(r["cands"]); s.update({"t": round(float(t), 2), "range": r["range"], "conf": round(c, 3)})
        per.append(s); pool += r["cands"]
    meds = [p["median_share"] for p in per if p.get("n", 0) >= MIN_N]
    summ = _stats(pool)
    summ.update({"times": len(frames), "lost_times": len(lost),
                 "per_time_median_share_median": round(float(np.median(meds)), 4) if meds else None,
                 "per_time_median_share_max": round(float(np.max(meds)), 4) if meds else None,
                 "times_over_third": [p["t"] for p in per if p.get("n", 0) >= MIN_N and p["median_share"] > 1 / 3],
                 "times_edge_over_third": [p["t"] for p in per if p.get("n", 0) >= MIN_N and p["median_edge"] > 1 / 3],
                 "times_few_candidates": [p["t"] for p in per if 0 < p.get("n", 0) < MIN_N]})
    return {"summary": summ, "lost": lost, "per_time": per}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("anchors"); ap.add_argument("track"); ap.add_argument("landmarks")
    ap.add_argument("--every", type=float, default=5.0); ap.add_argument("--out", default=None)
    ap.add_argument("--offset", type=float, default=0.1, help="check times are j*every + offset (0.1: between 5-a-second track samples)")
    a = ap.parse_args()
    from lmhands import Hands
    cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    want = {}
    for j in range(int(n / fps / a.every) + 1):
        fi = min(n - 1, int(round((j * a.every + a.offset) * fps))); want[fi] = round(fi / fps, 4)
    frames = {}; fi = 0
    while fi <= max(want):
        if not cap.grab(): break
        if fi in want:
            ok, img = cap.retrieve(); frames[want[fi]] = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        fi += 1
    res = selfcheck(frames, a.anchors, a.track, Hands(a.landmarks))
    for p in res["per_time"]:
        if p.get("n"):
            print(f"t {p['t']:7.2f}  cands {p['n']:3d}  median {p['median_px']:5.1f} px  {p['median_share']:.3f} sp   p90 {p['p90_px']:5.1f} px  {p['p90_share']:.3f} sp   edge {p['median_edge']:.3f}")
        else:
            print(f"t {p['t']:7.2f}  {p.get('note', 'no candidates')}")
    if res["lost"]:
        print("lost (no track):", res["lost"])
    print(json.dumps(res["summary"]))
    if a.out:
        json.dump(res, open(a.out, "w"), indent=1)
