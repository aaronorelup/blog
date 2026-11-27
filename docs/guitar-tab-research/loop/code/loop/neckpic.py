#!/home/user/gtv/tools/venv-video/bin/python
"""neckpic.py <blind_dir> <out.jpg> --times t1,t2,... [--plain] [--zoom] [--labels L1;L2;...]

The neck at given times, cropped to the fretboard (and the hand around it), at most 8 tiles, 2 columns.
Default: the hand-reach overlay (G/loop/tools/handreach/overlay.py): fret wires, each fret space numbered FROM THE
CAPO (gold), the window band (green), the fretting fingertips (red, with their fret from the capo).
--plain: the same crop without any drawing (to see the fingers themselves). --zoom: a tighter crop around the
fingertips. Prints, per tile, the window and the fingertips' frets."""
import argparse, json, math, os, subprocess, sys
import numpy as np, cv2
HAND = "/home/user/gtv/loop/tools/handreach"
sys.path.insert(0, HAND)
from neck import NeckModel, to_image  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("blind"); ap.add_argument("out"); ap.add_argument("--times", required=True)
ap.add_argument("--plain", action="store_true"); ap.add_argument("--zoom", action="store_true")
ap.add_argument("--labels", default=None)
a = ap.parse_args()
inp = os.path.join(a.blind, "inputs"); hd = os.path.join(inp, "hand")
if not os.path.exists(os.path.join(hd, "anchors.json")):
    sys.exit("the hand is off in this run: no neck pictures")
times = [float(x) for x in a.times.replace(" ", "").split(",") if x][:8]
trk = os.path.join(hd, "track.json")
NM = NeckModel(os.path.join(hd, "anchors.json"), trk if os.path.exists(trk) else None)
capo = int(NM.A.get("capo", 0)); kind = NM.kind
vid = os.path.join(inp, "video.mp4")
cap = cv2.VideoCapture(vid); W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); Hh = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
tips = {}
for line in open(os.path.join(hd, "tips.jsonl")):
    r = json.loads(line); tips[r["t"]] = r
tt = np.array(sorted(tips))
xs, ys = [], []
for t in times:
    H, _ = NM.H_at(t)
    if H is None:
        continue
    if a.zoom:
        r = tips[tt[int(np.argmin(np.abs(tt - t)))]]
        fr = [v[0] for v in r.get("tips", {}).values()] if not r["lost"] else []
        f0, f1 = (max(0, min(fr) - 2.5), max(fr) + 2.5) if fr else (capo, capo + 8)
    else:
        f0, f1 = 0, capo + 15
    p = to_image(H, [f0, f1, f1, f0], [-1.0, -1.0, 1.6, 1.6], kind)
    xs += list(p[:, 0]); ys += list(p[:, 1])
if xs:
    x0, x1 = max(0, int(min(xs)) - 20), min(W, int(max(xs)) + 20)
    y0, y1 = max(0, int(min(ys)) - 20), min(Hh, int(max(ys)) + 20)
else:
    x0, y0, x1, y1 = 0, 0, W, Hh
crop = f"{x0},{y0},{x1},{y1}"
width = 780 if (x1 - x0) / max(1, (y1 - y0)) > 2.2 else 640
win = {}
with open(os.path.join(hd, "hand_window.csv")) as fh:
    hdr = fh.readline().strip().split(",")
    for line in fh:
        v = line.strip().split(","); win[round(float(v[0]), 4)] = dict(zip(hdr, v))
wt = np.array(sorted(win))
for t in times:
    w = win[wt[int(np.argmin(np.abs(wt - t)))]]
    r = tips[tt[int(np.argmin(np.abs(tt - t)))]]
    tf = sorted(max(1, math.ceil(v[0])) - capo for v in r.get("tips", {}).values()) if not r["lost"] else []
    ws = "lost (no constraint)" if w.get("lost") not in ("0", None) else f"{w['lo']}-{w['hi']}"
    print(f"t {t:.2f}s window {ws} (frets from the capo); fingertips at frets {tf if tf else 'not seen'}"
          + (" thumb over the neck" if r.get("thumb_over") else ""))
if a.plain:
    tiles = []
    for k, t in enumerate(times):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(t * cap.get(cv2.CAP_PROP_FPS)))); ok, img = cap.read()
        if not ok:
            continue
        img = img[y0:y1, x0:x1]; sc = width / img.shape[1]; img = cv2.resize(img, (width, int(img.shape[0] * sc)))
        bar = np.full((30, img.shape[1], 3), 20, np.uint8)
        cv2.putText(bar, f"t {t:.2f}s (plain frame)", (8, 21), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        tiles.append(np.vstack([bar, img]))
    if not tiles:
        sys.exit("no frames")
    hm = max(x.shape[0] for x in tiles); tiles = [np.vstack([x, np.zeros((hm - x.shape[0], x.shape[1], 3), np.uint8)]) for x in tiles]
    rows = [np.hstack(tiles[i:i + 2] + [np.zeros_like(tiles[0])] * (2 - len(tiles[i:i + 2]))) for i in range(0, len(tiles), 2)]
    cv2.imwrite(a.out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88]); print("wrote", a.out)
else:
    cmd = [sys.executable, os.path.join(HAND, "overlay.py"), vid, os.path.join(hd, "anchors.json"), hd, a.out,
           "--times", ",".join(f"{t:.3f}" for t in times), "--crop", crop, "--cols", "2", "--width", str(width)]
    if os.path.exists(trk):
        cmd += ["--track", trk]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("overlay failed: " + (r.stderr or r.stdout)[-300:])
    print("wrote", a.out)
