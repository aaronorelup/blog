"""MediaPipe Hand Landmarker (tasks API), VIDEO running mode, 2 hands, image + world landmarks.

usage: python run_mediapipe_hands.py <clip> <mode: full|crop> <model .task> <out dir>
Writes <out>/<clip>_<mode>.jsonl (one line per frame), <out>/<clip>_<mode>.summary.json and annotated frames.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402
import mediapipe as mp  # noqa: E402
from mediapipe.tasks import python as mpt  # noqa: E402
from mediapipe.tasks.python import vision  # noqa: E402

clip, mode, model, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
SAMPLE_FRAMES = {"R3a": [100, 300, 500], "R3a_cu": [0, 150, 280], "R3b": [0, 225, 449], "R3c": [0, 225, 449]}[clip]
os.makedirs(out, exist_ok=True)

t0 = time.perf_counter()
opts = vision.HandLandmarkerOptions(
    base_options=mpt.BaseOptions(model_asset_path=model),
    running_mode=vision.RunningMode.VIDEO,
    num_hands=2,
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)
det = vision.HandLandmarker.create_from_options(opts)
t_init = time.perf_counter() - t0

records = []
jl = open(os.path.join(out, f"{clip}_{mode}.jsonl"), "w")
for n in range(C.n_frames(clip)):
    rgb = C.load_rgb(clip, n)
    view, tf = C.make_view(rgb, clip, n, mode)
    h, w = view.shape[:2]
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=view.copy())
    ts_ms = int(round(n * 1000 / C.fps(clip)))
    t1 = time.perf_counter()
    res = det.detect_for_video(img, ts_ms)
    dt = (time.perf_counter() - t1) * 1000
    hands = []
    for i, lms in enumerate(res.hand_landmarks):
        cat = res.handedness[i][0]
        px = [[lm.x * w, lm.y * h] for lm in lms]
        full = [C.to_full(p, tf) for p in px]
        hands.append({
            "label": cat.category_name, "score": round(float(cat.score), 4), "index": int(cat.index),
            "lm_norm_view": [[round(lm.x, 5), round(lm.y, 5), round(lm.z, 5)] for lm in lms],
            "lm_px_full": [[round(x, 2), round(y, 2)] for x, y in full],
            "world_m": [[round(lm.x, 5), round(lm.y, 5), round(lm.z, 5)] for lm in res.hand_world_landmarks[i]],
        })
    rec = {"n": n, "t_s": round(n / C.fps(clip), 4), "shot": C.shot_of(clip, n)[0], "view_wh": [w, h],
           "view_tf": list(tf), "t_infer_ms": round(dt, 3), "hands": hands}
    records.append(rec)
    jl.write(json.dumps(rec) + "\n")
    if n in SAMPLE_FRAMES:
        vis = view.copy()
        for hd in hands:
            col = (0, 255, 0) if hd["label"] == "Left" else (255, 64, 255)
            pts = [[p[0] * w, p[1] * h] for p in hd["lm_norm_view"]]
            C.draw_hand(vis, pts, col, f'{hd["label"]} {hd["score"]:.2f}', r=2 if mode == "full" else 3)
        cv2.putText(vis, f"MediaPipe HandLandmarker {clip} {mode} frame {n}: {len(hands)} hand(s)", (6, 18),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1, cv2.LINE_AA)
        C.save_sample(vis, os.path.join(out, "frames", f"{clip}_{mode}_f{n:04d}.webp"))
jl.close()
summ = C.summarize(records, clip, mode, {"tool": "mediapipe HandLandmarker", "mediapipe_version": mp.__version__,
                                         "model": os.path.basename(model), "init_s": round(t_init, 3),
                                         "settings": {"running_mode": "VIDEO", "num_hands": 2,
                                                      "min_hand_detection_confidence": 0.5,
                                                      "min_hand_presence_confidence": 0.5,
                                                      "min_tracking_confidence": 0.5}})
C.write_json(os.path.join(out, f"{clip}_{mode}.summary.json"), summ)
print(json.dumps(summ["all"]))
