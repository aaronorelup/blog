"""Open-vocabulary detection of guitar parts on single frames: Grounding DINO, OWLv2 (transformers),
YOLO-World v2 and YOLOE-26 (ultralytics).

usage: python run_openvocab.py <gdino|owlv2|yoloworld|yoloe> <out dir> [weights dir for ultralytics]
Images: R3a frames 100 (medium), 300 (wide), 500 (medium) full frame and as the 3x hand crop; R3a_cu frames 0, 150, 280.
Every box with score >= LOW is kept; the summary also counts boxes >= 0.25 and >= 0.5 per prompt.
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

which, out = sys.argv[1], sys.argv[2]
wdir = sys.argv[3] if len(sys.argv) > 3 else "."
os.makedirs(out, exist_ok=True)
torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
PROMPTS = ["guitar", "guitar neck", "fretboard", "headstock", "capo", "hand"]
IMAGES = [("R3a", 100, "full"), ("R3a", 300, "full"), ("R3a", 500, "full"), ("R3a", 100, "crop"),
          ("R3a", 300, "crop"), ("R3a_cu", 0, "full"), ("R3a_cu", 150, "full"), ("R3a_cu", 280, "full")]
LOW = 0.05 if which in ("yoloworld", "yoloe") else (0.1 if which == "owlv2" else 0.2)

t0 = time.perf_counter()
info = {}
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


def detect(rgb):
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
        r = proc.post_process_object_detection(outputs=o, threshold=LOW, target_sizes=torch.tensor([[side, side]]))[0]
        return [(PROMPTS[int(lb)], float(s), [float(v) for v in b]) for lb, s, b in zip(r["labels"], r["scores"], r["boxes"])]
    res = model.predict(np.ascontiguousarray(rgb[:, :, ::-1]), conf=LOW, device="cpu", verbose=False)[0]
    return [(PROMPTS[int(c)], float(s), [float(v) for v in b]) for c, s, b in
            zip(res.boxes.cls.tolist(), res.boxes.conf.tolist(), res.boxes.xyxy.tolist())]


results = []
for clip, n, mode in IMAGES:
    rgb = C.load_rgb(clip, n)
    view, tf = C.make_view(rgb, clip, n, mode)
    t1 = time.perf_counter()
    dets = detect(view)
    dt = time.perf_counter() - t1
    x0, y0, s = tf
    boxes = [{"prompt": p, "score": round(sc, 4),
              "box_full": [round(x0 + b[0] / s, 1), round(y0 + b[1] / s, 1), round(x0 + b[2] / s, 1), round(y0 + b[3] / s, 1)]}
             for p, sc, b in dets]
    boxes.sort(key=lambda d: -d["score"])
    per = {}
    for p in PROMPTS:
        mine = [d for d in boxes if d["prompt"] == p]
        per[p] = {"n_ge_low": len(mine), "n_ge_0.25": sum(d["score"] >= 0.25 for d in mine),
                  "n_ge_0.5": sum(d["score"] >= 0.5 for d in mine), "top": mine[:3]}
    results.append({"clip": clip, "frame": n, "mode": mode, "view_wh": [view.shape[1], view.shape[0]],
                    "infer_s": round(dt, 3), "per_prompt": per, "boxes": boxes})
    vis = view.copy()
    for d in boxes:
        if d["score"] < 0.25 and which != "owlv2":
            continue
        if which == "owlv2" and d["score"] < 0.15:
            continue
        b = d["box_full"]
        p1 = (int((b[0] - x0) * s), int((b[1] - y0) * s))
        p2 = (int((b[2] - x0) * s), int((b[3] - y0) * s))
        col = {"guitar": (255, 160, 0), "guitar neck": (0, 255, 0), "fretboard": (0, 200, 255), "headstock": (255, 0, 255),
               "capo": (255, 0, 0), "hand": (255, 255, 0)}[d["prompt"]]
        cv2.rectangle(vis, p1, p2, col, 2)
        cv2.putText(vis, f'{d["prompt"]} {d["score"]:.2f}', (p1[0] + 2, p1[1] + 14), cv2.FONT_HERSHEY_SIMPLEX, 0.45, col, 1,
                    cv2.LINE_AA)
    cv2.putText(vis, f"{which} {clip} {mode} frame {n}", (6, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1,
                cv2.LINE_AA)
    C.save_sample(vis, os.path.join(out, "frames", f"{clip}_{mode}_f{n:04d}.webp"))
C.write_json(os.path.join(out, "results.json"), {"tool": which, **info, "init_s": round(t_init, 2), "low_threshold": LOW,
                                                 "prompts": PROMPTS, "images": results})
for r in results:
    print(r["clip"], r["frame"], r["mode"], r["infer_s"], {p: (v["n_ge_0.25"], v["top"][0]["score"] if v["top"] else None)
                                                         for p, v in r["per_prompt"].items()})
