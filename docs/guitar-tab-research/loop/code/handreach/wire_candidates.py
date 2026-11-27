#!/usr/bin/env python3
"""wire_candidates.py <video> <t> <quad x1,y1,x2,y2,x3,y3,x4,y4 | auto> <out_prefix> [--len 2400] [--min-gap 18] [--floor 1]
   [--anchors anchors.json [--track track.json]]
Finds fret-wire candidates inside a rough board outline: the quad's corners are the string-6 edge at the BODY end, the
string-6 edge at the NUT end, the string-1 edge at the nut end, the string-1 edge at the body end (pixels of the full
frame; read them off frame_ruler.py). The board is straightened, its columns scored for a thin bright vertical ridge,
and the peaks become candidates A, B, C ... from the body end to the nut (--floor: the weakest ridge kept, in grey
levels; raise it to 2 or 3 when many false candidates show, lower it to 0.6 for faint wires). Each candidate follows the
wire's own direction (--slant 0 forces lines square to the quad, as version 0 did). Writes <out_prefix>.json (each candidate's two
ends in frame pixels and its strength) and <out_prefix>.jpg (the frame with the lettered candidates) for naming: look at
the picture, say which letter is which wire counted from the nut (inlays, the nut, the capo, the body join), and put
those wires in the anchors file.
With quad "auto" (needs --anchors, and --track if there is one) the outline is where the current neck model puts the
board at time t (from just past the nut to wire 19.5, the part inside the frame): the quick way to name wires on a new
keyframe once a first keyframe and a track exist (the letters are found on the picture, not taken from the model).
The detector itself is detect() below; track_check.py uses the same function to check a neck track."""
import argparse, json
import numpy as np, cv2


