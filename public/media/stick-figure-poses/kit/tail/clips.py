"""Rerun kit, part 2 of https://aaronorelup.com/ledger/stick-figure-poses/ : which frame of a clip comes closest to the
keyframe it was given. Per frame, the mean absolute difference (MAE, 0-255) between the frame and the keyframe,
centre-cropped to the clip's shape and scaled to its size (lanczos).
  python clips.py KEYFRAME.png FRAME_ASKED CLIP.mp4 [CLIP2.mp4 ...] [--out clips.json] [--frames DIR]
Prints, for each clip: the closest frame and its MAE, the MAE at the frame asked and 5 frames either side. Give it the
clip made with the keyframe and the one made without it (same seed and prompt): the post's numbers, frames counted
from 0, are closest = asked in all four, MAE 5.9 to 12.4 with the keyframe and 41 to 64 without.
--out adds each clip's numbers (and its whole per-frame series) to a JSON file, keyed by the clip's file name.
--frames DIR saves the frame asked twice: <clip>-f062.png at the clip's size (for SAM's tail mask and tail.py) and
<clip>-f062-1344.png, scaled into the 1344x768 frame of the stick figures (for score.py's limb error).
Needs numpy, Pillow, and ffmpeg and ffprobe on the PATH.
"""
import os, sys, json, subprocess, argparse
import numpy as np
from PIL import Image


def frames(path):
    probe = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                     "stream=width,height", "-of", "csv=p=0", path], text=True)
    w, h = (int(v) for v in probe.strip().split(",")[:2])
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def fit(img, w, h):
    """crop the centre to w:h, then scale to w x h (lanczos), as the run cropped its keyframes"""
    W, H = img.size
    cw, ch = (H * w / h, H) if W / H > w / h else (W, W * h / w)
    x0, y0 = (W - cw) / 2, (H - ch) / 2
    return img.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch))).resize((w, h), Image.LANCZOS)


def to_target_frame(frame):
    """a 736x416 clip frame into the 1344x768 frame of the stick figures: scaled to 1344 wide, centred on black"""
    im = Image.fromarray(frame); up = im.resize((1344, round(1344 * im.height / im.width)), Image.LANCZOS)
    c = Image.new("RGB", (1344, 768)); c.paste(up, (0, round((768 - up.height) / 2))); return c


def measure(keyframe, asked, path, frames_dir=None):
    fr = frames(path); n, h, w = fr.shape[:3]
    key = np.asarray(fit(Image.open(keyframe).convert("RGB"), w, h), np.float32)
    mae = np.abs(fr.astype(np.float32) - key[None]).mean(axis=(1, 2, 3))
    g = asked
    r = {"frames": n, "closest": int(mae.argmin()), "closest_mae": round(float(mae.min()), 2),
         "asked": g, "mae_at_asked": round(float(mae[g]), 2),
         "mae_asked_minus_5": round(float(mae[max(0, g - 5)]), 2), "mae_asked_plus_5": round(float(mae[min(n - 1, g + 5)]), 2),
         "mae": [round(float(x), 2) for x in mae]}
    if frames_dir:
        os.makedirs(frames_dir, exist_ok=True)
        stem = os.path.join(frames_dir, f"{os.path.splitext(os.path.basename(path))[0]}-f{g:03d}")
        Image.fromarray(fr[g]).save(stem + ".png"); to_target_frame(fr[g]).save(stem + "-1344.png")
        r["frame_files"] = [stem + ".png", stem + "-1344.png"]
    return r


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("keyframe"); ap.add_argument("asked", type=int)
    ap.add_argument("clips", nargs="+"); ap.add_argument("--out"); ap.add_argument("--frames")
    a = ap.parse_args()
    out = json.load(open(a.out)) if a.out and os.path.exists(a.out) else {}
    for path in a.clips:
        r = measure(a.keyframe, a.asked, path, a.frames)
        out[os.path.basename(path)] = r
        print(path, {k: v for k, v in r.items() if k != "mae"})
    if a.out:
        json.dump(out, open(a.out, "w"), indent=1)
