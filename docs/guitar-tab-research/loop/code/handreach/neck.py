"""neck.py: the neck model of the hand-reach tool.

An anchors file names fret wires on keyframes: {"video", "fps", "capo", "board": {"kind": "steel"|"nylon"},
"keyframes": [{"t": 60.0, "wires": [{"k": 2, "a": [x, y], "b": [x, y]}, ...], "by": "who set it", "note": ""}],
"shots": [[t0, t1], ...] (optional)}. "a" is the wire's end on the string-6 edge of the board, "b" on the string-1 edge,
in pixels of the full video frame. k is the wire's number counted from the NUT (k = 0 is the nut itself).
From two or more wires the image is mapped to the board plane: x along the neck in scale lengths from the nut (wire k
sits at 1 - 2^(-k/12)), y across the board from string 6 (0) to string 1 (1). A point's fret coordinate is
f = -12 log2(1 - x): wire k at f = k, a fingertip pressing in the space behind wire k has k - 1 < f <= k."""
import json, math
import numpy as np
import cv2

TAPER = {"steel": (0.0665, 0.0830), "nylon": (0.0800, 0.0955)}  # board width / scale length at the nut and at wire 12


def wire_x(k):
    return 1.0 - 2.0 ** (-k / 12.0)


def half_width(x, kind):
    w0, w12 = TAPER[kind]
    return (w0 + (w12 - w0) * x / 0.5) / 2.0


def board_points(wires, kind):
    """Board-plane coordinates (x along, y across in scale lengths, y = 0 on the centre line) of each wire end."""
    src, dst = [], []
    for w in wires:
        x = wire_x(w["k"])
        h = half_width(x, kind)
        src += [w["a"], w["b"]]
        dst += [[x, -h], [x, h]]
    return np.array(src, np.float64), np.array(dst, np.float64)


def fit(wires, kind):
    """Homography image -> board plane from the wire ends; with 2 wires exact (4 points), with more a least-squares fit."""
    src, dst = board_points(wires, kind)
    if len(src) == 4:
        Hm = cv2.getPerspectiveTransform(src.astype(np.float32), dst.astype(np.float32)).astype(np.float64)
    else:
        Hm, _ = cv2.findHomography(src, dst, 0)
    return Hm


def to_board(Hm, pts, kind):
    """Image points (N x 2) -> (f, s): fret coordinate and across position (0 = string-6 edge, 1 = string-1 edge)."""
    p = np.asarray(pts, np.float64).reshape(-1, 1, 2)
    q = cv2.perspectiveTransform(p, Hm).reshape(-1, 2)
    x = np.clip(q[:, 0], -0.5, 0.95)
    f = -12.0 * np.log2(1.0 - x)
    h = np.array([half_width(xx, kind) for xx in x])
    s = (q[:, 1] + h) / (2 * h)
    return f, s


def to_image(Hm, f, s, kind):
    """(f, s) -> image points: the inverse, for drawing the grid."""
    f = np.asarray(f, np.float64); s = np.asarray(s, np.float64)
    x = 1.0 - 2.0 ** (-f / 12.0)
    h = np.array([half_width(xx, kind) for xx in np.atleast_1d(x)])
    y = (s * 2 * h) - h
    q = np.stack([np.atleast_1d(x), np.atleast_1d(y)], 1).reshape(-1, 1, 2)
    return cv2.perspectiveTransform(q, np.linalg.inv(Hm)).reshape(-1, 2)


def interp_H(H0, H1, w, kind):
    """A homography between H0 (w = 0) and H1 (w = 1): the image points of four board points are interpolated and the
    mapping refitted, so the board moves smoothly between two track samples."""
    f = [0.0, 0.0, 15.0, 15.0]; s = [0.0, 1.0, 0.0, 1.0]
    p0 = to_image(H0, f, s, kind); p1 = to_image(H1, f, s, kind)
    p = (1 - w) * p0 + w * p1
    x = 1.0 - 2.0 ** (-np.array(f) / 12.0)
    h = np.array([half_width(xx, kind) for xx in x])
    q = np.stack([x, np.array(s) * 2 * h - h], 1)
    return cv2.getPerspectiveTransform(p.astype(np.float32), q.astype(np.float32)).astype(np.float64)


class NeckModel:
    """Per-time homography. Keyframes hold the anchors; with a track file (per-sample homographies from neck_track.py)
    the model follows the track: between two samples it interpolates, and a sample the tracker could not fit (null)
    means NO neck model there (the window is lost: no constraint). Without a track, the nearest keyframe in the same
    shot is used."""

    def __init__(self, anchors_path, track_path=None):
        self.A = json.load(open(anchors_path))
        self.kind = self.A.get("board", {}).get("kind", "steel")
        self.keys = sorted(self.A["keyframes"], key=lambda k: k["t"])
        for k in self.keys:
            k["H"] = fit(k["wires"], self.kind)
        self.shots = self.A.get("shots") or [[0.0, 1e9]]
        self.track = None
        if track_path:
            T = json.load(open(track_path))
            tt = np.array(T["t"], np.float64)
            self.track = (tt, [None if h is None else np.array(h, np.float64) for h in T["H"]],
                          np.array(T.get("conf", [1.0] * len(tt)), np.float64))
            self.step = float(np.median(np.diff(tt))) if len(tt) > 1 else 1.0

    def shot_of(self, t):
        for i, (a, b) in enumerate(self.shots):
            if a <= t < b:
                return i
        return None

    def H_at(self, t):
        """(H, conf) at time t, or (None, 0) when no neck model covers t."""
        if self.track is not None:
            tt, HH, cc = self.track
            j = int(np.searchsorted(tt, t))
            i0, i1 = max(0, j - 1), min(len(tt) - 1, j)
            if i0 != i1 and HH[i0] is not None and HH[i1] is not None and tt[i1] - tt[i0] <= 2.5 * self.step:
                w = float((t - tt[i0]) / (tt[i1] - tt[i0]))
                if w <= 0.0: return HH[i0], float(cc[i0])
                if w >= 1.0: return HH[i1], float(cc[i1])
                return interp_H(HH[i0], HH[i1], w, self.kind), float(min(cc[i0], cc[i1]))
            near = i0 if abs(tt[i0] - t) <= abs(tt[i1] - t) else i1
            if HH[near] is not None and abs(tt[near] - t) <= 0.6 * self.step:
                return HH[near], float(cc[near])
            return None, 0.0
        sh = self.shot_of(t)
        cand = [k for k in self.keys if self.shot_of(k["t"]) == sh]
        if not cand:
            return None, 0.0
        k = min(cand, key=lambda k: abs(k["t"] - t))
        return k["H"], 0.8
