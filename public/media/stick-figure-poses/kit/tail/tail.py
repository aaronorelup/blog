"""Rerun kit, part 2 of https://aaronorelup.com/ledger/stick-figure-poses/ : how far a picture's tail is from the drawn
tail chain. Input: a black and white mask of the tail (white = tail), from SAM 3.1 with the text prompt "tail", at the
picture's size: 1344x768 for a still, 736x416 for a frame of a clip (the centre crop of the 1344x768 frame).
  python tail.py MASK.png [MASK2.png ...] --pose pose1 [--out tails.json]
For each mask, the largest white piece is the tail:
  area_share   its share of the frame; tailless when under 0.005
  width_med    its median width along its centreline, px (2 x the distance to its edge)
  cl_dist      the symmetric mean distance between its centreline and the drawn chain, px: the post's "off the chain"
  iou_chain    how much it overlaps the drawn chain's band (intersection over union)
  chain_width_mean  the drawn band's mean width, px, to compare with width_med
Needs numpy, opencv (cv2), scikit-image and scipy, and targets.json beside this file.
"""
import os, sys, json, math, argparse
import numpy as np, cv2
from scipy.spatial import cKDTree
from skimage.morphology import skeletonize
HERE = os.path.dirname(os.path.abspath(__file__))


def to_frame(pts, W, H):
    """chain coordinates (1344x768) -> a WxH frame: the same, or the centre crop and scale of a 736x416 clip"""
    if (W, H) == (1344, 768):
        return [list(p) for p in pts], 1.0
    s = W / 1344.0; ch = 1344.0 * H / W; y0 = (768 - ch) / 2
    return [[p[0] * s, (p[1] - y0) * s] for p in pts], s


def chain_samples(pts, n=400):
    seg = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; tot = sum(seg)
    out = []
    for k in range(n):
        d = tot * k / (n - 1); i = 0
        while i < len(seg) - 1 and d > seg[i]:
            d -= seg[i]; i += 1
        t = min(1, d / seg[i]); out.append([pts[i][0] + t * (pts[i + 1][0] - pts[i][0]), pts[i][1] + t * (pts[i + 1][1] - pts[i][1])])
    return np.array(out)


def chain_band(pts, rr, W, H):
    """the drawn tail as a filled band: tapering quads between the joints and a disc at each joint"""
    m = np.zeros((H, W), np.uint8)
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]; r0, r1 = rr[i], rr[i + 1]
        d = math.hypot(x1 - x0, y1 - y0); ux, uy = (x1 - x0) / d, (y1 - y0) / d; nx, ny = -uy, ux
        poly = np.array([[x0 + nx * r0, y0 + ny * r0], [x1 + nx * r1, y1 + ny * r1],
                         [x1 - nx * r1, y1 - ny * r1], [x0 - nx * r0, y0 - ny * r0]], np.int32)
        cv2.fillConvexPoly(m, poly, 255)
    for (x, y), r in zip(pts, rr):
        cv2.circle(m, (int(x), int(y)), int(r), 255, -1)
    return m > 0


def measure(mask_path, pose=None):
    m = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE); H, W = m.shape
    b = (m > 127).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(b, 8)
    res = {"mask": os.path.basename(mask_path), "W": W, "H": H, "pieces": int(n - 1)}
    if n <= 1:
        res.update(area_share=0.0, tailless=True); return res
    i = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA])); comp = lab == i
    share = float(comp.sum()) / (W * H); res.update(area_share=round(share, 5), tailless=share < 0.005)
    if comp.sum() <= 50:
        return res
    sk = skeletonize(comp); dt = cv2.distanceTransform(comp.astype(np.uint8), cv2.DIST_L2, 5)
    w = 2 * dt[sk]; ys, xs = np.nonzero(sk)
    res.update(width_med=round(float(np.median(w)), 1))
    if pose:
        T = json.load(open(os.path.join(HERE, "targets.json")))["tail"][pose]
        pts, s = to_frame(T["pts"], W, H); rr = [r * s for r in T["r"]]
        S = chain_samples(pts); P = np.stack([xs, ys], 1).astype(float)
        d1 = cKDTree(S).query(P)[0]; d2 = cKDTree(P).query(S)[0]
        band = chain_band(pts, rr, W, H)
        res.update(cl_dist=round(float((d1.mean() + d2.mean()) / 2), 1),
                   iou_chain=round(float((band & comp).sum()) / float((band | comp).sum()), 3),
                   chain_width_mean=round(2 * float(np.mean(rr)), 1))
    return res


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("masks", nargs="+"); ap.add_argument("--pose")
    ap.add_argument("--out")
    a = ap.parse_args(); rows = {}
    for f in a.masks:
        r = measure(f, a.pose); rows[os.path.basename(f)] = r; print(json.dumps(r))
    if a.out:
        old = json.load(open(a.out)) if os.path.exists(a.out) else {}
        old.update(rows); json.dump(old, open(a.out, "w"), indent=1)
