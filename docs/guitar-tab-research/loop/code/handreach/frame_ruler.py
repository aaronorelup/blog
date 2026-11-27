#!/usr/bin/env python3
"""frame_ruler.py <video> <t_seconds> <out.jpg> [--crop x0,y0,x1,y1] [--scale S] [--step PX]
A video frame (or a crop of it) with a pixel ruler: gridlines every --step px of the ORIGINAL frame, labelled with
their coordinates, so a person or a model can read the pixel position of a fret wire's ends. Coordinates printed on the
picture are always those of the full original frame."""
import argparse, cv2, numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("t", type=float); ap.add_argument("out")
ap.add_argument("--crop", default=None); ap.add_argument("--scale", type=float, default=1.0)
ap.add_argument("--step", type=int, default=50)
a = ap.parse_args()
cap = cv2.VideoCapture(a.video)
fps = cap.get(cv2.CAP_PROP_FPS)
cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(a.t * fps)))
ok, img = cap.read()
assert ok, "no frame"
H, W = img.shape[:2]
x0, y0, x1, y1 = (0, 0, W, H) if not a.crop else [int(v) for v in a.crop.split(",")]
x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
crop = img[y0:y1, x0:x1].copy()
s = a.scale
crop = cv2.resize(crop, (int((x1 - x0) * s), int((y1 - y0) * s)), interpolation=cv2.INTER_CUBIC)
pad_l, pad_t = 60, 30
canvas = np.full((crop.shape[0] + pad_t, crop.shape[1] + pad_l, 3), 255, np.uint8)
canvas[pad_t:, pad_l:] = crop
step = a.step
for gx in range((x0 // step + 1) * step, x1, step):
    X = pad_l + int((gx - x0) * s)
    major = gx % (step * 2) == 0
    cv2.line(canvas, (X, pad_t), (X, canvas.shape[0]), (0, 255, 255) if major else (0, 200, 0), 1)
    if major: cv2.putText(canvas, str(gx), (X - 18, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
for gy in range((y0 // step + 1) * step, y1, step):
    Y = pad_t + int((gy - y0) * s)
    major = gy % (step * 2) == 0
    cv2.line(canvas, (pad_l, Y), (canvas.shape[1], Y), (0, 255, 255) if major else (0, 200, 0), 1)
    if major: cv2.putText(canvas, str(gy), (2, Y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
cv2.imwrite(a.out, canvas, [cv2.IMWRITE_JPEG_QUALITY, 92])
print(f"frame {int(round(a.t*fps))} of {a.video} ({W}x{H}, {fps:g} fps) crop {x0},{y0},{x1},{y1} scale {s} -> {a.out}")
