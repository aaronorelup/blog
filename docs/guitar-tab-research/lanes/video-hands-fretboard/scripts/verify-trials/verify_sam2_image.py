"""Verifier re-run of the IMAGE-MODE part of run_sam2.py (same model call, same prompts), without the 30-frame video
mode (which took 630 s in the trial). Compares each union mask with the trial's saved mask (IoU).
usage: python verify_sam2_image.py <weights dir> <out dir> <trial masks dir> <trial scripts dir>
"""
import json, os, sys, time
wdir, out, trial_masks, sdir = sys.argv[1:5]
sys.path.insert(0, sdir)
import vhf_common as C  # noqa: E402
import cv2  # noqa: E402
import numpy as np  # noqa: E402
import torch  # noqa: E402
import ultralytics  # noqa: E402
from ultralytics import SAM  # noqa: E402
os.makedirs(os.path.join(out, "masks"), exist_ok=True)
torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
PROMPTS = {("R3a_cu", 150): [(260, 314), (330, 272), (380, 243)],
           ("R3a", 100): [(342, 248), (350, 228)],
           ("R3a", 300): [(350, 222), (372, 205)]}
res = {"ultralytics": ultralytics.__version__, "torch": torch.__version__, "threads": torch.get_num_threads(), "image_mode": []}
t0 = time.perf_counter(); model = SAM(os.path.join(wdir, "sam2.1_t.pt")); res["load_s"] = round(time.perf_counter() - t0, 2)
for (clip, n), pts in PROMPTS.items():
    rgb = C.load_rgb(clip, n); bgr = np.ascontiguousarray(rgb[:, :, ::-1])
    for variant, use in (("all_points", pts), ("first_point", pts[:1])):
        t1 = time.perf_counter()
        r = model(bgr, points=[list(p) for p in use], labels=[1] * len(use), device="cpu", verbose=False)[0]
        dt = time.perf_counter() - t1
        masks = r.masks.data.numpy() if r.masks is not None else np.zeros((0,) + rgb.shape[:2])
        m = masks.any(axis=0) if len(masks) else np.zeros(rgb.shape[:2], bool)
        cv2.imwrite(os.path.join(out, "masks", f"{clip}_f{n:04d}_{variant}.png"), (m * 255).astype(np.uint8))
        old = cv2.imread(os.path.join(trial_masks, f"{clip}_f{n:04d}_{variant}.png"), cv2.IMREAD_GRAYSCALE) > 127
        inter = int((m & old).sum()); uni = int((m | old).sum())
        f = {"clip": clip, "frame": n, "variant": variant, "infer_s": round(dt, 3), "n_masks_returned": int(len(masks)),
             "area_px": int(m.sum()), "trial_area_px": int(old.sum()), "iou_vs_trial": round(inter / uni, 4) if uni else None,
             "pixels_differing": int((m ^ old).sum())}
        if r.boxes is not None and len(r.boxes):
            f["scores"] = [round(float(v), 4) for v in r.boxes.conf.tolist()]
        res["image_mode"].append(f); print(json.dumps(f))
json.dump(res, open(os.path.join(out, "verify_sam2_image.json"), "w"), indent=1)
