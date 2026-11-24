"""Rerun kit, part 2 of https://aaronorelup.com/ledger/stick-figure-poses/ : the sheets, clips and table the post shows,
from one folder of results.
  python sheets.py RESULTS_DIR [OUT_DIR]
RESULTS_DIR holds, for pose1 to pose4 (these names; a missing file leaves its cell grey or its number out):
  poseN-body-still.png, poseN-tail-still.png   the stills made from the body-only and from the tail-chain stick figure
  poseN-keyframe.png                           the picture given to the video model (the repaint kept, or the tail still)
  poseN-guided.mp4, poseN-unguided.mp4         the clips with and without it, same seed and prompt
  poseN-body-still-mask.png, poseN-tail-still-mask.png   SAM 3.1 "tail" masks of the two stills
Writes to OUT_DIR (default RESULTS_DIR): keyframes.jpg (a row per pose: the stick figure with its chain, the two
stills and the keyframe, the drawn chain as a yellow line over each, the tail's distance from it, overlap and width
under each still with a mask), frames.png (each clip's difference from its keyframe, frame by frame: gold with the
keyframe, red without, the frame asked marked), poseN-side-by-side.mp4 (with the keyframe left, without right) and
table.json; prints the table beside the post's numbers. Needs numpy, opencv, Pillow, scikit-image, scipy, ffmpeg.
"""
import os, sys, json, subprocess
import numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tail as T
import clips as C

POSES = ["pose1", "pose2", "pose3", "pose4"]
ASKED = {"pose1": 62, "pose2": 70, "pose3": 100, "pose4": 30}
TITLE = {"pose1": "1 sitting", "pose2": "2 jump attack", "pose3": "3 skid landing", "pose4": "4 lifted by the tail"}
POST = {"pose1": (63.7, 3.9, 62, 5.96, 41.4), "pose2": (73.3, 50.7, 70, 12.4, 64.1),
        "pose3": (39.6, 31.3, 100, 6.9, 45.2), "pose4": (61.6, 6.5, 30, 5.9, 47.6)}
GOLD, RED, CREAM, GREY, BG, YELLOW = (39, 162, 201), (80, 90, 220), (213, 231, 242), (127, 145, 156), (32, 18, 16), (0, 230, 255)
CHAIN = json.load(open(os.path.join(HERE, "targets.json")))["tail"]


def text(img, s, xy, scale=0.55, color=CREAM, thick=1):
    cv2.putText(img, s, xy, cv2.FONT_HERSHEY_SIMPLEX, scale, color, thick, cv2.LINE_AA)


def cell(path, pose, W=480, H=274, chain=True):
    im = cv2.imread(path) if path and os.path.exists(path) else None
    if im is None:
        return np.full((H, W, 3), 40, np.uint8)
    im = cv2.resize(im, (1344, 768), interpolation=cv2.INTER_AREA)
    if chain:
        pts = np.array(CHAIN[pose]["pts"], np.int32)
        cv2.polylines(im, [pts], False, YELLOW, 5, cv2.LINE_AA)
    return cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)


def keyframes(R, rows_out, out):
    W, H, head, foot, pad = 480, 274, 34, 44, 8
    sheet = np.full((len(POSES) * (head + H + foot) + pad, 4 * (W + pad) + pad, 3), BG, np.uint8)
    for i, p in enumerate(POSES):
        y = i * (head + H + foot) + pad
        cols = [(os.path.join(HERE, f"{p}-tail.png"), f"target {TITLE[p]}", False),
                (os.path.join(R, f"{p}-body-still.png"), "body-only stick figure", True),
                (os.path.join(R, f"{p}-tail-still.png"), "stick figure + tail chain", True),
                (os.path.join(R, f"{p}-keyframe.png"), "keyframe given to the video", True)]
        for j, (path, label, chain) in enumerate(cols):
            x = pad + j * (W + pad)
            text(sheet, label, (x + 4, y + 24), 0.6, GOLD if j else CREAM, 1)
            sheet[y + head:y + head + H, x:x + W] = cell(path, p, W, H, chain)
            m = rows_out[p].get("body" if j == 1 else "tail" if j == 2 else None) if j in (1, 2) else None
            if m and "cl_dist" in m:
                text(sheet, f"tail {m['cl_dist']} px off the chain, overlap {m['iou_chain']}, width {m['width_med']} px "
                            f"(drawn {m['chain_width_mean']})", (x + 4, y + head + H + 26), 0.42, GREY)
    cv2.imwrite(out, sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])


