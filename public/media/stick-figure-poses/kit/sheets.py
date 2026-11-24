"""Rerun kit for https://aaronorelup.com/ledger/stick-figure-poses/ : after score.py, print the comparison
table and write the two sheets the post shows.
  grid.jpg      targets down the left, versions A, B, C across, the comparison number under each picture
  openpose.jpg  every picture with the skeleton OpenPose found drawn over it (joints under 0.6 hollow, with
                their confidence), the target in the top right corner
Usage: python sheets.py scores.json RENDER_DIR [OUT_DIR]
scores.json is what score.py wrote, keyed <pose>_<version> (pose1_A ... pose4_C); RENDER_DIR holds the renders.
The comparison number for a pose averages each version's per-limb errors over the limbs found in all of its
scored versions (4 limbs or more). A version with fewer than 4 limbs is left out of its pose; a pose with fewer
than 4 common limbs is shown as "-" and is not comparable.
"""
import os, sys, json
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pose import draw
from score import found, LABELLINGS, angle_err, T

POSES = ["pose1", "pose2", "pose3", "pose4"]
VERS = {"A": "A words", "B": "B stick figure", "C": "C both"}
TITLE = {"pose1": "Arabesque", "pose2": "Lunge", "pose3": "Side-view sprint", "pose4": "Star jump"}
GOLD, CREAM, GREY, BG = (39, 162, 201), (213, 231, 242), (127, 145, 156), (32, 18, 16)


def per_limb(r):
    """per-limb errors under the best of the four left/right labellings"""
    if not r or not r.get("raw_kp"):
        return {}
    k, t, best = found(r["raw_kp"]), found(T[r["pose"]]), None
    for f in LABELLINGS.values():
        e, d = angle_err(f(k), t)
        if e is not None and (best is None or e < best[0]):
            best = (e, d)
    return best[1] if best else {}


def compare(S):
    out = {}
    for p in POSES:
        pl = {v: per_limb(S.get(f"{p}_{v}")) for v in VERS}
        ok = [v for v in VERS if len(pl[v]) >= 4]
        common = sorted(set.intersection(*[set(pl[v]) for v in ok])) if ok else []
        err = {v: round(float(np.mean([pl[v][l] for l in common])), 1) if v in ok and len(common) >= 4 else None
               for v in VERS}
        out[p] = {"err": err, "n_common": len(common), "limbs": {v: len(pl[v]) for v in VERS}}
    return out


def text(img, s, xy, scale, color, thick=1):
    cv2.putText(img, s, xy, cv2.FONT_HERSHEY_SIMPLEX, scale, color, thick, cv2.LINE_AA)


def picture(render_dir, r, size):
    im = cv2.imread(os.path.join(render_dir, r["file"])) if r else None
    return cv2.resize(im, (size, size), interpolation=cv2.INTER_AREA) if im is not None else np.full((size, size, 3), 40, np.uint8)


def grid(S, C, render_dir, path, cell=400, pad=10, head=50, foot=70):
    W = pad + 4 * (cell + pad); H = head + 4 * (cell + foot + pad)
    g = np.full((H, W, 3), BG, np.uint8)
    for j, lab in enumerate(["Target"] + list(VERS.values())):
        text(g, lab, (pad + j * (cell + pad) + 8, 34), 0.8, GOLD, 2)
    for i, p in enumerate(POSES):
        y = head + i * (cell + foot + pad)
        g[y:y + cell, pad:pad + cell] = cv2.resize(draw(T[p], 1024, 1024, stick=9, radius=10), (cell, cell))
        text(g, TITLE[p], (pad + 8, y + cell + 30), 0.75, CREAM, 2)
        text(g, f"{C[p]['n_common']} limbs common", (pad + 8, y + cell + 58), 0.55, GREY)
        errs = {v: e for v, e in C[p]["err"].items() if e is not None}
        win = min(errs, key=errs.get) if errs else None
        for j, v in enumerate(VERS, start=1):
            x = pad + j * (cell + pad); r = S.get(f"{p}_{v}")
            g[y:y + cell, x:x + cell] = picture(render_dir, r, cell)
            if v == win:
                cv2.rectangle(g, (x - 3, y - 3), (x + cell + 2, y + cell + 2), GOLD, 4)
            e = C[p]["err"][v]
            text(g, "-" if e is None else f"{e:.1f} deg", (x + 8, y + cell + 32), 0.85, GOLD if v == win else CREAM, 2)
            if r:
                text(g, f"all-limb {r.get('angle_err')} / {r.get('limbs_scored')} limbs", (x + 8, y + cell + 58), 0.5, GREY)
    cv2.imwrite(path, g, [cv2.IMWRITE_JPEG_QUALITY, 88])


