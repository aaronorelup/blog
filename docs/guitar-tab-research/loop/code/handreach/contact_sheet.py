#!/usr/bin/env python3
"""contact_sheet.py <video> <out.jpg> [--every 5] [--t0 0] [--t1 END] [--cols 6] [--width 320] [--crop x0,y0,x1,y1]
   [--track track.json --anchors anchors.json]
A grid of small frames taken every --every seconds, each labelled with its time, to see the whole video at a glance:
where the camera cuts (a new shot), where the guitar moves or tilts, where the hands leave the neck, title or black
cards. With --track and --anchors, each tile also gets the tracked board outline (cyan; red when the track has no fit
there) so a lost or drifting track shows up. Prints the mean frame-to-frame change between tiles; a large jump between
two tiles is a likely cut: look closer there with a smaller --every."""
import argparse, os, sys
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("out")
ap.add_argument("--every", type=float, default=5.0); ap.add_argument("--t0", type=float, default=0.0)
ap.add_argument("--t1", type=float, default=None); ap.add_argument("--cols", type=int, default=6)
ap.add_argument("--width", type=int, default=320); ap.add_argument("--crop", default=None)
ap.add_argument("--track", default=None); ap.add_argument("--anchors", default=None)
a = ap.parse_args()
cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
dur = n / fps
t1 = min(dur - 1.0 / fps, a.t1 if a.t1 is not None else dur)
times = list(np.arange(a.t0, t1 + 1e-9, a.every))
NM = None
if a.track and a.anchors:
    from neck import NeckModel, to_image
    NM = NeckModel(a.anchors, a.track)
want = {int(round(t * fps)): t for t in times}
tiles, prev, diffs = [], None, []
fi = 0
last = max(want)
while fi <= last:
    ok = cap.grab()
    if not ok: break
    if fi in want:
        ok, img = cap.retrieve(); t = want[fi]
        if NM is not None:
            H, c = NM.H_at(t)
            if H is not None:
                e = to_image(H, [0, 20, 20, 0], [0, 0, 1, 1], NM.kind).astype(np.int32)
                cv2.polylines(img, [e], True, (255, 255, 0), max(2, img.shape[1] // 400))
                p = to_image(H, [12, 12], [0, 1], NM.kind).astype(np.int32)
                cv2.line(img, tuple(p[0]), tuple(p[1]), (255, 255, 0), max(2, img.shape[1] // 400))
            else:
                cv2.rectangle(img, (0, 0), (img.shape[1] - 1, img.shape[0] - 1), (0, 0, 255), max(4, img.shape[1] // 200))
        if a.crop:
            x0, y0, x1, y1 = [int(v) for v in a.crop.split(",")]; img = img[y0:y1, x0:x1]
        g = cv2.resize(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (64, 36)).astype(np.float32)
        if prev is not None: diffs.append((t, float(np.mean(np.abs(g - prev)))))
        prev = g
        sc = a.width / img.shape[1]; img = cv2.resize(img, (a.width, int(img.shape[0] * sc)), interpolation=cv2.INTER_AREA)
        cv2.rectangle(img, (0, 0), (92, 22), (0, 0, 0), -1)
        cv2.putText(img, f"{t:.1f}s", (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        tiles.append(img)
    fi += 1
if not tiles: sys.exit("no frames")
h = max(t.shape[0] for t in tiles)
tiles = [np.vstack([t, np.zeros((h - t.shape[0], t.shape[1], 3), np.uint8)]) for t in tiles]
blank = np.zeros_like(tiles[0])
rows = [np.hstack(tiles[i:i + a.cols] + [blank] * (a.cols - len(tiles[i:i + a.cols]))) for i in range(0, len(tiles), a.cols)]
cv2.imwrite(a.out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])
if diffs:
    d = np.array([x[1] for x in diffs]); med = float(np.median(d))
    big = [(round(float(t), 2), round(v, 1)) for t, v in diffs if v > max(3 * med, med + 15)]
    print(f"wrote {a.out}: {len(tiles)} tiles; median change between tiles {med:.1f}; large changes (tile time, change): {big}")
else:
    print(f"wrote {a.out}: {len(tiles)} tiles")