def detect(img, quad, L=2400, Hh=120, min_gap=18, floor=1.0, mask=None, slant=0.5):
    """Wire candidates in a BGR or grey frame inside quad (4x2, the corner order above). Returns a list of
    {"id", "a", "b", "strength", "u", "slant"} from the body end to the nut. Each candidate is a line: "a" on the
    string-6 edge of the quad, "b" on the string-1 edge, following the wire's own direction (a wire that crosses the
    straightened board at a slant is searched for up to --slant strip pixels sideways per pixel across; "slant" is the
    slant found, 0 when the wire is square to the quad's edges). floor: the weakest ridge kept (grey levels; lower
    finds fainter wires and more false ones). mask (uint8, frame-sized, 255 = ignore, e.g. the hands): those pixels are
    left out of each column's median, and columns mostly under it are not scored."""
    q = np.asarray(quad, np.float32).reshape(4, 2)
    dst = np.array([[0, 0], [L, 0], [L, Hh], [0, Hh]], np.float32)
    M = cv2.getPerspectiveTransform(q, dst)
    rect = cv2.warpPerspective(img, M, (L, Hh), flags=cv2.INTER_CUBIC)
    g = (cv2.cvtColor(rect, cv2.COLOR_BGR2GRAY) if rect.ndim == 3 else rect).astype(np.float32)
    # ridge: column brightness minus its neighbourhood, on the middle 80 % of the board height, median over rows (robust
    # to fingers), along lines of several slants; each column keeps its best slant
    r0, r1 = int(Hh * 0.1), int(Hh * 0.9)
    band = g[r0:r1]
    ridge = band - cv2.blur(band, (21, 1))
    if mask is not None:
        mk = cv2.warpPerspective(mask, M, (L, Hh), flags=cv2.INTER_NEAREST)[r0:r1]
        mk = cv2.dilate(mk, np.ones((1, 23), np.uint8))
        ridge[mk > 0] = np.nan
    vc = Hh / 2.0
    rows = np.arange(r0, r1) - vc
    sig = np.linspace(-slant, slant, int(round(slant / 0.05)) * 2 + 1) if slant > 0 else np.array([0.0])
    profs = []
    pad = int(np.ceil(slant * (r1 - r0))) + 2
    if mask is not None:
        rp = np.pad(ridge, ((0, 0), (pad, pad)), constant_values=np.nan)
    else:
        rp = np.pad(ridge, ((0, 0), (pad, pad)), mode="edge")   # no NaN: the plain median is much faster
    if mask is None:
        # all slants at once: rows gathered along each slant, the median taken over a contiguous last axis
        R = r1 - r0
        sh = np.round(sig[:, None] * rows[None, :]).astype(int)                       # (S, R)
        idx = np.arange(L)[None, None, :] + pad + sh[:, :, None]                        # (S, R, L)
        sl = rp[np.arange(R)[None, :, None], idx].transpose(0, 2, 1).copy()           # (S, L, R)
        profs = np.partition(sl, R // 2, axis=2)[:, :, R // 2]
    else:
        with np.errstate(all="ignore"):
            for sg in sig:
                sh = np.round(sg * rows).astype(int)
                idx = np.arange(L)[None, :] + pad + sh[:, None]
                sl = np.take_along_axis(rp, idx, axis=1)
                pr = np.nanmedian(sl, axis=0)
                pr[np.mean(np.isnan(sl), axis=0) > 0.6] = 0.0
                profs.append(np.nan_to_num(pr))
        profs = np.array(profs)
    # a small preference for square wires, so noise does not pick a slant
    profs = profs - 0.15 * np.abs(sig)[:, None] * np.maximum(profs, 0)
    best = np.argmax(profs, axis=0)
    prof = profs[best, np.arange(L)]
    prof = np.convolve(prof, np.ones(3) / 3, mode="same")
    cand = []
    order = np.argsort(-prof)
    thr = max(floor, np.percentile(prof, 90))
    for x in order:
        if prof[x] <= thr: break
        if all(abs(x - c) >= min_gap for c in cand): cand.append(int(x))
    cand.sort()
    Minv = np.linalg.inv(M)
    res = []
    for i, x in enumerate(cand):
        sg = float(sig[best[x]])
        pts = cv2.perspectiveTransform(np.array([[[x + sg * (0 - vc), 0]], [[x + sg * (Hh - vc), Hh]]], np.float32), Minv).reshape(2, 2)
        res.append({"id": chr(65 + i) if i < 26 else "a" + chr(65 + i - 26), "a": [round(float(pts[0][0]), 1), round(float(pts[0][1]), 1)],
                    "b": [round(float(pts[1][0]), 1), round(float(pts[1][1]), 1)], "strength": round(float(prof[x]), 2), "u": x,
                    "slant": round(sg, 2)})
    return res


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("t", type=float); ap.add_argument("quad"); ap.add_argument("out")
    ap.add_argument("--len", type=int, default=2400); ap.add_argument("--min-gap", type=int, default=18)
    ap.add_argument("--h", type=int, default=120); ap.add_argument("--crop-pad", type=int, default=40)
    ap.add_argument("--anchors", default=None); ap.add_argument("--track", default=None)
    ap.add_argument("--floor", type=float, default=1.0); ap.add_argument("--slant", type=float, default=0.5)
    a = ap.parse_args()
    cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS)
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(a.t * fps))); ok, img = cap.read(); assert ok
    if a.quad == "auto":
        import os, sys
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from neck import NeckModel
        from track_check import board_quad
        NM = NeckModel(a.anchors, a.track)
        Hm, _ = NM.H_at(a.t)
        if Hm is None: sys.exit("no neck model at this time: give a quad by hand")
        q = board_quad(Hm, NM.kind, img.shape)
        if q is None: sys.exit("the modelled board is not inside the frame: give a quad by hand")
        q = q.astype(np.float32)
        print("auto quad:", ",".join(f"{v:.0f}" for v in q.ravel()))
    else:
        q = np.array([float(v) for v in a.quad.split(",")], np.float32).reshape(4, 2)
    res = detect(img, q, a.len, a.h, a.min_gap, a.floor, slant=a.slant)
    json.dump({"video": a.video, "t": a.t, "quad": q.tolist(), "candidates": res}, open(a.out + ".json", "w"), indent=1)
    vis = img.copy()
    for r in res:
        p0, p1 = tuple(int(v) for v in r["a"]), tuple(int(v) for v in r["b"])
        cv2.line(vis, p0, p1, (0, 0, 255), 1)
        cv2.putText(vis, r["id"], (p1[0] - 8, p1[1] + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    cv2.polylines(vis, [q.astype(np.int32)], True, (255, 255, 0), 1)
    x0, y0 = int(q[:, 0].min()) - a.crop_pad, int(q[:, 1].min()) - a.crop_pad
    x1, y1 = int(q[:, 0].max()) + a.crop_pad, int(q[:, 1].max()) + a.crop_pad + 30
    x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(img.shape[1], x1), min(img.shape[0], y1)
    vis = vis[y0:y1, x0:x1]
    if vis.shape[1] > 1900: vis = cv2.resize(vis, (1900, int(vis.shape[0] * 1900 / vis.shape[1])))
    cv2.imwrite(a.out + ".jpg", vis, [cv2.IMWRITE_JPEG_QUALITY, 92])
    print(f"{len(res)} candidates (letter@x of its end on the string-6 edge):", " ".join(f"{r['id']}@{r['a'][0]:.0f}" for r in res))
