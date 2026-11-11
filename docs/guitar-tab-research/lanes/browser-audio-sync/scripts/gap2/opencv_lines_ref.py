"""Python reference for the OpenCV.js page: the video-hands-fretboard lane's fret and string line steps, re-run on this
lane's decoded copies of the same frames, with the full segment lists kept for a one-by-one comparison.

usage: python -I opencv_lines_ref.py <frames dir> <out dir>

segments(), classify() and clusters() are copied unchanged from
docs/guitar-tab-research/lanes/video-hands-fretboard/scripts/run_opencv_lines.py (runs r0149, r0214, r0400 there);
run() follows its run_quad() without the drawing. Quads and sizes are the ones that script used:
  R3a_cu frames 150, 0, 280, hand-set quad (541,120) (575,168) (225,390) (195,335) -> 800x116;
  R3a_cu frame 150, quad from the SAM 2.1 mask (minimum-area rectangle of its largest component, same code) -> 800x116;
  R3b frames 225, 0, 449, hand-set quad (1262,25) (1340,130) (290,765) (245,635) -> 1200x130.
Frames: <frames dir>/R3a_cu/f_<n+1>.png (ffmpeg PNG) and <frames dir>/R3b/f_<n+1>.jpg (ffmpeg JPEG, -q:v 2), read with
cv2.imread as that script does. Also writes, per frame, the decoded RGB bytes (<frames dir>/<clip>/f_<n+1>.rgb) for
the page, and per quad the rectified image as PNG (<out dir>/<clip>_f<n>_<tag>_rectified.png).
"""
import json
import math
import os
import sys
import time

import cv2
import numpy as np

frames_dir, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
SAM_MASK = "/home/user/gtr/lanes/video-hands-fretboard/out/sam2/masks/R3a_cu_f0150_all_points.png"
JOBS = [
    ("R3a_cu", [150, 0, 280], [[541, 120], [575, 168], [225, 390], [195, 335]], (800, 116), ".png"),
    ("R3b", [225, 0, 449], [[1262, 25], [1340, 130], [290, 765], [245, 635]], (1200, 130), ".jpg"),
]


# ---- copied unchanged from video-hands-fretboard/scripts/run_opencv_lines.py ----
def segments(gray):
    edges = cv2.Canny(gray, 50, 150)
    hough = cv2.HoughLinesP(edges, 1, np.pi / 180, 30, minLineLength=20, maxLineGap=5)
    hough = [] if hough is None else [tuple(map(float, l)) for l in np.asarray(hough).reshape(-1, 4)]  # OpenCV 5 returns (N, 4)
    lsd = cv2.createLineSegmentDetector()
    ls = lsd.detect(gray)[0]
    ls = [] if ls is None else [tuple(map(float, l)) for l in np.asarray(ls).reshape(-1, 4)]
    return edges, hough, ls


def classify(segs, axis_deg, width_px, min_string_len):
    strings, frets = [], []
    for x1, y1, x2, y2 in segs:
        ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
        d = (ang - axis_deg + 90) % 180 - 90  # angle to the neck axis in (-90, 90]
        length = math.hypot(x2 - x1, y2 - y1)
        if abs(d) <= 10 and length >= min_string_len:
            strings.append((x1, y1, x2, y2))
        elif abs(abs(d) - 90) <= 20 and length >= 0.4 * width_px:
            frets.append((x1, y1, x2, y2))
    return strings, frets


def clusters(vals, tol):
    vals = sorted(vals)
    groups = []
    for v in vals:
        if groups and v - groups[-1][-1] <= tol:
            groups[-1].append(v)
        else:
            groups.append([v])
    return [round(float(np.mean(g)), 1) for g in groups]
# ---- end of the copied part ----


