"""Gap round 2 (gaps V1 and V6): the lane's open-vocabulary detectors on any list of images, with the settings of
scripts/run_openvocab.py (same prompts, same score floors, same model ids, same box handling), so the capo still and
the earlier R3a / R3a_cu views can be run through Grounding DINO, OWLv2, YOLO-World v2 and YOLOE-26 alike.

usage: python run_openvocab_images.py <gdino|owlv2|yoloworld|yoloe> <out dir> <weights dir> SPEC [SPEC ...]
  SPEC = id=path             the whole image
       = id=path@x0,y0,x1,y1@s  crop the box (pixels of that image) and upscale it s times with OpenCV INTER_CUBIC
Boxes are written in the pixels of the image named in the spec (crop offsets and scale undone).
Every box with score >= LOW is kept; counts are also given at >= 0.25 and >= 0.5 per prompt.
"""
import json
import os
import sys
import time

import cv2
import numpy as np
import torch

which, out, wdir = sys.argv[1], sys.argv[2], sys.argv[3]
specs = sys.argv[4:]
os.makedirs(os.path.join(out, "frames"), exist_ok=True)
torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
PROMPTS = ["guitar", "guitar neck", "fretboard", "headstock", "capo", "hand"]
LOW = 0.05 if which in ("yoloworld", "yoloe") else (0.1 if which == "owlv2" else 0.2)

t0 = time.perf_counter()
if which == "gdino":
    from transformers import AutoModelForZeroShotObjectDetection, AutoProcessor
    import transformers
    mid = "IDEA-Research/grounding-dino-tiny"
    proc = AutoProcessor.from_pretrained(mid)
    model = AutoModelForZeroShotObjectDetection.from_pretrained(mid).eval()
    info = {"model": mid, "transformers": transformers.__version__}
elif which == "owlv2":
    from transformers import Owlv2ForObjectDetection, Owlv2Processor
    import transformers
    mid = "google/owlv2-base-patch16-ensemble"
    proc = Owlv2Processor.from_pretrained(mid)
    model = Owlv2ForObjectDetection.from_pretrained(mid).eval()
    info = {"model": mid, "transformers": transformers.__version__}
else:
    import ultralytics
    from ultralytics import YOLO
    os.chdir(wdir)  # the text-encoder asset is looked up in the working directory
    wname = "yolov8s-worldv2.pt" if which == "yoloworld" else "yoloe-26s-seg.pt"
    model = YOLO(os.path.join(wdir, wname))
    if which == "yoloworld":
        model.set_classes(PROMPTS)
    else:
        model.set_classes(PROMPTS, model.get_text_pe(PROMPTS))
    info = {"model": wname, "ultralytics": ultralytics.__version__}
t_init = time.perf_counter() - t0
info["torch"] = torch.__version__


def detect(rgb):
    """Copied from scripts/run_openvocab.py (same calls and thresholds)."""
    from PIL import Image
    h, w = rgb.shape[:2]
    if which == "gdino":
        text = ". ".join(PROMPTS) + "."
        inputs = proc(images=Image.fromarray(rgb), text=text, return_tensors="pt")
        with torch.inference_mode():
            o = model(**inputs)
        r = proc.post_process_grounded_object_detection(o, inputs.input_ids, threshold=LOW, text_threshold=LOW,
                                                        target_sizes=[(h, w)])[0]
        labels = r.get("text_labels", r.get("labels"))
        return [(str(lb), float(s), [float(v) for v in b]) for lb, s, b in zip(labels, r["scores"], r["boxes"])]
    if which == "owlv2":
        texts = [[f"a photo of a {p}" for p in PROMPTS]]
        inputs = proc(text=texts, images=Image.fromarray(rgb), return_tensors="pt")
        with torch.inference_mode():
            o = model(**inputs)
        side = max(h, w)  # OWLv2 pads to a square; boxes come back in the padded frame
        # transformers 5.22.2: Owlv2Processor has no post_process_object_detection (AttributeError in run r0634, the
        # call the model card shows); its image processor keeps that method with the same arguments.
        r = proc.image_processor.post_process_object_detection(outputs=o, threshold=LOW,
                                                               target_sizes=torch.tensor([[side, side]]))[0]
        return [(PROMPTS[int(lb)], float(s), [float(v) for v in b]) for lb, s, b in zip(r["labels"], r["scores"], r["boxes"])]
    res = model.predict(np.ascontiguousarray(rgb[:, :, ::-1]), conf=LOW, device="cpu", verbose=False)[0]
    return [(PROMPTS[int(c)], float(s), [float(v) for v in b]) for c, s, b in
            zip(res.boxes.cls.tolist(), res.boxes.conf.tolist(), res.boxes.xyxy.tolist())]


