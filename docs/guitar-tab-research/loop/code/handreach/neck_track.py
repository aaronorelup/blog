#!/usr/bin/env python3
"""neck_track.py <video> <anchors.json> <landmarks.jsonl> <out track.json> [--fps 5] [--check-every 5] [--no-check]
   [--min-rho 0.4] [--threads 2] [--scale 1.0]
Follows the guitar through the video: for every sampled frame (--fps a second, plus every keyframe), the homography
image -> board plane (the mapping of neck.py, so NeckModel, hand_window.py and overlay.py read it with --track).
How: each keyframe of the anchors file starts a track that runs forward and backward through its shot. From one sample
to the next the board region is followed by optical flow on corner features (RANSAC homography), then refined by ECC
against the keyframe's straightened board (the board warped flat, nut to soundhole; wires weighted over strings by
--emph), so errors do not pile up, and then (unless --no-snap) refitted to the fret wires the detector of
wire_candidates.py finds within 1/4 of a spacing of the modelled wires (4 or more wires over 5 or more frets), which
keeps the grid square to the real wires. The stored hand landmarks mask the hands out of every step. Every keyframe resets the board to its anchors. Where two
keyframes' tracks meet a sample they are blended when they agree, else the more confident wins. A track stops at a
camera cut or a dark frame (found from frame-to-frame change), and at the end of an anchors shot ("shots" [[t0, t1]]).
A sample with no trustworthy fit is null: the window is lost there (no constraint). Shots with no keyframe stay null:
add a keyframe there.
Writes <out track.json>: {"t": [...], "H": [3x3 or null, ...], "conf": [...], "rho", "src", "cuts", "selfcheck", ...};
conf is the ECC correlation of the straightened board with the keyframe's (1 = same picture; null under --min-rho).
Then, unless --no-check, runs the self-check of track_check.py every --check-every s (no answer key), on frames half a
sample after the tracked ones (so never on a frame the snap used): the distance from each wire candidate found on the
tracked board to the nearest predicted wire, in pixels and as a share of the fret spacing there, in the middle of the
board and at its edges. A good track keeps both medians well under 1/3 of a spacing (random positions would give
0.25). --t0/--t1 track only that part of the video (for trials)."""
import argparse, json, math, os, sys, time, tempfile
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neck import fit, to_image, to_board, wire_x, half_width
from lmhands import Hands

F0, F1 = -0.5, 24.0          # straightened board: from just past the nut to the soundhole edge (fret coordinates)
EDGE = 1.12                  # across: the board's two edges and a little outside (half widths)


def board_poly(H, kind, f0=F0, f1=F1, edge=EDGE):
    f = np.linspace(f0, f1, 12)
    s_lo, s_hi = 0.5 - edge / 2, 0.5 + edge / 2
    a = to_image(H, f, np.full_like(f, s_lo), kind); b = to_image(H, f[::-1], np.full_like(f, s_hi), kind)
    return np.vstack([a, b])


