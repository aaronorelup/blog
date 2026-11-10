"""OWLv2 and Grounding DINO through their public Hugging Face Space demos (gradio_client), on single frames.

usage: python run_spaces_openvocab.py <out dir> <png> [<png> ...]
Spaces (both "RUNNING" on cpu-basic hardware per the Hugging Face API on 2026-11-10):
  merve/owlv2               predict(img, text_queries, score_threshold) -> AnnotatedImage (image + list of (mask, label))
  merve/Grounding_DINO_demo predict(image_base64, detection_prompt, box_threshold, text_threshold, fn_index=0) -> image
The model runs on Hugging Face's machine, so the times below are network plus remote inference, not this box's CPU.
"""
import base64
import json
import os
import shutil
import sys
import time

import numpy as np
from gradio_client import Client, handle_file
from PIL import Image

out = sys.argv[1]
pngs = sys.argv[2:]
os.makedirs(out, exist_ok=True)
OWL_Q = "guitar neck, fretboard, headstock, capo, hand"
OWL_T = 0.1
GD_Q = "guitar neck . fretboard . headstock . capo . hand ."
GD_BOX, GD_TXT = 0.25, 0.25
res = {"owlv2": {"space": "merve/owlv2", "text_queries": OWL_Q, "score_threshold": OWL_T, "images": []},
       "grounding_dino": {"space": "merve/Grounding_DINO_demo", "prompt": GD_Q, "box_threshold": GD_BOX,
                          "text_threshold": GD_TXT, "images": []}}

t0 = time.perf_counter()
owl = Client("merve/owlv2", verbose=False)
res["owlv2"]["connect_s"] = round(time.perf_counter() - t0, 2)
for p in pngs:
    stem = os.path.splitext(os.path.basename(p))[0]
    t1 = time.perf_counter()
    try:
        r = owl.predict(handle_file(p), OWL_Q, OWL_T, api_name="/predict")
    except Exception as e:  # record the failure as it happened
        res["owlv2"]["images"].append({"image": stem, "error": repr(e)[:300]})
        continue
    dt = time.perf_counter() - t1
    entry = {"image": stem, "s": round(dt, 2), "annotations": []}
    base = r["image"] if isinstance(r, dict) else r[0]
    shutil.copy(base, os.path.join(out, f"owlv2_{stem}_base.png"))
    anns = r["annotations"] if isinstance(r, dict) else r[1]
    for k, a in enumerate(anns):
        mpath = a["image"] if isinstance(a, dict) else a[0]
        label = a["label"] if isinstance(a, dict) else a[1]
        m = np.array(Image.open(mpath).convert("L"))
        ys, xs = np.nonzero(m > 0)
        entry["annotations"].append({"label": label, "mask_box": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
                                     if len(xs) else None, "mask_px": int((m > 0).sum())})
    res["owlv2"]["images"].append(entry)
    print("owlv2", stem, entry["s"], [(a["label"], a["mask_box"]) for a in entry["annotations"]])

t0 = time.perf_counter()
gd = Client("merve/Grounding_DINO_demo", verbose=False)
res["grounding_dino"]["connect_s"] = round(time.perf_counter() - t0, 2)
for p in pngs:
    stem = os.path.splitext(os.path.basename(p))[0]
    b64 = "data:image/png;base64," + base64.b64encode(open(p, "rb").read()).decode()
    t1 = time.perf_counter()
    try:
        r = gd.predict(b64, GD_Q, GD_BOX, GD_TXT, fn_index=0)
    except Exception as e:
        res["grounding_dino"]["images"].append({"image": stem, "error": repr(e)[:300]})
        continue
    dt = time.perf_counter() - t1
    outp = os.path.join(out, f"gdino_{stem}.png")
    if isinstance(r, str) and os.path.exists(r):
        shutil.copy(r, outp)
    elif isinstance(r, str):
        data = r.split(",", 1)[1] if r.startswith("data:") else r
        open(outp, "wb").write(base64.b64decode(data))
    res["grounding_dino"]["images"].append({"image": stem, "s": round(dt, 2), "output_png": os.path.basename(outp)})
    print("gdino", stem, round(dt, 2))
json.dump(res, open(os.path.join(out, "spaces_results.json"), "w"), indent=1)
