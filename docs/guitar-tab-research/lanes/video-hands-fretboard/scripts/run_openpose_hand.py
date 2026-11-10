"""OpenPose hand keypoint model (CMU), PyTorch port (Hzzone/pytorch-openpose), on hand boxes taken from MediaPipe.

usage: python run_openpose_hand.py <pytorch-openpose clone> <hand_pose_model.pth> <mediapipe jsonl> <clip> <frame step> <out dir>
OpenPose finds hands from its body model (not downloaded here: body_pose_model.pth is 209 MB, over the 200 MB download
limit set by the orchestrator's disk notice). Instead each box comes from the MediaPipe Hand Landmarker run on the same
frame: the square around MediaPipe's 21 points, side = 1.5 x the longer side of their bounding box (a handoff, done by
this script). The model code (`src/model.py` handpose_model) is imported from the clone passed as a path; the inference
loop below re-implements `src/hand.py` (scales 0.5, 1.0, 1.5, 2.0 of a 368-px box, stride 8, heatmap threshold 0.05)
with OpenCV instead of scipy/scikit-image, keeping the largest component per keypoint and its peak value as the score.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

repo, weights, mpjsonl, clip, step, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5]), sys.argv[6]
sys.path.append(os.path.abspath(repo))

import cv2  # noqa: E402
import numpy as np  # noqa: E402
import torch  # noqa: E402
from src.model import handpose_model  # noqa: E402

torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
os.makedirs(os.path.join(out, "frames"), exist_ok=True)
t0 = time.perf_counter()
model = handpose_model()
sd = torch.load(weights, map_location="cpu", weights_only=True)
model.load_state_dict({k: sd[".".join(k.split(".")[1:])] for k in model.state_dict().keys()})
model.eval()
t_load = time.perf_counter() - t0


def pad_right_down(img, stride, val):
    h, w = img.shape[:2]
    ph = (stride - h % stride) % stride
    pw = (stride - w % stride) % stride
    return cv2.copyMakeBorder(img, 0, ph, 0, pw, cv2.BORDER_CONSTANT, value=(val, val, val)), ph, pw


def openpose_hand(bgr):
    boxsize, stride, thre = 368, 8, 0.05
    h0, w0 = bgr.shape[:2]
    heat = np.zeros((h0, w0, 22), np.float32)
    for sc in (0.5, 1.0, 1.5, 2.0):
        m = sc * boxsize / h0
        im = cv2.resize(bgr, (0, 0), fx=m, fy=m, interpolation=cv2.INTER_CUBIC)
        padded, ph, pw = pad_right_down(im, stride, 128)
        x = torch.from_numpy(np.ascontiguousarray(padded.transpose(2, 0, 1)[None].astype(np.float32) / 256 - 0.5))
        with torch.no_grad():
            o = model(x)[0].numpy().transpose(1, 2, 0)
        o = cv2.resize(o, (0, 0), fx=stride, fy=stride, interpolation=cv2.INTER_CUBIC)
        o = o[:padded.shape[0] - ph, :padded.shape[1] - pw, :]
        heat += cv2.resize(o, (w0, h0), interpolation=cv2.INTER_CUBIC) / 4
    peaks = []
    for part in range(21):
        mo = heat[:, :, part].copy()
        sm = cv2.GaussianBlur(mo, (0, 0), 3)
        binary = (sm > thre).astype(np.uint8)
        if binary.sum() == 0:
            peaks.append([0.0, 0.0, 0.0])
            continue
        nlab, lab = cv2.connectedComponents(binary, connectivity=8)
        best = max(range(1, nlab), key=lambda i: float(mo[lab == i].sum()))
        mo[lab != best] = 0
        y, x = np.unravel_index(int(np.argmax(mo)), mo.shape)
        peaks.append([float(x), float(y), float(heat[y, x, part])])
    return peaks


recs = [json.loads(l) for l in open(mpjsonl)]
results = []
for r in recs:
    if r["n"] % step:
        continue
    rgb = C.load_rgb(clip, r["n"])
    for hi, hd in enumerate(r["hands"]):
        pts = np.array(hd["lm_px_full"])
        x0, y0 = pts.min(0)
        x1, y1 = pts.max(0)
        side = 1.5 * max(x1 - x0, y1 - y0)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        bx0, by0 = int(round(cx - side / 2)), int(round(cy - side / 2))
        bs = int(round(side))
        crop = cv2.copyMakeBorder(rgb, bs, bs, bs, bs, cv2.BORDER_CONSTANT, value=(0, 0, 0))[by0 + bs:by0 + 2 * bs,
                                                                                                bx0 + bs:bx0 + 2 * bs]
        t1 = time.perf_counter()
        pk = openpose_hand(np.ascontiguousarray(crop[:, :, ::-1]))
        dt = time.perf_counter() - t1
        full = [[round(bx0 + p[0], 2), round(by0 + p[1], 2), round(p[2], 4)] for p in pk]
        found = [p for p in full if p[2] > 0]
        mp_full = hd["lm_px_full"]
        dists = [float(np.hypot(full[i][0] - mp_full[i][0], full[i][1] - mp_full[i][1])) for i in range(21) if full[i][2] > 0]
        results.append({"n": r["n"], "mp_label": hd["label"], "box_full_xywh": [bx0, by0, bs, bs], "infer_s": round(dt, 3),
                        "keypoints_full_xy_score": full, "n_found": len(found),
                        "median_px_to_mediapipe_same_index": round(float(np.median(dists)), 2) if dists else None})
        if len(results) <= 3 or r["n"] in (150, 100):
            vis = crop.copy()
            sc = 368 / max(1, bs)
            vis = cv2.resize(vis, (368, 368), interpolation=cv2.INTER_CUBIC)
            C.draw_hand(vis, [[p[0] * sc, p[1] * sc] for p in pk], (0, 255, 255), "OpenPose", r=3)
            C.draw_hand(vis, [[(x - bx0) * sc, (y - by0) * sc] for x, y in mp_full], (255, 0, 255), None, r=1)
            cv2.putText(vis, f"{clip} f{r['n']} OpenPose (yellow) / MediaPipe (magenta)", (4, 14), cv2.FONT_HERSHEY_SIMPLEX,
                        0.4, (255, 255, 255), 1, cv2.LINE_AA)
            C.save_sample(vis, os.path.join(out, "frames", f"{clip}_f{r['n']:04d}_h{hi}.webp"))
times = [x["infer_s"] for x in results]
summ = {"tool": "OpenPose hand model (pytorch-openpose port)", "clip": clip, "frame_step": step, "load_s": round(t_load, 2),
        "hands_run": len(results), "infer_s_mean": round(float(np.mean(times)), 3) if times else None,
        "infer_s_median": round(float(np.median(times)), 3) if times else None,
        "keypoints_found_mean": round(float(np.mean([x["n_found"] for x in results])), 2) if results else None,
        "median_of_median_px_to_mediapipe": round(float(np.median([x["median_px_to_mediapipe_same_index"] for x in results
                                                                   if x["median_px_to_mediapipe_same_index"] is not None])), 2)
        if results else None,
        "peak_score_mean": round(float(np.mean([p[2] for x in results for p in x["keypoints_full_xy_score"]])), 4) if results else None,
        "torch": torch.__version__, "threads": torch.get_num_threads()}
C.write_json(os.path.join(out, f"{clip}.json"), {"summary": summ, "hands": results})
print(json.dumps(summ))