def save_webp(img_rgb, path, max_w=1280, max_bytes=300_000):
    from PIL import Image
    im = Image.fromarray(img_rgb)
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    for q in (85, 75, 65, 55, 45, 35):
        im.save(path, "WEBP", quality=q, method=6)
        if os.path.getsize(path) <= max_bytes:
            return
    while os.path.getsize(path) > max_bytes:
        im = im.resize((int(im.width * 0.85), int(im.height * 0.85)), Image.LANCZOS)
        im.save(path, "WEBP", quality=35, method=6)


COL = {"guitar": (255, 160, 0), "guitar neck": (0, 255, 0), "fretboard": (0, 200, 255), "headstock": (255, 0, 255),
       "capo": (255, 0, 0), "hand": (255, 255, 0)}
results = []
for spec in specs:
    sid, rest = spec.split("=", 1)
    parts = rest.split("@")
    path = parts[0]
    bgr = cv2.imread(path, cv2.IMREAD_COLOR)
    rgb = bgr[:, :, ::-1].copy()
    if len(parts) == 3:
        x0, y0, x1, y1 = [int(v) for v in parts[1].split(",")]
        s = float(parts[2])
        view = cv2.resize(rgb[y0:y1, x0:x1], (int((x1 - x0) * s), int((y1 - y0) * s)), interpolation=cv2.INTER_CUBIC)
    else:
        x0, y0, s = 0, 0, 1.0
        view = rgb
    t1 = time.perf_counter()
    dets = detect(view)
    dt = time.perf_counter() - t1
    boxes = [{"prompt": p, "score": round(sc, 4),
              "box_image": [round(x0 + b[0] / s, 1), round(y0 + b[1] / s, 1), round(x0 + b[2] / s, 1), round(y0 + b[3] / s, 1)]}
             for p, sc, b in dets]
    boxes.sort(key=lambda d: -d["score"])
    per = {}
    for p in PROMPTS:
        mine = [d for d in boxes if d["prompt"] == p]
        per[p] = {"n_ge_low": len(mine), "n_ge_0.25": sum(d["score"] >= 0.25 for d in mine),
                  "n_ge_0.5": sum(d["score"] >= 0.5 for d in mine), "top": mine[:3]}
    other = sorted({d["prompt"] for d in boxes} - set(PROMPTS))
    results.append({"id": sid, "path": path, "image_wh": [rgb.shape[1], rgb.shape[0]],
                    "view": {"x0": x0, "y0": y0, "scale": s, "wh": [view.shape[1], view.shape[0]]},
                    "infer_s": round(dt, 3), "per_prompt": per, "labels_outside_prompt_list": other, "boxes": boxes})
    vis = view.copy()
    lw = max(2, int(round(view.shape[1] / 640)))
    for d in boxes:
        if d["score"] < (0.15 if which == "owlv2" else 0.25):
            continue
        b = d["box_image"]
        p1 = (int((b[0] - x0) * s), int((b[1] - y0) * s))
        p2 = (int((b[2] - x0) * s), int((b[3] - y0) * s))
        col = COL.get(d["prompt"], (200, 200, 200))
        cv2.rectangle(vis, p1, p2, col, lw)
        cv2.putText(vis, f'{d["prompt"]} {d["score"]:.2f}', (p1[0] + 3, p1[1] + 16 * lw), cv2.FONT_HERSHEY_SIMPLEX,
                    0.45 * lw, col, lw, cv2.LINE_AA)
    cv2.putText(vis, f"{which} {sid}", (8, 22 * lw), cv2.FONT_HERSHEY_SIMPLEX, 0.5 * lw, (255, 255, 255), lw, cv2.LINE_AA)
    save_webp(vis, os.path.join(out, "frames", f"{sid}.webp"))
    print(sid, round(dt, 2), {p: (v["n_ge_low"], v["n_ge_0.25"], v["top"][0]["score"] if v["top"] else None)
                              for p, v in per.items()}, flush=True)
with open(os.path.join(out, "results.json"), "w") as fh:
    json.dump({"tool": which, **info, "init_s": round(t_init, 2), "low_threshold": LOW, "prompts": PROMPTS,
               "images": results}, fh, indent=1)
