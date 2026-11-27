"""lmhands.py: the stored hand landmarks (one JSON line per video frame: t_s, hands [label, score, lm_px_full]) as
masks, so the neck tracker and the track check can leave the hands out (moving fingers must not drag the board fit).
A hand's mask is the convex hull of its 21 points plus a point a little past the wrist (the start of the forearm),
widened by about a finger's width."""
import json
import numpy as np, cv2


class Hands:
    def __init__(self, path):
        self.t, self.h = [], []
        with open(path) as fh:
            for line in fh:
                r = json.loads(line)
                self.t.append(float(r["t_s"]))
                self.h.append([np.array(h["lm_px_full"], np.float64)[:, :2] for h in r.get("hands", []) if h.get("lm_px_full")])
        self.t = np.array(self.t)

    def at(self, t, span=0.08):
        """All hands (21 x 2 arrays, full-frame pixels) on the landmark frames within +-span s of t."""
        i0, i1 = np.searchsorted(self.t, t - span), np.searchsorted(self.t, t + span, side="right")
        out = []
        for i in range(i0, i1):
            out += self.h[i]
        return out

    def mask(self, t, shape, P=None, span=0.08, grow=0.18):
        """uint8 mask (255 = hand) of the given shape; P (3x3) maps full-frame pixels into the mask's pixels."""
        m = np.zeros(shape[:2], np.uint8)
        for pts in self.at(t, span):
            wrist, mid = pts[0], pts[9]
            size = float(np.hypot(*(mid - wrist)))
            ext = np.vstack([pts, wrist + (wrist - mid) * 0.7, wrist + (wrist - pts[5]) * 0.5, wrist + (wrist - pts[17]) * 0.5])
            if P is not None:
                ext = cv2.perspectiveTransform(ext.reshape(-1, 1, 2), P).reshape(-1, 2)
                size *= float(np.sqrt(abs(np.linalg.det(P[:2, :2]))))
            hull = cv2.convexHull(ext.astype(np.float32)).astype(np.int32)
            r = max(2, int(round(size * grow)))
            cv2.fillConvexPoly(m, hull, 255)
            cv2.polylines(m, [hull], True, 255, 2 * r + 1)
        return m