def run(rgb, quad, size, tag, label):
    RW, RH = size
    DST = np.float32([[0, 0], [0, RH], [RW, RH], [RW, 0]])
    res = {"quad": quad.tolist(), "tag": tag}
    gray_full = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    t0 = time.perf_counter()
    mask = np.zeros(gray_full.shape, np.uint8)
    cv2.fillConvexPoly(mask, quad.astype(np.int32), 255)
    edges, hough, ls = segments(gray_full)
    hh, ww = gray_full.shape
    inside = lambda s: mask[int(np.clip((s[1] + s[3]) / 2, 0, hh - 1)), int(np.clip((s[0] + s[2]) / 2, 0, ww - 1))] > 0  # noqa: E731
    axis = math.degrees(math.atan2(quad[3][1] - quad[0][1], quad[3][0] - quad[0][0]))
    width = float(np.linalg.norm(quad[1] - quad[0]))
    res["unrectified"] = {"neck_axis_deg": round(axis, 2), "fretboard_width_px": round(width, 1),
                          "edge_pixels": int(np.count_nonzero(edges)), "mask_pixels": int(np.count_nonzero(mask))}
    for name, segs in (("hough", hough), ("lsd", ls)):
        segs_in = [s for s in segs if inside(s)]
        st, fr = classify(segs_in, axis, width, 20)
        res["unrectified"][name] = {"segments_total": len(segs), "segments_in_quad": len(segs_in),
                                    "string_like": len(st), "fret_like": len(fr)}
    res["unrectified"]["hough_segments"] = [list(map(int, s)) for s in hough]
    res["unrectified"]["time_s"] = round(time.perf_counter() - t0, 4)
    t1 = time.perf_counter()
    H = cv2.getPerspectiveTransform(quad, DST)
    rect = cv2.warpPerspective(rgb, H, (RW, RH), flags=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(rect, cv2.COLOR_RGB2GRAY)
    edges, hough, ls = segments(gray)
    res["homography_img_to_rect"] = np.round(H, 6).tolist()
    res["homography_full"] = H.tolist()
    res["rectified"] = {"size": [RW, RH], "edge_pixels": int(np.count_nonzero(edges))}
    for name, segs in (("hough", hough), ("lsd", ls)):
        st, fr = classify(segs, 0.0, RH, 40)
        fret_x = clusters([(s[0] + s[2]) / 2 for s in fr], 8)
        string_y = clusters([(s[1] + s[3]) / 2 for s in st], 4)
        res["rectified"][name] = {"segments_total": len(segs), "string_like": len(st), "fret_like": len(fr),
                                  "fret_x_clusters_px_from_nut": fret_x, "string_y_clusters_px_from_upper_edge": string_y}
    res["rectified"]["hough_segments"] = [list(map(int, s)) for s in hough]
    res["rectified"]["time_s"] = round(time.perf_counter() - t1, 4)
    cv2.imwrite(os.path.join(out, f"{label}_{tag}_rectified.png"), cv2.cvtColor(rect, cv2.COLOR_RGB2BGR))
    return res


def sam_quad(hand_quad):   # the same code as run_opencv_lines.py's SAM branch
    m = cv2.imread(SAM_MASK, cv2.IMREAD_GRAYSCALE) > 127
    cnts, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    big = max(cnts, key=cv2.contourArea)
    box = cv2.boxPoints(cv2.minAreaRect(big))
    c = box.mean(axis=0)
    ax = hand_quad[0] - hand_quad[3]
    ax = ax / np.linalg.norm(ax)
    nut_side = [p for p in box if np.dot(p - c, ax) > 0]
    body_side = [p for p in box if np.dot(p - c, ax) <= 0]
    nut_side.sort(key=lambda p: p[1])
    body_side.sort(key=lambda p: p[1])
    return np.float32([nut_side[0], nut_side[1], body_side[1], body_side[0]])


results = {"opencv": cv2.__version__, "frames": {}}
for clip, frames, quad, size, ext in JOBS:
    q = np.float32(quad)
    for n in frames:
        path = os.path.join(frames_dir, clip, f"f_{n + 1:04d}{ext}")
        bgr = cv2.imread(path, cv2.IMREAD_COLOR)
        rgb = bgr[:, :, ::-1].copy()
        with open(os.path.join(frames_dir, clip, f"f_{n + 1:04d}.rgb"), "wb") as f:
            f.write(rgb.tobytes())
        lab = f"{clip}_f{n:04d}"
        d = {"file": path, "shape": list(rgb.shape), "rect_size": list(size), "hand_quad": run(rgb, q, size, "handquad", lab)}
        if clip == "R3a_cu" and n == 150 and os.path.exists(SAM_MASK):
            d["sam_quad"] = run(rgb, sam_quad(q), size, "samquad", lab)
        results["frames"][lab] = d
with open(os.path.join(out, "opencv_lines_ref.json"), "w") as f:
    json.dump(results, f, indent=1)
for lab, d in results["frames"].items():
    for tag in ("hand_quad", "sam_quad"):
        if tag in d:
            r = d[tag]
            print(lab, tag, "unrect hough", r["unrectified"]["hough"], "rect hough", {k: r["rectified"]["hough"][k] for k in ("segments_total", "string_like", "fret_like")})