class Strip:
    """The straightened board: strip pixel (u, v) <-> board plane (x, y): u = k (x - x0), v = k (y - y0)."""

    def __init__(self, H, kind, max_len):
        self.kind = kind
        self.x0, self.x1 = wire_x(F0), wire_x(F1)
        hm = half_width(self.x1, kind) * EDGE
        self.y0, self.y1 = -hm, hm
        c = to_image(H, [F0, F1], [0.5, 0.5], kind)
        L = float(np.hypot(*(c[1] - c[0])))
        self.W = int(min(max_len, max(200, L)))
        self.k = self.W / (self.x1 - self.x0)
        self.Hh = int(round(self.k * (self.y1 - self.y0)))
        self.S = np.array([[self.k, 0, -self.k * self.x0], [0, self.k, -self.k * self.y0], [0, 0, 1]], np.float64)
        u, v = np.meshgrid(np.arange(self.W), np.arange(self.Hh))
        x = self.x0 + u / self.k; y = self.y0 + v / self.k
        hw = np.array([half_width(xx, kind) for xx in x[0]])[None, :]
        self.board = ((np.abs(y) <= hw * EDGE)).astype(np.uint8) * 255

    def warp(self, img, H, interp=cv2.INTER_LINEAR):
        return cv2.warpPerspective(img, self.S @ H, (self.W, self.Hh), flags=interp, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def ecc_refine(T, Tm, J, Jm, levels=2, iters=(40, 30)):
    """Homography W with J(W p) ~ T(p), coarse to fine. Returns (rho, W) or (None, None)."""
    W = np.eye(3, dtype=np.float32)
    rho = None
    for lev in range(levels - 1, -1, -1):
        sc = 0.5 ** lev
        if sc < 1:
            Ts = cv2.resize(T, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA); Js = cv2.resize(J, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
            Tms = cv2.resize(Tm, (Ts.shape[1], Ts.shape[0]), interpolation=cv2.INTER_NEAREST); Jms = cv2.resize(Jm, (Js.shape[1], Js.shape[0]), interpolation=cv2.INTER_NEAREST)
        else:
            Ts, Js, Tms, Jms = T, J, Tm, Jm
        D = np.diag([sc, sc, 1.0]).astype(np.float32)
        Wl = (D @ W @ np.linalg.inv(D)).astype(np.float32)
        try:
            rho, Wl = cv2.findTransformECCWithMask(Ts, Js, Tms, Jms, Wl, cv2.MOTION_HOMOGRAPHY,
                                                   (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, iters[min(lev, len(iters) - 1)], 1e-5), 5)
        except cv2.error:
            return None, None
        W = (np.linalg.inv(D) @ Wl @ D).astype(np.float32)
    return float(rho), W.astype(np.float64)


def lk_step(prev, cur, mask):
    """Homography prev -> cur from tracked corners inside mask, or None."""
    pts = cv2.goodFeaturesToTrack(prev, maxCorners=500, qualityLevel=0.01, minDistance=6, mask=mask, blockSize=7)
    if pts is None or len(pts) < 20:
        return None, 0
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, cur, pts, None, winSize=(21, 21), maxLevel=3)
    back, st2, _ = cv2.calcOpticalFlowPyrLK(cur, prev, nxt, None, winSize=(21, 21), maxLevel=3)
    ok = (st.ravel() == 1) & (st2.ravel() == 1) & (np.linalg.norm((back - pts).reshape(-1, 2), axis=1) < 1.0)
    if ok.sum() < 15:
        return None, int(ok.sum())
    D, inl = cv2.findHomography(pts[ok], nxt[ok], cv2.RANSAC, 2.5)
    if D is None or inl.sum() < 12 or inl.sum() < 0.4 * ok.sum():
        return None, int(0 if inl is None else inl.sum())
    return D, int(inl.sum())


def wire_px(H, kind, f=(1.0, 12.0)):
    p = to_image(H, list(f), [0.5] * len(f), kind)
    return float(np.hypot(*(p[1] - p[0])))


def disagreement(Ha, Hb, kind):
    """Largest difference in fret coordinate between two board models, over wires 1..17 on the centre line."""
    f = np.array([1.0, 5.0, 9.0, 13.0, 17.0])
    p = to_image(Ha, f, np.full_like(f, 0.5), kind)
    fb, _ = to_board(Hb, p, kind)
    return float(np.max(np.abs(fb - f)))


def blend(Ha, Hb, w, kind):
    from neck import interp_H
    return interp_H(Ha, Hb, w, kind)


def snap(img, H, kind, hmask, max_err=0.25):
    """Refit the board to the wire candidates found near the modelled wires (each takes the number of the modelled wire
    it sits on). Needs 4 wires over at least 5 frets; returns (H, n) or (None, n)."""
    from wire_candidates import detect
    from track_check import board_quad
    q = board_quad(H, kind, img.shape)
    if q is None:
        return None, 0
    cs = detect(img, q, L=1600, Hh=100, min_gap=12, floor=1.0, slant=0.8)
    best = {}
    for c in cs:
        a_, b_ = np.array(c["a"]), np.array(c["b"]); m = (a_ + b_) / 2
        seg = a_[None, :] + np.linspace(0, 1, 7)[:, None] * (b_ - a_)[None, :]
        si = np.clip(seg.round().astype(int), [0, 0], [img.shape[1] - 1, img.shape[0] - 1])
        if np.mean(hmask[si[:, 1], si[:, 0]] > 0) > 0.3:
            continue
        f, _ = to_board(H, m[None, :], kind)
        k = int(round(float(f[0]))); e = abs(float(f[0]) - k)
        if k < 0 or k > 21 or e > max_err:
            continue
        if k not in best or e < best[k][0]:
            best[k] = (e, {"k": k, "a": list(a_), "b": list(b_)})
    ks = sorted(best)
    if len(ks) < 4 or ks[-1] - ks[0] < 5:
        return None, len(ks)
    use = [best[k][1] for k in ks]
    for _ in range(3):
        Hn = fit(use, kind)
        mids = np.array([(np.array(w["a"]) + np.array(w["b"])) / 2 for w in use])
        res = np.abs(to_board(Hn, mids, kind)[0] - np.array([w["k"] for w in use]))
        if res.max() <= 0.15:
            break
        use = [w for w, r in zip(use, res) if r < res.max()]
        if len(use) < 4 or use[-1]["k"] - use[0]["k"] < 5:
            return None, len(use)
    if np.sqrt(np.mean(res ** 2)) > 0.1 or disagreement(Hn, H, kind) > 0.5:
        return None, len(use)
    return Hn, len(use)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("anchors"); ap.add_argument("landmarks"); ap.add_argument("out")
    ap.add_argument("--fps", type=float, default=5.0); ap.add_argument("--check-every", type=float, default=5.0)
    ap.add_argument("--no-check", action="store_true"); ap.add_argument("--min-rho", type=float, default=0.4)
    ap.add_argument("--threads", type=int, default=2); ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--strip-len", type=int, default=1400); ap.add_argument("--max-miss", type=float, default=4.0)
    ap.add_argument("--agree", type=float, default=0.25)
    ap.add_argument("--emph", type=float, default=3.0, help="weight of the along-neck ridge filter in the ECC images (wires over strings)")
    ap.add_argument("--no-snap", action="store_true", help="do not refit the board to the wires the detector finds")
    ap.add_argument("--t0", type=float, default=None); ap.add_argument("--t1", type=float, default=None)
    a = ap.parse_args()
    cv2.setNumThreads(a.threads)
    T0 = time.time()
    A = json.load(open(a.anchors)); kind = A.get("board", {}).get("kind", "steel")
    keys = sorted(A["keyframes"], key=lambda k: k["t"])
    if not keys:
        sys.exit("anchors file has no keyframes")
    for k in keys:
        k["H"] = fit(k["wires"], kind)
    cap = cv2.VideoCapture(a.video); vfps = cap.get(cv2.CAP_PROP_FPS); nfr = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    FW, FH = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    dur = nfr / vfps
    # samples: a grid at --fps plus every keyframe, each on a real frame
    fis = set(min(nfr - 1, int(round(j / a.fps * vfps))) for j in range(int(dur * a.fps) + 1))
    kfi = [min(nfr - 1, int(round(k["t"] * vfps))) for k in keys]
    fis |= set(kfi)
    if a.t0 is not None or a.t1 is not None:
        lo_, hi_ = (a.t0 or 0.0) * vfps, (a.t1 if a.t1 is not None else 1e9) * vfps
        keep = [i for i, f in enumerate(kfi) if lo_ <= f <= hi_]
        keys = [keys[i] for i in keep]; kfi = [kfi[i] for i in keep]
        fis = {f for f in fis if lo_ <= f <= hi_}
    ck_fis = {}
    if not a.no_check:
        # check frames sit half a sample after the tracked frames, so the check never looks at a frame the snap used
        for j in range(int(dur / a.check_every) + 1):
            tc = j * a.check_every + 0.5 / a.fps
            if tc < dur - 1.0 / vfps:
                ck_fis[min(nfr - 1, int(round(tc * vfps)))] = round(min(nfr - 1, int(round(tc * vfps))) / vfps, 4)
    fis = sorted(fis)
    N = len(fis); st = np.array(fis) / vfps
    pos = {fi: i for i, fi in enumerate(fis)}
    # region: the keyframes' boards plus a margin, cropped and scaled
    polys = np.vstack([board_poly(k["H"], kind, -2.0, 26.0, 1.6) for k in keys])
    bx0, by0 = polys.min(0); bx1, by1 = polys.max(0)
    mg = 0.25 * max(bx1 - bx0, by1 - by0)
    x0, y0 = int(max(0, bx0 - mg)), int(max(0, by0 - mg)); x1, y1 = int(min(FW, bx1 + mg)), int(min(FH, by1 + mg))
    sc = a.scale
    P = np.array([[sc, 0, -x0 * sc], [0, sc, -y0 * sc], [0, 0, 1]], np.float64)   # full frame -> processing pixels
    Pinv = np.linalg.inv(P)
    pw, ph = int(round((x1 - x0) * sc)), int(round((y1 - y0) * sc))
    tmpd = tempfile.mkdtemp(prefix="necktrack_", dir=os.path.dirname(os.path.abspath(a.out)))
    import atexit, shutil, signal
    atexit.register(shutil.rmtree, tmpd, True)              # the frame cache goes even when the run is stopped
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(143))
    mm = np.memmap(os.path.join(tmpd, "frames.u8"), dtype=np.uint8, mode="w+", shape=(N, ph, pw))
    thumbs = np.zeros((N, 36, 64), np.float32); bright = np.zeros(N, np.float32); hists = [None] * N
    ck_frames = {}
    want = set(fis) | set(ck_fis)
    fi = 0; last = max(want)
    while fi <= last:
        if not cap.grab(): break
        if fi in want:
            ok, img = cap.retrieve()
            g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            if fi in pos:
                i = pos[fi]
                c = g[y0:y1, x0:x1]
                mm[i] = c if sc == 1 else cv2.resize(c, (pw, ph), interpolation=cv2.INTER_AREA)
                thumbs[i] = cv2.resize(g, (64, 36), interpolation=cv2.INTER_AREA); bright[i] = float(g.mean())
                hsv = cv2.cvtColor(cv2.resize(img, (160, 90), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2HSV)
                hh = cv2.calcHist([hsv], [0, 1, 2], None, [16, 8, 8], [0, 180, 0, 256, 0, 256]); hists[i] = cv2.normalize(hh, hh).flatten()
            if fi in ck_fis:
                ck_frames[ck_fis[fi]] = g
        fi += 1
    t_dec = time.time() - T0
    print(f"[neck_track] read {N} samples in {t_dec:.0f} s; tracking from {len(keys)} keyframe(s)", file=sys.stderr, flush=True)
    # cuts and dark frames: a track never crosses them. A cut changes most of the picture AND its colours; hands moving
    # in a close-up change much of the picture but not its colour histogram.
    frac = np.r_[0.0, np.mean(np.abs(np.diff(thumbs, axis=0)) > 25, axis=(1, 2))]
    bh = np.r_[0.0, [cv2.compareHist(hists[i - 1], hists[i], cv2.HISTCMP_BHATTACHARYYA) for i in range(1, N)]]
    dark = bright < 12.0
    brk = np.zeros(N, bool)        # brk[i]: no track may step between sample i-1 and i
    brk[1:] = ((frac[1:] > 0.5) & (bh[1:] > 0.5)) | dark[1:] | dark[:-1]
    cuts = [round(float(st[i]), 3) for i in range(1, N) if brk[i] and not dark[i] and not dark[i - 1]]
    shots = A.get("shots") or []

    def shot_of(t):
        for s0, s1 in shots:
            if s0 <= t < s1: return (s0, s1)
        return None if shots else (0.0, 1e9)

    H_masks = Hands(a.landmarks)
    mcache = {}

    def hmask(i):
        if i not in mcache:
            mcache[i] = H_masks.mask(st[i], (ph, pw), P)
            if len(mcache) > 64: mcache.pop(next(iter(mcache)))
        return mcache[i]

    valid_img = np.full((ph, pw), 255, np.uint8)
    snaps = []

    def prep(img):
        f = img.astype(np.float32)
        if a.emph > 0:
            f = f + a.emph * (f - cv2.blur(f, (15, 1)))
        return f
    results = [[] for _ in range(N)]   # per sample: (key index, H_proc, rho, dt)
    stats = []
    key_ref = []
    if not a.no_snap:
        # refine each keyframe on its own frame: wires the detector finds near the modelled ones are added (as
        # make_anchors.py --snap does), kept only if the keyframe check improves; the numbering cannot change
        from track_check import snap_grow, check_frame, _stats
        for ki, k in enumerate(keys):
            i_k = pos[kfi[ki]]
            gk = np.asarray(mm[i_k]); hk = hmask(i_k)
            wk = [{"k": w["k"], "a": list(cv2.perspectiveTransform(np.array([[w["a"]]], np.float64), P)[0, 0]),
                   "b": list(cv2.perspectiveTransform(np.array([[w["b"]]], np.float64), P)[0, 0])} for w in k["wires"]]
            r0 = check_frame(gk, fit(wk, kind), kind, hk)
            grown = snap_grow(gk, wk, kind, hk)
            H1 = fit(grown, kind)
            r1 = check_frame(gk, H1, kind, hk)
            s0, s1 = (_stats(r0["cands"]) if r0 else {}), (_stats(r1["cands"]) if r1 else {})
            used = bool(s0.get("n") and s1.get("n") and s1["median_share"] < s0["median_share"] and len(grown) > len(wk))
            if used:
                k["H"] = H1 @ P
            key_ref.append({"t": k["t"], "added_wires": len(grown) - len(wk), "check_before": s0.get("median_share"),
                            "check_after": s1.get("median_share"), "used": used})
    for ki, k in enumerate(keys):
        i_k = pos[kfi[ki]]
        Hk = k["H"] @ Pinv
        strip = Strip(Hk, kind, a.strip_len)
        key_img = np.asarray(mm[i_k])
        Tm = cv2.bitwise_and(strip.board, strip.warp(valid_img, Hk, cv2.INTER_NEAREST))
        Tm = cv2.bitwise_and(Tm, cv2.bitwise_not(strip.warp(hmask(i_k), Hk, cv2.INTER_NEAREST)))
        Tm = cv2.erode(Tm, np.ones((5, 5), np.uint8))
        T = prep(strip.warp(key_img, Hk))
        tm_area = max(1, int(np.count_nonzero(strip.board)))
        sh = shot_of(st[i_k])
        results[i_k].append((ki, Hk, 1.0, 0.0))
        L_key = wire_px(Hk, kind)
        n_ok = n_null = 0
        for direction in (+1, -1):
            H = Hk.copy(); prev_i = i_k; miss = 0.0
            i = i_k + direction
            # a keyframe's track runs to the next keyframe on that side (where that one takes over), not beyond
            stop_i = [pos[f] for j2, f in enumerate(kfi) if j2 != ki and (pos[f] - i_k) * direction > 0]
            stop_i = min(stop_i, key=lambda x: abs(x - i_k)) if stop_i else None
            while 0 <= i < N:
                if sh is None or not (sh[0] <= st[i] < sh[1]): break
                if stop_i is not None and (i - stop_i) * direction > 0: break
                if brk[max(i, prev_i)]: break
                prev = np.asarray(mm[prev_i]); cur = np.asarray(mm[i])
                pm = np.zeros((ph, pw), np.uint8)
                cv2.fillPoly(pm, [board_poly(H, kind).astype(np.int32)], 255)
                pm = cv2.bitwise_and(pm, cv2.bitwise_not(hmask(prev_i)))
                D, ninl = lk_step(prev, cur, pm)
                H_init = H @ np.linalg.inv(D) if D is not None else H
                J = prep(strip.warp(cur, H_init))
                Jm = cv2.bitwise_and(strip.board, strip.warp(valid_img, H_init, cv2.INTER_NEAREST))
                Jm = cv2.bitwise_and(Jm, cv2.bitwise_not(strip.warp(hmask(i), H_init, cv2.INTER_NEAREST)))
                Jm = cv2.erode(Jm, np.ones((5, 5), np.uint8))
                vis = np.count_nonzero(cv2.bitwise_and(Jm, Tm)) / tm_area
                rho, W = (None, None)
                if vis >= 0.15:
                    rho, W = ecc_refine(T, Tm, J, Jm)
                good = False
                if rho is not None:
                    Hn = np.linalg.inv(strip.S) @ np.linalg.inv(W) @ strip.S @ H_init
                    Lr = wire_px(Hn, kind) / L_key
                    jump = disagreement(Hn, H_init, kind)
                    good = rho >= a.min_rho and 0.6 < Lr < 1.6 and jump < 1.0
                if good and not a.no_snap:
                    Hs, nw = snap(cur, Hn, kind, hmask(i))
                    if Hs is not None: Hn = Hs
                    snaps.append(nw)
                if good:
                    H = Hn; miss = 0.0
                    results[i].append((ki, H.copy(), rho, abs(st[i] - st[i_k]))); n_ok += 1
                else:
                    H = H_init; miss += abs(st[i] - st[prev_i]); n_null += 1
                    stats.append({"t": round(float(st[i]), 2), "key": ki, "rho": None if rho is None else round(rho, 3),
                                  "visible": round(vis, 3), "lk_inliers": ninl})
                    if miss > a.max_miss: break
                prev_i = i; i += direction
            print(f"[neck_track] keyframe {ki + 1}/{len(keys)} at {k['t']:.2f} s, {'forward' if direction > 0 else 'backward'} "
                  f"to {st[max(0, min(N - 1, prev_i))]:.1f} s ({time.time() - T0:.0f} s so far; fitted {n_ok}, no fit {n_null})", file=sys.stderr, flush=True)
    # combine the keyframes' tracks at each sample
    outH, outC, outR, outS = [], [], [], []
    n_blend = n_pick = 0; pick_t = []
    for i in range(N):
        r = results[i]
        if not r:
            outH.append(None); outC.append(0.0); outR.append(None); outS.append(None); continue
        if any(x[3] == 0.0 for x in r):
            x = [x for x in r if x[3] == 0.0][0]
            outH.append(x[1] @ P); outC.append(1.0); outR.append(1.0); outS.append(x[0]); continue
        if len(r) == 1:
            x = r[0]
        else:
            r2 = sorted(r, key=lambda x: x[3])[:2]
            xa, xb = r2
            if disagreement(xa[1], xb[1], kind) < a.agree:
                wa = xa[2] / (xa[3] + 0.5); wb = xb[2] / (xb[3] + 0.5)
                Hm = blend(xa[1], xb[1], wb / (wa + wb), kind)
                x = (xa[0] if wa >= wb else xb[0], Hm, (wa * xa[2] + wb * xb[2]) / (wa + wb), min(xa[3], xb[3])); n_blend += 1
            else:   # they disagree: the nearer keyframe's track (less to drift), unless it fits much worse
                x = max(r2, key=lambda x: x[2] / (x[3] + 0.5)); x = (x[0], x[1], x[2] * 0.7, x[3]); n_pick += 1
                pick_t.append(float(st[i]))
        outH.append(x[1] @ P); outC.append(round(float(x[2]), 4)); outR.append(round(float(x[2]), 4)); outS.append(x[0])
    track = {"video": a.video, "anchors": os.path.abspath(a.anchors), "landmarks": os.path.abspath(a.landmarks),
             "kind": kind, "fps": a.fps, "frame_fps": vfps, "min_rho": a.min_rho,
             "t": [round(float(t), 4) for t in st],
             "H": [None if h is None else [[float(v) for v in row] for row in (h / h[2, 2])] for h in outH],
             "conf": outC, "src": outS, "cuts": cuts, "dark": [round(float(st[i]), 2) for i in range(N) if dark[i]][:2000],
             "keyframes": [round(float(k["t"]), 3) for k in keys], "keyframe_refine": key_ref,
             "summary": {"samples": N, "null": int(sum(h is None for h in outH)),
                         "null_share": round(sum(h is None for h in outH) / N, 4), "blended": n_blend, "picked": n_pick,
                         "decode_s": round(t_dec, 1), "snapped": int(sum(1 for x in snaps if x)),
                         "snap_wires_median": float(np.median([x for x in snaps if x])) if any(snaps) else 0}}
    rng = []
    for t in pick_t:
        if rng and t - rng[-1][1] <= 0.5: rng[-1][1] = t
        else: rng.append([t, t])
    track["disagreements"] = [[round(a_, 2), round(b_, 2)] for a_, b_ in rng]
    track["summary"]["disagreement_ranges"] = len(rng)
    track["summary"]["track_s"] = round(time.time() - T0 - t_dec, 1)
    track["failures"] = stats[:400]
    json.dump(track, open(a.out, "w"))
    try:
        os.remove(os.path.join(tmpd, "frames.u8")); os.rmdir(tmpd)
    except OSError:
        pass
    if not a.no_check:
        from track_check import selfcheck
        sc_res = selfcheck(ck_frames, a.anchors, a.out, H_masks)
        track["selfcheck"] = sc_res
        json.dump(track, open(a.out, "w"))
        print(json.dumps({"selfcheck": sc_res["summary"]}))
    track["summary"]["total_s"] = round(time.time() - T0, 1)
    json.dump(track, open(a.out, "w"))
    print(json.dumps({"summary": track["summary"], "cuts": cuts}))


if __name__ == "__main__":
    main()
