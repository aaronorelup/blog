"""MediaPipe legacy "solutions" Hands API (mediapipe 0.10.21, the last release on PyPI that has mp.solutions).

usage: python run_mediapipe_legacy_hands.py <clip> <full|crop> <out dir>
Settings: static_image_mode=False (tracking between frames), max_num_hands=2, model_complexity=1,
min_detection_confidence=0.5, min_tracking_confidence=0.5. The hand models ship inside the wheel.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402
import mediapipe as mp  # noqa: E402

clip, mode, out = sys.argv[1], sys.argv[2], sys.argv[3]
SAMPLE_FRAMES = {"R3a": [100, 300, 500], "R3a_cu": [0, 150, 280], "R3b": [0, 225, 449], "R3c": [0, 225, 449]}[clip]
os.makedirs(out, exist_ok=True)
t0 = time.perf_counter()
hands_sol = mp.solutions.hands.Hands(static_image_mode=False, max_num_hands=2, model_complexity=1,
                                     min_detection_confidence=0.5, min_tracking_confidence=0.5)
t_init = time.perf_counter() - t0
records = []
jl = open(os.path.join(out, f"{clip}_{mode}.jsonl"), "w")
for n in range(C.n_frames(clip)):
    rgb = C.load_rgb(clip, n)
    view, tf = C.make_view(rgb, clip, n, mode)
    h, w = view.shape[:2]
    t1 = time.perf_counter()
    res = hands_sol.process(view)
    dt = (time.perf_counter() - t1) * 1000
    hands = []
    for i, lms in enumerate(res.multi_hand_landmarks or []):
        cls = res.multi_handedness[i].classification[0]
        full = [C.to_full([lm.x * w, lm.y * h], tf) for lm in lms.landmark]
        world = res.multi_hand_world_landmarks[i].landmark if res.multi_hand_world_landmarks else []
        hands.append({"label": cls.label, "score": round(float(cls.score), 4), "index": int(cls.index),
                      "lm_norm_view": [[round(lm.x, 5), round(lm.y, 5), round(lm.z, 5)] for lm in lms.landmark],
                      "lm_px_full": [[round(x, 2), round(y, 2)] for x, y in full],
                      "world_m": [[round(lm.x, 5), round(lm.y, 5), round(lm.z, 5)] for lm in world]})
    rec = {"n": n, "t_s": round(n / C.fps(clip), 4), "shot": C.shot_of(clip, n)[0], "view_wh": [w, h],
           "view_tf": list(tf), "t_infer_ms": round(dt, 3), "hands": hands}
    records.append(rec)
    jl.write(json.dumps(rec) + "\n")
    if n in SAMPLE_FRAMES:
        vis = view.copy()
        for hd in hands:
            col = (0, 255, 0) if hd["label"] == "Left" else (255, 64, 255)
            C.draw_hand(vis, [[p[0] * w, p[1] * h] for p in hd["lm_norm_view"]], col, f'{hd["label"]} {hd["score"]:.2f}',
                        r=2 if w <= 640 else 4)
        cv2.putText(vis, f"MediaPipe 0.10.21 solutions.hands {clip} {mode} frame {n}: {len(hands)} hand(s)", (6, 18),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5 if w <= 800 else 1.0, (255, 255, 0), 1 if w <= 800 else 2, cv2.LINE_AA)
        C.save_sample(vis, os.path.join(out, "frames", f"{clip}_{mode}_f{n:04d}.webp"))
jl.close()
hands_sol.close()
summ = C.summarize(records, clip, mode, {"tool": "mediapipe legacy solutions.hands", "mediapipe_version": mp.__version__,
                                         "init_s": round(t_init, 3),
                                         "settings": {"static_image_mode": False, "max_num_hands": 2, "model_complexity": 1,
                                                      "min_detection_confidence": 0.5, "min_tracking_confidence": 0.5}})
C.write_json(os.path.join(out, f"{clip}_{mode}.summary.json"), summ)
print(json.dumps(summ["all"]))
