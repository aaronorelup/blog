"""Draw a hand tool's per-frame landmarks (from its JSONL) onto the clip and encode an MP4 (no audio).

usage: python make_overlay_video.py <clip> <tool jsonl> <title> <out mp4> [<scale>]
The JSONL must have, per frame, `n` and `hands` with `lm_px_full` or `kp_px_full` (21 points, full-frame pixels).
"""
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vhf_common as C  # noqa: E402

import cv2  # noqa: E402

clip, jsonl, title, outmp4 = sys.argv[1:5]
scale = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
recs = {}
for line in open(jsonl):
    r = json.loads(line)
    recs[r["n"]] = r
first = C.load_rgb(clip, 0)
h, w = first.shape[:2]
W, H = int(w * scale) // 2 * 2, int(h * scale) // 2 * 2
ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                       "-r", str(C.fps(clip)), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
                       "-pix_fmt", "yuv420p", "-threads", "2", "-movflags", "+faststart", outmp4], stdin=subprocess.PIPE)
for n in range(C.n_frames(clip)):
    img = C.load_rgb(clip, n)
    if scale != 1.0:
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    r = recs.get(n)
    if r:
        for hd in r["hands"]:
            pts = hd.get("lm_px_full") or hd.get("kp_px_full")
            if not pts:
                continue
            col = (0, 255, 0) if hd.get("label") in ("Left", "person_left", None) else (255, 64, 255)
            C.draw_hand(img, [[x * scale, y * scale] for x, y in pts], col,
                        f'{hd.get("label") or "hand"} {hd["score"]:.2f}' if hd.get("score") is not None else hd.get("label"),
                        r=2 if W <= 800 else 3)
    cv2.putText(img, f"{title}  frame {n}", (8, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5 if W <= 800 else 0.8, (255, 255, 0),
                1 if W <= 800 else 2, cv2.LINE_AA)
    ff.stdin.write(img.tobytes())
ff.stdin.close()
ff.wait()
print(outmp4, os.path.getsize(outmp4))
