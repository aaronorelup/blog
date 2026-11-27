#!/usr/bin/env python3
"""overlay.py <video> <anchors.json> <hand_dir> <out.jpg> --times t1,t2,... [--track track.json]
   [--crop x0,y0,x1,y1] [--cols 2] [--width 960]
Frames at the given times with the neck model drawn: every fret wire from the nut to wire 22 (cyan; the capo's wire and
wire 12 thicker), each fret space numbered FROM THE CAPO (gold numbers along the string-1 edge; the capo is 0), the
hand-reach window as a translucent band over the frets it allows (green), the fretting hand's four fingertips (red dots
with their fret from the capo; the thumb is a ring: orange "T<fret>" when it counts because it comes over the string-6
edge, grey and unlabelled when it does not), and a title line with the time, the window (lo-hi) and lost/conf. Tiles go into one sheet.
<hand_dir> is the folder hand_window.py wrote (hand_window.csv, tips.jsonl). Give the same --track as hand_window.py
used; a time where the track has no fit shows the bare frame and "NO NECK MODEL"."""
import argparse, json, math, os, sys
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neck import NeckModel, to_image

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("anchors"); ap.add_argument("hand_dir"); ap.add_argument("out")
ap.add_argument("--times", required=True); ap.add_argument("--track", default=None)
ap.add_argument("--crop", default=None); ap.add_argument("--cols", type=int, default=2); ap.add_argument("--width", type=int, default=960)
a = ap.parse_args()
NM = NeckModel(a.anchors, a.track); capo = int(NM.A.get("capo", 0)); kind = NM.kind
win = {}
with open(os.path.join(a.hand_dir, "hand_window.csv")) as fh:
    hdr = fh.readline().strip().split(",")
    for line in fh:
        v = line.strip().split(","); win[round(float(v[0]), 4)] = dict(zip(hdr, v))
wt = np.array(sorted(win))
tips = {}
with open(os.path.join(a.hand_dir, "tips.jsonl")) as fh:
    for line in fh:
        r = json.loads(line); tips[r["t"]] = r
tt = np.array(sorted(tips))
cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS)
tiles = []
for t in [float(x) for x in a.times.split(",")]:
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(t * fps))); ok, img = cap.read()
    if not ok: continue
    H, nconf = NM.H_at(t)
    ov = img.copy()
    w = win[wt[int(np.argmin(np.abs(wt - t)))]]
    if H is not None:
        if w["lost"] == "0":
            lo, hi = int(w["lo"]) + capo, int(w["hi"]) + capo
            poly = np.concatenate([to_image(H, [lo - 1, hi], [-0.02, -0.02], kind), to_image(H, [hi, lo - 1], [1.02, 1.02], kind)])
            cv2.fillPoly(ov, [poly.astype(np.int32)], (60, 200, 60))
        img = cv2.addWeighted(ov, 0.35, img, 0.65, 0)
        for k in range(0, 23):
            p = to_image(H, [k, k], [0.0, 1.0], kind).astype(int)
            th = 3 if k in (capo, 12) else 1
            cv2.line(img, tuple(p[0]), tuple(p[1]), (255, 255, 0) if k >= capo else (120, 120, 120), th)
            if k >= capo + 1:
                q = to_image(H, [k - 0.5], [1.18], kind)[0].astype(int)
                cv2.putText(img, str(k - capo), tuple(q - [8, -8]), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2)
        e = to_image(H, [0, 22, 22, 0], [0, 0, 1, 1], kind).astype(int)
        cv2.line(img, tuple(e[0]), tuple(e[1]), (255, 255, 0), 1); cv2.line(img, tuple(e[2]), tuple(e[3]), (255, 255, 0), 1)
    r = tips[tt[int(np.argmin(np.abs(tt - t)))]]
    if not r["lost"] and H is not None:
        for i, (f, s) in r["tips"].items():
            p = to_image(H, [f], [s], kind)[0].astype(int)
            if i == "4":   # the thumb: counts only when it comes over the string-6 edge
                col = (0, 160, 255) if r.get("thumb_over") else (160, 160, 160)
                cv2.circle(img, tuple(p), 7, col, 2)
                cv2.putText(img, "T" + (str(max(1, math.ceil(f)) - capo) if r.get("thumb_over") else ""), tuple(p + [8, -8]),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, col, 2)
                continue
            cv2.circle(img, tuple(p), 7, (0, 0, 255), -1)
            cv2.putText(img, str(max(1, math.ceil(f)) - capo), tuple(p + [8, -8]), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    if a.crop:
        x0, y0, x1, y1 = [int(v) for v in a.crop.split(",")]; img = img[y0:y1, x0:x1]
    sc = a.width / img.shape[1]; img = cv2.resize(img, (a.width, int(img.shape[0] * sc)))
    bar = np.full((34, img.shape[1], 3), 20, np.uint8)
    txt = f"t {t:.2f}s  window {w['lo']}-{w['hi']} from capo" if w["lost"] == "0" else f"t {t:.2f}s  LOST (no constraint)"
    if H is None: txt = f"t {t:.2f}s  NO NECK MODEL (no constraint)"
    cv2.putText(bar, txt + f"  conf {w['conf']}", (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    tiles.append(np.vstack([bar, img]))
if not tiles: sys.exit("no frames")
hmax = max(t.shape[0] for t in tiles); tiles = [np.vstack([t, np.zeros((hmax - t.shape[0], t.shape[1], 3), np.uint8)]) for t in tiles]
rows = [np.hstack(tiles[i:i + a.cols] + [np.zeros_like(tiles[0])] * (a.cols - len(tiles[i:i + a.cols]))) for i in range(0, len(tiles), a.cols)]
cv2.imwrite(a.out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88]); print("wrote", a.out, len(tiles), "tiles")
