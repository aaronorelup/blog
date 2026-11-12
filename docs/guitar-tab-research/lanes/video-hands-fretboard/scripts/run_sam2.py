"""Segment Anything 2.1 tiny through ultralytics: image mode on single frames (point prompts on the guitar neck)
and video mode propagating the neck mask over 30 frames of R3a_cu.

usage: python run_sam2.py <weights dir with sam2.1_t.pt> <out dir> <short mp4 of R3a_cu frames 150-179>
Point prompts were picked by hand on the frames (see PROMPTS); label 1 = foreground.
Writes masks as PNG (neck mask per frame), a JSON with areas, boxes, times, and annotated samples.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402
import numpy as np  # noqa: E402
import torch  # noqa: E402
import ultralytics  # noqa: E402
from ultralytics import SAM  # noqa: E402

wdir, out, clipmp4 = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(os.path.join(out, "masks"), exist_ok=True)
torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
W = os.path.join(wdir, "sam2.1_t.pt")
PROMPTS = {  # (clip, frame): list of (x, y) foreground points on the fretboard, 640x480 pixels
    ("R3a_cu", 150): [(260, 314), (330, 272), (380, 243)],
    ("R3a", 100): [(342, 248), (350, 228)],
    ("R3a", 300): [(350, 222), (372, 205)],
}


def mask_facts(m):
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return {"area_px": 0}
    cnts, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    big = max(cnts, key=cv2.contourArea)
    rect = cv2.minAreaRect(big)
    return {"area_px": int(m.sum()), "bbox": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
            "n_components": len(cnts), "min_area_rect": {"center": [round(v, 1) for v in rect[0]],
                                                         "size": [round(v, 1) for v in rect[1]], "angle": round(rect[2], 2)},
            "min_area_rect_corners": np.round(cv2.boxPoints(rect), 1).tolist()}


res_all = {"tool": "SAM 2.1 tiny via ultralytics", "ultralytics": ultralytics.__version__, "weights": "sam2.1_t.pt",
           "torch": torch.__version__, "threads": torch.get_num_threads(), "image_mode": [], "video_mode": None}
t0 = time.perf_counter()
model = SAM(W)
res_all["load_s"] = round(time.perf_counter() - t0, 2)
for (clip, n), pts in PROMPTS.items():
    rgb = C.load_rgb(clip, n)
    bgr = np.ascontiguousarray(rgb[:, :, ::-1])
    for variant, use in (("all_points", pts), ("first_point", pts[:1])):
        t1 = time.perf_counter()
        r = model(bgr, points=[list(p) for p in use], labels=[1] * len(use), device="cpu", verbose=False)[0]
        dt = time.perf_counter() - t1
        masks = r.masks.data.numpy() if r.masks is not None else np.zeros((0,) + rgb.shape[:2])
        # several points for one object are passed as one prompt; ultralytics may return one mask per point
        m = masks.any(axis=0) if len(masks) else np.zeros(rgb.shape[:2], bool)
        f = {"clip": clip, "frame": n, "variant": variant, "points": use, "infer_s": round(dt, 3),
             "n_masks_returned": int(len(masks)), "union": mask_facts(m)}
        if r.boxes is not None and len(r.boxes):
            f["scores"] = [round(float(v), 4) for v in r.boxes.conf.tolist()]
        res_all["image_mode"].append(f)
        cv2.imwrite(os.path.join(out, "masks", f"{clip}_f{n:04d}_{variant}.png"), (m * 255).astype(np.uint8))
        vis = rgb.copy()
        vis[m] = (0.5 * vis[m] + 0.5 * np.array([0, 255, 0])).astype(np.uint8)
        for p in use:
            cv2.circle(vis, p, 4, (255, 0, 0), -1)
        if f["union"].get("min_area_rect_corners"):
            cv2.polylines(vis, [np.int32(f["union"]["min_area_rect_corners"])], True, (255, 255, 0), 1)
        cv2.putText(vis, f"SAM 2.1 tiny {clip} frame {n} {variant} {dt:.2f}s", (6, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (255, 255, 0), 1, cv2.LINE_AA)
        C.save_sample(vis, os.path.join(out, "frames", f"{clip}_f{n:04d}_{variant}.webp"))
        print(json.dumps({k: f[k] for k in ("clip", "frame", "variant", "infer_s", "n_masks_returned")}), f["union"].get("area_px"))

# video mode: 30 frames of R3a_cu starting at frame 150, prompts on the first frame
from ultralytics.models.sam import SAM2VideoPredictor  # noqa: E402

pts = PROMPTS[("R3a_cu", 150)]
t2 = time.perf_counter()
pred = SAM2VideoPredictor(overrides=dict(conf=0.25, task="segment", mode="predict", imgsz=1024, model=W, device="cpu",
                                         verbose=False, save=False))
frames_out = []
tprev = time.perf_counter()
for k, r in enumerate(pred(source=clipmp4, points=[list(p) for p in pts], labels=[1] * len(pts), stream=True)):
    now = time.perf_counter()
    masks = r.masks.data.numpy() if r.masks is not None else np.zeros((0, 480, 640))
    m = masks.any(axis=0) if len(masks) else np.zeros((480, 640), bool)
    frames_out.append({"k": k, "frame": 150 + k, "s": round(now - tprev, 3), "n_masks": int(len(masks)), **mask_facts(m)})
    cv2.imwrite(os.path.join(out, "masks", f"video_R3a_cu_f{150 + k:04d}.png"), (m * 255).astype(np.uint8))
    if k in (0, 29):
        vis = C.load_rgb("R3a_cu", 150 + k)
        vis[m] = (0.5 * vis[m] + 0.5 * np.array([0, 255, 0])).astype(np.uint8)
        cv2.putText(vis, f"SAM 2.1 tiny video mode, R3a_cu frame {150 + k} (prompted on 150)", (6, 18),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1, cv2.LINE_AA)
        C.save_sample(vis, os.path.join(out, "frames", f"video_R3a_cu_f{150 + k:04d}.webp"))
    tprev = now
t_video = time.perf_counter() - t2
res_all["video_mode"] = {"clip": "R3a_cu frames 150-179 (re-encoded to " + os.path.basename(clipmp4) + ")",
                         "points_on_first_frame": pts, "total_s_incl_setup": round(t_video, 2),
                         "n_frames": len(frames_out), "frames": frames_out}
C.write_json(os.path.join(out, "sam2_results.json"), res_all)
areas = [f.get("area_px", 0) for f in frames_out]
print("video", round(t_video, 1), "s for", len(frames_out), "frames; area min/max", min(areas), max(areas))
