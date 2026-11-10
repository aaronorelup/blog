"""Worked handoff on one frame (R3a_cu frame 150): fingertip pixels -> rectified fretboard -> (string, fret) cell.

usage: python handoff_fingertip_to_cell.py <mediapipe R3a_cu_full.jsonl> <opencv_lines.json> <out dir>

Step 1 (tool: MediaPipe Hand Landmarker 1.2.2, run r0078): fingertip landmarks 4, 8, 12, 16, 20 in 640x480 pixels.
Step 2 (by hand + OpenCV): the neck quadrilateral was set by hand; cv2.getPerspectiveTransform (run r0149) maps it to an
        800x116 rectangle, nut at x=0, the fretboard's upper edge in the image at y=0.
Step 3 (tool: OpenCV LSD, run r0149): fret-like segment clusters in the rectified image (x positions).
Step 4 (this script): a 12-TET fret model x_n = x_nut + s * (1 - 2**(-n/12)) is fitted to the detected fret clusters,
        trying each starting fret number k0 for the first cluster right of the hand, least squares in s.
Step 5 (this script, assumptions stated): fret cell = n such that x_(n-1) <= u < x_n (n = 0 means behind the nut);
        string cell from v: the width is split into 6 equal lanes, string 6 along the upper edge (the bass side for a
        right-handed player seen from the front; not checked against string thickness).
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402
import numpy as np  # noqa: E402

mpjsonl, linesjson, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
N = 150
rec = [json.loads(l) for l in open(mpjsonl)][N]
assert rec["n"] == N
hand = rec["hands"][0]
TIPS = {"thumb_tip": 4, "index_tip": 8, "middle_tip": 12, "ring_tip": 16, "pinky_tip": 20}
lines = json.load(open(linesjson))["frames"][f"R3a_cu_f{N:04d}"]["hand_quad"]
H = np.array(lines["homography_img_to_rect"], dtype=np.float64)
RW, RH = lines["rectified"]["size"]
fret_x = lines["rectified"]["lsd"]["fret_x_clusters_px_from_nut"]

tips_px = {k: hand["lm_px_full"][i] for k, i in TIPS.items()}
pts = np.array(list(tips_px.values()), dtype=np.float64).reshape(-1, 1, 2)
uv = cv2.perspectiveTransform(pts, H).reshape(-1, 2)
tips_uv = {k: [round(float(a), 1), round(float(b), 1)] for k, (a, b) in zip(TIPS, uv)}

# fret model fit: the nut cluster is the first one (x < 20); the clusters right of the widest gap are taken as consecutive frets
nut = fret_x[0] if fret_x and fret_x[0] < 20 else 0.0
rest = [x for x in fret_x if x >= 20]
gaps = [rest[i + 1] - rest[i] for i in range(len(rest) - 1)]
cut = int(np.argmax(gaps)) + 1 if gaps else 0
run = rest[cut:]  # consecutive frets right of the hand
fits = []
for k0 in range(1, 15):
    ns = np.arange(k0, k0 + len(run))
    g = 1 - 2.0 ** (-ns / 12)
    s = float(np.dot(g, np.array(run) - nut) / np.dot(g, g))
    resid = np.array(run) - (nut + s * g)
    fits.append({"k0": k0, "scale_px": round(s, 1), "rms_px": round(float(np.sqrt(np.mean(resid ** 2))), 2),
                 "max_abs_px": round(float(np.max(np.abs(resid))), 2)})
best = min(fits, key=lambda f: f["rms_px"])
model_x = [nut + best["scale_px"] * (1 - 2.0 ** (-n / 12)) for n in range(0, 20)]


def fret_cell(u):
    if u < model_x[0]:
        return 0
    for n in range(1, len(model_x)):
        if u < model_x[n]:
            return n
    return None


def string_cell(v):
    lane = int(np.clip(v / (RH / 6), 0, 5))
    return 6 - lane  # lane 0 (top) = string 6


cells = {k: {"px": tips_px[k], "rect_uv": tips_uv[k], "fret": fret_cell(tips_uv[k][0]),
             "string": string_cell(tips_uv[k][1]), "v_inside_fretboard": 0 <= tips_uv[k][1] <= RH,
             "nearest_detected_fret_lines_px": [max([x for x in fret_x if x <= tips_uv[k][0]], default=None),
                                                min([x for x in fret_x if x > tips_uv[k][0]], default=None)]}
         for k in TIPS}
res = {"frame": N, "clip": "R3a_cu", "mediapipe_label": hand["label"], "mediapipe_score": hand["score"],
       "homography_img_to_rect": lines["homography_img_to_rect"], "rect_size": [RW, RH],
       "lsd_fret_clusters_x": fret_x, "nut_x": nut, "frets_right_of_hand_x": run, "fret_model_fits": fits,
       "fret_model_best": best, "fret_model_x_0_to_19": [round(x, 1) for x in model_x], "cells": cells}
C.write_json(os.path.join(out, "handoff_R3a_cu_f0150.json"), res)

# picture: rectified neck with model frets (thin), detected frets (thick) and fingertips
rgb = C.load_rgb("R3a_cu", N)
rect = cv2.warpPerspective(rgb, H, (RW, RH), flags=cv2.INTER_CUBIC)
big = cv2.resize(rect, (RW, RH * 2), interpolation=cv2.INTER_CUBIC)
for x in fret_x:
    cv2.line(big, (int(x), 0), (int(x), RH * 2), (255, 0, 255), 2)
for n, x in enumerate(model_x):
    if x < RW:
        cv2.line(big, (int(x), 0), (int(x), 12), (0, 255, 255), 1)
        cv2.putText(big, str(n), (int(x) + 2, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1, cv2.LINE_AA)
for k, c in cells.items():
    u, v = c["rect_uv"]
    cv2.circle(big, (int(u), int(v * 2)), 5, (0, 255, 0), -1)
    cv2.putText(big, f'{k.split("_")[0]} s{c["string"]} f{c["fret"]}', (int(u) + 6, int(v * 2) + 4),
                cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1, cv2.LINE_AA)
C.save_sample(big, os.path.join(out, "handoff_R3a_cu_f0150_rectified.webp"))
print(json.dumps(best), "nut", nut, "run", run)
for k, c in cells.items():
    print(k, c)