def chart(rows_out, out):
    W, H, l, r, t, b = 480, 300, 46, 12, 34, 30
    img = np.full((H, W * len(POSES), 3), BG, np.uint8)
    for i, p in enumerate(POSES):
        x0 = i * W; c = rows_out[p]["clips"]; series = [c[k]["mae"] for k in ("guided", "unguided") if k in c]
        if not series:
            continue
        n = max(len(s) for s in series); top = max(80.0, max(max(s) for s in series))
        X = lambda f: int(x0 + l + (W - l - r) * f / max(1, n - 1)); Y = lambda v: int(H - b - (H - t - b) * v / top)
        cv2.rectangle(img, (x0 + l, t), (x0 + W - r, H - b), (60, 45, 40), 1)
        for v in range(0, int(top) + 1, 20):
            text(img, str(v), (x0 + 8, Y(v) + 4), 0.38, GREY)
        g = ASKED[p]; cv2.line(img, (X(g), t), (X(g), H - b), GREY, 1)
        for k, col in (("unguided", RED), ("guided", GOLD)):
            if k in c:
                pts = np.array([[X(f), Y(v)] for f, v in enumerate(c[k]["mae"])], np.int32)
                cv2.polylines(img, [pts], False, col, 2, cv2.LINE_AA)
        if "guided" in c:
            cv2.circle(img, (X(c["guided"]["closest"]), Y(c["guided"]["closest_mae"])), 5, CREAM, -1)
            text(img, f"{TITLE[p]}: closest f{c['guided']['closest']} (asked f{g})", (x0 + l, 22), 0.5, GOLD)
        text(img, "frame", (x0 + W // 2 - 20, H - 8), 0.4, GREY)
    cv2.imwrite(out, img)


def side_by_side(R, p, out):
    g, u = os.path.join(R, f"{p}-guided.mp4"), os.path.join(R, f"{p}-unguided.mp4")
    if os.path.exists(g) and os.path.exists(u):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", g, "-i", u, "-filter_complex", "[0:v][1:v]hstack=inputs=2",
                        "-an", "-c:v", "libx264", "-crf", "23", "-pix_fmt", "yuv420p", out], check=True)


if __name__ == "__main__":
    R = sys.argv[1]; O = sys.argv[2] if len(sys.argv) > 2 else R; os.makedirs(O, exist_ok=True)
    rows = {}
    for p in POSES:
        row = {"clips": {}}
        for k in ("body", "tail"):
            m = os.path.join(R, f"{p}-{k}-still-mask.png")
            if os.path.exists(m):
                row[k] = T.measure(m, p)
        key = os.path.join(R, f"{p}-keyframe.png")
        for k in ("guided", "unguided"):
            v = os.path.join(R, f"{p}-{k}.mp4")
            if os.path.exists(key) and os.path.exists(v):
                row["clips"][k] = C.measure(key, ASKED[p], v)
        rows[p] = row
        side_by_side(R, p, os.path.join(O, f"{p}-side-by-side.mp4"))
    keyframes(R, rows, os.path.join(O, "keyframes.jpg"))
    chart(rows, os.path.join(O, "frames.png"))
    print(f"{'pose':22s}{'tail off chain px':>22s}{'closest (asked)':>17s}{'MAE with / without':>21s}")
    for p in POSES:
        r = rows[p]; c = r["clips"]
        tl = f"{r.get('body', {}).get('cl_dist', '-')} -> {r.get('tail', {}).get('cl_dist', '-')}"
        cl = f"{c['guided']['closest']} ({ASKED[p]})" if "guided" in c else "-"
        ma = f"{c.get('guided', {}).get('mae_at_asked', '-')} / {c.get('unguided', {}).get('mae_at_asked', '-')}"
        print(f"{TITLE[p]:22s}{tl:>22s}{cl:>17s}{ma:>21s}")
        b, t, a, mg, mu = POST[p]
        print(f"{'  post':22s}{f'{b} -> {t}':>22s}{f'{a} ({a})':>17s}{f'{mg} / {mu}':>21s}")
    for r in rows.values():
        for c in r["clips"].values():
            c.pop("mae", None)
    json.dump(rows, open(os.path.join(O, "table.json"), "w"), indent=1)
    print("wrote", os.path.join(O, "keyframes.jpg"), os.path.join(O, "frames.png"), "and the side-by-side clips")
