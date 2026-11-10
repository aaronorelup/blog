# NOT RUN: written by the verifier on 2026-11-10; running the cloned tapnet code was refused by the session permission check ("[Code from External]").
"""TAPIR (original checkpoint, PyTorch port in google-deepmind/tapnet) on the same R3a_cu window and the same
hand-picked query points as the trial's CoTracker3 run (run_cotracker.py), on CPU. Written by the verifier.

usage: python run_tapir.py <tapir_checkpoint_panning.pt> <first frame n> <number of frames> <out dir> <tapnet clone>
       <trial scripts dir (for vhf_common)> [<cotracker json to compare with>]
Model settings follow configs/tapir_config.py of the clone (pyramid_level=0, no extra convs) and the PyTorch Colab
(colabs/torch_tapir_demo.ipynb): frames resized to 256x256 and scaled to [-1, 1], queries as (t, y, x) in the
256x256 grid, visible = (1 - sigmoid(occlusion)) * (1 - sigmoid(expected_dist)) > 0.5.
"""
import json
import os
import sys
import time

ckpt, n0, T, out, repo, sdir = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4], sys.argv[5], sys.argv[6]
cot = sys.argv[7] if len(sys.argv) > 7 else None
sys.path.insert(0, sdir)
sys.path.append(os.path.abspath(repo))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402
import numpy as np  # noqa: E402
import torch  # noqa: E402
import torch.nn.functional as F  # noqa: E402
from tapnet.torch import tapir_model  # noqa: E402

os.makedirs(out, exist_ok=True)
QUERIES = {  # identical to run_cotracker.py: name: (x, y) on frame n0 of R3a_cu, 640x480 pixels
    "nut_mid": (557, 140), "neck_a": (242, 331), "neck_b": (297, 296), "neck_c": (353, 261),
    "index_mcp": (525, 227), "wrist": (545, 323), "index_tip": (483, 186), "middle_tip": (436, 197),
}
torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
frames = np.stack([C.load_rgb("R3a_cu", n) for n in range(n0, n0 + T)])  # T H W 3 uint8
H, W = frames.shape[1:3]
small = np.stack([cv2.resize(f, (256, 256), interpolation=cv2.INTER_AREA) for f in frames])
t0 = time.perf_counter()
model = tapir_model.TAPIR(pyramid_level=0, extra_convs=False)
sd = torch.load(ckpt, map_location="cpu", weights_only=True)
missing, unexpected = model.load_state_dict(sd, strict=True), None
model.eval()
t_load = time.perf_counter() - t0
q = np.array([[0.0, y * 256 / H, x * 256 / W] for x, y in QUERIES.values()], np.float32)  # t, y, x
video = torch.from_numpy(small).float() / 255 * 2 - 1
t1 = time.perf_counter()
with torch.inference_mode():
    o = model(video[None], torch.from_numpy(q)[None])
t_run = time.perf_counter() - t1
tracks = o["tracks"][0].numpy()  # N T 2 in (x, y) of the 256 grid
vis = ((1 - F.sigmoid(o["occlusion"][0])) * (1 - F.sigmoid(o["expected_dist"][0])) > 0.5).numpy()  # N T
tracks = tracks * np.array([W / 256, H / 256])  # back to 640x480 pixels
tracks = np.transpose(tracks, (1, 0, 2))  # T N 2
vis = vis.T  # T N
names = list(QUERIES)
res = {"tool": "TAPIR (tapir_checkpoint_panning.pt, tapnet PyTorch port)", "clip": "R3a_cu", "first_frame": n0,
       "n_frames": T, "model_input": [256, 256], "queries": QUERIES, "load_s": round(t_load, 2),
       "track_s": round(t_run, 2), "s_per_frame": round(t_run / T, 4), "torch": torch.__version__,
       "threads": torch.get_num_threads(), "strict_state_dict_load": True,
       "per_point": {nm: {"visible_frames": int(vis[:, i].sum()),
                          "start_xy": [round(float(v), 2) for v in tracks[0, i]],
                          "end_xy": [round(float(v), 2) for v in tracks[-1, i]],
                          "max_disp_px": round(float(np.max(np.linalg.norm(tracks[:, i] - tracks[0, i], axis=1))), 2)}
                     for i, nm in enumerate(names)},
       "tracks_xy": np.round(tracks, 2).tolist(), "visible": vis.astype(int).tolist()}
if cot:
    c = json.load(open(cot))
    ct = np.array(c["tracks_xy"])  # T N 2
    d = np.linalg.norm(ct[:T] - tracks, axis=2)  # T N
    res["vs_cotracker"] = {nm: {"median_px": round(float(np.median(d[:, i])), 2), "max_px": round(float(d[:, i].max()), 2),
                                "frame_last_px": round(float(d[-1, i]), 2)} for i, nm in enumerate(names)}
C.write_json(os.path.join(out, f"tapir_R3a_cu_f{n0}_{T}.json"), res)
for k in (0, T - 1):
    img = frames[k].copy()
    for i, nm in enumerate(names):
        for j in range(1, k + 1):
            cv2.line(img, tuple(int(v) for v in tracks[j - 1, i]), tuple(int(v) for v in tracks[j, i]), (255, 200, 0), 1)
        cv2.circle(img, tuple(int(v) for v in tracks[k, i]), 4, (0, 255, 0) if vis[k, i] else (255, 0, 0), -1)
        cv2.putText(img, nm, (int(tracks[k, i, 0]) + 5, int(tracks[k, i, 1]) - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4,
                    (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(img, f"TAPIR (verifier run), R3a_cu frame {n0 + k}", (6, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                (255, 255, 0), 1, cv2.LINE_AA)
    C.save_sample(img, os.path.join(out, f"tapir_R3a_cu_track_f{n0 + k:04d}.webp"))
print(json.dumps({k: res[k] for k in ("load_s", "track_s", "s_per_frame", "threads")}))
print(json.dumps(res["per_point"]))
if cot:
    print(json.dumps(res["vs_cotracker"]))