def overlay(r, render_dir, size=1024):
    im = cv2.imread(os.path.join(render_dir, r["file"]))   # joints are in the render's own pixels
    if im is None:
        return np.full((size, size, 3), 40, np.uint8)
    h, w = im.shape[:2]
    raw = r.get("raw_kp") or {}
    kp = {n: (v if v and v[2] >= 0.6 else None) for n, v in raw.items()}
    out = draw(kp, w, h, bg=(im * 0.55).astype(np.uint8), stick=5, radius=6)
    for n, v in raw.items():
        if v and v[2] < 0.6:
            cv2.circle(out, (int(v[0]), int(v[1])), 9, (255, 255, 255), 2)
            text(out, f"{n} {v[2]:.2f}", (int(v[0]) + 10, int(v[1])), 0.5, (255, 255, 255))
    out = cv2.resize(out, (size, size), interpolation=cv2.INTER_AREA)
    out[8:264, size - 264:size - 8] = cv2.resize(draw(T[r["pose"]], 1024, 1024, stick=6, radius=7), (256, 256))
    text(out, f"{r['pose']}_{r.get('arm', '')}  all-limb {r.get('angle_err')}  limbs {r.get('limbs_scored')}  {r.get('labelling')}",
         (12, 30), 0.8, (255, 255, 255), 2)
    return out


def openpose_sheet(S, render_dir, path, size=1024, gap=16):
    sheet = np.full((gap + 4 * (size + gap), gap + 3 * (size + gap), 3), BG, np.uint8)
    for i, p in enumerate(POSES):
        for j, v in enumerate(VERS):
            r = S.get(f"{p}_{v}")
            if r:
                sheet[gap + i * (size + gap):gap + i * (size + gap) + size,
                      gap + j * (size + gap):gap + j * (size + gap) + size] = overlay(r, render_dir, size)
    sheet = cv2.resize(sheet, (sheet.shape[1] // 2, sheet.shape[0] // 2), interpolation=cv2.INTER_AREA)
    cv2.imwrite(path, sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])


if __name__ == "__main__":
    S = json.load(open(sys.argv[1])); render_dir = sys.argv[2]
    out_dir = sys.argv[3] if len(sys.argv) > 3 else "."
    os.makedirs(out_dir, exist_ok=True)
    C = compare(S)
    print(f"{'pose':18s}" + "".join(f"{VERS[v]:>16s}" for v in VERS) + "   limbs common")
    means = {v: [] for v in VERS}
    for p in POSES:
        e = C[p]["err"]
        print(f"{TITLE[p]:18s}" + "".join(f"{'-' if e[v] is None else e[v]:>16}" for v in VERS) + f"   {C[p]['n_common']}")
        if all(e[v] is not None for v in VERS):
            for v in VERS:
                means[v].append(e[v])
    print(f"{'average':18s}" + "".join(f"{round(float(np.mean(means[v])), 1) if means[v] else '-':>16}" for v in VERS)
          + "   (poses where all three are comparable)")
    print("post: A 17.8  B 28.1  C 5.4")
    json.dump(C, open(os.path.join(out_dir, "compare.json"), "w"), indent=1)
    grid(S, C, render_dir, os.path.join(out_dir, "grid.jpg"))
    openpose_sheet(S, render_dir, os.path.join(out_dir, "openpose.jpg"))
    print("wrote", os.path.join(out_dir, "grid.jpg"), "and", os.path.join(out_dir, "openpose.jpg"))
