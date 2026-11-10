"""MediaPipe Pose Landmarker and Holistic Landmarker (tasks API), VIDEO running mode.

usage: python run_mediapipe_pose_holistic.py <clip> <mode: full|crop> <pose|holistic> <model .task> <out dir>
Pose: 33 body landmarks per person (wrists 15/16, pinky 17/18, index 19/20, thumb 21/22), num_poses=1.
Holistic: pose (33) + face (478) + left hand (21) + right hand (21) for one person.
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

clip, mode, which, model, out = sys.argv[1:6]
SAMPLE_FRAMES = {"R3a": [100, 300, 500], "R3a_cu": [0, 150, 280]}[clip]
os.makedirs(out, exist_ok=True)

t0 = time.perf_counter()
base = mpt.BaseOptions(model_asset_path=model)
if which == "pose":
    det = vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(
        base_options=base, running_mode=vision.RunningMode.VIDEO, num_poses=1,
        min_pose_detection_confidence=0.5, min_pose_presence_confidence=0.5, min_tracking_confidence=0.5))
else:
    det = vision.HolisticLandmarker.create_from_options(vision.HolisticLandmarkerOptions(
        base_options=base, running_mode=vision.RunningMode.VIDEO))
t_init = time.perf_counter() - t0

POSE_ARM = {"l_shoulder": 11, "r_shoulder": 12, "l_elbow": 13, "r_elbow": 14, "l_wrist": 15, "r_wrist": 16,
            "l_pinky": 17, "r_pinky": 18, "l_index": 19, "r_index": 20, "l_thumb": 21, "r_thumb": 22}


def lm_list(lms, w, h, tf):
    return [[round(v, 2) for v in C.to_full([lm.x * w, lm.y * h], tf)] for lm in lms]


records = []
jl = open(os.path.join(out, f"{clip}_{mode}.jsonl"), "w")
for n in range(C.n_frames(clip)):
    rgb = C.load_rgb(clip, n)
    view, tf = C.make_view(rgb, clip, n, mode)
    h, w = view.shape[:2]
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=view.copy())
    t1 = time.perf_counter()
    res = det.detect_for_video(img, int(round(n * 1000 / C.FPS)))
    dt = (time.perf_counter() - t1) * 1000
    hands, pose = [], None
    if which == "pose":
        if res.pose_landmarks:
            lms = res.pose_landmarks[0]
            pose = {k: lm_list([lms[i]], w, h, tf)[0] + [round(float(lms[i].visibility or 0), 3)]
                    for k, i in POSE_ARM.items()}
            # count a "hand" when the wrist landmark's visibility is >= 0.5
            for side, i in (("person_left", 15), ("person_right", 16)):
                if (lms[i].visibility or 0) >= 0.5:
                    hands.append({"label": side, "score": round(float(lms[i].visibility), 4)})
    else:
        if res.pose_landmarks:
            lms = res.pose_landmarks
            pose = {k: lm_list([lms[i]], w, h, tf)[0] for k, i in POSE_ARM.items()}
        for side, lms in (("left_hand", res.left_hand_landmarks), ("right_hand", res.right_hand_landmarks)):
            if lms:
                hands.append({"label": side, "score": None, "lm_px_full": lm_list(lms, w, h, tf)})
    rec = {"n": n, "t_s": round(n / C.FPS, 4), "shot": C.shot_of(clip, n)[0], "view_wh": [w, h], "view_tf": list(tf),
           "t_infer_ms": round(dt, 3), "pose_found": pose is not None, "pose_arm": pose, "hands": hands}
    records.append(rec)
    jl.write(json.dumps(rec) + "\n")
    if n in SAMPLE_FRAMES:
        vis = view.copy()
        x0, y0, s = tf
        if pose:
            for a, b in (("l_shoulder", "l_elbow"), ("l_elbow", "l_wrist"), ("r_shoulder", "r_elbow"),
                         ("r_elbow", "r_wrist"), ("l_shoulder", "r_shoulder")):
                pa = (int((pose[a][0] - x0) * s), int((pose[a][1] - y0) * s))
                pb = (int((pose[b][0] - x0) * s), int((pose[b][1] - y0) * s))
                cv2.line(vis, pa, pb, (0, 200, 255), 2, cv2.LINE_AA)
            for k in ("l_wrist", "r_wrist", "l_index", "r_index", "l_thumb", "r_thumb", "l_pinky", "r_pinky"):
                cv2.circle(vis, (int((pose[k][0] - x0) * s), int((pose[k][1] - y0) * s)), 3, (255, 255, 255), -1)
        for hd in hands:
            if "lm_px_full" in hd:
                pts = [[(x - x0) * s, (y - y0) * s] for x, y in hd["lm_px_full"]]
                C.draw_hand(vis, pts, (0, 255, 0) if hd["label"] == "left_hand" else (255, 64, 255), hd["label"])
        cv2.putText(vis, f"MediaPipe {which} {clip} {mode} frame {n}", (6, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (255, 255, 0), 1, cv2.LINE_AA)
        C.save_sample(vis, os.path.join(out, "frames", f"{clip}_{mode}_f{n:04d}.webp"))
jl.close()
summ = C.summarize(records, clip, mode, {"tool": f"mediapipe {which}", "mediapipe_version": mp.__version__,
                                         "model": os.path.basename(model), "init_s": round(t_init, 3),
                                         "frac_pose_found": round(sum(r["pose_found"] for r in records) / len(records), 4)})
C.write_json(os.path.join(out, f"{clip}_{mode}.summary.json"), summ)
print(json.dumps({"all": summ["all"], "frac_pose_found": summ["frac_pose_found"]}))
