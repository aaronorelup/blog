"""OpenCV edge and line detection for frets and strings on a guitar neck, before and after rectification.

usage: python run_opencv_lines.py <out dir> [<sam mask png for R3a_cu frame 150>]
Neck quadrilateral for R3a_cu frame 150, set by hand from a gridded 2x crop (corners in 640x480 pixels):
  nut end, upper edge (541,120); nut end, lower edge (575,168); body end, lower edge (225,390); body end, upper edge (195,335).
The "body end" corners sit where the frame's view of the fretboard meets the guitar's upper bout, not at a named fret.
Rectification: cv2.getPerspectiveTransform of that quad onto an 800x116 rectangle (nut at x=0, upper edge at y=0).
Line detectors: Canny(50,150) + HoughLinesP(rho=1, theta=1 deg, threshold=30, minLineLength=20, maxLineGap=5) and
cv2.createLineSegmentDetector() (LSD, default parameters). A segment is "string-like" if it lies within 10 degrees of the
neck axis and is >= 40 px long (rectified) / >= 20 px (unrectified), "fret-like" if it lies within 20 degrees of the
perpendicular to the neck axis and spans >= 40 % of the fretboard width.
"""
import json
import math
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402
import numpy as np  # noqa: E402

out = sys.argv[1]
sam_mask = sys.argv[2] if len(sys.argv) > 2 else None
os.makedirs(out, exist_ok=True)
RW, RH = 800, 116
QUAD_HAND = np.float32([[541, 120], [575, 168], [225, 390], [195, 335]])  # nut-top, nut-bottom, body-bottom, body-top
DST = np.float32([[0, 0], [0, RH], [RW, RH], [RW, 0]])


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


def draw(img, strings, frets):
    for x1, y1, x2, y2 in strings:
        cv2.line(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 255), 1, cv2.LINE_AA)
    for x1, y1, x2, y2 in frets:
        cv2.line(img, (int(x1), int(y1)), (int(x2), int(y2)), (255, 0, 255), 2, cv2.LINE_AA)
    return img


def run_quad(rgb, quad, tag, frame_label):
    res = {"quad": quad.tolist(), "tag": tag}
    gray_full = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    # unrectified: segments inside the quad, angles judged against the quad's long axis
    t0 = time.perf_counter()
    mask = np.zeros(gray_full.shape, np.uint8)
    cv2.fillConvexPoly(mask, quad.astype(np.int32), 255)
    edges, hough, ls = segments(gray_full)
    inside = lambda s: mask[int(np.clip((s[1] + s[3]) / 2, 0, 479)), int(np.clip((s[0] + s[2]) / 2, 0, 639))] > 0  # noqa: E731
    axis = math.degrees(math.atan2(quad[3][1] - quad[0][1], quad[3][0] - quad[0][0]))
    width = float(np.linalg.norm(quad[1] - quad[0]))
    res["unrectified"] = {"neck_axis_deg": round(axis, 2), "fretboard_width_px": round(width, 1)}
    for name, segs in (("hough", hough), ("lsd", ls)):
        segs_in = [s for s in segs if inside(s)]
        st, fr = classify(segs_in, axis, width, 20)
        res["unrectified"][name] = {"segments_total": len(segs), "segments_in_quad": len(segs_in),
                                    "string_like": len(st), "fret_like": len(fr)}
        if name == "hough":
            vis = draw(rgb.copy(), st, fr)
            cv2.polylines(vis, [quad.astype(np.int32)], True, (0, 255, 0), 1)
            cv2.putText(vis, f"{frame_label} unrectified {tag}: HoughLinesP strings {len(st)} frets {len(fr)}", (6, 18),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 0), 1, cv2.LINE_AA)
            C.save_sample(vis, os.path.join(out, f"{frame_label}_{tag}_unrectified_hough.webp"))
    res["unrectified"]["time_s"] = round(time.perf_counter() - t0, 4)
    # rectified
    t1 = time.perf_counter()
    H = cv2.getPerspectiveTransform(quad, DST)
    rect = cv2.warpPerspective(rgb, H, (RW, RH), flags=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(rect, cv2.COLOR_RGB2GRAY)
    edges, hough, ls = segments(gray)
    res["homography_img_to_rect"] = np.round(H, 6).tolist()
    res["rectified"] = {"size": [RW, RH]}
    for name, segs in (("hough", hough), ("lsd", ls)):
        st, fr = classify(segs, 0.0, RH, 40)
        fret_x = clusters([(s[0] + s[2]) / 2 for s in fr], 8)
        string_y = clusters([(s[1] + s[3]) / 2 for s in st], 4)
        res["rectified"][name] = {"segments_total": len(segs), "string_like": len(st), "fret_like": len(fr),
                                  "fret_x_clusters_px_from_nut": fret_x, "string_y_clusters_px_from_upper_edge": string_y}
        vis = draw(rect.copy(), st, fr)
        big = cv2.resize(vis, (RW, RH * 2), interpolation=cv2.INTER_NEAREST)
        cv2.putText(big, f"{name}: strings {len(st)} frets {len(fr)}", (6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.45,
                    (255, 255, 0), 1, cv2.LINE_AA)
        C.save_sample(big, os.path.join(out, f"{frame_label}_{tag}_rectified_{name}.webp"))
    res["rectified"]["time_s"] = round(time.perf_counter() - t1, 4)
    cv2.imwrite(os.path.join(out, f"{frame_label}_{tag}_rectified.png"), cv2.cvtColor(rect, cv2.COLOR_RGB2BGR))
    return res


results = {"opencv": cv2.__version__, "frames": {}}
for n in (150, 0, 280):
    rgb = C.load_rgb("R3a_cu", n)
    lab = f"R3a_cu_f{n:04d}"
    results["frames"][lab] = {"hand_quad": run_quad(rgb, QUAD_HAND, "handquad", lab)}
    if n == 150 and sam_mask and os.path.exists(sam_mask):
        m = cv2.imread(sam_mask, cv2.IMREAD_GRAYSCALE) > 127
        cnts, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        big = max(cnts, key=cv2.contourArea)
        box = cv2.boxPoints(cv2.minAreaRect(big))  # 4 corners, order to match QUAD_HAND: nut-top, nut-bottom, body-bottom, body-top
        c = box.mean(axis=0)
        ax = QUAD_HAND[0] - QUAD_HAND[3]
        ax = ax / np.linalg.norm(ax)
        nut_side = [p for p in box if np.dot(p - c, ax) > 0]
        body_side = [p for p in box if np.dot(p - c, ax) <= 0]
        nut_side.sort(key=lambda p: p[1])
        body_side.sort(key=lambda p: p[1])
        q = np.float32([nut_side[0], nut_side[1], body_side[1], body_side[0]])
        results["frames"][lab]["sam_quad"] = run_quad(rgb, q, "samquad", lab)
C.write_json(os.path.join(out, "opencv_lines.json"), results)
for lab, d in results["frames"].items():
    for tag, r in d.items():
        print(lab, tag, json.dumps({k: {kk: (vv if not isinstance(vv, dict) else {a: b for a, b in vv.items() if a in ("string_like", "fret_like", "segments_in_quad")}) for kk, vv in r[k].items() if kk in ("hough", "lsd")} for k in ("unrectified", "rectified")}))
        print("   fret_x (hough, rectified):", r["rectified"]["hough"]["fret_x_clusters_px_from_nut"])
        print("   string_y (hough, rectified):", r["rectified"]["hough"]["string_y_clusters_px_from_upper_edge"])
