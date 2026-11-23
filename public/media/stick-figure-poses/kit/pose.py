"""CNDY-038 pose helpers: OpenPose body_estimation (CPU) + OpenPose-style skeleton drawing.
Run with the embedded Python:  python_embeded\\python.exe -s pose.py detect IMG [IMG ...] --out keypoints.json
"""
import os, sys, json, warnings
warnings.filterwarnings("ignore")
import numpy as np, cv2

NAMES = ["nose", "neck", "r_shoulder", "r_elbow", "r_wrist", "l_shoulder", "l_elbow", "l_wrist",
         "r_hip", "r_knee", "r_ankle", "l_hip", "l_knee", "l_ankle",
         "r_eye", "l_eye", "r_ear", "l_ear"]
BODY14 = NAMES[:14]
# OpenPose 18-joint limb list (1-based in the reference code) and its colours (BGR here)
LIMBS = [(1, 2), (1, 5), (2, 3), (3, 4), (5, 6), (6, 7), (1, 8), (8, 9), (9, 10), (1, 11), (11, 12),
         (12, 13), (1, 0), (0, 14), (14, 16), (0, 15), (15, 17)]
COLORS = [[255, 0, 0], [255, 85, 0], [255, 170, 0], [255, 255, 0], [170, 255, 0], [85, 255, 0],
          [0, 255, 0], [0, 255, 85], [0, 255, 170], [0, 255, 255], [0, 170, 255], [0, 85, 255],
          [0, 0, 255], [85, 0, 255], [170, 0, 255], [255, 0, 255], [255, 0, 170], [255, 0, 85]]

_op = None
def detector():
    global _op
    if _op is None:
        import torch
        _o = torch.load
        torch.load = lambda *a, **k: _o(*a, **{**k, "weights_only": False})
        from controlnet_aux import OpenposeDetector
        _op = OpenposeDetector.from_pretrained("lllyasviel/Annotators")
        for m in (_op.body_estimation.model,):
            m.to("cpu")
    return _op

def detect(path_or_bgr):
    """Return list of people, each {name: [x, y, conf] or None}, biggest person first."""
    img = cv2.imread(path_or_bgr) if isinstance(path_or_bgr, str) else path_or_bgr
    cand, subset = detector().body_estimation(img)
    people = []
    for person in subset:
        kp = {}
        for i, nm in enumerate(NAMES):
            idx = int(person[i])
            kp[nm] = None if idx == -1 else [float(cand[idx][0]), float(cand[idx][1]), float(cand[idx][2])]
        pts = np.array([v[:2] for v in kp.values() if v])
        area = float(np.ptp(pts[:, 0]) * np.ptp(pts[:, 1])) if len(pts) > 1 else 0.0
        people.append({"kp": kp, "score": float(person[-2]), "parts": int(person[-1]), "bbox_area": area})
    people.sort(key=lambda p: -p["bbox_area"])
    return people, img.shape[1], img.shape[0]

def draw(kp, W, H, bg=None, stick=4, radius=4):
    """OpenPose-style skeleton (coloured limbs on black) from {name: [x,y,...]}."""
    canvas = np.zeros((H, W, 3), np.uint8) if bg is None else bg.copy()
    pts = [kp.get(n) for n in NAMES]
    for i, (a, b) in enumerate(LIMBS):
        pa, pb = pts[a], pts[b]
        if pa is None or pb is None:
            continue
        cur = canvas.copy()
        X = [pa[1], pb[1]]; Y = [pa[0], pb[0]]
        mX, mY = np.mean(X), np.mean(Y)
        length = ((X[0] - X[1]) ** 2 + (Y[0] - Y[1]) ** 2) ** 0.5
        angle = np.degrees(np.arctan2(X[0] - X[1], Y[0] - Y[1]))
        poly = cv2.ellipse2Poly((int(mY), int(mX)), (int(length / 2), stick), int(angle), 0, 360, 1)
        cv2.fillConvexPoly(cur, poly, COLORS[i][::-1])
        canvas = cv2.addWeighted(canvas, 0.4, cur, 0.6, 0)
    for i, p in enumerate(pts):
        if p is not None:
            cv2.circle(canvas, (int(p[0]), int(p[1])), radius, COLORS[i][::-1], -1)
    return canvas

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument("cmd"); ap.add_argument("imgs", nargs="+")
    ap.add_argument("--out", default=None)
    a = ap.parse_args()
    res = {}
    for f in a.imgs:
        people, W, H = detect(f)
        res[os.path.basename(f)] = {"W": W, "H": H, "people": people}
        if people:
            p = people[0]
            hi = [n for n in BODY14 if p["kp"][n] and p["kp"][n][2] >= 0.6]
            print(f"{os.path.basename(f)}: {len(people)} people; biggest: {len(hi)}/14 body joints >= 0.6")
            for n in NAMES:
                v = p["kp"][n]
                print(f"   {n:11s} " + ("-" if v is None else f"({v[0]:.0f},{v[1]:.0f}) {v[2]:.2f}"))
        else:
            print(f"{os.path.basename(f)}: no person")
    if a.out:
        json.dump(res, open(a.out, "w"), indent=1)
