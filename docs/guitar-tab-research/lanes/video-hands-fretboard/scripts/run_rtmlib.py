"""rtmlib (ONNX Runtime): RTMPose hand (Hand solution), RTMW and DWPose whole-body (Wholebody / Custom).

usage: python run_rtmlib.py <clip> <mode: full|crop> <which: hand|rtmw|dwpose|vitpose> <out dir> [frame step]
Hand: RTMDet-nano hand detector + RTMPose-m hand, 21 keypoints per detected hand, no handedness label.
RTMW / DWPose: YOLOX person detector + 133 COCO-WholeBody keypoints per person; hands are keypoints 91-111
(the person's left hand) and 112-132 (the person's right hand).
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402
import numpy as np  # noqa: E402
import rtmlib  # noqa: E402

clip, mode, which, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
step = int(sys.argv[5]) if len(sys.argv) > 5 else 1
SAMPLE_FRAMES = {"R3a": [100, 300, 500], "R3a_cu": [0, 150, 280], "R3b": [0, 225, 449], "R3c": [0, 225, 449]}[clip]
os.makedirs(out, exist_ok=True)
KPT_THR = 0.3  # a hand counts as found when the mean score of its 21 keypoints is at least this

DET_M = "https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/onnx_sdk/yolox_m_8xb8-300e_humanart-c2c7a14a.zip"
DWPOSE_L = ("https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/onnx_sdk/"
            "rtmpose-l_simcc-ucoco_dw-ucoco_270e-384x288-2438fd99_20230728.zip")

t0 = time.perf_counter()
if which == "hand":
    model = rtmlib.Hand(backend="onnxruntime", device="cpu")
    models = {"det": rtmlib.Hand.MODE["lightweight"]["det"], "pose": rtmlib.Hand.MODE["lightweight"]["pose"]}
elif which == "rtmw":
    model = rtmlib.Wholebody(mode="performance", backend="onnxruntime", device="cpu")
    models = {"det": rtmlib.Wholebody.MODE["performance"]["det"], "pose": rtmlib.Wholebody.MODE["performance"]["pose"]}
elif which == "vitpose":
    VITPOSE_S = "https://huggingface.co/JunkyByte/easy_ViTPose/resolve/main/onnx/wholebody/vitpose-s-wholebody.onnx"
    model = rtmlib.Custom(to_openpose=False, det_class="YOLOX", det=DET_M, det_input_size=(640, 640),
                          pose_class="ViTPose", pose=VITPOSE_S, pose_input_size=(192, 256),
                          backend="onnxruntime", device="cpu")
    models = {"det": DET_M, "pose": VITPOSE_S}
elif which == "dwpose":
    model = rtmlib.Custom(to_openpose=False, det_class="YOLOX", det=DET_M, det_input_size=(640, 640),
                          pose_class="RTMPose", pose=DWPOSE_L, pose_input_size=(288, 384),
                          backend="onnxruntime", device="cpu")
    models = {"det": DET_M, "pose": DWPOSE_L}
else:
    raise SystemExit(which)
t_init = time.perf_counter() - t0

records = []
jl = open(os.path.join(out, f"{clip}_{mode}.jsonl"), "w")
for n in range(0, C.n_frames(clip), step):
    rgb = C.load_rgb(clip, n)
    view, tf = C.make_view(rgb, clip, n, mode)
    bgr = np.ascontiguousarray(view[:, :, ::-1])
    t1 = time.perf_counter()
    # call the detector and the pose model separately (as the solution classes do) to record how many boxes the
    # detector returned: rtmlib's RTMPose/ViTPose run on the WHOLE image when the box list is empty
    bboxes = model.det_model(bgr)
    if isinstance(bboxes, tuple):  # multiclass detectors return (boxes, classes)
        bboxes = bboxes[0]
    bboxes = [list(map(float, b)) for b in bboxes]
    kps, scores = model.pose_model(bgr, bboxes=bboxes)
    dt = (time.perf_counter() - t1) * 1000
    n_det = len(bboxes)
    kps = np.asarray(kps).reshape(-1, np.asarray(kps).shape[-2], 2) if len(kps) else np.zeros((0, 0, 2))
    scores = np.asarray(scores).reshape(len(kps), -1) if len(kps) else np.zeros((0, 0))
    hands, persons = [], []
    if n_det == 0:
        kps = np.zeros((0, 0, 2))  # whole-image fallback output is not counted (kept out of the hand counts)
    if which == "hand":
        for p in range(len(kps)):
            ms = float(scores[p].mean())
            full = [C.to_full(xy, tf) for xy in kps[p]]
            if ms >= KPT_THR:
                hands.append({"label": None, "score": round(ms, 4),
                              "kp_px_full": [[round(x, 2), round(y, 2)] for x, y in full],
                              "kp_score": [round(float(s), 4) for s in scores[p]]})
    else:
        for p in range(len(kps)):
            persons.append({"mean_score_133": round(float(scores[p].mean()), 4)})
            for name, a in (("person_left", 91), ("person_right", 112)):
                hs = scores[p][a:a + 21]
                ms = float(hs.mean())
                full = [C.to_full(xy, tf) for xy in kps[p][a:a + 21]]
                if ms >= KPT_THR:
                    hands.append({"label": name, "score": round(ms, 4), "person": p,
                                  "kp_px_full": [[round(x, 2), round(y, 2)] for x, y in full],
                                  "kp_score": [round(float(s), 4) for s in hs]})
            wr = {"left_wrist_body": kps[p][9].tolist(), "right_wrist_body": kps[p][10].tolist(),
                  "wrist_scores": [float(scores[p][9]), float(scores[p][10])]}
            persons[-1].update({k: (np.round(v, 2).tolist() if isinstance(v, list) else v) for k, v in wr.items()})
    rec = {"n": n, "t_s": round(n / C.fps(clip), 4), "shot": C.shot_of(clip, n)[0], "view_wh": [view.shape[1], view.shape[0]],
           "view_tf": list(tf), "t_infer_ms": round(dt, 3), "n_det_boxes": n_det,
           "det_boxes_full": [[round(v, 1) for v in (C.to_full(b[:2], tf) + C.to_full(b[2:4], tf))] for b in bboxes],
           "n_instances": int(len(kps)), "hands": hands,
           "persons": persons}
    records.append(rec)
    jl.write(json.dumps(rec) + "\n")
    if n in SAMPLE_FRAMES:
        vis = view.copy()
        x0, y0, s = tf
        for hd in hands:
            col = (0, 255, 0) if hd["label"] in (None, "person_left") else (255, 64, 255)
            pts = [[(x - x0) * s, (y - y0) * s] for x, y in hd["kp_px_full"]]
            C.draw_hand(vis, pts, col, f'{hd["label"] or "hand"} {hd["score"]:.2f}', r=2 if mode == "full" else 3)
        cv2.putText(vis, f"rtmlib {which} {clip} {mode} frame {n}: {len(hands)} hand(s) >= {KPT_THR}", (6, 18),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1, cv2.LINE_AA)
        C.save_sample(vis, os.path.join(out, "frames", f"{clip}_{mode}_f{n:04d}.webp"))
jl.close()
summ = C.summarize(records, clip, mode, {"tool": f"rtmlib {which}", "rtmlib_version": getattr(rtmlib, "__version__", "?"),
                                         "models": models, "init_s": round(t_init, 3), "frame_step": step,
                                         "hand_counted_if_mean_kpt_score_ge": KPT_THR,
                                         "frac_frames_with_det_box": round(sum(1 for r in records if r["n_det_boxes"]) / len(records), 4),
                                         "det_boxes_per_frame_max": max(r["n_det_boxes"] for r in records)})
C.write_json(os.path.join(out, f"{clip}_{mode}.summary.json"), summ)
print(json.dumps(summ["all"]))
