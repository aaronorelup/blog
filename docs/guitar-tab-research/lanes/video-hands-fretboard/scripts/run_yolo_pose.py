"""Ultralytics YOLO pose (17 COCO body keypoints; no finger keypoints) per frame.

usage: python run_yolo_pose.py <clip> <full|crop> <weights .pt> <out dir>
A "hand" is counted when a wrist keypoint (COCO 9 = person's left wrist, 10 = person's right wrist) has
keypoint confidence >= 0.5. Elbows are 7 (left) and 8 (right).
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402
import numpy as np  # noqa: E402
import ultralytics  # noqa: E402
from ultralytics import YOLO  # noqa: E402

clip, mode, weights, out = sys.argv[1:5]
SAMPLE_FRAMES = {"R3a": [100, 300, 500], "R3a_cu": [0, 150, 280]}[clip]
os.makedirs(out, exist_ok=True)
t0 = time.perf_counter()
model = YOLO(weights)
t_init = time.perf_counter() - t0
records = []
jl = open(os.path.join(out, f"{clip}_{mode}.jsonl"), "w")
for n in range(C.n_frames(clip)):
    rgb = C.load_rgb(clip, n)
    view, tf = C.make_view(rgb, clip, n, mode)
    bgr = np.ascontiguousarray(view[:, :, ::-1])
    t1 = time.perf_counter()
    res = model.predict(bgr, imgsz=640, conf=0.25, device="cpu", verbose=False)[0]
    dt = (time.perf_counter() - t1) * 1000
    persons, hands = [], []
    if res.keypoints is not None and len(res.boxes):
        xy = res.keypoints.xy.numpy()
        kc = res.keypoints.conf.numpy() if res.keypoints.conf is not None else np.zeros(xy.shape[:2])
        for p in range(len(res.boxes)):
            pts = {name: C.to_full(xy[p][i].tolist(), tf) + [round(float(kc[p][i]), 4)]
                   for name, i in (("l_elbow", 7), ("r_elbow", 8), ("l_wrist", 9), ("r_wrist", 10))}
            persons.append({"box_conf": round(float(res.boxes.conf[p]), 4),
                            "arm": {k: [round(v[0], 2), round(v[1], 2), v[2]] for k, v in pts.items()}})
            for side, k in (("person_left", "l_wrist"), ("person_right", "r_wrist")):
                if pts[k][2] >= 0.5:
                    hands.append({"label": side, "score": pts[k][2], "person": p})
    rec = {"n": n, "t_s": round(n / C.FPS, 4), "shot": C.shot_of(clip, n)[0], "view_wh": [view.shape[1], view.shape[0]],
           "view_tf": list(tf), "t_infer_ms": round(dt, 3), "ultra_speed_ms": {k: round(v, 2) for k, v in res.speed.items()},
           "persons": persons, "hands": hands}
    records.append(rec)
    jl.write(json.dumps(rec) + "\n")
    if n in SAMPLE_FRAMES:
        vis = res.plot()[:, :, ::-1].copy()
        cv2.putText(vis, f"{os.path.basename(weights)} {clip} {mode} frame {n}", (6, 18), cv2.FONT_HERSHEY_SIMPLEX,
                    0.5, (255, 255, 0), 1, cv2.LINE_AA)
        C.save_sample(vis, os.path.join(out, "frames", f"{clip}_{mode}_f{n:04d}.webp"))
jl.close()
summ = C.summarize(records, clip, mode, {"tool": "ultralytics YOLO pose", "ultralytics_version": ultralytics.__version__,
                                         "weights": os.path.basename(weights), "init_s": round(t_init, 3),
                                         "settings": {"imgsz": 640, "conf": 0.25, "wrist_kpt_conf_min": 0.5},
                                         "frac_frames_with_person": round(sum(1 for r in records if r["persons"]) / len(records), 4),
                                         "persons_per_frame_max": max(len(r["persons"]) for r in records)})
C.write_json(os.path.join(out, f"{clip}_{mode}.summary.json"), summ)
print(json.dumps({"all": summ["all"], "frac_frames_with_person": summ["frac_frames_with_person"]}))
