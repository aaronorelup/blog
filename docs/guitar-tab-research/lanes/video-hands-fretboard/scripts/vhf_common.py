"""Shared helpers for the video-hands-fretboard trials (frames, shots, crops, summaries, sample images).

Frames are the PNGs extracted with
  ffmpeg -i <clip>.mp4 -vsync 0 <dir>/<prefix>_%04d.png
so file k (1-based) is frame n = k - 1, at t = n * 1001 / 30000 s for the 30000/1001 fps clips.
"""
import json
import os
import statistics

import numpy as np

LANE = "/home/user/gtr/lanes/video-hands-fretboard"
FPS = 30000 / 1001

CLIPS = {
    # clip id: (frame glob prefix, number of frames)
    "R3a": (os.path.join(LANE, "frames", "R3a_{:04d}.png"), 540),
    "R3a_cu": (os.path.join(LANE, "frames", "R3a_cu", "f_{:04d}.png"), 300),
    # R3b, R3c: 1920x1080, 25 fps, 450 frames, decoded as JPEG (ffmpeg -q:v 2) to save disk
    "R3b": (os.path.join(LANE, "frames", "R3b", "f_{:04d}.jpg"), 450),
    "R3c": (os.path.join(LANE, "frames", "R3c", "f_{:04d}.jpg"), 450),
}
CLIP_FPS = {"R3a": 30000 / 1001, "R3a_cu": 30000 / 1001, "R3b": 25.0, "R3c": 25.0}


def fps(clip):
    return CLIP_FPS[clip]


# Shots and hand crops, set by hand (see inputs.md). (x0, y0, x1, y1) in the 640x480 frame.
SHOTS = {
    "R3a": [((0, 217), "medium", (200, 110, 440, 350)),
            ((218, 438), "wide", (200, 100, 480, 320)),
            ((439, 539), "medium", (200, 110, 440, 350))],
    "R3a_cu": [((0, 299), "close", (0, 0, 640, 480))],
    "R3b": [((0, 449), "close", (0, 0, 1920, 1080))],
    "R3c": [((0, 449), "r3c_medium", (0, 0, 1920, 1080))],
}
UPSCALE = {"R3a": 3, "R3a_cu": 2, "R3b": 1, "R3c": 1}


def frame_path(clip, n):
    return CLIPS[clip][0].format(n + 1)


def n_frames(clip):
    return CLIPS[clip][1]


def shot_of(clip, n):
    for (a, b), name, box in SHOTS[clip]:
        if a <= n <= b:
            return name, box
    raise ValueError((clip, n))


def load_rgb(clip, n):
    import cv2
    bgr = cv2.imread(frame_path(clip, n), cv2.IMREAD_COLOR)
    return bgr[:, :, ::-1].copy()


def make_view(rgb, clip, n, mode):
    """Return (image, (x0, y0, scale)) so that full-frame x = x0 + x_view / scale."""
    import cv2
    if mode == "full":
        return rgb, (0, 0, 1.0)
    if mode == "crop":
        _, (x0, y0, x1, y1) = shot_of(clip, n)
        s = UPSCALE[clip]
        crop = rgb[y0:y1, x0:x1]
        up = cv2.resize(crop, ((x1 - x0) * s, (y1 - y0) * s), interpolation=cv2.INTER_CUBIC)
        return up, (x0, y0, float(s))
    raise ValueError(mode)


def to_full(xy_view, tf):
    x0, y0, s = tf
    return [x0 + xy_view[0] / s, y0 + xy_view[1] / s]


def summarize(records, clip, mode, extra=None):
    """records: one dict per frame with keys n, t_infer_ms, hands (list of dicts with 'label', 'score')."""
    out = {"clip": clip, "mode": mode, "frames": len(records)}
    def block(recs):
        k = [len(r["hands"]) for r in recs]
        times = [r["t_infer_ms"] for r in recs]
        labels = {}
        for r in recs:
            for h in r["hands"]:
                labels[h.get("label")] = labels.get(h.get("label"), 0) + 1
        scores = [h["score"] for r in recs for h in r["hands"] if h.get("score") is not None]
        b = {
            "frames": len(recs),
            "frac_0_hands": round(sum(1 for x in k if x == 0) / len(recs), 4),
            "frac_1_hand": round(sum(1 for x in k if x == 1) / len(recs), 4),
            "frac_2_hands": round(sum(1 for x in k if x == 2) / len(recs), 4),
            "frac_more_than_2": round(sum(1 for x in k if x > 2) / len(recs), 4),
            "frac_at_least_1": round(sum(1 for x in k if x >= 1) / len(recs), 4),
            "label_counts": labels,
            "infer_ms_mean": round(statistics.mean(times), 2),
            "infer_ms_median": round(statistics.median(times), 2),
            "infer_ms_p90": round(float(np.percentile(times, 90)), 2),
            "fps_from_mean": round(1000.0 / statistics.mean(times), 2),
        }
        if scores:
            b["score_mean"] = round(statistics.mean(scores), 4)
            b["score_min"] = round(min(scores), 4)
            b["score_max"] = round(max(scores), 4)
        return b
    out["all"] = block(records)
    shots = {}
    for (a, b_), name, _box in SHOTS[clip]:
        shots.setdefault(name, []).extend([r for r in records if a <= r["n"] <= b_])
    out["per_shot"] = {name: block(recs) for name, recs in shots.items() if recs}
    if extra:
        out.update(extra)
    return out


def save_sample(img_rgb, path, max_w=1280, max_bytes=300_000):
    """Save a WebP no wider than max_w and no larger than max_bytes (lowers quality, then size)."""
    from PIL import Image
    im = Image.fromarray(img_rgb)
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for q in (85, 75, 65, 55, 45, 35):
        im.save(path, "WEBP", quality=q, method=6)
        if os.path.getsize(path) <= max_bytes:
            return os.path.getsize(path)
    while os.path.getsize(path) > max_bytes:
        im = im.resize((int(im.width * 0.85), int(im.height * 0.85)), Image.LANCZOS)
        im.save(path, "WEBP", quality=35, method=6)
    return os.path.getsize(path)


def write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(obj, f, indent=1)


# MediaPipe / OpenPose 21-point hand topology (also used by RTMPose hand and the COCO-WholeBody hand blocks).
HAND_EDGES = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 5), (5, 6), (6, 7), (7, 8), (5, 9), (9, 10), (10, 11), (11, 12),
              (9, 13), (13, 14), (14, 15), (15, 16), (13, 17), (17, 18), (18, 19), (19, 20), (0, 17)]


def draw_hand(img, pts, color=(0, 255, 0), label=None, r=2):
    import cv2
    pts = [(int(round(x)), int(round(y))) for x, y in pts]
    for a, b in HAND_EDGES:
        if a < len(pts) and b < len(pts):
            cv2.line(img, pts[a], pts[b], color, 1, cv2.LINE_AA)
    for p in pts:
        cv2.circle(img, p, r, (255, 255, 255), -1, cv2.LINE_AA)
    if label:
        cv2.putText(img, label, (pts[0][0] + 4, pts[0][1] + 12), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1, cv2.LINE_AA)
    return img
