"""CoTracker3 (offline model) on a short window of R3a_cu, tracking a few hand-picked points (CPU).

usage: python run_cotracker.py <checkpoint scaled_offline.pth> <first frame n> <number of frames> <out dir> <co-tracker clone>
The co-tracker clone (git clone --depth 1 https://github.com/facebookresearch/co-tracker) is passed as a path and
appended to sys.path; it is not pip-installed.
Query points (x, y in 640x480 pixels of R3a_cu, all on the first frame of the window) were picked by hand:
see QUERIES. Output: tracks (T x N x 2 pixels) and visibility (T x N) as JSON, plus two annotated frames.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

ckpt, n0, T, out, repo = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4], sys.argv[5]
sys.path.append(os.path.abspath(repo))

import cv2  # noqa: E402
import numpy as np  # noqa: E402
import torch  # noqa: E402
from cotracker.predictor import CoTrackerPredictor  # noqa: E402
os.makedirs(out, exist_ok=True)
QUERIES = {  # name: (x, y) on frame n0 of R3a_cu
    "nut_mid": (557, 140),
    "neck_a": (242, 331),
    "neck_b": (297, 296),
    "neck_c": (353, 261),
    "index_mcp": (525, 227),
    "wrist": (545, 323),
    "index_tip": (483, 186),
    "middle_tip": (436, 197),
}
torch.set_num_threads(int(os.environ.get("OMP_NUM_THREADS", "2")))
frames = np.stack([C.load_rgb("R3a_cu", n) for n in range(n0, n0 + T)])  # T H W 3
video = torch.from_numpy(frames).permute(0, 3, 1, 2)[None].float()  # 1 T 3 H W
q = torch.tensor([[0.0, x, y] for x, y in QUERIES.values()])[None]  # 1 N 3 (t, x, y)
t0 = time.perf_counter()
model = CoTrackerPredictor(checkpoint=ckpt, offline=True, window_len=60)
t_load = time.perf_counter() - t0
t1 = time.perf_counter()
with torch.inference_mode():
    tracks, vis = model(video, queries=q)
t_run = time.perf_counter() - t1
tracks = tracks[0].numpy()  # T N 2
vis = vis[0].numpy()  # T N
names = list(QUERIES)
res = {"tool": "CoTracker3 offline (scaled_offline.pth)", "clip": "R3a_cu", "first_frame": n0, "n_frames": T,
       "interp_shape": list(model.interp_shape), "queries": QUERIES, "load_s": round(t_load, 2),
       "track_s": round(t_run, 2), "s_per_frame": round(t_run / T, 4), "torch": torch.__version__,
       "threads": torch.get_num_threads(),
       "per_point": {nm: {"visible_frames": int(vis[:, i].sum()),
                          "start_xy": [round(float(v), 2) for v in tracks[0, i]],
                          "end_xy": [round(float(v), 2) for v in tracks[-1, i]],
                          "max_disp_px": round(float(np.max(np.linalg.norm(tracks[:, i] - tracks[0, i], axis=1))), 2)}
                     for i, nm in enumerate(names)},
       "tracks_xy": np.round(tracks, 2).tolist(), "visible": vis.astype(int).tolist()}
C.write_json(os.path.join(out, f"R3a_cu_f{n0}_{T}.json"), res)
for k in (0, T - 1):
    img = frames[k].copy()
    for i, nm in enumerate(names):
        for j in range(1, k + 1):
            cv2.line(img, tuple(int(v) for v in tracks[j - 1, i]), tuple(int(v) for v in tracks[j, i]), (255, 200, 0), 1)
        cv2.circle(img, tuple(int(v) for v in tracks[k, i]), 4, (0, 255, 0) if vis[k, i] else (255, 0, 0), -1)
        cv2.putText(img, nm, (int(tracks[k, i, 0]) + 5, int(tracks[k, i, 1]) - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4,
                    (255, 255, 255), 1, cv2.LINE_AA)
    cv2.putText(img, f"CoTracker3 offline, R3a_cu frame {n0 + k}", (6, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                (255, 255, 0), 1, cv2.LINE_AA)
    C.save_sample(img, os.path.join(out, f"R3a_cu_track_f{n0 + k:04d}.webp"))
print(json.dumps({k: res[k] for k in ("load_s", "track_s", "s_per_frame", "interp_shape", "threads")}))
print(json.dumps(res["per_point"]))
